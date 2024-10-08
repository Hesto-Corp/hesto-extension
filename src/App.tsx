import { useEffect, useState } from 'react';

import IdlePopup from '@/components/IdlePopup';
import PromptPopup from '@/components/PromptPopup';
// import AuthPopup from '@/components/AuthPopup';

const App = () => {
  const [popupType, setPopupType] = useState<'default' | 'space'>('default');
  const [purchasePrice, setPurchasePrice] = useState<number | null>(null);

  useEffect(() => {
    // Read data from Chrome storage
    chrome.storage.local.get(['popupData'], (result) => {
      if (result.popupData) {
        console.log('Data retrieved from Chrome storage:', result.popupData);
        if (result.popupData.price) {
          setPopupType('space');
          setPurchasePrice(result.popupData.price);
          chrome.runtime.connect({ name: 'popup_lifecycle' }); // TODO: Ehh gotta debug this.
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
