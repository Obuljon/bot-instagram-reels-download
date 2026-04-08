const fs = require("fs");
const http = require("http");
const https = require("https");

const DOWNLOAD_TIMEOUT_MS = 30000;

function cleanupFile(filePath) {
  fs.unlink(filePath, () => {});
}

function downloadFile(url, destinationPath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https") ? https : http;
    const file = fs.createWriteStream(destinationPath);
    let isSettled = false;

    const handleFailure = (error) => {
      if (isSettled) {
        return;
      }

      isSettled = true;
      file.close(() => cleanupFile(destinationPath));
      reject(error);
    };

    const handleSuccess = () => {
      if (isSettled) {
        return;
      }

      isSettled = true;
      resolve();
    };

    const request = protocol.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location;

        file.close(() => cleanupFile(destinationPath));

        if (!redirectUrl) {
          reject(new Error("Redirect manzili topilmadi"));
          return;
        }

        downloadFile(redirectUrl, destinationPath).then(resolve).catch(reject);
        return;
      }

      if (response.statusCode !== 200) {
        handleFailure(new Error(`Server ${response.statusCode} qaytardi`));
        return;
      }

      response.pipe(file);
      file.on("finish", () => file.close(handleSuccess));
    });

    request.on("error", handleFailure);
    file.on("error", handleFailure);

    request.setTimeout(DOWNLOAD_TIMEOUT_MS, () => {
      request.destroy(new Error("Yuklab olish vaqti tugadi (timeout)"));
    });
  });
}

module.exports = {
  downloadFile,
};
