import { safeSendMessage } from '../utils/messaging'

// export function savePopupDataToStorage(popupData: PopupData) {
//   chrome.storage.local.set({ popupData }, () => {
//     console.log('Popup data has been set in Chrome storage:', popupData);
//   });
// }
// 
// export function setToIdle() {
//   console.log("Setting Popup State to Idle");
// 
//   chrome.storage.local.set({ popupData: { state: PopupState.Idle } }, () => {
//     console.log("Popup state has been set to Idle in Chrome storage.");
//   });
// }
// 
// export enum PopupState {
//   Idle,
//   Detected,
// }
// 
// export interface Product {
//   name: string | null
//   price: number | null
//   currency: string | null
//   url?: string
// }
// 
// export interface PopupData {
//   state: PopupState // Idle / Detected
//   product?: Product
// }

// New
export function clearTriggerPopup(){
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
