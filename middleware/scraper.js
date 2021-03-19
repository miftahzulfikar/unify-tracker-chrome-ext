const startBrowser = require("./browser");
const spreadsheetAPI = require("./spreadsheet");
const { tagList, sheetList } = require("./constant");

(async () => {
  let browserInstance = await startBrowser();

  try {
    for (let i = 0; i < sheetList.length; i++) {
      const module = sheetList[i];
      // get routes
      const response = await spreadsheetAPI.get({
        range: `${module}!D6:D100`,
      });
      const values = response.values.flat();

      for (let j = 0; j < values.length; j++) {
        const params = JSON.parse(values[j]);
        const page = await browserInstance.newPage();

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

        await updateSingleRow(module, item, j);

        await page.close();
      }
      // update date
      await spreadsheetAPI.update({
        range: `${module}!B4`,
        valueInputOption: "RAW",
        resource: {
          values: [[Date()]],
        },
      });
    }

    // browserInstance.close();
  } catch (err) {
    console.log(err);
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
