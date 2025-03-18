/**
 * Sets up the document for printing by handling iframes
 * and lazy-loaded images, and triggering the print dialog.
 */

import {
  setIsPrint,
  setPrintLoading,
} from '@eeacms/volto-eea-website-theme/actions/print';
import { loadLazyImages } from '@eeacms/volto-eea-website-theme/helpers/loadLazyImages';

export const setupPrintView = (dispatch) => {
  // set tabs to be visible
  const tabs = document.getElementsByClassName('ui tab');
  Array.from(tabs).forEach((tab) => {
    tab.style.display = 'block';
  });

  dispatch(setIsPrint(true));
  dispatch(setPrintLoading(true));

  let timeoutValue = 1000;
  // if we have plotlycharts increase timeout
  setTimeout(() => {
    const plotlyCharts = document.getElementsByClassName(
      'visualization-wrapper',
    );
    if (plotlyCharts.length > 0) {
      timeoutValue += 1000;
    }
  }, timeoutValue);

  // scroll to iframes to make them be in the viewport
  // use timeout to wait for load
  const handleIframes = () => {
    const iframes = document.getElementsByTagName('iframe');
    if (iframes.length > 0) {
      timeoutValue += 2000;
      Array.from(iframes).forEach((iframe, index) => {
        setTimeout(() => {
          iframe.scrollIntoView({
            behavior: 'instant',
            block: 'nearest',
            inline: 'center',
          });
        }, timeoutValue);
        timeoutValue += 3000;
      });
      timeoutValue += 1000;
    }
  };

  setTimeout(() => {
    handleIframes();
    loadLazyImages();
    setTimeout(() => {
      window.scrollTo({ top: 0 });
      Array.from(tabs).forEach((tab) => {
        tab.style.display = '';
      });
      dispatch(setPrintLoading(false));
      dispatch(setIsPrint(false));
      window.print();
    }, timeoutValue);
  }, timeoutValue);
};
