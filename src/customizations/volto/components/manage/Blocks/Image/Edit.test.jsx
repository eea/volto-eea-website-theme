/**
 * Image block Edit — unit tests
 *
 * Volto 17 / 18 dual-support notes
 * ---------------------------------
 * Importing `@plone/volto/components` (the full barrel) triggers the chain:
 *   TranslationObject.jsx → store.js → `@root/reducers`
 * which Jest cannot resolve in this project's test environment.
 * We therefore stub the entire barrel and provide minimal fakes for the
 * components that Edit.jsx actually uses.  `@eeacms/volto-eea-design-system/ui`
 * is mocked for the same reason (external design-system package not present in
 * the test runner).
 *
 * Both mocks are version-agnostic — they expose the same API on V17 and V18.
 *
 * IMPORTANT: jest.mock() factories cannot reference out-of-scope variables
 * (including React imported via ESM). Use require() inside the factory instead.
 */

// jest.mock() calls are hoisted above all imports by babel-jest.
/* eslint-disable no-undef */

/* eslint-enable no-undef */

import config from '@plone/volto/registry';
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-intl-redux';
import configureMockStore from 'redux-mock-store';
import Edit, { getImageBlockSizes } from './Edit';

jest.mock('@plone/volto/components', () => {
  const React = require('react');

  const MockImage = (props) =>
    React.createElement('img', {
      src: props.src,
      alt: props.alt,
      className: props.className,
      loading: props.loading,
      'data-testid': 'volto-image',
    });

  return {
    // Volto SVG icon wrapper — renders nothing in tests
    Icon: () => null,
    // Image sidebar form rendered inside SidebarPortal — not under test here
    ImageSidebar: () => null,
    // Portal that makes sidebar visible only when `selected` is true
    SidebarPortal: (props) =>
      props.selected
        ? React.createElement(
            'div',
            { 'data-testid': 'sidebar-portal' },
            props.children,
          )
        : null,
    // Volto responsive image component
    Image: MockImage,
  };
});

jest.mock('@eeacms/volto-eea-design-system/ui/Copyright/Copyright', () => {
  const React = require('react');

  const Copyright = (props) =>
    React.createElement(
      'div',
      { 'data-testid': 'eea-copyright' },
      props.children,
    );
  Copyright.Icon = (props) =>
    React.createElement(
      'span',
      { 'data-testid': 'eea-copyright-icon' },
      props.children,
    );
  Copyright.Text = (props) =>
    React.createElement(
      'span',
      { 'data-testid': 'eea-copyright-text' },
      props.children,
    );

  return {
    __esModule: true,
    default: Copyright,
  };
});

// Register our mock Image component so config.getComponent({ name: 'Image' })
// returns something renderable during tests.
const MockImage = jest.requireMock('@plone/volto/components').Image;
config.set('components', {
  Image: { component: MockImage },
});

const mockStore = configureMockStore();
const { settings } = config;

config.blocks.blocksConfig = {
  image: {
    id: 'image',
    title: 'Image',
    group: 'media',
    extensions: {},
    variations: [],
    restricted: false,
    mostUsed: true,
    sidebarTab: 1,
    security: {
      addPermission: [],
      view: [],
    },
    getSizes: getImageBlockSizes,
  },
};

const blockId = '1234';

/**
 * Helper: render Edit wrapped in Redux + intl Provider.
 */
const renderEdit = (data, extraProps = {}) => {
  settings.internalApiPath = 'http://localhost:8080/Plone';
  const store = mockStore({
    content: {
      create: {},
      data: {},
      subrequests: { [blockId]: {} },
    },
    intl: { locale: 'en', messages: {} },
  });

  return render(
    <Provider store={store}>
      <Edit
        data={{ '@type': 'image', ...data }}
        selected={false}
        block={blockId}
        content={{}}
        request={{ loading: false, loaded: false }}
        pathname="/news"
        onChangeBlock={() => {}}
        onSelectBlock={() => {}}
        onDeleteBlock={() => {}}
        createContent={() => {}}
        onFocusPreviousBlock={() => {}}
        onFocusNextBlock={() => {}}
        handleKeyDown={() => {}}
        index={1}
        openObjectBrowser={() => {}}
        {...extraProps}
      />
    </Provider>,
  );
};

// ---------------------------------------------------------------------------
// getImageBlockSizes — pure-function export used by blocksConfig.getSizes
// ---------------------------------------------------------------------------

