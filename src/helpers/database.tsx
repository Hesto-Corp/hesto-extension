import { auth, db } from '@/firebase.config';
import { ProductData } from '@/types/product';
import { addDoc, collection } from 'firebase/firestore';

/**
 * Saves the given product data to Firestore under the current user's collection.
 * 
 * This function assumes that a user is logged in, and it stores the product data 
 * in a `products` sub-collection under the `userData/{userId}/products` path in Firestore.
 * 
 * @param {ProductData} product - The product data to save to Firestore.
 * @returns {Promise<void>} - A promise that resolves when the data is successfully written.
 */
export async function writeProductData(product: ProductData): Promise<void> {
  // Retrieve the current user's ID from Firebase authentication
  const userId = auth.currentUser?.uid;

  // Check if a user is logged in before proceeding
  if (userId) {
    try {
      // Reference to the current user's `products` collection in Firestore
      const userSavedProductsRef = collection(db, 'userData', userId, 'products');

      // Add the product data to the collection, along with a timestamp
      await addDoc(userSavedProductsRef, {
        ...product,      // Spread the product object properties into the Firestore document
        date: new Date(), // Add a timestamp for when the product was saved
      });

      console.log("Product data successfully saved!");

    } catch (error) {
      // Log any errors that occur during the save operation
      console.error("Error saving product data: ", error);
    }
  } else {
    // Handle the case where no user is logged in
    console.warn("No user is logged in. Cannot save product data.");
  }
}
