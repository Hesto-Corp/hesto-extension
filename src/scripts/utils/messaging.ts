/**
 * Safely sends a message to the background script or other parts of the extension.
 * 
 * This function ensures that the extension context is still valid before attempting
 * to send a message using `chrome.runtime.sendMessage()`. It handles any potential 
 * errors that may occur due to invalid contexts, like when the extension is 
 * reloaded or disabled.
 * 
 * @param message - The message object to be sent, containing key-value pairs 
 *                  representing the action or data to be shared.
 */
export function safeSendMessage(message: any) {
  if (!chrome.runtime || !chrome.runtime.sendMessage) {
    console.warn("Cannot send message, extension context might be invalid.");
    return;
  }
  try {
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        console.warn("Error in sending message:", chrome.runtime.lastError.message);
      } else {
        console.log("Message sent successfully:", response);
      }
    });
  } catch (error) {
    console.warn("Failed to send message:", error);
  }
}
