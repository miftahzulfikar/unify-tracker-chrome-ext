(function (window, document) {
  "use strict";

  function toggleAction(tabs) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.executeScript(tabs[0].id, { file: "unifySelectorJS.js" });
    });
  }

  chrome.browserAction.onClicked.addListener(function (tab) {
    toggleAction(tab);
    chrome.tabs.sendMessage(tab.id,"toggle");
  });
})(window, document);
