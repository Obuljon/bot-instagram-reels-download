const {
  SUBSCRIPTION_CHECK_FAILED_MESSAGE,
  SUBSCRIPTION_CONFIRMED_MESSAGE,
  getNotSubscribedMessage,
} = require("../constants/messages");

const SUBSCRIPTION_CHECK_CALLBACK = "check_subscription";
const ALLOWED_MEMBER_STATUSES = [
  "creator",
  "administrator",
  "member",
  "restricted",
];

function getRequiredChannelEntries() {
  const raw = process.env.REQUIRED_CHANNELS || "";

  return raw
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map(parseRequiredChannelEntry);
}

function parseRequiredChannelEntry(rawValue) {
  const raw = String(rawValue || "").trim();

  if (!raw) {
    return null;
  }

  if (/^-?\d+$/.test(raw)) {
    return {
      raw,
      chatId: raw,
      title: raw,
      url: null,
    };
  }

  const normalized = normalizeTelegramUsername(raw);

  if (!normalized.ok) {
    return {
      raw,
      error: normalized.error,
    };
  }

  return {
    raw,
    chatId: `@${normalized.username}`,
    title: `@${normalized.username}`,
    url: `https://t.me/${normalized.username}`,
  };
}

function normalizeTelegramUsername(value) {
  const raw = String(value || "").trim();

  if (!raw) {
    return {
      ok: false,
      error: "bo'sh qiymat berilgan",
    };
  }

  if (raw.startsWith("@")) {
    return validateUsername(raw.slice(1));
  }

  if (!raw.includes("/") && !raw.includes(" ")) {
    return validateUsername(raw);
  }

  let candidate = raw;
  if (/^t\.me\//i.test(candidate) || /^telegram\.me\//i.test(candidate)) {
    candidate = `https://${candidate}`;
  }

  try {
    const url = new URL(candidate);
    const hostname = url.hostname.replace(/^www\./i, "").toLowerCase();

    if (!["t.me", "telegram.me"].includes(hostname)) {
      return {
        ok: false,
        error: "faqat `t.me/...`, `@username` yoki chat ID ishlating",
      };
    }

    const segments = url.pathname.split("/").filter(Boolean);
    const [firstSegment] = segments;

    if (!firstSegment) {
      return {
        ok: false,
        error: "Telegram havolasi bo'sh",
      };
    }

    if (firstSegment === "joinchat" || firstSegment.startsWith("+")) {
      return {
        ok: false,
        error: "private invite link qo'llanmaydi, `@username` yoki chat ID ishlating",
      };
    }

    return validateUsername(firstSegment);
  } catch {
    return {
      ok: false,
      error: "noto'g'ri format. Misol: `https://t.me/kanal_nomi`",
    };
  }
}

function validateUsername(username) {
  const cleanUsername = String(username || "").trim().replace(/^@+/, "");

  if (!/^[A-Za-z0-9_]{5,}$/.test(cleanUsername)) {
    return {
      ok: false,
      error: "Telegram username kamida 5 belgidan iborat bo'lishi kerak",
    };
  }

  return {
    ok: true,
    username: cleanUsername,
  };
}

function getRequiredChannels() {
  const uniqueChannels = new Map();

  for (const channel of getRequiredChannelEntries()) {
    if (!channel || channel.error || uniqueChannels.has(channel.chatId)) {
      continue;
    }

    uniqueChannels.set(channel.chatId, channel);
  }

  return Array.from(uniqueChannels.values());
}

function getInvalidRequiredChannels() {
  return getRequiredChannelEntries().filter(
    (channel) => channel && channel.error
  );
}

function resolveChatUrl(chat, fallbackChannel) {
  if (chat.username) {
    return `https://t.me/${chat.username}`;
  }

  if (chat.invite_link) {
    return chat.invite_link;
  }

  return fallbackChannel.url;
}

function getTelegramErrorMessage(error) {
  return error.description || error.message || "noma'lum xatolik";
}

function isMembershipListUnavailable(errorMessage) {
  return errorMessage.toLowerCase().includes("member list is inaccessible");
}