describe('getImageBlockSizes', () => {
  it('returns 100vw for full-width alignment', () => {
    expect(getImageBlockSizes({ align: 'full' })).toBe('100vw');
  });

  it('returns correct sizes for centered alignment', () => {
    expect(getImageBlockSizes({ align: 'center', size: 'l' })).toBe('100vw');
    expect(getImageBlockSizes({ align: 'center', size: 'm' })).toBe('50vw');
    expect(getImageBlockSizes({ align: 'center', size: 's' })).toBe('25vw');
  });

  it('returns correct sizes for left / right alignment', () => {
    expect(getImageBlockSizes({ align: 'left', size: 'l' })).toBe('50vw');
    expect(getImageBlockSizes({ align: 'left', size: 'm' })).toBe('25vw');
    expect(getImageBlockSizes({ align: 'right', size: 's' })).toBe('15vw');
  });

  it('returns undefined for unknown alignment', () => {
    expect(getImageBlockSizes({})).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Edit rendering — EEA structural requirements (image-block-container, etc.)
// ---------------------------------------------------------------------------

describe('Edit', () => {
  it('renders the EEA wrapper structure when a URL is provided (full align)', () => {
    const { container } = renderEdit({
      url: 'http://localhost:8080/Plone/image',
      align: 'full',
    });

    expect(container.querySelector('.block.image.align')).toBeInTheDocument();
    expect(
      container.querySelector('.image-block-container'),
    ).toBeInTheDocument();
    // copyright-wrapper is always rendered when there is a URL
    expect(container.querySelector('.copyright-wrapper')).toBeInTheDocument();
  });

  it('shows the copyright overlay when copyright text is set and size is l', () => {
    const { getByTestId } = renderEdit({
      url: 'http://localhost:8080/Plone/image',
      size: 'l',
      copyright: 'EEA Copyright',
      copyrightIcon: 'ri-copyright-line',
      copyrightPosition: 'left',
    });

    expect(getByTestId('eea-copyright')).toBeInTheDocument();
    expect(getByTestId('eea-copyright-text')).toHaveTextContent(
      'EEA Copyright',
    );
  });

  it('shows the copyright overlay when no size is specified (defaults to showing)', () => {
    const { getByTestId } = renderEdit({
      url: 'http://localhost:8080/Plone/image',
      copyright: 'EEA Copyright',
    });
    // showCopyright is true when size is undefined
    expect(getByTestId('eea-copyright')).toBeInTheDocument();
  });

  it('hides the copyright overlay when size is m', () => {
    const { queryByTestId } = renderEdit({
      url: 'http://localhost:8080/Plone/image',
      size: 'm',
      copyright: 'EEA Copyright',
    });

    // showCopyright is false for size !== 'l' and size !== undefined
    expect(queryByTestId('eea-copyright')).not.toBeInTheDocument();
  });

  it('hides the copyright overlay when size is s', () => {
    const { queryByTestId } = renderEdit({
      url: 'http://localhost:8080/Plone/image',
      size: 's',
      copyright: 'EEA Copyright',
    });
    expect(queryByTestId('eea-copyright')).not.toBeInTheDocument();
  });

  it('renders without copyright when no copyright text is provided', () => {
    const { container, queryByTestId } = renderEdit({
      url: 'http://localhost:8080/Plone/image',
      size: 'l',
    });

    expect(
      container.querySelector('.image-block-container'),
    ).toBeInTheDocument();
    expect(queryByTestId('eea-copyright')).not.toBeInTheDocument();
  });

  it('renders without a URL — shows the dropzone upload UI', () => {
    const { container } = renderEdit({ url: undefined }, { editable: true });

    expect(container.querySelector('.block.image.align')).toBeInTheDocument();
    expect(
      container.querySelector('.image-block-container'),
    ).toBeInTheDocument();
    // No copyright-wrapper when there is no image URL
    expect(
      container.querySelector('.copyright-wrapper'),
    ).not.toBeInTheDocument();
  });

  it('applies align class to both the outer block and the EEA container', () => {
    const { container } = renderEdit({
      url: 'http://localhost:8080/Plone/image',
      align: 'left',
    });

    const outer = container.querySelector('.block.image.align');
    expect(outer).toHaveClass('left');
    const inner = container.querySelector('.image-block-container');
    expect(inner).toHaveClass('left');
  });

  it('applies center class when no align is provided', () => {
    const { container } = renderEdit({
      url: 'http://localhost:8080/Plone/image',
    });

    const outer = container.querySelector('.block.image.align');
    expect(outer).toHaveClass('center');
  });

  it('applies size class to the EEA container and the image', () => {
    const { container } = renderEdit({
      url: 'http://localhost:8080/Plone/image',
      size: 'l',
    });

    const inner = container.querySelector('.image-block-container');
    expect(inner).toHaveClass('large');
    const img = container.querySelector('[data-testid="volto-image"]');
    expect(img).toHaveClass('large');
  });

  it('renders with an external URL', () => {
    const { container } = renderEdit({
      url: 'https://example.com/image.png',
    });

    expect(container.querySelector('.block.image.align')).toBeInTheDocument();
    expect(
      container.querySelector('.image-block-container'),
    ).toBeInTheDocument();
  });
});
