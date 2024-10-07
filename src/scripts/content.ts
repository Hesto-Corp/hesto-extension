import { safeSendMessage } from './utils/messaging'
import { addDimOverlay, removeDimOverlay} from './utils/overlay'


// ==Utility Functions==
// Function to recursively extract text from an element and its children
function getDeepText(element: HTMLElement): string {
  let text = '';
  element.childNodes.forEach(child => {
    if (child.nodeType === Node.TEXT_NODE) {
      text += (child.textContent || '').trim() + ' ';
    } else if (child instanceof HTMLElement) {
      text += getDeepText(child).trim() + ' ';
    }
  });
  return text.trim();
}

// ==Price Detection==

// Function to find the price element near the actionable element
function findPriceNearby(actionableElement: HTMLElement): number | null {
  let price: string = '';

  // Start by looking at siblings of the actionable element
  let parent = actionableElement.parentElement;
  while (parent && !price) {
    // Search for potential price elements in siblings or parent
    const potentialPriceElements = parent.querySelectorAll('span, div, p');
    potentialPriceElements.forEach((el) => {
      if (el instanceof HTMLElement) {
        if (
          el.className.toLowerCase().includes('price') ||
          el.className.toLowerCase().includes('cost') ||
          el.id.toLowerCase().includes('price') ||
          el.id.toLowerCase().includes('cost')
        ) {
          price = getDeepText(el);
        }
      }
    });

    // Move up one level to continue the search
    parent = parent.parentElement;
  }

  if (price) {
    // Remove any non-numeric characters except for decimal points
    const cleanedPrice = price.replace(/[^0-9.]/g, '');

    // Convert to a number
    const numericPrice = parseFloat(cleanedPrice);

    // If the result is a valid number, return it, otherwise return null
    return isNaN(numericPrice) ? null : numericPrice;
  }

  return null;
}

// ==Purchase Intent Detection==

// Keywords for purchasing intent
const keywords: string[] = ['add to cart', 'buy now', 'checkout', 'add to bag', 'purchase', 'order now', 'buy', 'cart', 'checkout'];
const buyIntentRegex = /(add to cart|buy now|checkout|add to bag|purchase|order now|buy|cart|checkout)/i;

// Function to detect purchasing intent from actionable element attributes
function detectPurchaseIntent(actionableElement: HTMLElement): boolean {
  const actionableText = getDeepText(actionableElement).toLowerCase();

  // Check if the text matches any keywords or regex
  if (actionableText && (keywords.some((keyword: string) => actionableText.includes(keyword)) || buyIntentRegex.test(actionableText))) {
    return true;
  }

  // Check for additional attributes that might indicate purchasing intent
  const label = actionableElement.getAttribute('aria-label') || actionableElement.getAttribute('title') || actionableElement.getAttribute('unbxdattr');
  if (label) {
    const labelText = label.trim().toLowerCase();
    if (keywords.some((keyword: string) => labelText.includes(keyword)) || buyIntentRegex.test(labelText)) {
      return true;
    }
  }

  // Check for specific IDs or class names that indicate purchasing intent
  const elementId = actionableElement.id.toLowerCase();
  const elementClass = actionableElement.className.toLowerCase();
  if (elementId.includes('buy') || elementId.includes('checkout') || elementClass.includes('buy') || elementClass.includes('cart')) {
    return true;
  }

  return false;
}

// ==Event Handling==

// Event listener for click events to detect purchasing intent
document.addEventListener('click', (event) => {
  console.log("Click registered!!!!!!!!!!!!!!!!!");

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
    safeSendMessage({ action: 'open_space_popup', price: price || 'Price not found' });
    savePopupData('open_space_popup', price || 0);

    addDimOverlay();
  } else {
    console.log('No actionable element found for the click.');

    // TODO: this is a hack also doesn't work on clicking I really want this.
    // removeDimOverlay();
  }
});

// ==Message Handling==

// Listen for messages from the background script to remove the overlay
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'close_popup') {
    console.log("Removing Dimming!!!!");
    removeDimOverlay();
  }
});

// ==Chrome Storage Management==

// Chrome Storage: Save popup data
function savePopupData(action: string, price: number | string) {
  chrome.storage.local.set({ popupData: { action, price } }, () => {
    console.log('Popup data has been set in Chrome storage.');
  });
}
