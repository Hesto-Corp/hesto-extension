import { useEffect, useState, useCallback } from 'react';
import PromptPopup from '@/components/PromptPopup';
import AuthPopup from '@/components/AuthPopup';
import IdlePopup from '@/components/IdlePopup';
import { PopupState } from './scripts/utils/stateManagement';

// Custom hook for managing Chrome storage state
const useChromeStorage = () => {
  const [popupType, setPopupType] = useState<PopupState>(PopupState.Idle);
  const [purchasePrice, setPurchasePrice] = useState<number | null>(null);

  const handleStorageChange = useCallback(
    (changes: { [key: string]: chrome.storage.StorageChange }, areaName: string) => {
      if (areaName === 'local' && changes.popupData) {
        const newPopupData = changes.popupData.newValue;
        if (newPopupData?.state !== undefined) setPopupType(newPopupData.state);
        if (newPopupData?.state === PopupState.Detected && newPopupData?.product?.price) {
          setPurchasePrice(newPopupData.product.price);
        }
      }
    },
    []
  );

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
  }, [handleStorageChange]);

  return { popupType, purchasePrice };
};

// Custom hook for managing authentication state
const useAuthState = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    chrome.storage.local.get(['isLoggedIn', 'userName'], (result) => {
      setIsLoggedIn(result.isLoggedIn ?? false);
      setUserName(result.userName ?? null);
    });

    const handleAuthChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes.isLoggedIn) setIsLoggedIn(changes.isLoggedIn.newValue);
      if (changes.userName) setUserName(changes.userName.newValue);
    };

    chrome.storage.onChanged.addListener(handleAuthChange);

    return () => {
      chrome.storage.onChanged.removeListener(handleAuthChange);
    };
  }, []);

  const handleLoginSuccess = (userName: string) => {
    chrome.storage.local.set({ isLoggedIn: true, userName });
    setIsLoggedIn(true);
    setUserName(userName);
  };

  return { isLoggedIn, userName, handleLoginSuccess };
};

const App = () => {
  const { popupType, purchasePrice } = useChromeStorage();
  const { isLoggedIn, userName, handleLoginSuccess } = useAuthState();

  return (
    <div>
      {!isLoggedIn ? (
        <AuthPopup onLoginSuccess={handleLoginSuccess} />
      ) : popupType === PopupState.Idle ? (
        <IdlePopup userName={userName} />
      ) : (
        <PromptPopup purchasePrice={purchasePrice} userName={userName} />
      )}
    </div>
  );
};

export default App;
