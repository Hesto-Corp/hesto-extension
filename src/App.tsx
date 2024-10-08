import { useEffect, useState } from 'react';

import IdlePopup from '@/components/IdlePopup';
import PromptPopup from '@/components/PromptPopup';
// import AuthPopup from '@/components/AuthPopup';

const App = () => {
  const [popupType, setPopupType] = useState<'default' | 'space'>('default');
  const [purchasePrice, setPurchasePrice] = useState<number | null>(null);

  // TODO: Clean this up!

  useEffect(() => {
    // Read data from Chrome storage
    chrome.storage.local.get(['popupData'], (result) => {
      if (result.popupData) {
        console.log('Data retrieved from Chrome storage:', result.popupData);
        if (result.popupData.product.price) {
          setPopupType('space');
          setPurchasePrice(result.popupData.product.price);
          chrome.runtime.connect({ name: 'popup_lifecycle' });
        }
      }
    });
  }, []);

  return (
    <div>
      {popupType === 'default' ? (
        <IdlePopup />
      ) : (
        <PromptPopup purchasePrice={purchasePrice} />
      )}
    </div>
  );
};

export default App;
