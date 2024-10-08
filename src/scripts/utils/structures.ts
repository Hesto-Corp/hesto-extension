export function savePopupDataToStorage(popupData: PopupData) {
  chrome.storage.local.set({ popupData }, () => {
    console.log('Popup data has been set in Chrome storage:', popupData);
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
