console.log("hello world from content extension");

const componentList = [
  {
    id: 1,
    name: "Button",
    selector: "*[class*='unf-btn']",
  },
  // {
  //   id: 2,
  //   name: "Button non Unify",
  //   selector: "button:not(*[class*='unf-btn'])",
  // },
  {
    id: 3,
    name: "Image",
    selector: "picture.unf-image > img",
  },
  // {
  //   id: 3,
  //   name: "Image non Unify",
  //   selector: "img:not(picture.unf-image > img)",
  // },
  {
    id: 4,
    name: "Card",
    selector: "*[class*='unf-card']",
  },
];

// should unify
const tagList = [
  // "a", // link
  // typography
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

const colors = [
  "#d90c8d",
  "#4f9cf9",
  "#abb0b8",
  "#877bf1",
  "#9c7b60",
  "#361092",
  "#eb07e9",
  "#930df2",
  //
  "#d90c8d",
  "#4f9cf9",
  "#abb0b8",
  "#877bf1",
  "#9c7b60",
  "#361092",
  "#eb07e9",
  "#930df2",
];

var data = {
  unify: [],
  nonunify: [],
};

var highlight = true;
var highlightNonUnify = false;

chrome.runtime.onMessage.addListener(gotMessage);

function countComponent(selector, i) {
  let list = document.querySelectorAll(selector);
  // highlightComponent(selector, i);

  return list.length;
}

function highlightComponent(selector, i, coloring) {
  let list = document.querySelectorAll(selector);
  list.forEach((element) => {
    if (coloring) {
      element.style.outline = `2px dotted ${colors[i]}`;
    } else {
      element.style.outline = "none";
    }
  });
  return list.length;
}

function handleButtonClick() {
  data = {
    unify: [],
    nonunify: [],
  };

  componentList.forEach(function (item, i) {
    const count = countComponent(item.selector, i);
    if (count > 0) {
      highlightComponent(item.selector, i, highlight);
      data.unify.push({ ...item, count, color: colors[i] });
    }
  });

  tagList.forEach(function (item, i) {
    const count = countComponent(`${item}:not([data-unify])`, i);
    if (count > 0) {
      data.nonunify.push({ name: item, count, color: colors[i] });
    }
  });

  chrome.runtime.sendMessage({
    type: "setCount",
    data,
  });
}

function handleCheckboxClick(value) {
  highlight = value;
  data.unify.forEach((element, i) => {
    highlightComponent(element.selector, i, highlight);
  });
}

function handleCheckbox2Click(value) {
  highlightNonUnify = value;
  data.nonunify.forEach((element, i) => {
    highlightComponent(
      `${element.name}:not([data-unify])`,
      i,
      highlightNonUnify
    );
  });
}

function createIframe() {
  const iframe = document.createElement('iframe');
  iframe.id = "unifySelectorIframe";
  iframe.frameBorder = "none"; 
  iframe.src = chrome.extension.getURL("popup.html");

  document.body.appendChild(iframe);
}

function createStyle() {
  const style = document.createElement("link");
  style.id = 'unifySelectorStyle';
  style.rel = 'stylesheet';
  style.type = 'text/css';
  style.href = chrome.extension.getURL("/assets/style/unifySelectorCSS.css");

  document.getElementsByTagName('head')[0].appendChild(style);
}

function toggleIframe () {
  if (document.getElementById('unifySelectorIframe')) {
    // if they exist, remove them
    document.getElementsByTagName('body')[0].removeChild(document.getElementById('unifySelectorIframe'));
    document.getElementsByTagName('head')[0].removeChild(document.getElementById('unifySelectorStyle'));

  } else {
    // if they don't exist, inject createStyle() & createIframe();
    createStyle();
    createIframe();
  }
}

function gotMessage(message, sender, sendResponse) {
  console.log(message);

  if(message.text == "toggle"){
    toggleIframe();
  }
  
    if (message.type === "BUTTON_CLICK") {
      handleButtonClick();
    } else if (message.type === "CHECKBOX_CLICK") {
      handleCheckboxClick(message.value);
    } else if (message.type === "CHECKBOX2_CLICK") {
      handleCheckbox2Click(message.value);
    }
}
