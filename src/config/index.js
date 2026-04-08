const path = require("path");

require("dotenv").config({ path: path.resolve(process.cwd(), ".env") });

const BOT_TOKEN = process.env.BOT_TOKEN || "YOUR_BOT_TOKEN_HERE";
const CHROME_PATH =
  process.env.CHROME_PATH || "/opt/google/chrome/chrome";
const MAX_MEDIA_ITEMS = 5;

function validateConfig() {
  if (!BOT_TOKEN || BOT_TOKEN === "YOUR_BOT_TOKEN_HERE") {
    throw new Error(
      "BOT_TOKEN topilmadi. `.env` fayliga haqiqiy Telegram bot token kiriting."
    );
  }
}

module.exports = {
  BOT_TOKEN,
  CHROME_PATH,
  MAX_MEDIA_ITEMS,
  validateConfig,
};
