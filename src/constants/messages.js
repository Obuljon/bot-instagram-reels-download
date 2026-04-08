function getStartMessage(firstName = "do'st") {
  return (
    `👋 Salom, ${firstName}!\n\n` +
    `📸 Instagram Downloader Botiga xush kelibsiz!\n\n` +
    `🔗 Menga Instagram post yoki reels havolasini yuboring, men esa uni yuklab beraman.\n\n` +
    `📌 Misol:\nhttps://www.instagram.com/reel/ABC123/\nhttps://www.instagram.com/p/XYZ456/`
  );
}

const HELP_MESSAGE =
  `ℹ️ Yordam:\n\n` +
  `1. Instagram post yoki reels havolasini nusxalang\n` +
  `2. Shu havolani menga yuboring\n` +
  `3. Men videoni yoki rasmni yuklab beraman\n\n` +
  `✅ Qo'llab-quvvatlanadigan formatlar:\n` +
  `• Instagram Reels\n` +
  `• Instagram Post (foto/video)\n` +
  `• Instagram TV (IGTV)`;

const INVALID_URL_MESSAGE =
  `❌ Bu Instagram havolasi emas!\n\n` +
  `To'g'ri havola misoli:\n` +
  `https://www.instagram.com/reel/ABC123/\n` +
  `https://www.instagram.com/p/XYZ456/`;

const LOADING_MESSAGE = "⏳ Yuklanmoqda, iltimos kuting...";
const NO_MEDIA_FOUND_MESSAGE =
  "❌ Media topilmadi. Havola ochiq (public) ekanligini tekshiring.";

function getMediaFoundMessage(count) {
  return `✅ ${count} ta media topildi! Yuborilmoqda...`;
}

function getMediaCaption(type, index, total) {
  return type === "video"
    ? `🎬 Video ${index}/${total}`
    : `📸 Rasm ${index}/${total}`;
}

function getMediaSendErrorMessage(index, errorMessage) {
  return `⚠️ ${index}-media yuborishda xatolik: ${errorMessage}`;
}

function getMainErrorMessage(errorMessage) {
  return (
    `❌ Xatolik yuz berdi: ${errorMessage}\n\n` +
    `Havola ochiq (public) ekanligini tekshiring.`
  );
}

module.exports = {
  HELP_MESSAGE,
  INVALID_URL_MESSAGE,
  LOADING_MESSAGE,
  NO_MEDIA_FOUND_MESSAGE,
  getMainErrorMessage,
  getMediaCaption,
  getMediaFoundMessage,
  getMediaSendErrorMessage,
  getStartMessage,
};
