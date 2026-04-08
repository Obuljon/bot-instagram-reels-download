const SCRAPER_URL = "https://sssinstagram.com/en1";

const VIEWPORT = {
  width: 1280,
  height: 800,
};

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const BROWSER_ARGS = [
  "--no-sandbox",
  "--disable-setuid-sandbox",
  "--disable-dev-shm-usage",
  "--disable-gpu",
  "--window-size=1280,800",
];

const NAVIGATION_TIMEOUT_MS = 30000;
const INPUT_TIMEOUT_MS = 10000;
const SUBMIT_TIMEOUT_MS = 5000;
const RESULT_TIMEOUT_MS = 25000;
const RESULT_STABILIZE_DELAY_MS = 1500;

module.exports = {
  BROWSER_ARGS,
  INPUT_TIMEOUT_MS,
  NAVIGATION_TIMEOUT_MS,
  RESULT_STABILIZE_DELAY_MS,
  RESULT_TIMEOUT_MS,
  SCRAPER_URL,
  SUBMIT_TIMEOUT_MS,
  USER_AGENT,
  VIEWPORT,
};
