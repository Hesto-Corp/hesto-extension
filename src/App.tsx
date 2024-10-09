import { useEffect, useState } from 'react';

import PromptPopup from '@/components/PromptPopup';
import AuthPopup from '@/components/AuthPopup';
import IdlePopup from '@/components/IdlePopup';
import LoadingScreen from '@/components/LoadingScreen';

import { PopupState } from './scripts/utils/stateManagement';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from './firebase.config'; // Import your Firebase auth config
import { getDoc, doc } from 'firebase/firestore';

const App = () => {
  const [popupType, setPopupType] = useState<PopupState>(PopupState.Idle);
  const [purchasePrice, setPurchasePrice] = useState<number | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track user login state
  const [checkingAuth, setCheckingAuth] = useState(true); // Add checkingAuth state to handle initial check
  const [userName, setUserName] = useState<string | null>(null);

  // Firebase Authentication Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("On auth state changed called!");

      if (user) {
        console.log("User is logged in: ", user);

        // Fetch user data and wait until it's resolved before proceeding
        const fetchUserData = async () => {
          try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              if (userData?.name) {
                setUserName(userData.name);
                setIsLoggedIn(true); // Allow login
                chrome.storage.local.set({ isLoggedIn: true });
              } else {
                throw new Error("Name field is missing");
              }
            } else {
              throw new Error("User document does not exist");
            }
          } catch (error) {
            console.error("Error fetching user data or name field missing:", error);

            // Forcefully sign the user out if the document or name field is missing
            await signOut(auth);
            chrome.storage.local.set({ isLoggedIn: false });
            setIsLoggedIn(false);
            setUserName(null);
            alert("User account is incomplete. Please contact support.");
          } finally {
            // Only set checkingAuth to false after fetching user data or handling error
            setCheckingAuth(false);
          }
        };

        fetchUserData();
      } else {
        console.log("User is logged out");
        chrome.storage.local.set({ isLoggedIn: false });
        setIsLoggedIn(false);
        setUserName(null);
        setCheckingAuth(false); // No need to fetch data if not logged in
      }
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
  if (checkingAuth || (isLoggedIn && userName === null)) {
    // Render LoadingScreen while checking authentication or fetching username
    return <LoadingScreen />;
  }

  return (
    <div>
      {!isLoggedIn ? (
        <AuthPopup />  // Show AuthPopup if user is not logged in
      ) : (
        popupType === PopupState.Idle ? (
          <IdlePopup userName={userName} />
        ) : (
          <PromptPopup purchasePrice={purchasePrice} userName={userName} />
        )
      )}
    </div>
  );
};

export default App;
