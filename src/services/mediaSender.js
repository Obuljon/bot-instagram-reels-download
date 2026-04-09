const { MAX_MEDIA_ITEMS } = require("../config");
const {
  getMediaCaption,
  getMediaSendErrorMessage,
} = require("../constants/messages");
const {
  createTempMediaPath,
  getFileSizeInMb,
  removeFileIfExists,
} = require("../utils/files");
const { downloadFile } = require("./fileDownloader");

async function sendMediaFile(ctx, media, filePath, index, total) {
  const caption = getMediaCaption(media.type, index, total);

  if (media.type === "video") {
    await ctx.replyWithVideo({ source: filePath }, { caption });
    return;
  }

  await ctx.replyWithPhoto({ source: filePath }, { caption });
}

async function sendMediaBatch(ctx, mediaLinks) {
  const totalToSend = Math.min(mediaLinks.length, MAX_MEDIA_ITEMS);

  for (let index = 0; index < totalToSend; index += 1) {
    const media = mediaLinks[index];
    const tempFilePath = createTempMediaPath(index, media.type);

    try {
      // console.log(`📥 Yuklab olinmoqda: ${media.url}`);
      await downloadFile(media.url, tempFilePath);
      // console.log(`📦 Fayl hajmi: ${getFileSizeInMb(tempFilePath)} MB`);

      await sendMediaFile(ctx, media, tempFilePath, index + 1, totalToSend);
    } catch (error) {
      console.error(`❌ Fayl yuborishda xato: ${error.message}`);
      await ctx.reply(getMediaSendErrorMessage(index + 1, error.message));
    } finally {
      removeFileIfExists(tempFilePath);
    }
  }
}

module.exports = {
  sendMediaBatch,
};
