const express = require("express");
const bodyParser = require("body-parser");
const spreadsheetAPI = require("./spreadsheet");
const { componentList } = require("./helpers");
const scraper = require("./scraper");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
const port = 3000;

app.get("/component-list", (req, res) => {
  res.send(componentList);
});

app.put("/update-spreadsheet", (req, res) => {
  console.log(req.body);
  const { range, list } = req.body;

  const parsedList = JSON.parse(list);
  const dateNow = Date();
  const values = parsedList.map((x) => [x.name, dateNow, x.count]);

  const resolve = spreadsheetAPI.update(
    {
      range: range,
      valueInputOption: "RAW",
      resource: {
        values: values,
      },
    },
    res
  );
});

app.post("/scraper", (req, res) => {
  console.log(req.body);
  const { urls } = req.body;

  const parsedUrls = JSON.parse(urls);
  scraper(parsedUrls);

  res.send(200);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
