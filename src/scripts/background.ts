chrome.runtime.onMessage.addListener((message) => {
  console.log("Background: Opening Popup!!!");
  if (message.action === 'open_space_popup') {
    console.log("Background: Opening Popup!!!");
    chrome.action.openPopup();
  }
});
