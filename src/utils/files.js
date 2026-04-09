const fs = require("fs");
const os = require("os");
const path = require("path");

function createTempMediaPath(index, type) {
  const extension = type === "video" ? "mp4" : "jpg";
  return path.join(os.tmpdir(), `insta_${Date.now()}_${index}.${extension}`);
}

function getFileSizeInMb(filePath) {
  const stats = fs.statSync(filePath);
  return (stats.size / 1024 / 1024).toFixed(2);
}

function removeFileIfExists(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  fs.unlink(filePath, () => {});
}

module.exports = {
  createTempMediaPath,
  getFileSizeInMb,
  removeFileIfExists,
};
