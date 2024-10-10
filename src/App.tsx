import { useEffect, useState } from 'react';
import PromptPopup from '@/components/PromptPopup';
import AuthPopup from '@/components/AuthPopup';
import IdlePopup from '@/components/IdlePopup';
import { PopupState } from './scripts/utils/stateManagement';
// import LoadingScreen from '@/components/LoadingScreen';

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
    chrome.storage.local.get(['popupData'], (result) => {
      const initialData = result.popupData;
      if (initialData) {
        setPopupType(initialData.state ?? PopupState.Idle);
        setPurchasePrice(initialData?.product?.price ?? null);
      }
      chrome.runtime.connect({ name: 'popup_lifecycle' });
    });

    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  return { popupType, purchasePrice };
};

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  // const [checkingAuth, setCheckingAuth] = useState(true);
  const { popupType, purchasePrice } = useChromeStorage();

  // Function to handle successful login
  const handleLoginSuccess = (userName: string) => {
    // Save login state and userName in Chrome storage for persistence
    chrome.storage.local.set({ isLoggedIn: true, userName });
    setIsLoggedIn(true);
    setUserName(userName);
  };

  // Effect to read initial auth state from Chrome storage
  useEffect(() => {
    chrome.storage.local.get(['isLoggedIn', 'userName'], (result) => {
      setIsLoggedIn(result.isLoggedIn ?? false);
      setUserName(result.userName ?? null);
      // setCheckingAuth(false);
    });

    // Callback for changes in Chrome storage
    chrome.storage.onChanged.addListener((changes) => {
      if (changes.isLoggedIn) {
        setIsLoggedIn(changes.isLoggedIn.newValue);
      }
      if (changes.userName) {
        setUserName(changes.userName.newValue);
      }
    });

    // Cleanup listener
    return () => {
      chrome.storage.onChanged.removeListener((changes) => {
        if (changes.isLoggedIn) {
          setIsLoggedIn(changes.isLoggedIn.newValue);
        }
        if (changes.userName) {
          setUserName(changes.userName.newValue);
        }
      });
    };
  }, []);

  // Render logic based on login state and popup type
  // if (checkingAuth || (isLoggedIn && !userName)) {
  //   console.log("Checking Auth: {}  userName: {}", checkingAuth, userName);
  //   return <LoadingScreen />;
  // }

  return (
    <div>
      {!isLoggedIn ? (
        <AuthPopup onLoginSuccess={handleLoginSuccess} /> // Pass handleLoginSuccess to AuthPopup
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
