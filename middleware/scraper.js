const startBrowser = require("./browser");
const spreadsheetAPI = require("./spreadsheet");
const { scraperConfig, tagList, scraperConf } = require("./constant");

(async () => {
  let browserInstance = await startBrowser();

  await scraperConf.reduce(async (items, x) => {
    const module = x.module;

    await Promise.all(
      x.routes.map(async (y) => {
        const page = await browserInstance.newPage();

        await page.setDefaultNavigationTimeout(0);

        await page.goto(y.url);

        if (y.wait) {
          await page.waitFor(y.wait);
        }

        const item = await page.evaluate(
          async ({ module, params, tagList }) => {
            const { name, ...otherParams } = params;
            // unify
            let list = document.querySelectorAll("[data-unify]");

            const reduced = Array.from(list).reduce((acc, y) => {
              const key = y.getAttribute("data-unify");

              acc[key] = acc[key] ? acc[key] + 1 : 1;

              return acc;
            }, {});

            const reduced2 = Object.keys(reduced).reduce(
              (acc, z) => `${acc}- ${z}: ${reduced[z]}\n`,
              ""
            );

            // non unify

            let nonUnifyList = tagList.reduce((acc, x) => {
              const count = document.querySelectorAll(`${x}:not([data-unify])`)
                .length;
              if (count > 0) {
                return `${acc}- ${x}: ${count}\n`;
              }

              return acc;
            }, "");

            return {
              module: module,
              values: [
                // result.length + 1,
                // name,
                Object.keys(otherParams).reduce(
                  (acc, x) => `${acc}- ${x}: ${otherParams[x]}\n`,
                  ""
                ),
                reduced2,
                nonUnifyList,
              ],
            };
          },
          { module, params: y, tagList }
        );

        await page.close();

        return item;
      })
    )
      .then(async (x) => {
        console.log("test", x);
        await updateSpreadsheet(x);
      })
      .catch((error) => {
        console.log("error promise: ", error);
      });
  }, []);
  browserInstance.close();
})();

const updateSpreadsheet = async (arr) => {
  arr.forEach(async (x, i) => {
    await updateSingleRow(x.module, x.values, i);
  });
  // let valuesItem = arr.reduce((acc, x) => {
  //   acc.push(["url :", x.url], ["COMPONENT", "COUNT"]);

  //   if (Object.keys(x.data).length > 0) {
  //     Object.keys(x.data).forEach((y) => {
  //       acc.push([y, x.data[y]]);
  //     });
  //   } else {
  //     acc.push(["None"]);
  //   }

  //   if (x.nonUnify.length > 0) {
  //     acc.push(
  //       ["----------"],
  //       ["Non Unify Element:"],
  //       ["Element", "COUNT"],
  //       ...x.nonUnify
  //     );
  //   }
  //   acc.push(["----------"]);
  //   return acc;
  // }, []);

  // const resUpdate = await updateSingleRow([
  //   ["========================================"],
  //   ["Date :", Date()],
  //   ["----------"],
  //   ...valuesItem,
  //   ["========================================"],
  // ]);
};

const updateSingleRow = async (module, values, i) => {
  return await spreadsheetAPI.update({
    range: `${module}!D${6 + i}`,
    valueInputOption: "RAW",
    resource: {
      values: [values],
    },
  });
};

// module.exports = scraper;
