import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-intl-redux';
import configureStore from 'redux-mock-store';
import ImageViewWidget from './ImageViewWidget';

const mockStore = configureStore();
const store = mockStore({
  intl: {
    locale: 'en',
    messages: {},
  },
  site: { data: {} },
});

describe('ImageViewWidget', () => {
  it('renders img with correct src and alt', () => {
    const mockValue = {
      download: 'https://example.com/image.jpg',
      filename: 'example.jpg',
    };

    render(
      <Provider store={store}>
        <ImageViewWidget value={mockValue} />
      </Provider>,
    );

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', mockValue.download);
    expect(img).toHaveAttribute('alt', mockValue.filename);
  });

  it('renders nothing when value is null', () => {
    const { container } = render(
      <Provider store={store}>
        <ImageViewWidget value={null} />
      </Provider>,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
