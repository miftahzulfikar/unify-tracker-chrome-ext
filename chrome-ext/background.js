console.log("background js");

chrome.browserAction.onClicked.addListener(buttonClicked);

function buttonClicked(tab) {
  let msg = {
    text: "hello from background script",
  };

  chrome.tabs.sendMessage(tab.id, msg);
}
