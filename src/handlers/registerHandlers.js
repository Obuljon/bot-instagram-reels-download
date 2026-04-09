const {
  HELP_MESSAGE,
  INVALID_URL_MESSAGE,
  LOADING_MESSAGE,
  NO_MEDIA_FOUND_MESSAGE,
  SUBSCRIPTION_CONFIRMED_MESSAGE,
  SUBSCRIPTION_CHECK_FAILED_MESSAGE,
  getMainErrorMessage,
  getMediaFoundMessage,
  getStartMessage,
} = require("../constants/messages");
const { getMediaLinks } = require("../services/instagramScraper");
const { sendMediaBatch } = require("../services/mediaSender");
const {
  SUBSCRIPTION_CHECK_CALLBACK,
  checkAllSubscriptions,
  requireSubscription,
  showSubscriptionPrompt,
} = require("../services/subscriptionService");
const { isInstagramUrl } = require("../utils/validators");

async function updateStatusMessage(ctx, statusMessage, text) {
  await ctx.telegram.editMessageText(
    ctx.chat.id,
    statusMessage.message_id,
    null,
    text
  );
}

async function sendStartMessage(ctx) {
  await ctx.reply(getStartMessage(ctx.from?.first_name));
}

async function sendHelpMessage(ctx) {
  await ctx.reply(HELP_MESSAGE);
}

async function handleTextMessage(ctx, rawText = ctx.message?.text || "") {
  const text = rawText.trim();

  if (!isInstagramUrl(text)) {
    await ctx.reply(INVALID_URL_MESSAGE);
    return;
  }

  const statusMessage = await ctx.reply(LOADING_MESSAGE);

  try {
    const mediaLinks = await getMediaLinks(text);

    if (!mediaLinks || mediaLinks.length === 0) {
      await updateStatusMessage(ctx, statusMessage, NO_MEDIA_FOUND_MESSAGE);
      return;
    }

    await updateStatusMessage(
      ctx,
      statusMessage,
      getMediaFoundMessage(mediaLinks.length)
    );

    await sendMediaBatch(ctx, mediaLinks);
  } catch (error) {
    console.error("❌ Asosiy xato:", error);
    await updateStatusMessage(
      ctx,
      statusMessage,
      getMainErrorMessage(error.message)
    );
  }
}

function registerHandlers(bot) {
  const pendingRequests = new Map();

  async function continuePendingRequest(ctx, request) {
    if (!request) {
      await ctx.reply(SUBSCRIPTION_CONFIRMED_MESSAGE);
      return;
    }

    if (request.type === "start") {
      await sendStartMessage(ctx);
      return;
    }

    if (request.type === "help") {
      await sendHelpMessage(ctx);
      return;
    }

    if (request.type === "text") {
      await handleTextMessage(ctx, request.payload?.text || "");
      return;
    }

    await ctx.reply(SUBSCRIPTION_CONFIRMED_MESSAGE);
  }

  function withRequiredSubscription(type, handler, getPayload = () => ({})) {
    return async (ctx) => {
      const userId = ctx.from?.id;
      const payload = getPayload(ctx);
      const allowed = await requireSubscription(ctx);

      if (!allowed) {
        if (userId) {
          pendingRequests.set(userId, { type, payload });
        }
        return;
      }

      if (userId) {
        pendingRequests.delete(userId);
      }

      await handler(ctx, payload);
    };
  }

  bot.action(SUBSCRIPTION_CHECK_CALLBACK, async (ctx) => {
    await ctx.answerCbQuery();

    const userId = ctx.from?.id;
    const { ok, missing, unknown } = await checkAllSubscriptions(
      ctx.telegram,
      userId
    );

    if (unknown.length > 0) {
      await ctx.reply(SUBSCRIPTION_CHECK_FAILED_MESSAGE);
      return;
    }

    if (!ok) {
      await showSubscriptionPrompt(ctx, missing, { editMessage: true });
      return;
    }

    const pendingRequest = userId ? pendingRequests.get(userId) : null;
    if (userId) {
      pendingRequests.delete(userId);
    }

    try {
      await ctx.editMessageReplyMarkup(undefined);
    } catch {
      // Xabarni tahrirlab bo'lmasa ham asosiy oqimni davom ettiramiz.
    }

    await continuePendingRequest(ctx, pendingRequest);
  });

  bot.start(withRequiredSubscription("start", sendStartMessage));
  bot.help(withRequiredSubscription("help", sendHelpMessage));

  const handleProtectedText = withRequiredSubscription(
    "text",
    (ctx, payload) => handleTextMessage(ctx, payload.text),
    (ctx) => ({ text: ctx.message?.text || "" })
  );

  bot.on("text", handleProtectedText);
}

module.exports = {
  registerHandlers,
};
