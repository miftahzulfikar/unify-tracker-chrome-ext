const puppeteer = require("puppeteer");
const startBrowser = require("./browser");
const spreadsheetAPI = require("./spreadsheet");
// const { tagList } = require("./constant");
const postSlack = require("./postSlack");
const iPhone = puppeteer.devices["iPhone 6"];

(async () => {
  let startDate = Date();
  // every console log below will be printed on log file
  console.log("==========");
  console.log("Start Scraper : ", startDate);
  let slackMsg = `
    Unify Tracker Updated on: ${startDate}
    Scraper Log:
  `;
  let browserInstance = await startBrowser();

  try {
    const getParams = await spreadsheetAPI.batchGet({
      ranges: ["Dashboard!A9:A100", "Dashboard!E5:E100"],
    });

    const sheetList = getParams.valueRanges[0].values.flat();
    const tagList = getParams.valueRanges[1].values.flat();

    for (let i = 0; i < sheetList.length; i++) {
      try {
        const module = sheetList[i];

        console.log("scraping module: ", module);
        slackMsg += `# Module: ${module} \n`;

        // get routes & params
        const response = await spreadsheetAPI.batchGet({
          ranges: [`${module}!B6:B100`, `${module}!D6:D100`],
        });
        const routes = response.valueRanges[0].values.flat();
        const values = response.valueRanges[1].values.flat();

        for (let j = 0; j < values.length; j++) {
          console.log("- Scraping route: ", routes[j], "...");
          const params = JSON.parse(values[j]);
          const page = await browserInstance.newPage();

          await page.emulate(iPhone);

          await page.setDefaultNavigationTimeout(0);

          await page.goto(params.url, { waitUntil: "networkidle2" });

          if (params.lazyload) {
            // Get scroll width and height of the rendered page and set viewport
            const bodyWidth = await page.evaluate(
              () => document.body.scrollWidth
            );
            const bodyHeight = await page.evaluate(
              () => document.body.scrollHeight
            );
            await page.setViewport({ width: bodyWidth, height: bodyHeight });
            await page.waitForTimeout(10000);
          }

          if (params.wait) {
            await page.waitForTimeout(params.wait);
          }

          const item = await page.evaluate(
            async ({ params, tagList }) => {
              const { name, ...otherParams } = params;
              // unify
              let list = document.querySelectorAll("[data-unify]");

              const reduced = Array.from(list).reduce((acc, el) => {
                const key = el.getAttribute("data-unify");

                acc[key] = acc[key] ? acc[key] + 1 : 1;

                return acc;
              }, {});

              const reduced2 = Object.keys(reduced).reduce(
                (acc, x) => `${acc}- ${x}: ${reduced[x]}\n`,
                ""
              );

              // non unify

              let nonUnifyList = tagList.reduce((acc, tag) => {
                const count = document.querySelectorAll(
                  `${tag}:not([data-unify])`
                ).length;
                if (count > 0) {
                  return `${acc}- ${tag}: ${count}\n`;
                }

                return acc;
              }, "");

              return [reduced2, nonUnifyList];
            },
            { params, tagList }
          );

          console.log("insert data to spreadsheet...");

          try {
            await updateSingleRow(module, item, j);
            slackMsg += `- ${routes[j]} :heavy_check_mark: \n`;
          } catch (e) {
            slackMsg += `- ${routes[j]} :x: \n`;
          } finally {
            await page.close();
          }
        }

        console.log("Module ", module, "has been scraped.");
        // update date
        console.log("updating date to spreadsheet...");
        await spreadsheetAPI.update({
          range: `${module}!B4`,
          valueInputOption: "RAW",
          resource: {
            values: [[startDate]],
          },
        });
      } catch (e) {
        console.log(e);
      }
    }

    slackMsg += `See detail information on https://docs.google.com/spreadsheets/d/1UcZ47-kYD5OzMZKuyKh4TfiFfhlnf3ooyI5R6u8PRbM/edit#gid=1030955860`;

    postSlack(slackMsg);
    console.log("Scraper Done");
  } catch (err) {
    console.log("error: ", err);
    postSlack("Unify Tracker Error:\n", err);
    console.log("Scraper Failed");
  } finally {
    browserInstance.close();
  }
})();

const updateSingleRow = async (module, values, i) => {
  try {
    return await spreadsheetAPI.update({
      range: `${module}!E${6 + i}`,
      valueInputOption: "RAW",
      resource: {
        values: [values],
      },
    });
  } catch (err) {
    throw `spreadsheet update failed for module: ${module} row: ${i + 1}`;
  }
};
