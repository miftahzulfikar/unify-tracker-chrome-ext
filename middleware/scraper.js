const startBrowser = require("./browser");
const spreadsheetAPI = require("./spreadsheet");

const tagList = [
  // "a",
  // "h1",
  // "h2",
  // "h3",
  // "h4",
  // "h5",
  // "h6",
  // "p",
  "input",
  "textarea",
  "image",
  "button",
];

const scraper = async (urls = [], res) => {
  let browserInstance = await startBrowser();

  let result = [];

  await Promise.all(
    urls.map(async (x) => {
      const page = await browserInstance.newPage();

      await page.goto(x.url);

      if (x.wait) {
        await page.waitFor(x.wait);
      }

      result.push(
        await page.evaluate(
          ({ result, url, tagList }) => {
            // unify
            let list = document.querySelectorAll("[data-unify]");
            let data = [];
            list.forEach((y) => {
              data.push(y.getAttribute("data-unify"));
            });

            const reduced = Array.from(list).reduce((acc, y) => {
              const key = y.getAttribute("data-unify");

              acc[key] = acc[key] ? acc[key] + 1 : 1;

              return acc;
            }, {});

            // non unify

            let nonUnifyList = tagList.reduce((acc, x) => {
              const count = document.querySelectorAll(`${x}:not([data-unify])`)
                .length;
              if (count > 0) {
                acc.push([x, count]);
              }

              return acc;
            }, []);

            return { url: url, data: reduced, nonUnify: nonUnifyList };
          },
          { result, url: x.url, tagList }
        )
      );
    })
  );

  console.log(result);
  updateSpreadsheet(result, res);

  browserInstance.close();
};

const updateSpreadsheet = async (arr, res) => {
  let valuesItem = arr.reduce((acc, x) => {
    acc.push(["url :", x.url], ["COMPONENT", "COUNT"]);

    if (Object.keys(x.data).length > 0) {
      Object.keys(x.data).forEach((y) => {
        acc.push([y, x.data[y]]);
      });
    } else {
      acc.push(["None"]);
    }

    if (x.nonUnify.length > 0) {
      acc.push(
        ["----------"],
        ["Non Unify Element:"],
        ["Element", "COUNT"],
        ...x.nonUnify
      );
    }
    acc.push(["----------"]);
    return acc;
  }, []);

  const resUpdate = await updateSingleRow([
    ["========================================"],
    ["Date :", Date()],
    ["----------"],
    ...valuesItem,
    ["========================================"],
  ]);
};

const updateSingleRow = (values) => {
  return spreadsheetAPI.update({
    range: "scraper!A1",
    valueInputOption: "RAW",
    resource: {
      values: values,
    },
  });
};

module.exports = scraper;
