# Node.js tasviri bilan boshlash
FROM node:20-slim

# Chromium va boshqa zarur vosita
RUN apt-get update && apt-get install -y \
    chromium \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Ish faylini belgilang
WORKDIR /app

# package.json va package-lock.json nusxalash
COPY package*.json ./

# Kutubxonalarni o'rnatish
RUN npm ci --only=production

# Barcha loyiha fayllarini nusxalash
COPY . .

# Chrome yo'li o'rnatish
ENV CHROME_PATH=/usr/bin/chromium

# Port (agar kerak bo'lsa)
EXPOSE 3000

# Botni ishga tushirish
CMD ["npm", "start"]
