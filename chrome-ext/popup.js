// sender

const button = document.getElementById("button");
const checkbox = document.getElementById("highlight");
const checkbox2 = document.getElementById("highlight-non-unify");
const targetCell = document.getElementById("target-cell");
const exportButton = document.getElementById("export");

button.addEventListener("click", handleButtonClicked);

function handleButtonClicked() {
  console.log("button clicked");

  chrome.tabs.query({ active: true, currentWindow: true }, sendMessage);

  function sendMessage(tabs) {
    const msg = {
      type: "BUTTON_CLICK",
    };
    chrome.tabs.sendMessage(tabs[0].id, msg);
  }
}

checkbox.addEventListener("click", handleCheckboxClicked);

function handleCheckboxClicked() {
  console.log("checkbox clicked", checkbox.checked);

  chrome.tabs.query({ active: true, currentWindow: true }, sendMessage);

  function sendMessage(tabs) {
    const msg = {
      type: "CHECKBOX_CLICK",
      value: checkbox.checked,
    };
    chrome.tabs.sendMessage(tabs[0].id, msg);
  }
}

checkbox2.addEventListener("click", handleCheckbox2Clicked);

function handleCheckbox2Clicked() {
  console.log("checkbox clicked", checkbox.checked);

  chrome.tabs.query({ active: true, currentWindow: true }, sendMessage);

  function sendMessage(tabs) {
    const msg = {
      type: "CHECKBOX2_CLICK",
      value: checkbox2.checked,
    };
    chrome.tabs.sendMessage(tabs[0].id, msg);
  }
}

const instance = axios.create({
  baseURL: "http://localhost:3000",
  headers: {
    "X-Requested-With": "XMLHttpRequest",
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/x-www-form-urlencoded",
  },
});

let list = [];
let listNonUnify = [];
let targetCellValue = "Homepage-Desktop!B5"; // default

targetCell.addEventListener("change", () => {
  targetCellValue = targetCell.value;
});

exportButton.addEventListener("click", handleExportButtonClick);

function handleExportButtonClick() {
  const formData = new URLSearchParams();
  formData.append("range", targetCellValue);
  formData.append("list", JSON.stringify(list));

  console.log(targetCellValue);
  instance.put("/update-spreadsheet", formData);
}

// listener

chrome.runtime.onMessage.addListener(gotMessage);

function gotMessage(message, sender, sendResponse) {
  console.log(message);

  if (message.type === "setCount") {
    list = message.data.unify;
    const wrapper = document.getElementById("table-list");
    const data = list.reduce(function (curr, item, i) {
      return `${curr}<tr><td style="background-color: ${item.color};"></td><td>${item.name}</td><td>${item.count}</td></tr>`;
    }, "");
    wrapper.innerHTML = data;

    listNonUnify = message.data.nonunify;
    const wrapperNonUnify = document.getElementById("table-non-unify");
    const dataNonUnify = listNonUnify.reduce(function (curr, item, i) {
      return `${curr}<tr><td style="background-color: ${item.color};"></td><td>${item.name}</td><td>${item.count}</td></tr>`;
    }, "");
    wrapperNonUnify.innerHTML = dataNonUnify;
  }
}

handleButtonClicked();
handleCheckboxClicked();
handleCheckbox2Clicked();
