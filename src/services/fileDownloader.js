const fs = require("fs");
const https = require("https");
const http = require("http");

const DOWNLOAD_TIMEOUT_MS = 45000; // 45 sekund

async function downloadFile(url, destinationPath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https") ? https : http;
    const file = fs.createWriteStream(destinationPath);

    const req = protocol.get(url, { timeout: DOWNLOAD_TIMEOUT_MS }, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        return downloadFile(response.headers.location, destinationPath)
          .then(resolve)
          .catch(reject);
      }

      if (response.statusCode !== 200) {
        return reject(new Error(`HTTP ${response.statusCode}`));
      }

      response.pipe(file);

      file.on("finish", () => {
        file.close();
        resolve();
      });
    });

    req.on("error", (err) => {
      file.close();
      fs.unlink(destinationPath, () => {});
      reject(err);
    });

    req.setTimeout(DOWNLOAD_TIMEOUT_MS, () => {
      req.destroy();
      file.close();
      fs.unlink(destinationPath, () => {});
      reject(new Error("Download timeout"));
    });
  });
}

module.exports = { downloadFile };