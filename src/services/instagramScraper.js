// scraper.js
const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");

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

async function getMediaLinks(instagramUrl) {
  let browser = null;
  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();
    
    // Yaxshiroq timeout va user agent
    await page.setUserAgent(USER_AGENT);
    await page.setViewport(VIEWPORT);
    await page.setDefaultNavigationTimeout(NAVIGATION_TIMEOUT_MS);

    await page.goto(SCRAPER_URL, { 
      waitUntil: "networkidle2", 
      timeout: NAVIGATION_TIMEOUT_MS 
    });

    // Input va submit
    await page.waitForSelector("#input", { timeout: INPUT_TIMEOUT_MS });
    await page.type("#input", instagramUrl);   // evaluate o‘rniga oddiyroq usul

    await page.waitForSelector("button.form__submit", { timeout: SUBMIT_TIMEOUT_MS });
    await page.click("button.form__submit");

    // Natijani kutish
    await page.waitForSelector("a.button__download", { 
      timeout: RESULT_TIMEOUT_MS 
    });

    await new Promise(r => setTimeout(r, RESULT_STABILIZE_DELAY_MS));

    const mediaLinks = await page.evaluate(() => {
      const links = [];
      document.querySelectorAll("li.output-list__item").forEach(item => {
        const btn = item.querySelector("a.button__download");
        if (!btn?.href) return;

        const isVideo = item.querySelector(".tags__item--video") !== null || 
                       btn.href.includes(".mp4");

        links.push({
          url: btn.href,
          type: isVideo ? "video" : "photo"
        });
      });
      return links;
    });

    return mediaLinks;

  } finally {
    if (browser) await browser.close();
  }
}

module.exports = { getMediaLinks };