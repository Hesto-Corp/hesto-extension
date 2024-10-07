// Keywords for purchasing intent
const keywords: string[] = ['add to cart', 'buy now', 'checkout', 'add to bag', 'purchase', 'order now', 'buy', 'cart', 'checkout'];
const buyIntentRegex = /(add to cart|buy now|checkout|add to bag|purchase|order now|buy|cart|checkout)/i;

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
          el.id.toLowerCase().includes('cost') ||
          buyIntentRegex.test(el.textContent || '')
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

document.addEventListener('click', (event) => {
  console.log("Click registered!!!!!!!!!!!!!!!!!");

  const target = event.target as HTMLElement;

  // Log details of the clicked target
  console.log('Clicked element:', target);
  console.log('Clicked element tag name:', target.tagName);
  console.log('Clicked element text:', target.textContent?.trim());

  // Find the closest actionable element (button, link, or input)
  const actionableElement = target.closest('button, a, input') as HTMLElement | null;

  if (actionableElement) {
    console.log('Actionable element found:', actionableElement);
    console.log('Actionable element tag name:', actionableElement.tagName);

    // Extract text from the element in multiple ways
    let actionableText = actionableElement.textContent?.trim().toLowerCase() || '';
    if (!actionableText) {
      actionableText = actionableElement.innerText?.trim().toLowerCase() || '';
    }
    if (!actionableText) {
      actionableText = getDeepText(actionableElement).toLowerCase();
    }

    console.log('Extracted actionable text:', actionableText);

    // Check if the text matches any keywords or regex
    if (actionableText && (keywords.some((keyword: string) => actionableText.includes(keyword)) || buyIntentRegex.test(actionableText))) {
      console.log('Detected purchasing intent based on text:', actionableText);

      // Find the price nearby
      const price = findPriceNearby(actionableElement);
      if (price) {
        console.log('Detected price near actionable element:', price);
      } else {
        console.log('No price found near the actionable element.');
      }

      chrome.runtime.sendMessage({ action: 'open_space_popup', price: price || 'Price not found' });
      chrome.storage.local.set({ popupData: { action: 'open_space_popup', price: price } }, () => {
        console.log('Popup data has been set in Chrome storage.');
      });
      return;
    }

    // Check for additional attributes that might indicate purchasing intent
    const label = actionableElement.getAttribute('aria-label') || actionableElement.getAttribute('title') || actionableElement.getAttribute('unbxdattr');
    if (label) {
      const labelText = label.trim().toLowerCase();
      console.log('Extracted label text:', labelText);

      if (keywords.some((keyword: string) => labelText.includes(keyword)) || buyIntentRegex.test(labelText)) {
        console.log('Detected purchasing intent based on label:', labelText);

        const price = findPriceNearby(actionableElement);
        if (price) {
          console.log('Detected price near actionable element:', price);
        } else {
          console.log('No price found near the actionable element.');
        }

        chrome.runtime.sendMessage({ action: 'open_space_popup', price: price || 'Price not found' });
        chrome.storage.local.set({ popupData: { action: 'open_space_popup', price: price } }, () => {
          console.log('Popup data has been set in Chrome storage.');
        });

        return;
      }
    }

    // Check for specific IDs or class names that indicate purchasing intent
    const elementId = actionableElement.id.toLowerCase();
    const elementClass = actionableElement.className.toLowerCase();
    console.log('Element ID:', elementId);
    console.log('Element Class:', elementClass);

    if (
      elementId.includes('buy') ||
      elementId.includes('checkout') ||
      elementClass.includes('buy') ||
      elementClass.includes('cart')
    ) {
      console.log('Detected purchasing intent based on ID or class:', actionableElement);
      chrome.runtime.sendMessage({ action: 'open_space_popup' });
      return;
    }
  } else {
    console.log('No actionable element found for the click.');
  }
});
