// request body:
const scraperConfig = [
  {
    module: "Search",
    routes: [
      {
        url: "https://61kvi.csb.app/",
        name: "Search Page",
        wait: 10000,
        login: true,
      },
      {
        url:
          "https://www.tokopedia.com/search?q=rockbros+ts+43&source=universe&st=product&navsource=home",
        name: "Search Result Page - Product",
        lazyload: true,
        login: true,
      },
    ],
  },
  {
    module: "PDP",
    routes: [
      {
        url: "https://61kvi.csb.app/",
        name: "PDP Page",
        wait: 10000,
      },
    ],
  },
  {
    module: "Test",
    routes: [
      {
        url: "https://61kvi.csb.app/",
        name: "PDP Page",
        wait: 10000,
      },
    ],
  },
];

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

const sheetList = ["Search", "PDP"];

// sample response body:
const resData = [
  {
    range: "Search!A1",
    value: [
      [
        "1",
        "Search Page",
        `
          url: www.tokopedia.com
          wait: 10000
          login: true
        `,
        `
          - Button
          - Chip
          - Label
          - List
          - SearchBar
        `,
        `
          - input
          - button
          - textarea
          - image
        `,
      ],
      [
        "2",
        "Search Result Page - Product",
        `
          url: https://www.tokopedia.com/search?q=rockbros+ts+43&source=universe&st=product&navsource=home
        `,
        `
          - BottomSheet
          - Button
          - Card
          - Chip
          - Label
          - SearchBar
          - Tab
        `,
        "",
      ],
    ],
  },
];

exports.scraperConf = scraperConfig;
exports.tagList = tagList;
exports.sheetList = sheetList;
