const puppeteer = require("puppeteer-core");

const { CHROME_PATH } = require("../config");
const {
  BROWSER_ARGS,
  INPUT_TIMEOUT_MS,
  NAVIGATION_TIMEOUT_MS,
  RESULT_STABILIZE_DELAY_MS,
  RESULT_TIMEOUT_MS,
  SCRAPER_URL,
  SUBMIT_TIMEOUT_MS,
  USER_AGENT,
  VIEWPORT,
} = require("../constants/scraper");

async function preparePage(page) {
  await page.setUserAgent(USER_AGENT);
  await page.setViewport(VIEWPORT);
}

async function submitInstagramUrl(page, instagramUrl) {
  // console.log("🌐 sssinstagram.com ga kirilmoqda...");
  await page.goto(SCRAPER_URL, {
    waitUntil: "networkidle2",
    timeout: NAVIGATION_TIMEOUT_MS,
  });

  await page.waitForSelector("#input", { timeout: INPUT_TIMEOUT_MS });
  // console.log("📝 Input topildi, URL yozilmoqda...");

  await page.evaluate((url) => {
    const input = document.querySelector("#input");
    input.focus();
    input.value = url;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }, instagramUrl);

  await page.waitForSelector("button.form__submit", {
    timeout: SUBMIT_TIMEOUT_MS,
  });
  await page.click("button.form__submit");
  // console.log("⏳ Submit bosildi, natija kutilmoqda...");
}

async function extractMediaLinks(page) {
  await page.waitForSelector("a.button__download", {
    timeout: RESULT_TIMEOUT_MS,
  });

  await new Promise((resolve) => {
    setTimeout(resolve, RESULT_STABILIZE_DELAY_MS);
  });

  return page.evaluate(() => {
    const links = [];

    document.querySelectorAll("li.output-list__item").forEach((item) => {
      const downloadButton = item.querySelector("a.button__download");

      if (!downloadButton || !downloadButton.href) {
        return;
      }

      const href = downloadButton.href;
      const isVideo =
        item.querySelector(".tags__item--video") !== null ||
        href.includes(".mp4");

      links.push({
        url: href,
        type: isVideo ? "video" : "photo",
      });
    });

    return links;
  });
}

async function getMediaLinks(instagramUrl) {
  // console.log(`🔍 Scraping: ${instagramUrl}`);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: BROWSER_ARGS,
  });

  try {
    const page = await browser.newPage();

    await preparePage(page);
    await submitInstagramUrl(page, instagramUrl);

    const mediaLinks = await extractMediaLinks(page);
    // console.log(`✅ ${mediaLinks.length} ta media topildi`);

    return mediaLinks;
  } finally {
    await browser.close();
  }
}

module.exports = {
  getMediaLinks,
};
