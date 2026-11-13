import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-intl-redux';
import configureStore from 'redux-mock-store';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

import ObjectBrowserWidget, {
  ObjectBrowserWidgetComponent,
} from './ObjectBrowserWidget';

vi.mock('@plone/volto/components/manage/Widgets/FormFieldWrapper', () => ({
  __esModule: true,
  default: ({ children, error }) => (
    <>
      {children}
      {(error || []).map((message) => (
        <span key={message} className="field-error">
          {message}
        </span>
      ))}
    </>
  ),
}));

const intl = {
  formatMessage: (message) => message.defaultMessage,
};

const baseProps = {
  id: 'href',
  title: 'Link',
  intl,
  location: { pathname: '/en/current' },
  openObjectBrowser: () => {},
  searchContent: () => Promise.resolve({ items: [] }),
};

const renderWidget = (props) =>
  render(<ObjectBrowserWidgetComponent {...baseProps} {...props} />);

const typeManualLink = (value) => {
  const input = screen.getByRole('textbox');
  fireEvent.change(input, { target: { value } });
  return input;
};

describe('ObjectBrowserWidget', () => {
  it('renders the connected widget', () => {
    const store = configureStore()({
      search: {},
      intl: { locale: 'en', messages: {} },
    });
    const { container } = render(
      <Provider store={store}>
        <MemoryRouter>
          <ObjectBrowserWidget
            id="my-field"
            title="My field"
            fieldSet="default"
            onChange={() => {}}
          />
        </MemoryRouter>
      </Provider>,
    );
    expect(container.querySelector('.objectbrowser-field')).toBeTruthy();
    expect(screen.getByText('No items selected')).toBeInTheDocument();
  });

  it('EEA: stores linkWithHash for a pasted internal link with an anchor', async () => {
    const onChange = vi.fn();
    const searchContent = vi.fn(() =>
      Promise.resolve({
        items: [{ '@id': 'http://localhost:3000/en/page', title: 'Page' }],
      }),
    );
    renderWidget({
      mode: 'link',
      allowExternals: true,
      onChange,
      searchContent,
    });

    const input = typeManualLink('http://localhost:3000/en/page#section');
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => expect(onChange).toHaveBeenCalled());
    expect(searchContent.mock.calls[0][1]['path.query']).toBe('/en/page');
    expect(onChange).toHaveBeenCalledWith('href', [
      {
        '@id': 'http://localhost:3000/en/page',
        title: 'Page',
        linkWithHash: '/en/page#section',
      },
    ]);
  });

  it('EEA: does not set linkWithHash when the pasted link has no anchor', async () => {
    const onChange = vi.fn();
    const searchContent = vi.fn(() =>
      Promise.resolve({
        items: [{ '@id': 'http://localhost:3000/en/page', title: 'Page' }],
      }),
    );
    renderWidget({
      mode: 'link',
      allowExternals: true,
      onChange,
      searchContent,
    });

    fireEvent.keyDown(typeManualLink('/en/page'), { key: 'Enter' });

    await waitFor(() => expect(onChange).toHaveBeenCalled());
    expect(onChange.mock.calls[0][1][0].linkWithHash).toBeUndefined();
  });

  it('EEA: keeps linkWithHash when selectedItemAttrs filters the item', async () => {
    const onChange = vi.fn();
    const searchContent = vi.fn(() =>
      Promise.resolve({
        items: [
          {
            '@id': 'http://localhost:3000/en/page',
            title: 'Page',
            review_state: 'published',
            UID: 'abc',
          },
        ],
      }),
    );
    renderWidget({
      mode: 'link',
      allowExternals: true,
      selectedItemAttrs: ['UID'],
      onChange,
      searchContent,
    });

    fireEvent.keyDown(typeManualLink('/en/page#section'), { key: 'Enter' });

    await waitFor(() => expect(onChange).toHaveBeenCalled());
    expect(onChange).toHaveBeenCalledWith('href', [
      {
        '@id': 'http://localhost:3000/en/page',
        title: 'Page',
        UID: 'abc',
        linkWithHash: '/en/page#section',
      },
    ]);
  });

  it('EEA: uses linkWithHash in the selected item label', () => {
    const widget = new ObjectBrowserWidgetComponent({
      ...baseProps,
      onChange: () => {},
    });
    const label = widget.renderLabel({
      '@id': 'http://localhost:3000/en/page',
      title: 'Page',
      linkWithHash: '/en/page#section',
    });
    expect(label.key).toBe('/en/page#section');
  });

  it('EEA: getHashAndLinkFromUrl splits the anchor from the link', () => {
    const widget = new ObjectBrowserWidgetComponent(baseProps);
    expect(widget.getHashAndLinkFromUrl('/en/page#section')).toEqual([
      '/en/page',
      'section',
    ]);
    expect(widget.getHashAndLinkFromUrl('/en/page')).toEqual(['/en/page']);
  });

  it('validates external links with the core urlValidator', () => {
    renderWidget({ mode: 'link', allowExternals: true, onChange: () => {} });

    typeManualLink('not a url');
    expect(
      screen.getByText(
        'Input must be valid url (www.something.com or http(s)://www.something.com)',
      ),
    ).toBeInTheDocument();

    typeManualLink('https://www.eea.europa.eu');
    expect(document.querySelector('.field-error')).toBeNull();
  });

  it('submits a valid external link', () => {
    const onChange = vi.fn();
    renderWidget({ mode: 'link', allowExternals: true, onChange });

    fireEvent.keyDown(typeManualLink('www.eea.europa.eu'), { key: 'Enter' });

    expect(onChange).toHaveBeenCalledWith('href', [
      { '@id': 'http://www.eea.europa.eu', title: 'www.eea.europa.eu' },
    ]);
  });

  it('passes initialPath to openObjectBrowser', () => {
    const openObjectBrowser = vi.fn();
    renderWidget({
      initialPath: '/en/folder',
      openObjectBrowser,
      onChange: () => {},
    });

    fireEvent.click(
      screen.getByRole('button', { name: 'Open object browser' }),
    );

    expect(openObjectBrowser).toHaveBeenCalledWith(
      expect.objectContaining({
        currentPath: '/en/folder',
        initialPath: '/en/folder',
      }),
    );
  });
});
