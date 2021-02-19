console.log("hello world from content extension");

const componentList = [
  {
    id: 1,
    name: "Button",
    selector: "*[class*='unf-btn']",
  },
  {
    id: 2,
    name: "Card",
    selector: "*[class*='unf-card']",
  },
];

const colors = [
  "#d90c8d",
  "#4f9cf9",
  "#abb0b8",
  "#877bf1",
  "#9c7b60",
  "#361092",
  "#eb07e9",
  "#930df2",
];

var data = [];
var highlight = true;

chrome.runtime.onMessage.addListener(gotMessage);

function gotMessage(message, sender, sendResponse) {
  console.log(message);
  if (message.type === "BUTTON_CLICK") {
    handleButtonClick();
  } else if (message.type === "CHECKBOX_CLICK") {
    handleCheckboxClick(message.value);
  }
}

function handleButtonClick() {
  data = [];

  componentList.forEach(function (item, i) {
    const count = countComponent(item.selector, i);
    if (count > 0) {
      data.push({ ...item, count, color: colors[i] });
    }
  });

  chrome.runtime.sendMessage({
    type: "setCount",
    data,
  });
}

function handleCheckboxClick(value) {
  highlight = value;
  data.forEach((element, i) => {
    highlightComponent(element.selector, i);
  });
}

function countComponent(selector, i) {
  let list = document.querySelectorAll(selector);
  highlightComponent(selector, i);

  return list.length;
}

function highlightComponent(selector, i) {
  let list = document.querySelectorAll(selector);
  list.forEach((element) => {
    if (highlight) {
      element.style.outline = `2px dotted ${colors[i]}`;
    } else {
      element.style.outline = "none";
    }
  });
  return list.length;
}
