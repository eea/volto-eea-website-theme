import { setupPrintView } from './setupPrintView';
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
      // to handle the async/await chain in forceLoadLazyBlocks and waitForPlotlyCharts
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
});
