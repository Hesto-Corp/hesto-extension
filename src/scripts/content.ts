import { addDimOverlay, removeDimOverlay } from '../helpers/overlay'
import { findPriceNearby, detectPurchaseIntent } from '../helpers/parsing'
import { triggerPopup } from '../helpers/triggerPopup'
import { setProductData } from '../types/product'

// Event listener for click events to detect purchasing intent
document.addEventListener('click', (event) => {
  const target = event.target as HTMLElement;

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
    setProductData({
      name: 'Example Product',
      price: price,
      currency: 'USD',
    });
    triggerPopup();
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
