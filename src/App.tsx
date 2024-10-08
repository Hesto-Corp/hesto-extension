import { useEffect, useState } from 'react';

import IdlePopup from '@/components/IdlePopup';
import PromptPopup from '@/components/PromptPopup';
// import AuthPopup from '@/components/AuthPopup';

// import { PopupState } from './scripts/utils/structures';

enum PopupState {
  Idle,
  Detected,
}

const App = () => {
  const [popupType, setPopupType] = useState<PopupState>(PopupState.Idle);
  const [purchasePrice, setPurchasePrice] = useState<number | null>(null);

  useEffect(() => {
    // Function to handle storage changes
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

  return (
    <div>
      {popupType === PopupState.Idle ? (
        <IdlePopup />
      ) : (
        <PromptPopup purchasePrice={purchasePrice} />
      )}
    </div>
  );
};

export default App;
