import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-intl-redux';
import config from '@plone/volto/registry';

import ObjectBrowserNav from './ObjectBrowserNav';

vi.mock('@plone/volto/components/theme/Icon/Icon', () => ({
  default: ({ className }) => <svg data-testid="icon" className={className} />,
}));
vi.mock('@plone/volto/components/theme/Image/Image', () => ({
  default: ({ src, alt, className }) => (
    <img data-testid="volto-image" src={src} alt={alt} className={className} />
  ),
}));

const mockStore = configureStore();

const currentSearchResults = {
  items: [
    {
      '@id': '/folder/bird.jpg',
      '@type': 'Image',
      getURL: 'http://localhost:8080/Plone/folder/bird.jpg',
      title: 'A bird',
      is_folderish: false,
    },
    {
      '@id': '/news',
      '@type': 'Folder',
      getURL: 'http://localhost:8080/Plone/news',
      title: 'News',
      is_folderish: true,
    },
  ],
};

const renderNav = (props) =>
  render(
    <Provider store={mockStore({ intl: { locale: 'en', messages: {} } })}>
      <ObjectBrowserNav
        currentSearchResults={currentSearchResults}
        selected={[{ '@id': '/folder/bird.jpg' }]}
        isSelectable={() => true}
        handleClickOnItem={vi.fn()}
        handleDoubleClickOnItem={vi.fn()}
        navigateTo={vi.fn()}
        mode="link"
        view="list"
        {...props}
      />
    </Provider>,
  );

describe('ObjectBrowserNav', () => {
  let imageObjects;

  beforeEach(() => {
    imageObjects = config.settings.imageObjects;
    config.settings.imageObjects = ['Image'];
  });

  afterEach(() => {
    config.settings.imageObjects = imageObjects;
  });

  it('shows an image thumbnail instead of the type icon in the list view', () => {
    const { container } = renderNav({ mode: 'image' });
    const thumbnail = container.querySelector('img.ui.image');
    expect(thumbnail).toHaveAttribute(
      'src',
      'http://localhost:8080/Plone/folder/bird.jpg/@@images/image/icon',
    );
    expect(container.querySelectorAll('li')).toHaveLength(2);
    expect(container.querySelector('li.selected-item')).toHaveTextContent(
      'A bird',
    );
    expect(screen.queryByTestId('volto-image')).toBeNull();
  });

  it('marks the browse button of folderish items as type="button"', () => {
    const navigateTo = vi.fn();
    const handleClickOnItem = vi.fn();
    renderNav({ navigateTo, handleClickOnItem });
    const browse = screen.getByRole('button', { name: 'Browse News' });
    expect(browse).toHaveAttribute('type', 'button');
    fireEvent.click(browse);
    expect(navigateTo).toHaveBeenCalledWith('/news');
    expect(handleClickOnItem).not.toHaveBeenCalled();
  });

  it('renders the icons view with the Volto Image component', () => {
    const handleClickOnItem = vi.fn();
    const { container } = renderNav({
      mode: 'image',
      view: 'icons',
      handleClickOnItem,
    });
    expect(container.querySelectorAll('li.image-wrapper')).toHaveLength(2);
    const preview = screen.getByTestId('volto-image');
    expect(preview).toHaveAttribute(
      'src',
      '/folder/bird.jpg/@@images/image/preview',
    );
    expect(preview).toHaveClass('selected');
    expect(container.querySelector('img.ui.image')).toBeNull();

    fireEvent.click(container.querySelectorAll('.image-preview')[1]);
    expect(handleClickOnItem).toHaveBeenCalledWith(
      currentSearchResults.items[1],
    );
  });

  it('handles selected as an empty object without errors', () => {
    const { container } = renderNav({ selected: {} });
    expect(container.querySelector('li.selected-item')).toBeNull();
  });
});
