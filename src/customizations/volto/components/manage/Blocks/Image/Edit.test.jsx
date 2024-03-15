import config from '@plone/volto/registry';
import '@testing-library/jest-dom/extend-expect';
import { render } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-intl-redux';
import configureMockStore from 'redux-mock-store';
import Edit from './Edit';

const getImageBlockSizes = function (data) {
  if (data.align === 'full') return '100vw';
  if (data.align === 'center') {
    if (data.size === 'l') return '100vw';
    if (data.size === 'm') return '50vw';
    if (data.size === 's') return '25vw';
  }
  if (data.align === 'left' || data.align === 'right') {
    if (data.size === 'l') return '50vw';
    if (data.size === 'm') return '25vw';
    if (data.size === 's') return '15vw';
  }
  return undefined;
};

const mockStore = configureMockStore();
const { settings } = config;

let store;

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

describe('Edit', () => {
  beforeEach(() => {
    store = mockStore({
      content: {
        create: {},
        data: {},
        subrequests: {
          [blockId]: {},
        },
      },
      intl: {
        locale: 'en',
        messages: {},
      },
    });
  });

  it('should render without errors', () => {
    const { container } = render(
      <Provider store={store}>
        <Edit
          data={{
            url: 'http://localhost:8080/Plone/image',
            '@type': 'image',
            align: 'full',
          }}
          selected={false}
          block={blockId}
          content={{}}
          request={{
            loading: false,
            loaded: false,
          }}
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
        />
      </Provider>,
    );

    settings.internalApiPath = 'http://localhost:8080/Plone';

    expect(container.querySelector('.block.image.align')).toBeInTheDocument();
    expect(
      container.querySelector('.image-block-container'),
    ).toBeInTheDocument();
    expect(container.querySelector('.copyright-wrapper')).toBeInTheDocument();
  });

  it('should render without errors', () => {
    const { container } = render(
      <Provider store={store}>
        <Edit
          data={{
            url: 'http://localhost:8080/Plone/image',
            '@type': 'image',
            size: 'l',
            copyright: 'Copyright',
          }}
          selected={false}
          block={blockId}
          content={{}}
          request={{
            loading: false,
            loaded: false,
          }}
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
        />
      </Provider>,
    );

    settings.internalApiPath = 'http://localhost:8080/Plone';

    expect(container.querySelector('.block.image.align')).toBeInTheDocument();
    expect(
      container.querySelector('.image-block-container'),
    ).toBeInTheDocument();
    expect(container.querySelector('.copyright-wrapper')).toBeInTheDocument();
  });

  it('should render without errors', () => {
    const { container } = render(
      <Provider store={store}>
        <Edit
          data={{
            url: 'http://localhost:8080/Plone/image',
            '@type': 'image',
            size: 'm',
          }}
          selected={false}
          block={blockId}
          content={{}}
          request={{
            loading: false,
            loaded: false,
          }}
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
        />
      </Provider>,
    );

    settings.internalApiPath = 'http://localhost:8080/Plone';

    expect(container.querySelector('.block.image.align')).toBeInTheDocument();
    expect(
      container.querySelector('.image-block-container'),
    ).toBeInTheDocument();
    expect(container.querySelector('.copyright-wrapper')).toBeInTheDocument();
  });

  it('should render without errors', () => {
    const { container } = render(
      <Provider store={store}>
        <Edit
          data={{
            url: 'http://localhost:8080/Plone/image',
            '@type': 'image',
            size: 's',
          }}
          selected={false}
          block={blockId}
          content={{}}
          request={{
            loading: false,
            loaded: false,
          }}
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
        />
      </Provider>,
    );

    settings.internalApiPath = 'http://localhost:8080/Plone';

    expect(container.querySelector('.block.image.align')).toBeInTheDocument();
    expect(
      container.querySelector('.image-block-container'),
    ).toBeInTheDocument();
    expect(container.querySelector('.copyright-wrapper')).toBeInTheDocument();
  });

  it('should render without errors', () => {
    const { container } = render(
      <Provider store={store}>
        <Edit
          data={{
            url: 'http://localhost:8080/Plone/image',
            '@type': 'image',
          }}
          selected={false}
          block={blockId}
          content={{}}
          request={{
            loading: false,
            loaded: false,
          }}
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
        />
      </Provider>,
    );

    settings.internalApiPath = 'http://localhost:8080/Plone';

    expect(container.querySelector('.block.image.align')).toBeInTheDocument();
    expect(
      container.querySelector('.image-block-container'),
    ).toBeInTheDocument();
    expect(container.querySelector('.copyright-wrapper')).toBeInTheDocument();
  });

  it('should render without errors', () => {
    const { container } = render(
      <Provider store={store}>
        <Edit
          data={{
            url: 'http://localhost:80801/Plone/image',
            '@type': 'image',
          }}
          selected={false}
          block={blockId}
          content={{}}
          request={{
            loading: false,
            loaded: false,
          }}
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
        />
      </Provider>,
    );

    settings.internalApiPath = 'http://localhost:8080/Plone';

    expect(container.querySelector('.block.image.align')).toBeInTheDocument();
    expect(
      container.querySelector('.image-block-container'),
    ).toBeInTheDocument();
    expect(container.querySelector('.copyright-wrapper')).toBeInTheDocument();
  });

  it('should render without errors', () => {
    render(
      <Provider store={store}>
        <Edit
          data={{
            url: undefined,
            '@type': 'image',
          }}
          selected={false}
          block={blockId}
          content={{}}
          request={{
            loading: false,
            loaded: false,
          }}
          editable={true}
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
        />
      </Provider>,
    );
  });
});
