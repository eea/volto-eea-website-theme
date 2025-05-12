/**
 * Sets up the document for printing by handling iframes
 * and lazy-loaded images, and triggering the print dialog.
 * Uses proper event listeners to ensure all content is loaded before printing.
 */

import {
  setIsPrint,
  setPrintLoading,
} from '@eeacms/volto-eea-website-theme/actions/print';
import { loadLazyImages } from '@eeacms/volto-eea-website-theme/helpers/loadLazyImages';

export const setupPrintView = (dispatch) => {
  // Set tabs to be visible
  const tabs = document.getElementsByClassName('ui tab');
  Array.from(tabs).forEach((tab) => {
    tab.style.display = 'block';
  });

  dispatch(setIsPrint(true));
  dispatch(setPrintLoading(true));

  // Load all lazy images
  loadLazyImages();

  // Create a promise that resolves when all iframes are loaded
  const waitForIframes = () => {
    const iframes = document.getElementsByTagName('iframe');
    if (iframes.length === 0) {
      return Promise.resolve();
    }

    const iframePromises = Array.from(iframes).map((iframe) => {
      return new Promise((resolve) => {
        // If iframe is already loaded, resolve immediately
        if (iframe.contentDocument?.readyState === 'complete') {
          resolve();
          return;
        }

        // Otherwise wait for load event
        iframe.addEventListener(
          'load',
          () => {
            // Scroll iframe into view to ensure content loads
            iframe.scrollIntoView({
              behavior: 'instant',
              block: 'nearest',
              inline: 'center',
            });
            resolve();
          },
          { once: true },
        );

        // Set a timeout as a fallback in case the load event doesn't fire
        setTimeout(resolve, 5000);
      });
    });

    return Promise.all(iframePromises);
  };

  // Create a promise that resolves when all images are loaded
  const waitForImages = () => {
    const images = document.getElementsByTagName('img');
    if (images.length === 0) {
      return Promise.resolve();
    }

    const imagePromises = Array.from(images).map((img) => {
      return new Promise((resolve) => {
        // If image is already loaded, resolve immediately
        if (img.complete) {
          resolve();
          return;
        }

        // Otherwise wait for load event
        img.addEventListener('load', resolve, { once: true });
        img.addEventListener('error', resolve, { once: true }); // Also handle error case

        // Set a timeout as a fallback
        setTimeout(resolve, 3000);
      });
    });

    return Promise.all(imagePromises);
  };

  // Wait for plotly charts if they exist
  const waitForPlotlyCharts = () => {
    const plotlyCharts = document.getElementsByClassName(
      'visualization-wrapper',
    );
    if (plotlyCharts.length === 0) {
      return Promise.resolve();
    }

    // Give plotly charts some time to render
    return new Promise((resolve) => setTimeout(resolve, 2000));
  };

  // Wait for all content to load before printing
  const waitForAllContentToLoad = async () => {
    // Wait for iframes, images, and Plotly charts to load
    Promise.all([waitForIframes(), waitForImages(), waitForPlotlyCharts()])
      .then(() => {
        // Scroll back to top
        window.scrollTo({ top: 0 });

        // Reset tab display
        Array.from(tabs).forEach((tab) => {
          tab.style.display = '';
        });

        // Update state and trigger print
        dispatch(setPrintLoading(false));
        dispatch(setIsPrint(false));
        window.print();
      })
      .catch(() => {
        // Still try to print even if there was an error
        dispatch(setPrintLoading(false));
        dispatch(setIsPrint(false));
        window.print();
      });
  };

  // Delay the initial call to ensure everything is rendered
  setTimeout(() => {
    waitForAllContentToLoad();
  }, 1000);
};
