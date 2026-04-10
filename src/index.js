const { Telegraf } = require("telegraf");
const express = require("express");

const { 
  BOT_TOKEN, 
  validateConfig,
  WEBHOOK_URL,
  WEBHOOK_PORT,
  WEBHOOK_SECRET_PATH,
  USE_POLLING 
} = require("./config");
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

  // Express server
  const app = express();
  const PORT = WEBHOOK_PORT;

  // JSON parse middleware
  app.use(express.json());

  // Health check endpoint
  app.get('/', (req, res) => {
    res.json({ 
      status: '✅ Bot ishlamoqda',
      mode: USE_POLLING ? 'Polling' : 'Webhook',
      timestamp: new Date().toISOString()
    });
  });

  // Webhook endpoint (agar webhook mode)
  if (WEBHOOK_URL && !USE_POLLING) {
    console.log(`\n🔗 Webhook rejimida ishlamoqda: ${WEBHOOK_URL}`);
    
    app.post(WEBHOOK_SECRET_PATH, (req, res) => {
      bot.handleUpdate(req.body, res);
    });

    // Webhook'ni Telegramga ro'yxatlashtirish
    bot.telegram.setWebhook(`${WEBHOOK_URL}${WEBHOOK_SECRET_PATH}`).then(() => {
      console.log(`✅ Webhook sozlandi: ${WEBHOOK_URL}${WEBHOOK_SECRET_PATH}`);
    }).catch((error) => {
      console.error("❌ Webhook sozlashda xato:", error.message);
    });
  } else {
    console.log("\n📡 Polling rejimida ishlamoqda...");
    // Botni polling mode'da ishga tushirish
    await bot.launch();
  }

  // Express serverni ishga tushirish
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌐 Server ${PORT}-portda ishga tushdi`);
  });

  console.log("✅ Bot muvaffaqiyatli ishga tushdi!");
  console.log("📌 Telegram da botni sinab ko'ring.");

  process.once("SIGINT", () => {
    console.log("\n⏹️ Bot to'xtatilyapti...");
    bot.stop("SIGINT");
  });
  process.once("SIGTERM", () => {
    console.log("\n⏹️ Bot to'xtatilyapti...");
    bot.stop("SIGTERM");
  });
}

startBot().catch((error) => {
  console.error("❌ Botni ishga tushirishda xato:", error);
  process.exit(1);
});