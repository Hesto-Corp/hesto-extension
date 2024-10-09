import { useEffect, useState } from 'react';
import PromptPopup from '@/components/PromptPopup';
import AuthPopup from '@/components/AuthPopup';
import IdlePopup from '@/components/IdlePopup';
import LoadingScreen from '@/components/LoadingScreen';
import { PopupState } from './scripts/utils/stateManagement';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth, db } from './firebase.config';
import { getDoc, doc } from 'firebase/firestore';

// Custom hook for Firebase authentication and user state
const useFirebaseAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const fetchUserData = async (userUid: string) => {
    const userDoc = await getDoc(doc(db, 'users', userUid));
    if (!userDoc.exists()) throw new Error('User document does not exist');
    const userData = userDoc.data();
    if (!userData?.name) throw new Error('Name field is missing');
    return userData.name;
  };

  const handleAuthStateChanged = async (user: User | null) => {
    if (user) {
      try {
        const userName = await fetchUserData(user.uid);
        setUserName(userName);
        setIsLoggedIn(true);
        updateChromeStorage(true);
      } catch (error) {
        console.error('Error fetching user data:', error);
        await handleUserSignOut();
      } finally {
        setCheckingAuth(false);
      }
    } else {
      await handleUserSignOut();
      setCheckingAuth(false);
    }
  };

  const handleUserSignOut = async () => {
    await signOut(auth);
    setIsLoggedIn(false);
    setUserName(null);
    await updateChromeStorage(false);
  };

  const updateChromeStorage = async (isLoggedIn: boolean) => {
    await chrome.storage.local.set({ isLoggedIn });
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, handleAuthStateChanged);
    return () => unsubscribe();
  }, []);

  return { isLoggedIn, userName, checkingAuth };
};

// Custom hook for managing Chrome storage state
const useChromeStorage = () => {
  const [popupType, setPopupType] = useState<PopupState>(PopupState.Idle);
  const [purchasePrice, setPurchasePrice] = useState<number | null>(null);

  const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }, areaName: string) => {
    if (areaName === 'local' && changes.popupData) {
      const newPopupData = changes.popupData.newValue;
      if (newPopupData?.state !== undefined) setPopupType(newPopupData.state);
      if (newPopupData?.state === PopupState.Detected && newPopupData?.product?.price) {
        setPurchasePrice(newPopupData.product.price);
      }
    }
  };

  useEffect(() => {
    // Initial read from Chrome storage
    chrome.storage.local.get(['popupData'], (result) => {
      const initialData = result.popupData;
      if (initialData) {
        setPopupType(initialData.state ?? PopupState.Idle);
        setPurchasePrice(initialData?.product?.price ?? null);
      }
      chrome.runtime.connect({ name: 'popup_lifecycle' });
    });

    // Listen for storage changes
    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  return { popupType, purchasePrice };
};

const App = () => {
  const { isLoggedIn, userName, checkingAuth } = useFirebaseAuth();
  const { popupType, purchasePrice } = useChromeStorage();

  // Render logic based on login state and popup type
  if (checkingAuth || (isLoggedIn && !userName)) {
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
