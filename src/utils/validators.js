const INSTAGRAM_URL_REGEX =
  /https?:\/\/(www\.)?instagram\.com\/(p|reel|reels|tv)\/[A-Za-z0-9_-]+/;

function isInstagramUrl(url) {
  return INSTAGRAM_URL_REGEX.test(url);
}

module.exports = {
  isInstagramUrl,
};
