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
