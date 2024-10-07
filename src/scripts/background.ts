chrome.runtime.onMessage.addListener((message) => {
  console.log("Background: Opening Popup!!!");
  if (message.action === 'open_space_popup') {
    console.log("Background: Opening Popup!!!");
    chrome.action.openPopup();
  }
});

chrome.runtime.onConnect.addListener((port) => {
  console.assert(port.name === 'popup_lifecycle');
  port.onDisconnect.addListener(() => {
    console.log('Port has been disconnected');

    // Send a message to the content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && typeof tabs[0].id !== 'undefined') {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'close_popup' });
      }
    });

  });
});
