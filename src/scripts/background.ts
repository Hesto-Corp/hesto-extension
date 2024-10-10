import { setToIdle } from './utils/stateManagement'
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth, db } from '../firebase.config';
import { getDoc, doc } from 'firebase/firestore';

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


const fetchUserData = async (userUid: string) => {
  const userDoc = await getDoc(doc(db, 'users', userUid));
  if (!userDoc.exists()) throw new Error('User document does not exist');
  const userData = userDoc.data();
  if (!userData?.name) throw new Error('Name field is missing');
  return userData.name;
};

// Start listening for auth changes

onAuthStateChanged(auth, async (user: User | null) => {
  if (user) {
    try {
      const userName = await fetchUserData(user.uid);
      chrome.storage.local.set({ isLoggedIn: true, userName});  // Set authPending to false after completion
    } catch (error) {
      console.error('Error fetching user data:', error);
      await signOut(auth);
      chrome.storage.local.set({ isLoggedIn: false, userName: null});  // Set authPending to false after completion
    }
  } else {
    chrome.storage.local.set({ isLoggedIn: false, userName: null});  // Set authPending to false after completion
  }
});

// Very simple
// - Auth Component directly sets the userState: {isLoggedIn, userInfor} for App.tsx (also writes to chrome storage) 
//   via a passed in function
//
// - Also background script writes to chrome storage on AuthChange
// - On Chrome Storage Change App.tsx updates it's memory variables
// 
