import { useEffect, useState, useCallback } from 'react';
import PromptPopup from '@/components/PromptPopup';
import AuthPopup from '@/components/AuthPopup';
import IdlePopup from '@/components/IdlePopup';

import { AppState } from './types/appState';
import { ProductData } from './types/product';

import { AuthState } from './types/auth';
import { UserInformation } from './types/user';

// Custom hook for managing Chrome storage state
const useChromeStorage = () => {
  const [appState, setAppState] = useState<AppState>(AppState.Idle);
  const [productData, setProductData] = useState<ProductData | null>(null);

  const handleStorageChange = useCallback(
    (changes: { [key: string]: chrome.storage.StorageChange }, areaName: string) => {
      if (areaName === 'local') {
        // If appState changed in the storage
        if (changes.appState) {
          const newAppState = changes.appState.newValue;

          // Set the appState if it exists
          if (newAppState?.state !== undefined) {
            setAppState(newAppState.state); // Assuming you have setAppState for updating appState
          }

          // Retrieve productData from Chrome storage
          chrome.storage.local.get('productData', (result) => {
            const productData = result.productData;
            setProductData(productData); // Set product data 
          });
        }
      }
    },
    [] // No dependencies, since it's a callback
  );



  useEffect(() => {
    chrome.storage.local.get(['appState', 'productData'], (result) => {
      // Extract appState and productData from the storage result
      const { appState, productData } = result;

      if (appState) setAppState(appState || AppState.Idle);
      if (productData) setProductData(productData || null); // Assuming you're setting product price here

      // Connect to the popup lifecycle after initialization
      chrome.runtime.connect({ name: 'popup_lifecycle' });
    });

    chrome.storage.onChanged.addListener(handleStorageChange);

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, [handleStorageChange]);


  return { appState, productData };
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
  const { appState, productData } = useChromeStorage();
  const { authState, userInfo, handleLogin } = useAuthState();

  return (
    <div>
      {!authState.isLoggedIn ? (
        appState === AppState.Detected ? (
          <AuthPopup onLogin={handleLogin} detected={true} />
        ) : (
          <AuthPopup onLogin={handleLogin} />
        )
      ) : appState === AppState.Idle ? (
        <IdlePopup userName={userInfo?.name ?? null} />
      ) : (
        // TODO: Handle Null Price
        <PromptPopup purchasePrice={productData?.price ?? null} userName={userInfo?.name ?? null} />
      )}
    </div>
  );
};

export default App;
