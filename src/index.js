const { Telegraf } = require("telegraf");

const { BOT_TOKEN, validateConfig } = require("./config");
const { registerHandlers } = require("./handlers/registerHandlers");
const { validateRequiredChannelsAccess } = require("./services/subscriptionService");

async function startBot() {
  validateConfig();

  const bot = new Telegraf(BOT_TOKEN);
  const requiredChannels = await validateRequiredChannelsAccess(bot);

  registerHandlers(bot);

  console.log("🤖 Instagram Downloader Bot ishga tushmoqda...");
  if (requiredChannels.length > 0) {
    console.log(
      "🔒 Majburiy obuna yoqildi:",
      requiredChannels.map((channel) => channel.title).join(", ")
    );
  }
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
