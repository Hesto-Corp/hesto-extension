/**
 * Recursively extracts text from an element and its children.
 * 
 * This function traverses the DOM structure of the given element and its children
 * to extract all the text content, ensuring all nested text nodes are included.
 * 
 * @param element - The root HTML element from which to extract the text.
 * @returns The combined text content of the element and all of its children.
 */
export function getDeepText(element: HTMLElement): string {
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


// Keywords for purchasing intent
const keywords: string[] = ['add to cart', 'buy now', 'checkout', 'add to bag', 'purchase', 'order now', 'buy', 'cart', 'checkout'];
const buyIntentRegex = /(add to cart|buy now|checkout|add to bag|purchase|order now|buy|cart|checkout)/i;

/**
 * Detects purchasing intent from an actionable HTML element.
 * 
 * This function inspects the provided actionable element (e.g., a button or link) to determine
 * if it likely represents a purchasing action, such as "add to cart" or "buy now".
 * The detection is based on matching keywords in the element's text content, attributes, ID, or class name.
 * 
 * @param {HTMLElement} actionableElement - The HTML element (e.g., button, link) to be analyzed for purchasing intent.
 * @returns {boolean} `true` if the element is determined to represent purchasing intent, otherwise `false`.
 * 
 * The function follows these steps:
 * 1. Extracts the deep text content of the actionable element and checks for purchasing-related keywords.
 * 2. Checks additional attributes (`aria-label`, `title`, etc.) to see if they indicate purchasing intent.
 * 3. Checks the element's `id` or `className` for keywords like "buy" or "cart" to infer purchasing intent.
 */
export function detectPurchaseIntent(actionableElement: HTMLElement): boolean {
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


/**
 * Finds the price element near the given actionable element.
 * 
 * This function searches for an element containing a price value near the provided actionable element.
 * It starts by examining the siblings of the actionable element and moves up through its ancestors.
 * It specifically looks for elements whose class or ID contains terms like 'price' or 'cost' to find potential price values.
 * 
 * @param {HTMLElement} actionableElement - The HTML element that triggered the action (e.g., a button clicked by the user).
 * @returns {number | null} The extracted price as a number, or null if no valid price is found.
 * 
 * The function follows these steps:
 * 1. Starts by examining siblings and parent elements of the actionable element.
 * 2. Searches for elements such as `<span>`, `<div>`, or `<p>` that may contain price information.
 * 3. Checks if the `className` or `id` of an element contains keywords like 'price' or 'cost'.
 * 4. Extracts and cleans the text content to derive a numeric price value.
 */
export function findPriceNearby(actionableElement: HTMLElement): number | null {
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
