import { addDimOverlay, removeDimOverlay } from './utils/overlay'
import { findPriceNearby, detectPurchaseIntent } from './tracking/extractInformation'
import { safeSendMessage } from './utils/messaging'
import { Url } from 'url';

// Event listener for click events to detect purchasing intent
document.addEventListener('click', (event) => {
  const target = event.target as HTMLElement;

  // Log details of the clicked target
  console.log('Clicked element:', target);

  // Find the closest actionable element (button, link, or input)
  const actionableElement = target.closest('button, a, input') as HTMLElement | null;

  if (actionableElement && detectPurchaseIntent(actionableElement)) {
    console.log('Detected purchasing intent based on actionable element:', actionableElement);

    // Find the price nearby
    const price = findPriceNearby(actionableElement);
    if (price) {
      console.log('Detected price near actionable element:', price);
    } else {
      console.log('No price found near the actionable element.');
    }

    // Send message to open the popup
    savePopupDataToStorage({
      state: DetectionState.Detected,
      product: { name: 'Example Product', price, currency: 'USD' }
    });

    safeSendMessage({ action: 'trigger_popup'}); // Trigger the Popup
    addDimOverlay();

  } else {
    console.log('No actionable element found for the click.');
  }
});

// Listen for messages from the background script to remove the overlay
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'close_popup') {
    removeDimOverlay();
  }
});


function savePopupDataToStorage(popupData: PopupData) {
  chrome.storage.local.set({ popupData }, () => {
    console.log('Popup data has been set in Chrome storage:', popupData);
  });
}


export enum DetectionState {
  Idle,
  Detected,
}

export interface Product{
  name: string | null
  price: number | null
  currency: string | null
  url?: Url
}

export interface PopupData {
  state: DetectionState // Idle / Detected
  product?: Product
}

