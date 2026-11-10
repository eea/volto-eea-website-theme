import { cancelPrintView, setupPrintView } from './setupPrintView';
import { loadLazyImages } from '@eeacms/volto-eea-website-theme/helpers/loadLazyImages';
import { act } from '@testing-library/react';

jest.mock('@eeacms/volto-eea-website-theme/actions/print', () => ({
  setIsPrint: jest.fn(() => ({ type: 'SET_IS_PRINT' })),
  setPrintLoading: jest.fn(() => ({ type: 'SET_PRINT_LOADING' })),
}));

jest.mock('@eeacms/volto-eea-website-theme/helpers/loadLazyImages', () => ({
  loadLazyImages: jest.fn(),
}));

describe('setupPrintView', () => {
  let matchMediaMock;

  beforeEach(() => {
    document.body.innerHTML = `
      <div class="ui tab"></div>
      <img />
      <iframe></iframe>
      <div class="visualization-wrapper"></div>
    `;

    jest.useFakeTimers();
    window.scrollTo = jest.fn();
    window.print = jest.fn();
    window.innerHeight = 1000;

    // Mock matchMedia
    matchMediaMock = {
      matches: false,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    };
    window.matchMedia = jest.fn(() => matchMediaMock);
  });

  it('cancels print preparation before the delayed work starts', async () => {
    const dispatch = jest.fn();

    setupPrintView(dispatch);
    cancelPrintView(dispatch);

    await act(async () => {
      jest.runAllTimers();
      await Promise.resolve();
    });

    expect(dispatch).toHaveBeenCalledWith({ type: 'SET_PRINT_LOADING' });
    expect(dispatch).toHaveBeenCalledWith({ type: 'SET_IS_PRINT' });
    expect(window.print).not.toHaveBeenCalled();
  });

  it('cancels print preparation after loading has started', async () => {
    const dispatch = jest.fn();
    const tab = document.querySelector('.ui.tab');

    setupPrintView(dispatch);

    await act(async () => {
      jest.advanceTimersByTime(1000);
      await Promise.resolve();
    });

    cancelPrintView(dispatch);

    await act(async () => {
      jest.runAllTimers();
      await Promise.resolve();
    });

    expect(tab.style.display).toBe('');
    expect(window.print).not.toHaveBeenCalled();
  });

  it('keeps every tab expanded when the print dialog opens', async () => {
    const dispatch = jest.fn();
    const tab = document.querySelector('.ui.tab');
    tab.hidden = true;
    window.print = jest.fn(() => {
      expect(
        document.documentElement.classList.contains('print-view-active'),
      ).toBe(true);
      expect(tab.style.getPropertyValue('display')).toBe('block');
      expect(tab.style.getPropertyPriority('display')).toBe('important');
    });

    await act(async () => {
      setupPrintView(dispatch);

      for (let i = 0; i < 10; i++) {
        jest.runAllTimers();
        await Promise.resolve();
      }
    });

    expect(window.print).toHaveBeenCalled();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it('dispatches actions and triggers print', async () => {
    const dispatch = jest.fn();

    await act(async () => {
      setupPrintView(dispatch);

      // Run all timers and flush all promises multiple times
      // to handle the async/await chain in forceLoadLazyBlocks and waitForPrintBlocks
      for (let i = 0; i < 10; i++) {
        jest.runAllTimers();
        await Promise.resolve();
      }
    });

    expect(dispatch).toHaveBeenCalledWith({ type: 'SET_IS_PRINT' });
    expect(dispatch).toHaveBeenCalledWith({ type: 'SET_PRINT_LOADING' });
    expect(loadLazyImages).toHaveBeenCalled();
    expect(window.scrollTo).toHaveBeenCalledWith({
      behavior: 'instant',
      top: 0,
    });
    expect(window.print).toHaveBeenCalled();
  });

  it('handles iframes that are already loaded', async () => {
    const iframe = document.createElement('iframe');
    Object.defineProperty(iframe, 'contentDocument', {
      value: { readyState: 'complete' },
      writable: true,
    });
    document.body.appendChild(iframe);

    const dispatch = jest.fn();

    await act(async () => {
      setupPrintView(dispatch);

      for (let i = 0; i < 10; i++) {
        jest.runAllTimers();
        await Promise.resolve();
      }
    });

    expect(window.print).toHaveBeenCalled();
  });

  it('handles iframes with load event', async () => {
    const iframe = document.createElement('iframe');
    document.body.appendChild(iframe);

    const dispatch = jest.fn();

    await act(async () => {
      setupPrintView(dispatch);

      // Simulate iframe load event
      iframe.dispatchEvent(new Event('load'));

      for (let i = 0; i < 10; i++) {
        jest.runAllTimers();
        await Promise.resolve();
      }
    });

    expect(window.print).toHaveBeenCalled();
  });

  it('handles images that are already loaded', async () => {
    const img = document.createElement('img');
    Object.defineProperty(img, 'complete', {
      value: true,
      writable: true,
    });
    document.body.appendChild(img);

    const dispatch = jest.fn();

    await act(async () => {
      setupPrintView(dispatch);

      for (let i = 0; i < 10; i++) {
        jest.runAllTimers();
        await Promise.resolve();
      }
    });

    expect(window.print).toHaveBeenCalled();
  });

  it('handles images with load event', async () => {
    const img = document.createElement('img');
    Object.defineProperty(img, 'complete', {
      value: false,
      writable: true,
    });
    document.body.appendChild(img);

    const dispatch = jest.fn();

    await act(async () => {
      setupPrintView(dispatch);

      // Simulate image load event
      img.dispatchEvent(new Event('load'));

      for (let i = 0; i < 10; i++) {
        jest.runAllTimers();
        await Promise.resolve();
      }
    });

    expect(window.print).toHaveBeenCalled();
  });

  it('handles images with error event', async () => {
    const img = document.createElement('img');
    Object.defineProperty(img, 'complete', {
      value: false,
      writable: true,
    });
    document.body.appendChild(img);

    const dispatch = jest.fn();

    await act(async () => {
      setupPrintView(dispatch);

      // Simulate image error event
      img.dispatchEvent(new Event('error'));

      for (let i = 0; i < 10; i++) {
        jest.runAllTimers();
        await Promise.resolve();
      }
    });

    expect(window.print).toHaveBeenCalled();
  });

  it('waits for registered print blocks that are ready', async () => {
    // Create registered print blocks.
    const chart1 = document.createElement('div');
    chart1.dataset.printBlock = 'test-chart';
    chart1.dataset.printStatus = 'ready';
    document.body.appendChild(chart1);

    const chart2 = document.createElement('div');
    chart2.dataset.printBlock = 'test-chart';
    chart2.dataset.printStatus = 'ready';
    document.body.appendChild(chart2);

    const dispatch = jest.fn();

    await act(async () => {
      setupPrintView(dispatch);

      for (let i = 0; i < 15; i++) {
        jest.runAllTimers();
        await Promise.resolve();
      }
    });

    expect(window.print).toHaveBeenCalled();
  });

  it('waits for a registered print block that is still loading', async () => {
    const chart1 = document.createElement('div');
    chart1.dataset.printBlock = 'test-chart';
    chart1.dataset.printStatus = 'loading';
    document.body.appendChild(chart1);

    const dispatch = jest.fn();

    await act(async () => {
      setupPrintView(dispatch);

      // Simulate the block becoming ready after some time.
      setTimeout(() => {
        chart1.dataset.printStatus = 'ready';
      }, 1000);

      for (let i = 0; i < 20; i++) {
        jest.runAllTimers();
        await Promise.resolve();
      }
    });

    expect(window.print).toHaveBeenCalled();
  });

  it('handles page with #page-document element for scrolling', async () => {
    const pageDocument = document.createElement('div');
    pageDocument.id = 'page-document';
    Object.defineProperty(pageDocument, 'scrollHeight', {
      value: 5000,
      writable: true,
    });
    document.body.appendChild(pageDocument);

    const dispatch = jest.fn();

    await act(async () => {
      setupPrintView(dispatch);

      for (let i = 0; i < 15; i++) {
        jest.runAllTimers();
        await Promise.resolve();
      }
    });

    expect(window.scrollTo).toHaveBeenCalled();
    expect(window.print).toHaveBeenCalled();
  });

  it('handles print media query change event', async () => {
    const dispatch = jest.fn();
    let changeHandler;

    matchMediaMock.addEventListener = jest.fn((event, handler) => {
      if (event === 'change') {
        changeHandler = handler;
      }
    });

    await act(async () => {
      setupPrintView(dispatch);

      for (let i = 0; i < 10; i++) {
        jest.runAllTimers();
        await Promise.resolve();
      }

      // Simulate print dialog closing (media query becomes false)
      if (changeHandler) {
        changeHandler({ matches: false });
        jest.runAllTimers();
      }
    });

    expect(window.print).toHaveBeenCalled();
    // Should reset isPrint state after print dialog closes
    expect(dispatch).toHaveBeenCalledWith({ type: 'SET_IS_PRINT' });
  });

  it('handles afterprint event', async () => {
    const dispatch = jest.fn();
    let afterPrintHandler;

    const originalAddEventListener = window.addEventListener;
    window.addEventListener = jest.fn((event, handler, options) => {
      if (event === 'afterprint') {
        afterPrintHandler = handler;
      }
      originalAddEventListener.call(window, event, handler, options);
    });

    await act(async () => {
      setupPrintView(dispatch);

      for (let i = 0; i < 10; i++) {
        jest.runAllTimers();
        await Promise.resolve();
      }

      // Simulate afterprint event
      if (afterPrintHandler) {
        afterPrintHandler();
        jest.runAllTimers();
      }
    });

    expect(window.print).toHaveBeenCalled();
  });

  it('handles window focus event after print', async () => {
    const dispatch = jest.fn();
    let focusHandler;

    const originalAddEventListener = window.addEventListener;
    window.addEventListener = jest.fn((event, handler, options) => {
      if (event === 'focus') {
        focusHandler = handler;
      }
      originalAddEventListener.call(window, event, handler, options);
    });

    await act(async () => {
      setupPrintView(dispatch);

      for (let i = 0; i < 10; i++) {
        jest.runAllTimers();
        await Promise.resolve();
      }

      // Simulate window focus event
      if (focusHandler) {
        focusHandler();
        jest.runAllTimers();
      }
    });

    expect(window.print).toHaveBeenCalled();
  });

  it('handles safety timeout for resetting print state', async () => {
    const dispatch = jest.fn();

    await act(async () => {
      setupPrintView(dispatch);

      for (let i = 0; i < 10; i++) {
        jest.runAllTimers();
        await Promise.resolve();
      }

      // Fast-forward to trigger the 30-second safety timeout
      jest.advanceTimersByTime(30000);
    });

    expect(window.print).toHaveBeenCalled();
    // Should reset isPrint state after timeout
    expect(dispatch).toHaveBeenCalledWith({ type: 'SET_IS_PRINT' });
  });

  it('handles errors during content loading', async () => {
    const dispatch = jest.fn();

    // Create an iframe that will cause an error
    const iframe = document.createElement('iframe');
    // Mock contentDocument to be null to trigger error path
    Object.defineProperty(iframe, 'contentDocument', {
      value: null,
      writable: true,
    });
    document.body.appendChild(iframe);

    await act(async () => {
      setupPrintView(dispatch);

      // Trigger the iframe timeout to simulate error condition
      jest.advanceTimersByTime(5000);

      for (let i = 0; i < 10; i++) {
        jest.runAllTimers();
        await Promise.resolve();
      }
    });

    // Should still call print even with timeout
    expect(window.print).toHaveBeenCalled();
  });

  it('prevents multiple resets of print state', async () => {
    const dispatch = jest.fn();
    let changeHandler;

    matchMediaMock.addEventListener = jest.fn((event, handler) => {
      if (event === 'change') {
        changeHandler = handler;
      }
    });

    await act(async () => {
      setupPrintView(dispatch);

      for (let i = 0; i < 10; i++) {
        jest.runAllTimers();
        await Promise.resolve();
      }

      // Simulate print dialog closing multiple times
      if (changeHandler) {
        changeHandler({ matches: false });
        jest.runAllTimers();
        changeHandler({ matches: false });
        jest.runAllTimers();
      }
    });

    expect(window.print).toHaveBeenCalled();
  });

  it('handles case with no iframes', async () => {
    // Remove all iframes
    const iframes = document.getElementsByTagName('iframe');
    while (iframes.length > 0) {
      iframes[0].remove();
    }

    const dispatch = jest.fn();

    await act(async () => {
      setupPrintView(dispatch);

      for (let i = 0; i < 10; i++) {
        jest.runAllTimers();
        await Promise.resolve();
      }
    });

    expect(window.print).toHaveBeenCalled();
  });

  it('handles case with no images', async () => {
    // Remove all images
    const images = document.getElementsByTagName('img');
    while (images.length > 0) {
      images[0].remove();
    }

    const dispatch = jest.fn();

    await act(async () => {
      setupPrintView(dispatch);

      for (let i = 0; i < 10; i++) {
        jest.runAllTimers();
        await Promise.resolve();
      }
    });

    expect(window.print).toHaveBeenCalled();
  });

  it('scrolls iframe into view on load', async () => {
    const iframe = document.createElement('iframe');
    iframe.scrollIntoView = jest.fn();

    // Make sure iframe is not considered already loaded
    Object.defineProperty(iframe, 'contentDocument', {
      value: { readyState: 'loading' },
      writable: true,
    });

    document.body.appendChild(iframe);

    const dispatch = jest.fn();
    let eventDispatched = false;

    await act(async () => {
      setupPrintView(dispatch);

      for (let i = 0; i < 15; i++) {
        jest.runAllTimers();
        await Promise.resolve();

        // Dispatch the load event after the first timer run to ensure listener is attached
        if (i === 2 && !eventDispatched) {
          iframe.dispatchEvent(new Event('load'));
          eventDispatched = true;
        }
      }
    });

    expect(iframe.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'instant',
      block: 'nearest',
      inline: 'center',
    });
    expect(window.print).toHaveBeenCalled();
  });

  it('continues checking registered print blocks until timeout', async () => {
    const chart1 = document.createElement('div');
    chart1.dataset.printBlock = 'test-chart';
    chart1.dataset.printStatus = 'loading';
    document.body.appendChild(chart1);

    const dispatch = jest.fn();

    await act(async () => {
      setupPrintView(dispatch);

      // Run enough iterations to hit the timeout (40 checks)
      for (let i = 0; i < 50; i++) {
        jest.runAllTimers();
        await Promise.resolve();
      }
    });

    expect(window.print).toHaveBeenCalled();
  });

  it('handles actual error in Promise.all', async () => {
    const dispatch = jest.fn();

    // Create an iframe that will reject
    const iframe = document.createElement('iframe');
    document.body.appendChild(iframe);

    // Mock scrollIntoView to throw an error
    iframe.scrollIntoView = jest.fn(() => {
      throw new Error('scrollIntoView error');
    });

    await act(async () => {
      setupPrintView(dispatch);

      // Trigger iframe load which will call scrollIntoView and throw
      try {
        iframe.dispatchEvent(new Event('load'));
      } catch (e) {
        // Expected error
      }

      for (let i = 0; i < 15; i++) {
        jest.runAllTimers();
        await Promise.resolve();
      }
    });

    // Should still call print
    expect(window.print).toHaveBeenCalled();
  });
});
