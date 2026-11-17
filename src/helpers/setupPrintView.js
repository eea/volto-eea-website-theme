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

const CANCEL_PRINT_EVENT = 'eea:cancel-print-preparation';
const PRINT_VIEW_CLASS = 'print-view-active';

const cancelActivePrintJobs = () => {
  window.dispatchEvent(new Event(CANCEL_PRINT_EVENT));
};

const resetTabs = () => {
  document.documentElement.classList.remove(PRINT_VIEW_CLASS);
  Array.from(document.getElementsByClassName('ui tab')).forEach((tab) => {
    tab.style.removeProperty('display');
  });
};

export const cancelPrintView = (dispatch) => {
  cancelActivePrintJobs();

  resetTabs();
  dispatch(setPrintLoading(false));
  dispatch(setIsPrint(false));
};

export const setupPrintView = (dispatch) => {
  cancelActivePrintJobs();

  const printJob = {
    cancelled: false,
    resolveCancellation: () => {},
    startTimeout: undefined,
  };
  const cancellation = new Promise((resolve) => {
    printJob.resolveCancellation = resolve;
  });
  const cancelPrintJob = () => {
    printJob.cancelled = true;
    clearTimeout(printJob.startTimeout);
    printJob.resolveCancellation();
  };
  const removeCancellationListener = () => {
    window.removeEventListener(CANCEL_PRINT_EVENT, cancelPrintJob);
  };
  window.addEventListener(CANCEL_PRINT_EVENT, cancelPrintJob, { once: true });

  // Keep every tab pane expanded while content is prepared and printed.
  document.documentElement.classList.add(PRINT_VIEW_CLASS);
  const tabs = document.getElementsByClassName('ui tab');
  Array.from(tabs).forEach((tab) => {
    tab.style.setProperty('display', 'block', 'important');
  });

  dispatch(setIsPrint(true));
  dispatch(setPrintLoading(true));

  // Load all lazy images
  loadLazyImages();

  // Create a promise that resolves when all iframes are loaded
  const waitForIframes = async () => {
    const iframes = Array.from(document.getElementsByTagName('iframe'));
    if (iframes.length === 0) {
      return;
    }

    const originalScrollPosition = {
      left: window.scrollX || window.pageXOffset || 0,
      top: window.scrollY || window.pageYOffset || 0,
    };

    const iframePromises = iframes.map((iframe) => {
      return new Promise((resolve) => {
        let timeout;
        const finish = () => {
          iframe.removeEventListener('load', finish);
          clearTimeout(timeout);
          resolve();
        };

        iframe.addEventListener('load', finish, { once: true });

        // Set a timeout as a fallback in case the load event doesn't fire
        timeout = setTimeout(finish, 5000);

        try {
          // This is available only for same-origin iframes. Cross-origin
          // frames will continue through the load event or timeout path.
          if (iframe.contentDocument?.readyState === 'complete') {
            finish();
          }
        } catch {
          // Cross-origin iframe contents cannot be inspected by the parent.
        }
      });
    });

    try {
      // Some embedded applications defer their own rendering until their
      // iframe enters the viewport. Visit only iframe elements; do not sweep
      // through the rest of the page or affect print-aware charts and maps.
      for (const iframe of iframes) {
        if (printJob.cancelled) return;

        iframe.scrollIntoView?.({
          behavior: 'instant',
          block: 'center',
          inline: 'nearest',
        });

        const activationCompleted = await Promise.race([
          new Promise((resolve) => setTimeout(() => resolve(true), 250)),
          cancellation.then(() => false),
        ]);
        if (!activationCompleted || printJob.cancelled) return;
      }

      await Promise.race([Promise.all(iframePromises), cancellation]);
    } finally {
      window.scrollTo({
        ...originalScrollPosition,
        behavior: 'instant',
      });
    }
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

  // Wait for registered print-aware blocks to finish rendering.
  const waitForPrintBlocks = async () => {
    const printBlocks = document.querySelectorAll('[data-print-block]');

    if (printBlocks.length === 0) {
      return;
    }

    // Check registered block loading status periodically.
    return new Promise((resolve) => {
      let checkCount = 0;
      let settledChecks = 0;
      const maxChecks = 120; // 120 checks * 250ms = 30 seconds max
      const requiredSettledChecks = 3;
      const checkInterval = 250;

      const checkPrintBlocksLoaded = () => {
        if (printJob.cancelled) {
          resolve();
          return;
        }

        checkCount++;

        const allPrintBlocks = Array.from(
          document.querySelectorAll('[data-print-block]'),
        );
        const settledCount = allPrintBlocks.filter((block) =>
          ['ready', 'failed'].includes(block.dataset.printStatus),
        ).length;

        if (settledCount === allPrintBlocks.length) {
          settledChecks++;
        } else {
          settledChecks = 0;
        }

        // Require a short stable period after every block reports completion.
        // Plotly's afterplot event can fire just before the browser paints the
        // final SVG/canvas into the print surface.
        if (settledChecks >= requiredSettledChecks || checkCount >= maxChecks) {
          resolve();
        } else {
          setTimeout(checkPrintBlocksLoaded, checkInterval);
        }
      };

      // Start checking after a brief delay to allow initial rendering.
      setTimeout(checkPrintBlocksLoaded, 500);
    });
  };

  // Wait for all content to load before printing
  const waitForAllContentToLoad = async () => {
    try {
      // Allow print mode and visibility sensors to mount their content before
      // collecting images, iframes, and registered blocks.
      const preparationReady = await Promise.race([
        new Promise((resolve) => setTimeout(() => resolve(true), 500)),
        cancellation.then(() => false),
      ]);
      if (!preparationReady || printJob.cancelled) return;

      // Wait for iframes, images, and registered print-aware blocks.
      const contentLoaded = await Promise.race([
        Promise.all([
          waitForIframes(),
          waitForImages(),
          waitForPrintBlocks(),
        ]).then(() => true),
        cancellation.then(() => false),
      ]);

      if (!contentLoaded || printJob.cancelled) return;

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

        resetTabs();
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
      removeCancellationListener();
      window.print();
    } catch (error) {
      if (printJob.cancelled) return;

      // Still try to print even if there was an error
      dispatch(setPrintLoading(false));
      dispatch(setIsPrint(false));
      removeCancellationListener();
      window.print();
      resetTabs();
    }
  };

  // Delay the initial call to ensure everything is rendered
  printJob.startTimeout = setTimeout(() => {
    if (printJob.cancelled) return;
    waitForAllContentToLoad();
  }, 1000);
};
