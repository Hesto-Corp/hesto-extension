import { setToIdle } from './utils/stateManagement'
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth, db } from '../firebase.config';
import { getDoc, doc } from 'firebase/firestore';

import { UserInformation } from '../types/user';
import {AuthState} from '../types/auth';

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'trigger_popup') {
    console.log("Background: Opening Popup!!!");
    chrome.action.openPopup();
  }
});


// This is to manage graceful closing of the popups and relevant cleanups
chrome.runtime.onConnect.addListener((port) => {
  console.assert(port.name === 'popup_lifecycle');
  port.onDisconnect.addListener(() => {
    console.log('Port has been disconnected');

    // Send a message to the content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && typeof tabs[0].id !== 'undefined') {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'close_popup' });
      }
    });

    setToIdle();
  });
});


const fetchUserData = async (userUid: string): Promise<UserInformation> => {
  const userDoc = await getDoc(doc(db, 'users', userUid));

  if (!userDoc.exists()) {
    throw new Error('User document does not exist');
  }

  const userData = userDoc.data();

  if (!userData?.name) {
    throw new Error('Name field is missing');
  }

  // Return the user information object
  return {
    uid: userUid,
    name: userData.name || null,
    email: userData.email || null
  };
};

// Start listening for auth changes
// onAuthStateChanged(auth, async (user: User | null) => {
//   if (user) {
//     try {
//       const userName = await fetchUserData(user.uid);
//       chrome.storage.local.set({ isLoggedIn: true, userName });  // Set authPending to false after completion
//     } catch (error) {
//       console.error('Error fetching user data:', error);
//       await signOut(auth);
//       chrome.storage.local.set({ isLoggedIn: false, userName: null });  // Set authPending to false after completion
//     }
//   } else {
//     chrome.storage.local.set({ isLoggedIn: false, userName: null });  // Set authPending to false after completion
//   }
// });



/**
 * Updates the authentication state and user information in Chrome storage.
 * 
 * @param {AuthState} authState - The current state of authentication (whether the user is logged in, tokens, etc.).
 * @param {UserInformation | null} userInfo - The user information object containing uid, name, and email. If null, resets user info to null values.
 */
const setAuthStateInStorage = (authState: AuthState, userInfo: UserInformation | null) => {
  const storageData = {
    authState,
    userInfo: userInfo || {
      uid: null,
      name: null,
      email: null,
    },
  };
  chrome.storage.local.set(storageData);
};

/**
 * Handles the sign-out process by signing the user out of Firebase Auth
 * and resetting the authentication state and user information in Chrome storage.
 * 
 * @param {any} auth - The Firebase Auth instance.
 * @param {string | null} [errorMessage=null] - Optional error message to be stored in the authState in case of an error.
 */
const handleSignOut = async (auth: any, errorMessage: string | null = null) => {
  await signOut(auth);
  
  const errorAuthState: AuthState = {
    isLoggedIn: false,
    token: null,
    uid: null,
    pending: false,
    error: errorMessage,
  };

  // Reset both authState and userInfo to null values
  setAuthStateInStorage(errorAuthState, null);
};

/**
 * Handles successful user authentication by fetching the user's information
 * from the database, retrieving their authentication token, and updating Chrome storage.
 * 
 * If fetching the user data fails, it will sign the user out and store the error.
 * 
 * @param {User} user - The authenticated Firebase User object.
 */
const handleAuthSuccess = async (user: User) => {
  try {
    // Fetch user data (uid, name, email) from your Firestore or database
    const userInfo: UserInformation = await fetchUserData(user.uid);

    // Create the AuthState with the fetched user info and authentication token
    const updatedAuthState: AuthState = {
      isLoggedIn: true,
      token: await user.getIdToken(),
      uid: user.uid,
      pending: false,
      error: null,
    };

    // Store the updated authState and userInfo in Chrome storage
    setAuthStateInStorage(updatedAuthState, userInfo);

  } catch (error) {
    let errorMessage = 'Unknown error occurred'; // Default error message
    if (error instanceof Error) {
      errorMessage = error.message; // Extract error message if it's an Error object
    }

    console.error('Error fetching user data:', errorMessage);
    await handleSignOut(auth, errorMessage); // Sign out and store the error message
  }
};

/**
 * Listener function for Firebase Auth state changes. This function listens for
 * changes in the user's authentication status (e.g., logged in, logged out) and
 * handles updating the authentication state and user information in Chrome storage.
 * 
 * @param {any} auth - The Firebase Auth instance.
 */
onAuthStateChanged(auth, async (user: User | null) => {
  if (user) {
    // If a user is logged in, handle the authentication success
    await handleAuthSuccess(user);
  } else {
    // If no user is signed in, reset the authentication state and clear userInfo
    const loggedOutAuthState: AuthState = {
      isLoggedIn: false,
      token: null,
      uid: null,
      pending: false,
      error: null,
    };

    // Reset authState and userInfo in Chrome storage
    setAuthStateInStorage(loggedOutAuthState, null);
  }
});







// How auth storage works
// - Auth Component directly sets the userState: {isLoggedIn, userInfor} for App.tsx (also writes to chrome storage) 
//   via a passed in function
//
// - Also background script writes to chrome storage on AuthChange
// - On Chrome Storage Change App.tsx updates it's memory variables
