const puppeteer = require("puppeteer");

async function startBrowser(props = {}) {
  let browser;
  try {
    console.log("Opening the browser...");
    browser = await puppeteer.launch({
      // headless: false,
      args: ["--disable-setuid-sandbox", "--disable-dev-shm-usage"],
      ignoreHTTPSErrors: true,
      ...props,
    });
  } catch (err) {
    console.log("Could not create a browser instance => : ", err);
    throw err;
  }
  return browser;
}

module.exports = startBrowser;
