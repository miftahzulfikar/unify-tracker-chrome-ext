const express = require("express");
const bodyParser = require("body-parser");
const spreadsheetAPI = require("./spreadsheet");
const { componentList, getComponentDataById } = require("./helpers");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
const port = 3000;

app.get("/component-list", (req, res) => {
  res.send(componentList);

  // const resolve = await spreadsheetAPI.update(
  //   {
  //     range: "Homepage-Desktop!B4",
  //     valueInputOption: "RAW",
  //     resource: {
  //       values: [["Test", Date(), req.params.id, 10]],
  //     },
  //   },
  //   res
  // );
});

app.put("/", (req, res) => {
  console.log(req.body);
  const { range, list } = req.body;

  const parsedList = JSON.parse(list);
  const dateNow = Date();
  const values = parsedList.map((x) => [x.name, dateNow, x.count, "-"]);

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

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
