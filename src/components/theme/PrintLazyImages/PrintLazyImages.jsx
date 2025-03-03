import { useEffect } from 'react';
import { loadLazyImages } from '@eeacms/volto-eea-website-theme/helpers/loadLazyImages';

const PrintLazyImages = () => {
  useEffect(() => {
    const handleBeforePrint = () => {
      loadLazyImages();
    };

    window.addEventListener('beforeprint', handleBeforePrint);

    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
    };
  }, []);

  return null;
};

export default PrintLazyImages;
