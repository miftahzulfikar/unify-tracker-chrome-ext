console.log("background js");

function buttonClicked(tab) {
  let msg = { text: "toggle", };

  chrome.tabs.sendMessage(tab.id, msg);
}

chrome.browserAction.onClicked.addListener(buttonClicked);
