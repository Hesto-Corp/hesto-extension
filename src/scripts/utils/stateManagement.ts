export function savePopupDataToStorage(popupData: PopupData) {
  chrome.storage.local.set({ popupData }, () => {
    console.log('Popup data has been set in Chrome storage:', popupData);
  });
}

export function setToIdle() {
  console.log("Setting Popup State to Idle");

  chrome.storage.local.set({ popupData: { state: PopupState.Idle } }, () => {
    console.log("Popup state has been set to Idle in Chrome storage.");
  });
}

export enum PopupState {
  Idle,
  Detected,
}

export interface Product{
  name: string | null
  price: number | null
  currency: string | null
  url?: string
}

export interface PopupData {
  state: PopupState // Idle / Detected
  product?: Product
}
