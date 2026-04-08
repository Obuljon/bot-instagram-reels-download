const {
  HELP_MESSAGE,
  INVALID_URL_MESSAGE,
  LOADING_MESSAGE,
  NO_MEDIA_FOUND_MESSAGE,
  getMainErrorMessage,
  getMediaFoundMessage,
  getStartMessage,
} = require("../constants/messages");
const { getMediaLinks } = require("../services/instagramScraper");
const { sendMediaBatch } = require("../services/mediaSender");
const { isInstagramUrl } = require("../utils/validators");

async function updateStatusMessage(ctx, statusMessage, text) {
  await ctx.telegram.editMessageText(
    ctx.chat.id,
    statusMessage.message_id,
    null,
    text
  );
}

async function handleTextMessage(ctx) {
  const text = ctx.message.text.trim();

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
  bot.start((ctx) => ctx.reply(getStartMessage(ctx.from?.first_name)));
  bot.help((ctx) => ctx.reply(HELP_MESSAGE));
  bot.on("text", handleTextMessage);
}

module.exports = {
  registerHandlers,
};
