import { safeSendMessage } from '../utils/messaging'

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

export function updateAppState(appState : AppState){
  chrome.storage.local.set({ appState }, () => {
    console.log('App State has been set in Chrome storage:', appState);
  });
}

export function setProductData(productData: ProductData){
  chrome.storage.local.set({productData}, () => {
    console.log("Product Data updated.")
  });
};

export function clearProductData() {
  chrome.storage.local.set({productData: null}, () => {
    console.log("Product Data cleared.");
  });
};

export interface ProductData {
  name: string | null
  price: number | null
  currency: string | null
  url?: string
}

export enum AppState {
  Idle,
  Detected,
}

// chrome storage
// AppState: Idle / Detected
// ProductData: {}
