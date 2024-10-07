import { useEffect, useState } from 'react';
import DefaultPopup from '@/components/DefaultPopup';
import PromptPopup from '@/components/PromptPopup';

const App = () => {
  const [popupType, setPopupType] = useState<'default' | 'space'>('space');
  const [purchasePrice, setPurchasePrice] = useState<number | null>(null);

  useEffect(() => {
    // Read data from Chrome storage
    chrome.storage.local.get(['popupData'], (result) => {
      if (result.popupData) {
        console.log('Data retrieved from Chrome storage:', result.popupData);
        if (result.popupData.action === 'open_space_popup' && result.popupData.price) {
          setPopupType('space');
          setPurchasePrice(result.popupData.price);
        }
      }
    });

    chrome.runtime.connect({ name: 'popup_lifecycle' }); // TODO: Ehh gotta debug this.

  }, []);

  return (
    <div>
      {popupType === 'default' ? (
        <DefaultPopup />
      ) : (
        <PromptPopup purchasePrice={purchasePrice} />
      )}
    </div>
  );
};

export default App;
