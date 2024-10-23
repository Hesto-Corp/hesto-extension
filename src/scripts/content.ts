import { addDimOverlay, removeDimOverlay } from '../helpers/overlay'
import { detectPurchaseIntent, extractProductData } from '../helpers/parsing'
import { triggerPopup } from '../helpers/triggerPopup'
import { setProductData } from '../types/product'

// Event listener for click events to detect purchasing intent
document.addEventListener('click', async (event) => {
  const target = event.target as HTMLElement;

  console.log('Clicked element:', target);

  // Find the closest actionable element (button, link, or input)
  const actionableElement = target.closest('button, a, input') as HTMLElement | null;

  if (actionableElement && detectPurchaseIntent(actionableElement)) {
    console.log('Detected purchasing intent based on actionable element:', actionableElement);

    // TODO: Handle Null case, just don't do any detection in that case!
    const product_data = await extractProductData()
    console.log("Extracted Data: ", product_data)

    if (product_data.name && product_data.price && product_data.url) {
      console.log("Product Data: ", product_data)
      setProductData(product_data)

      triggerPopup();
      addDimOverlay();
    }

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