async function validateRequiredChannelsAccess(bot) {
  const invalidChannels = getInvalidRequiredChannels();

  if (invalidChannels.length > 0) {
    const details = invalidChannels
      .map((channel) => `${channel.raw} (${channel.error})`)
      .join(", ");

    throw new Error(`REQUIRED_CHANNELS noto'g'ri sozlangan: ${details}`);
  }

  const channels = getRequiredChannels();
  if (channels.length === 0) {
    return [];
  }

  const botInfo = await bot.telegram.getMe();
  const validatedChannels = [];

  for (const channel of channels) {
    try {
      const chat = await bot.telegram.getChat(channel.chatId);
      const botMember = await bot.telegram.getChatMember(
        channel.chatId,
        botInfo.id
      );

      if (!ALLOWED_MEMBER_STATUSES.includes(botMember.status)) {
        throw new Error("bot kanal yoki guruh ichida emas");
      }

      validatedChannels.push({
        ...channel,
        title: chat.title || channel.title,
        url: resolveChatUrl(chat, channel),
      });
    } catch (error) {
      const errorMessage = getTelegramErrorMessage(error);
      const extraHint = isMembershipListUnavailable(errorMessage)
        ? " Bot aynan shu chatda admin ekanini va agar bu guruh bo'lsa, a'zolar ro'yxatini yashirish cheklovi tekshiruvga xalaqit bermayotganini tekshiring."
        : "";

      throw new Error(
        `REQUIRED_CHANNELS dagi "${channel.raw}" uchun qat'iy obuna tekshiruvi yoqilmadi. Xato: ${errorMessage}.${extraHint}`
      );
    }
  }

  return validatedChannels;
}

async function isSubscribed(telegram, userId, channel) {
  try {
    const member = await telegram.getChatMember(channel.chatId, userId);
    return ALLOWED_MEMBER_STATUSES.includes(member.status);
  } catch (error) {
    const errorMessage = getTelegramErrorMessage(error);

    console.error(
      `❌ ${channel.chatId} uchun obunani tekshirib bo'lmadi:`,
      errorMessage
    );
    return null;
  }
}

async function checkAllSubscriptions(telegram, userId) {
  const channels = getRequiredChannels();
  if (channels.length === 0) {
    return { ok: true, missing: [], unknown: [] };
  }

  const missing = [];
  const unknown = [];

  for (const channel of channels) {
    const subscribed = await isSubscribed(telegram, userId, channel);

    if (subscribed === false) {
      missing.push(channel);
    } else if (subscribed === null) {
      unknown.push(channel);
    }
  }

  return {
    ok: missing.length === 0 && unknown.length === 0,
    missing,
    unknown,
  };
}

async function getChannelTitle(telegram, channel) {
  try {
    const chat = await telegram.getChat(channel.chatId);

    return {
      title: chat.title || channel.title,
      url: resolveChatUrl(chat, channel),
    };
  } catch {
    return {
      title: channel.title || channel.chatId,
      url: channel.url,
    };
  }
}

async function buildSubscribeKeyboard(telegram, missingChannels) {
  const buttons = [];

  for (const channel of missingChannels) {
    const info = await getChannelTitle(telegram, channel);

    if (info.url) {
      buttons.push([{ text: `📢 ${info.title}`, url: info.url }]);
    }
  }

  buttons.push([
    {
      text: "✅ Obuna bo'ldim, tekshiring!",
      callback_data: SUBSCRIPTION_CHECK_CALLBACK,
    },
  ]);

  return { inline_keyboard: buttons };
}

async function showSubscriptionPrompt(ctx, missingChannels, options = {}) {
  const keyboard = await buildSubscribeKeyboard(ctx.telegram, missingChannels);
  const text = getNotSubscribedMessage(missingChannels.length);
  const extra = {
    disable_web_page_preview: true,
    reply_markup: keyboard,
  };

  if (options.editMessage && ctx.callbackQuery?.message) {
    try {
      await ctx.editMessageText(text, extra);
      return false;
    } catch {
      // Fallback quyida ishlaydi.
    }
  }

  await ctx.reply(text, extra);
  return false;
}

async function requireSubscription(ctx) {
  const userId = ctx.from?.id;

  if (!userId) {
    return true;
  }

  const { ok, missing, unknown } = await checkAllSubscriptions(
    ctx.telegram,
    userId
  );

  if (ok) {
    return true;
  }

  if (unknown.length > 0) {
    await ctx.reply(SUBSCRIPTION_CHECK_FAILED_MESSAGE);
    return false;
  }

  return showSubscriptionPrompt(ctx, missing);
}

module.exports = {
  SUBSCRIPTION_CHECK_CALLBACK,
  SUBSCRIPTION_CHECK_FAILED_MESSAGE,
  SUBSCRIPTION_CONFIRMED_MESSAGE,
  buildSubscribeKeyboard,
  checkAllSubscriptions,
  getRequiredChannels,
  requireSubscription,
  showSubscriptionPrompt,
  validateRequiredChannelsAccess,
};
