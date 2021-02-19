
function createStyle() {
  const style = document.createElement("link");

  style.rel = 'stylesheet';
  style.type = 'text/css';
  style.id = 'unifySelector';
  style.href = chrome.extension.getURL('/assets/style/unifySelectorCSS.css');

  document.getElementsByTagName('head')[0].appendChild(style);
}

function scriptAction() {
  if (document.getElementById('unifySelector')) {
    // if they exist, remove them
    document.getElementsByTagName('head')[0].removeChild(document.getElementById('unifySelector'));

  } else {
    // if they don't exist, inject createStyle();
    createStyle();
  }
}

scriptAction();
