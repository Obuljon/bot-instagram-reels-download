# 📸 Instagram Downloader Telegram Bot

Telegram bot — foydalanuvchi Instagram reels yoki photo havolasini yuboradi,
bot esa `sssinstagram.com` orqali **Puppeteer** yordamida yuklab, Telegramga qaytaradi.

---

## 🛠 O'rnatish

### 1. Talablar
- **Node.js** v18+ (`node --version`)
- **Google Chrome** yoki **Chromium** o'rnatilgan bo'lishi kerak
- **Telegram Bot Token** ([@BotFather](https://t.me/BotFather) dan olinadi)

---

### 2. Loyihani sozlash

```bash
# Papkaga kirish
cd instagram-bot

# Kutubxonalarni o'rnatish
npm install

# .env faylini yaratish
cp .env.example .env
```

---

### 3. `.env` faylini tahrirlash

`.env` faylini oching va o'z token ni kiriting:

```env
BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
CHROME_PATH=/opt/google/chrome/chrome
REQUIRED_CHANNELS=https://t.me/itpark_xonqa,@my_group
```

> **BOT_TOKEN** ni [@BotFather](https://t.me/BotFather) dan olasiz:
> 1. BotFather ga `/newbot` yuboring
> 2. Bot nomini kiriting
> 3. Username kiriting (oxiri `bot` bilan tugashi kerak)
> 4. Token nusxalab `.env` ga joylashtiring

> `REQUIRED_CHANNELS` ixtiyoriy. Agar to'ldirilsa, foydalanuvchi botdan foydalanishdan oldin shu kanal/guruhlarga obuna bo'lgan bo'lishi kerak.
> `https://t.me/...`, `@username` yoki chat ID formatlari qo'llanadi.
> Botni tekshiriladigan kanal/guruhning o'ziga admin qilib qo'ying.
> Agar bot foydalanuvchi membership'ini o'qiy olmasa, qat'iy obuna tekshiruvi yoqilmaydi va startup xato bilan to'xtaydi.

---

### 4. Botni ishga tushirish

```bash
npm start
```

Muvaffaqiyatli boshlansa:
```
🤖 Instagram Downloader Bot ishga tushmoqda...
✅ Bot muvaffaqiyatli ishga tushdi!
```

---

## 🚀 Ishlatish

| Buyruq | Ta'rif |
|--------|--------|
| `/start` | Botni boshlash, xush kelibsiz xabari |
| `/help` | Yordam ma'lumotlari |
| Instagram URL | Yuklab beradi |

Agar `REQUIRED_CHANNELS` sozlangan bo'lsa:
- bot avval foydalanuvchi obunasini tekshiradi
- obuna bo'lmagan kanal/guruhlar uchun tugmalarni ko'rsatadi
- foydalanuvchi obuna bo'lgach, oldingi buyruq yoki yuborgan linki davom ettiriladi

**Qo'llab-quvvatlanadigan havolalar:**
```
https://www.instagram.com/reel/ABC123/
https://www.instagram.com/p/XYZ456/
https://www.instagram.com/tv/DEF789/
```

---

## 📁 Loyiha tuzilishi

```
instagram-bot/
├── bot.js          ← Kirish nuqtasi
├── .env.example    ← Sozlamalar namunasi
├── .env            ← Sizning sozlamalaringiz (git ga yuklamang!)
├── package.json    ← NPM ma'lumotlari
├── README.md       ← Shu fayl
└── src/
    ├── config/     ← Env va umumiy sozlamalar
    ├── constants/  ← Xabar va scraper konstantalari
    ├── handlers/   ← Telegram handlerlar
    ├── services/   ← Scraper, downloader, media yuborish
    └── utils/      ← Validator va fayl helperlari
```

---

## ⚙️ Qanday ishlaydi?

```
Foydalanuvchi URL yuboradi
        ↓
Bot URL ni tekshiradi (Instagram-mi?)
        ↓
Puppeteer sssinstagram.com ga kiradi
        ↓
URL ni inputga yozadi va Submit bosadi
        ↓
Download linklar scraplanadi
        ↓
Fayllar yuklab olinadi va Telegramga yuboriladi
```

---

## 🔧 Chrome yo'lini sozlash

| Tizim | Chrome yo'li |
|-------|-------------|
| Ubuntu/Debian | `/usr/bin/chromium-browser` |
| Google Chrome Linux | `/opt/google/chrome/chrome` |
| macOS | `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome` |
| Windows | `C:\Program Files\Google\Chrome\Application\chrome.exe` |

---

## ❗ Eslatmalar

- Faqat **ochiq (public)** Instagram profillari ishlaydi
- Telegram fayl cheklovi: video ≤ **50MB**, rasm ≤ **10MB**
- Bot serverda doim ishlab turishi uchun **PM2** ishlatish tavsiya etiladi:
  ```bash
  npm install -g pm2
  pm2 start bot.js --name instagram-bot
  pm2 save
  pm2 startup
  ```
