const { Telegraf } = require("telegraf");

const { BOT_TOKEN, validateConfig } = require("./config");
const { registerHandlers } = require("./handlers/registerHandlers");

async function startBot() {
  validateConfig();

  const bot = new Telegraf(BOT_TOKEN);
  registerHandlers(bot);

  console.log("🤖 Instagram Downloader Bot ishga tushmoqda...");
  await bot.launch();
  console.log("✅ Bot muvaffaqiyatli ishga tushdi!");
  console.log("📌 Telegram da botni sinab ko'ring.");

  process.once("SIGINT", () => bot.stop("SIGINT"));
  process.once("SIGTERM", () => bot.stop("SIGTERM"));
}

startBot().catch((error) => {
  console.error("❌ Botni ishga tushirishda xato:", error);
  process.exit(1);
});
