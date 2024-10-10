import { useEffect, useState, useCallback } from 'react';
import PromptPopup from '@/components/PromptPopup';
import AuthPopup from '@/components/AuthPopup';
import IdlePopup from '@/components/IdlePopup';
import { PopupState } from './scripts/utils/stateManagement';

import { AuthState } from './types/auth';
import { UserInformation } from './types/user';

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
  const [authState, setAuthState] = useState<AuthState>({
    isLoggedIn: false,
    token: null,
    uid: null,
    pending: false,
    error: null,
  });

  const [userInfo, setUserInfo] = useState<UserInformation>({
    uid: null,
    name: null,
    email: null,
  });

  useEffect(() => {
    chrome.storage.local.get(['authState', 'userInfo'], (result) => {
      if (result.authState) setAuthState(result.authState);
      if (result.userInfo) setUserInfo(result.userInfo);
    });

    const handleAuthChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes.authState) setAuthState(changes.authState.newValue);
      if (changes.userInfo) setUserInfo(changes.userInfo.newValue);
    };

    chrome.storage.onChanged.addListener(handleAuthChange);

    return () => {
      chrome.storage.onChanged.removeListener(handleAuthChange);
    };
  }, []);

  const handleLogin = (newAuthState: AuthState, newUserInfo: UserInformation) => {
    chrome.storage.local.set({ authState: newAuthState, userInfo: newUserInfo });
    setAuthState(newAuthState);
    setUserInfo(newUserInfo);
  };

  return { authState, userInfo, handleLogin };
};

const App = () => {
  const { popupType, purchasePrice } = useChromeStorage();
  const { authState, userInfo, handleLogin } = useAuthState();

  return (
    <div>
      {!authState.isLoggedIn ? (
        <AuthPopup onLogin={handleLogin} />
      ) : popupType === PopupState.Idle ? (
        <IdlePopup userName={userInfo.name} />
      ) : (
        <PromptPopup purchasePrice={purchasePrice} userName={userInfo.name} />
      )}
    </div>
  );
};

export default App;
