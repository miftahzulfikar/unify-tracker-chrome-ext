// sender

const button = document.getElementById("button");
const checkbox = document.getElementById("highlight");
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

const instance = axios.create({
  baseURL: "http://localhost:3000",
  headers: {
    "X-Requested-With": "XMLHttpRequest",
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/x-www-form-urlencoded",
  },
});

let list = [];
let targetCellValue = "Homepage-Desktop!B5";

targetCell.addEventListener("change", () => {
  targetCellValue = targetCell.value;
});

exportButton.addEventListener("click", handleExportButtonClick);

function handleExportButtonClick() {
  const formData = new URLSearchParams();
  formData.append("range", targetCellValue);
  formData.append("list", JSON.stringify(list));

  console.log(targetCellValue);
  instance.put("/", formData);
}

// listener

chrome.runtime.onMessage.addListener(gotMessage);

function gotMessage(message, sender, sendResponse) {
  console.log(message);

  if (message.type === "setCount") {
    list = message.data;
    const wrapper = document.getElementById("table-list");
    const data = list.reduce(function (curr, item, i) {
      return `${curr}<tr><td style="background-color: ${item.color};">${i + 1}</td><td>${item.name}</td><td>${item.count}</td></tr>`;
    }, "");
    wrapper.innerHTML = data;
  }
}
