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

  // Force load all lazy-loaded blocks by scrolling through the page in steps
  const forceLoadLazyBlocks = async () => {
    const pageDocument =
      document.getElementById('page-document') || document.body;
    const scrollHeight = pageDocument.scrollHeight;
    const viewportHeight = window.innerHeight;

    // Calculate number of steps needed to scroll through entire page
    const steps = Math.ceil(scrollHeight / viewportHeight) + 1;

    // Scroll through the page in steps to trigger lazy loading
    for (let i = 0; i <= steps; i++) {
      const scrollPosition = (scrollHeight / steps) * i;
      window.scrollTo({ top: scrollPosition, behavior: 'instant' });

      // Small delay to allow IntersectionObserver to trigger
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // Final scroll to absolute bottom
    window.scrollTo({ top: pageDocument.scrollHeight, behavior: 'instant' });
  };

  // Wait for plotly charts to load and re-render in mobile layout
  const waitForPlotlyCharts = async () => {
    // Give a small delay for isPrint state to propagate and VisibilitySensor to re-render
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Force load all lazy blocks by scrolling through the page
    await forceLoadLazyBlocks();

    // Now wait a bit for the blocks to start loading
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Find all plotly chart containers (now they should be loaded)
    const plotlyCharts = document.querySelectorAll(
      '.embed-visualization, .plotly-component, .plotly-chart, .treemap-chart',
    );

    if (plotlyCharts.length === 0) {
      return;
    }

    // Check chart loading status periodically
    return new Promise((resolve) => {
      let checkCount = 0;
      const maxChecks = 40; // 40 checks * 250ms = 10 seconds max
      const checkInterval = 250;

      const checkChartsLoaded = () => {
        checkCount++;

        const allCharts = document.querySelectorAll(
          '.embed-visualization, .plotly-component, .plotly-chart, .treemap-chart',
        );

        let loadedCount = 0;

        allCharts.forEach((chart, index) => {
          const hasPlotlyDiv = chart.querySelector('.js-plotly-plot');

          if (hasPlotlyDiv) {
            loadedCount++;
          }
        });

        // If all charts are loaded or we've reached max checks, resolve
        if (loadedCount === allCharts.length || checkCount >= maxChecks) {
          resolve();
        } else {
          // Continue checking
          setTimeout(checkChartsLoaded, checkInterval);
        }
      };

      // Start checking after a brief delay to allow initial rendering
      setTimeout(checkChartsLoaded, 500);
    });
  };

  // Wait for all content to load before printing
  const waitForAllContentToLoad = async () => {
    try {
      // Wait for iframes, images, and Plotly charts to re-render
      await Promise.all([
        waitForIframes(),
        waitForImages(),
        waitForPlotlyCharts(),
      ]);

      // Scroll back to top
      window.scrollTo({ top: 0 });

      // Reset tab display
      Array.from(tabs).forEach((tab) => {
        tab.style.display = '';
      });

      // Keep isPrint=true during printing so charts stay in mobile layout
      // Only turn off loading indicator
      dispatch(setPrintLoading(false));

      // Use matchMedia to detect when print is actually happening
      const printMediaQuery = window.matchMedia('print');
      let printDialogClosed = false;

      // Function to reset isPrint state
      const resetPrintState = () => {
        if (printDialogClosed) return; // Prevent multiple resets
        printDialogClosed = true;

        dispatch(setIsPrint(false));

        // Clean up listeners
        printMediaQuery.removeEventListener('change', handlePrintMediaChange);
        window.removeEventListener('afterprint', handleAfterPrint);
        window.removeEventListener('focus', handleWindowFocus);
      };

      // Listen for print media query changes
      const handlePrintMediaChange = (e) => {
        // When print media query becomes false, the print dialog was closed
        if (!e.matches) {
          // Add a small delay to ensure the dialog is fully closed
          setTimeout(resetPrintState, 100);
        }
      };

      // Fallback: afterprint event (unreliable but keep as backup)
      const handleAfterPrint = () => {
        // Don't reset immediately - wait a bit to see if we're actually done
        setTimeout(() => {
          // Only reset if print media query is not active
          if (!printMediaQuery.matches) {
            resetPrintState();
          }
        }, 500);
      };

      // Fallback: window focus event (when user cancels or completes print)
      const handleWindowFocus = () => {
        // Wait a bit to ensure print dialog is closed
        setTimeout(() => {
          // Only reset if print media query is not active
          if (!printMediaQuery.matches) {
            resetPrintState();
          }
        }, 300);
      };

      // Set up all listeners
      printMediaQuery.addEventListener('change', handlePrintMediaChange);
      window.addEventListener('afterprint', handleAfterPrint);
      // Focus event fires when user returns from print dialog
      window.addEventListener('focus', handleWindowFocus, { once: true });

      // Safety timeout: reset after 30 seconds no matter what
      setTimeout(() => {
        if (!printDialogClosed) {
          resetPrintState();
        }
      }, 30000);

      // Trigger print - isPrint remains true during the dialog
      window.print();
    } catch (error) {
      // Still try to print even if there was an error
      dispatch(setPrintLoading(false));
      dispatch(setIsPrint(false));
      window.print();
    }
  };

  // Delay the initial call to ensure everything is rendered
  setTimeout(() => {
    waitForAllContentToLoad();
  }, 1000);
};
