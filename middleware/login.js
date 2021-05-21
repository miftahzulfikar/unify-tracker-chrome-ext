const puppeteer = require("puppeteer");
const startBrowser = require("./browser");
const iPhone = puppeteer.devices["iPhone 6"];

(async () => {
  console.log("login...");
  // let browserInstance = await startBrowser({ headless: false });

  // const page = await browserInstance.newPage();

  // await page.emulate(iPhone);

  // await page.setDefaultNavigationTimeout(0);

  await page.goto("https://staging.tokopedia.com/", {
    waitUntil: "networkidle2",
  });

  await page.click('[data-testid="btnLogin"]');

  await page.waitForTimeout(1000);

  await page.type("#input", "dwi.widodo+06@tokopedia.com");

  await page.click("#button-submit");

  await page.waitForTimeout(1000);

  await page.type("#password", "dodopass");

  await page.click("#button-submit");

  await page.waitForTimeout(1000);
})();
