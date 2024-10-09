import { useEffect, useState } from 'react';

import PromptPopup from '@/components/PromptPopup';
import AuthPopup from '@/components/AuthPopup';
import IdlePopup from '@/components/IdlePopup';
import LoadingScreen from '@/components/LoadingScreen';

import { PopupState } from './scripts/utils/stateManagement';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase.config'; // Import your Firebase auth config

const App = () => {
  const [popupType, setPopupType] = useState<PopupState>(PopupState.Idle);
  const [purchasePrice, setPurchasePrice] = useState<number | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track user login state
  const [checkingAuth, setCheckingAuth] = useState(true); // Add checkingAuth state to handle initial check

  // Firebase Authentication Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("On auth state changed called!");
      if (user) {
        console.log("User is logged in: ", user);
        chrome.storage.local.set({ isLoggedIn: true });
        setIsLoggedIn(true);
      } else {
        console.log("User is logged out");
        chrome.storage.local.set({ isLoggedIn: false });
        setIsLoggedIn(false);
      }
      // After checking auth, set checkingAuth to false
      setCheckingAuth(false);
    });

    return () => unsubscribe(); // Cleanup listener on component unmount
  }, []);

  // Listen to changes in Chrome storage for popup state
  useEffect(() => {
    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }, areaName: string) => {
      if (areaName === 'local' && changes.popupData) {
        const newPopupData = changes.popupData.newValue;
        console.log('Data changed in Chrome storage:', newPopupData);

        if (newPopupData?.state !== undefined) {
          setPopupType(newPopupData.state);
        }

        if (newPopupData?.state === PopupState.Detected && newPopupData?.product?.price) {
          setPurchasePrice(newPopupData.product.price);
        }
      }
    };

    // Initial read from Chrome storage
    chrome.storage.local.get(['popupData'], (result) => {
      if (result.popupData) {
        console.log('Initial data retrieved from Chrome storage:', result.popupData);

        if (result.popupData?.state !== undefined) {
          setPopupType(result.popupData.state);
        }

        if (result.popupData?.state === PopupState.Detected && result.popupData?.product?.price) {
          setPurchasePrice(result.popupData.product.price);
        }
      }

      // Handle graceful cleanup
      chrome.runtime.connect({ name: 'popup_lifecycle' });
    });

    // Listen for storage changes
    chrome.storage.onChanged.addListener(handleStorageChange);

    // Cleanup the listener when the component unmounts
    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []); // Empty dependency array ensures this runs only once (on mount)

  // Render logic based on login state and popup type
  if (checkingAuth) {
    return <LoadingScreen/>;
  }

  return (
    <div>
      {!isLoggedIn ? (
        <AuthPopup />  // Show AuthPopup if user is not logged in
      ) : (
        popupType === PopupState.Idle ? (
          <IdlePopup />
        ) : (
          <PromptPopup purchasePrice={purchasePrice} />
        )
      )}
    </div>
  );
};

export default App;
