export function setProductData(productData: ProductData) {
  chrome.storage.local.set({ productData }, () => {
    console.log("Product Data updated.")
  });
};

export function clearProductData() {
  chrome.storage.local.set({ productData: null }, () => {
    console.log("Product Data cleared.");
  });
};

export interface ProductData {
  name: string | null
  price: number | null
  currency: string | null
  url?: string
}
