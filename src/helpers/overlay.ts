/**
 * Adds a dimming overlay to the webpage.
 * 
 * This function creates and appends a semi-transparent overlay that dims the entire page.
 * The opacity of the overlay can be customized using the `dimAmount` parameter, 
 * and the ID can be specified for further customization or management.
 * 
 * @param {number} [dimAmount=0.8] - The opacity of the overlay, where 0 is fully transparent and 1 is fully opaque.
 * @param {string} [overlayId='dim-overlay'] - The ID to assign to the overlay element. Default is 'dim-overlay'.
 */
export function addDimOverlay(dimAmount: number = 0.8, overlayId: string = 'dim-overlay') {
  if (document.getElementById(overlayId)) {
    console.log('Overlay already exists');
    return; // Avoid adding the overlay multiple times
  }

  // Create an overlay element
  const overlay = document.createElement('div');
  overlay.id = overlayId;
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.backgroundColor = `rgba(0, 0, 0, ${dimAmount})`; // Set the dimming level based on `dimAmount`
  overlay.style.zIndex = '9998'; // Set the overlay to cover everything on the webpage but still below the popup
  overlay.style.pointerEvents = 'none'; // Ensure it doesn't block interactions with the extension popup

  // Append the overlay to the body
  document.body.appendChild(overlay);
}

/**
 * Removes the dimming overlay from the webpage.
 * 
 * This function removes the overlay element with the specified ID from the page.
 * 
 * @param {string} [overlayId='dim-overlay'] - The ID of the overlay element to be removed. Default is 'dim-overlay'.
 */
export function removeDimOverlay(overlayId: string = 'dim-overlay') {
  const overlay = document.getElementById(overlayId);
  if (overlay) {
    overlay.remove();
  } else {
    console.warn(`No overlay found with ID: ${overlayId}`);
  }
}
