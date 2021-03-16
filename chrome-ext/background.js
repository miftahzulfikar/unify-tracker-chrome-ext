console.log("background js");

chrome.browserAction.onClicked.addListener(buttonClicked);

function buttonClicked(tab) {
  let msg = {
    text: "toggle",
  };

  chrome.tabs.sendMessage(tab.id, msg);
}
