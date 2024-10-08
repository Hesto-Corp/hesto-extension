import { useEffect, useState } from 'react';

import IdlePopup from '@/components/IdlePopup';
import PromptPopup from '@/components/PromptPopup';
// import AuthPopup from '@/components/AuthPopup';

const App = () => {
  // TODO Use Enum here, and make it handle different popup types
  const [popupType, setPopupType] = useState<'idle' | 'detected'>('idle');
  const [purchasePrice, setPurchasePrice] = useState<number | null>(null);

  useEffect(() => {
    // Function to handle storage changes
    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }, areaName: string) => {
      if (areaName === 'local' && changes.popupData) {
        const newPopupData = changes.popupData.newValue;
        console.log('Data changed in Chrome storage:', newPopupData);

        if (newPopupData?.product?.price) {
          setPopupType('detected');
          setPurchasePrice(newPopupData.product.price);
        }
      }
    };

    // Initial read from Chrome storage
    chrome.storage.local.get(['popupData'], (result) => {
      if (result.popupData) {
        console.log('Initial data retrieved from Chrome storage:', result.popupData);
        if (result.popupData.product.price) {
          setPopupType('detected');
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
  }, []);


  return (
    <div>
      {popupType === 'idle' ? (
        <IdlePopup />
      ) : (
        <PromptPopup purchasePrice={purchasePrice} />
      )}
    </div>
  );
};

export default App;
