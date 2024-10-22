import { ProductData } from '@/types/product'
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


export function findPriceNearby(actionableElement: HTMLElement): number | null {
  let price: string = '';

  // Keywords to identify potential price-related elements
  const priceKeywords = ['price', 'cost', 'amount', 'total', 'value', 'sale'];

  // Regex to identify common price patterns (e.g., "$123.45", "123.45 USD")
  const priceRegex = /[$€£¥₹]?\s?(\d{1,3}(,\d{3})*(\.\d{2})?)/;

  // Start by looking at siblings and parent elements
  let parent = actionableElement.parentElement;
  while (parent && !price) {
    const potentialPriceElements = parent.querySelectorAll('span, div, p, li, strong');

    potentialPriceElements.forEach((el) => {
      if (el instanceof HTMLElement) {
        const textContent = getDeepText(el);

        // Check if the element has price-related keywords in class or id
        const classOrId = (el.className + el.id).toLowerCase();
        if (priceKeywords.some(keyword => classOrId.includes(keyword))) {
          price = textContent;
        }

        // If no match via class or id, try to find price using regex
        const match = textContent.match(priceRegex);
        if (match && !price) {
          price = match[0];
        }
      }
    });

    // Move up one level to continue the search if no price is found
    parent = parent.parentElement;
  }

  if (price) {
    // Clean up the price text to extract the numeric value
    const cleanedPrice = price.replace(/[^0-9.]/g, '');

    // Convert to a number
    const numericPrice = parseFloat(cleanedPrice);

    // Return the numeric price if valid, otherwise return null
    return isNaN(numericPrice) ? null : numericPrice;
  }

  return null;
}

// Define a recursive function to find the product data
function findProductData(jsonData: any): any | null {
  // Base case: if the current object is a Product
  if (jsonData['@type'] === 'Product') {
    return jsonData;
  }

  // If it's an object, check all keys
  if (typeof jsonData === 'object' && jsonData !== null) {
    for (const key in jsonData) {
      if (jsonData.hasOwnProperty(key)) {
        const result = findProductData(jsonData[key]); // Recursive call
        if (result) {
          return result; // Return the product data as soon as it's found
        }
      }
    }
  }

  return null; // Return null if no product is found
}

// Function to extract JSON-LD structured data (schema.org)
export function extractJSONLD(): ProductData | null {
  const scriptTags = document.querySelectorAll('script[type="application/ld+json"]');
  let productData: ProductData | null = null;

  // Use a regular for loop so we can break early
  for (let i = 0; i < scriptTags.length; i++) {
    const script = scriptTags[i];
    const jsonText = script.textContent; // textContent can be null
    if (jsonText) {
      try {
        const jsonData = JSON.parse(jsonText);

        // Use the recursive function to find the Product data
        const product = findProductData(jsonData);

        if (product) {
          // Extract product details
          let price: number | null = null;
          let currency: string | null = null;
          let availability: string | null = null;

          if (product.offers) {
            price = product.offers.price ? parseFloat(product.offers.price) : null;
            currency = product.offers.priceCurrency || null;
            availability = product.offers.availability || null;
          }

          // Populate the product data
          productData = {
            name: product.name || null,
            price: price,
            currency: currency,
            availability: availability,
            image: product.image ? product.image[0] || null : null, // Use the first image if multiple are present
            description: product.description || null,
            url: window.location.href || null  // Add current page URL
          };
          break; // Exit loop once the product data is found
        }
      } catch (error) {
        console.error("Error parsing JSON-LD:", error);
      }
    }
  }

  return productData;
}

const currencySymbolMap: Record<string, string> = {
  '$': 'USD',    // US Dollar
  '€': 'EUR',    // Euro
  '£': 'GBP',    // British Pound
  '¥': 'JPY',    // Japanese Yen
  '₹': 'INR',    // Indian Rupee
  '₣': 'CHF',    // Swiss Franc
  '₩': 'KRW',    // South Korean Won
  '₽': 'RUB',    // Russian Ruble
  '₺': 'TRY',    // Turkish Lira
  'R$': 'BRL',   // Brazilian Real
  'C$': 'CAD',   // Canadian Dollar
  'A$': 'AUD'    // Australian Dollar
};

// Function to extract product data from Amazon and return as ProductData
export function extractAmazonProduct(): ProductData | null {
  // Extract the product name (typically in the 'productTitle' id)
  const name = (document.getElementById('productTitle') as HTMLDivElement)?.textContent?.trim() || null;

  const currencySymbol = document.querySelector('.a-price-symbol')?.textContent?.trim() || '$';
  const currency = currencySymbolMap[currencySymbol] || 'USD'; // Map the symbol to currency code

  // Extract the price parts from the 'a-price-whole' and 'a-price-fraction' classes
  const priceWhole = document.querySelector('.a-price-whole')?.textContent?.replace(/[.,]/g, '').trim() || '0'; // Remove commas and periods
  const priceFraction = document.querySelector('.a-price-fraction')?.textContent?.trim() || '00'; // Default fraction to '00' if not present
  console.log("Price Whole: ", priceWhole)
  console.log("Price Fraction: ", priceFraction)

  // Combine the price whole and fraction parts to form the full price
  const fullPrice = parseFloat(`${priceWhole}.${priceFraction}`) || null;

  // Extract the product image URL (assert that it's an HTMLImageElement)
  const image = (document.getElementById('landingImage') as HTMLImageElement)?.src || null;

  // Extract the product description (now from the 'productDescription' section)
  const description = (document.getElementById('productDescription') as HTMLDivElement)?.textContent?.trim() || null;

  // Extract the product availability (could vary depending on region, so this is optional)
  const availability = (document.querySelector('#availability .a-declarative') as HTMLDivElement)?.textContent?.trim() || null;

  // Get the current page URL
  const url = window.location.href;

  // Return the extracted data as a ProductData object
  return {
    name,
    price: fullPrice,
    currency,
    url,
    image,
    description,
    availability
  };
}

// Call the function and log the result
const productData = extractAmazonProduct();
console.log(productData);

export function extractProductData(): ProductData {

  let productData: ProductData = {
    name: null,
    price: null,
    currency: null,
    url: null,
    image: null,
    description: null,
    availability: null
  }

  if (window.location.hostname.includes('amazon.com')) {
     const data = extractAmazonProduct();
    if (data != null) {
      productData = data;
      return productData;
    }
  }
  // TODO: ASOS.
  // Last Resort: Regex Query to find xx.xx Format

  const extractedData = extractJSONLD();
  if (extractedData !== null) {
    productData = extractedData;
    console.log('Extracted Product:', productData);
  } else {
    // Do other techniques
    console.log('No product data found.');
    // findPriceNearby, etc
  }

  return productData;
}
