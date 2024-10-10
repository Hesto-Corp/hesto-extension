import { safeSendMessage } from '../helpers/messages'
import { AppState } from '../types/appState'

// Somehow make this inaccessible without trigger.
function updateAppState(appState: AppState) {
  chrome.storage.local.set({ appState }, () => {
    console.log('App State has been set in Chrome storage:', appState);
  });
}
export function clearTriggerPopup(){
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0] && typeof tabs[0].id !== 'undefined') {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'close_popup' });
    }
  });
  updateAppState(AppState.Idle);
}

export function triggerPopup(){
  updateAppState(AppState.Detected);
  safeSendMessage({ action: 'trigger_popup'});
};
