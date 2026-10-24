import React from 'react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { IntlProvider } from 'react-intl';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import '@testing-library/jest-dom';

import ImageAddFileWidget from './ImageAddFileWidget';

const mockPost = jest.fn();
let mockUseRealFileWidget = false;
const PNG = {
  data: 'cG5n',
  encoding: 'base64',
  'content-type': 'image/png',
  filename: 'wetland.png',
};
const SVG = {
  data: 'PHN2Zz4=',
  encoding: 'base64',
  'content-type': 'image/svg+xml',
  filename: 'diagram.svg',
};

jest.mock('@plone/volto/helpers/Api/Api', () => ({
  __esModule: true,
  default: jest.fn(() => ({ post: mockPost })),
}));

jest.mock('@loadable/component', () => ({
  __esModule: true,
  default:
    () =>
    ({ children }) =>
      children({
        getRootProps: () => ({}),
        getInputProps: (props = {}) => props,
        isDragActive: false,
      }),
}));

jest.mock('@plone/volto/components/manage/UniversalLink/UniversalLink', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: ({ href, download, children }) =>
      React.createElement('a', { href, download }, children),
  };
});

jest.mock('@plone/volto/components/theme/Image/Image', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: ({ id, className, src }) =>
      React.createElement('img', { id, className, src, alt: '' }),
  };
});

jest.mock('@plone/volto/components/manage/Widgets/FileWidget', () => {
  const React = require('react');
  const ActualFileWidget = jest.requireActual(
    '@plone/volto/components/manage/Widgets/FileWidget',
  ).default;
  return {
    __esModule: true,
    default: (props) =>
      mockUseRealFileWidget
        ? React.createElement(ActualFileWidget, props)
        : React.createElement(
            'div',
            null,
            React.createElement(
              'button',
              {
                type: 'button',
                'data-disabled': String(Boolean(props.isDisabled)),
                onClick: () =>
                  props.onChange(props.id, {
                    data: 'cG5n',
                    encoding: 'base64',
                    'content-type': 'image/png',
                    filename: 'wetland.png',
                  }),
              },
              'Choose PNG',
            ),
            React.createElement(
              'button',
              {
                type: 'button',
                'data-disabled': String(Boolean(props.isDisabled)),
                onClick: () =>
                  props.onChange(props.id, {
                    data: 'PHN2Zz4=',
                    encoding: 'base64',
                    'content-type': 'image/svg+xml',
                    filename: 'diagram.svg',
                  }),
              },
              'Choose SVG',
            ),
          ),
  };
});

const enabledSettings = {
  enabled: true,
  features: { image: { enabled: true, allowed_content_types: ['Image'] } },
};

const makeStore = (
  formData = {},
  genAISettings = enabledSettings,
  content = {},
) => {
  const state = {
    intl: { locale: 'fr' },
    content: { data: content },
    form: { global: formData },
    reduxAsyncConnect: { genAISettings },
  };
  return createStore((current = state, action) =>
    action.type === 'TEST_SETTINGS'
      ? { ...current, reduxAsyncConnect: { genAISettings: action.settings } }
      : action.type === 'TEST_CONTENT'
        ? { ...current, content: { data: action.content } }
        : current,
  );
};

const renderWidget = ({
  route = '/folder/add?type=Image',
  value = null,
  id = 'image',
  formData = {},
  genAISettings = enabledSettings,
  content = {},
  ...restProps
} = {}) => {
  const onChange = jest.fn();
  let store = makeStore(formData, genAISettings, content);
  const history = createMemoryHistory({ initialEntries: [route] });
  let widgetProps = {
    id,
    title: 'Image',
    value,
    formData,
    onChange,
    ...restProps,
  };
  const tree = () => (
    <Provider store={store}>
      <IntlProvider locale="en" messages={{}}>
        <Router history={history}>
          <ImageAddFileWidget {...widgetProps} />
        </Router>
      </IntlProvider>
    </Provider>
  );
  const utils = render(tree());
  return {
    onChange,
    store,
    history,
    ...utils,
    rerenderWidget: (next, nextStore = store) => {
      widgetProps = { ...widgetProps, ...next };
      store = nextStore;
      utils.rerender(tree());
    },
  };
};

describe('ImageAddFileWidget', () => {
  beforeEach(() => {
    mockUseRealFileWidget = false;
    jest.clearAllMocks();
    mockPost.mockReset();
  });

  it.each([
    null,
    { enabled: true, features: { image: { enabled: true } } },
    { enabled: false, features: { image: { enabled: true } } },
    { enabled: true, features: { image: { enabled: false } } },
  ])(
    'uploads normally without AI when SSR settings are unavailable or disabled',
    (genAISettings) => {
      const { onChange } = renderWidget({ genAISettings, value: PNG });
      fireEvent.click(screen.getByText('Choose PNG'));
      expect(onChange).toHaveBeenCalledWith('image', PNG);
      expect(screen.queryByText('Generate with AI')).not.toBeInTheDocument();
      expect(
        screen.queryByText('Generate metadata with AI'),
      ).not.toBeInTheDocument();
      expect(mockPost).not.toHaveBeenCalled();
    },
  );

  it('uploads normally when the target content type is excluded', () => {
    const { onChange } = renderWidget({ route: '/folder/add?type=Chart' });
    fireEvent.click(screen.getByText('Choose PNG'));
    expect(onChange).toHaveBeenCalledWith('image', PNG);
    expect(screen.queryByText('Generate with AI')).not.toBeInTheDocument();
    expect(mockPost).not.toHaveBeenCalled();
  });

  it.each([[['Chart']], [[]]])(
    'generates from an allowed preview_image field with policy %j',
    async (allowedContentTypes) => {
      mockPost.mockResolvedValueOnce({
        title: 'Wetland chart',
        description: 'A chart shows wetland coverage.',
      });
      const { onChange } = renderWidget({
        route: '/folder/add?type=Chart',
        id: 'preview_image',
        genAISettings: {
          enabled: true,
          features: {
            image: {
              enabled: true,
              allowed_content_types: allowedContentTypes,
            },
          },
        },
      });
      fireEvent.click(screen.getByText('Choose PNG'));
      await act(async () =>
        fireEvent.click(screen.getByText('Generate with AI')),
      );
      expect(mockPost).toHaveBeenCalledWith('/folder/@image-metadata', {
        data: { image: PNG, language: 'fr', portal_type: 'Chart' },
      });
      expect(onChange).toHaveBeenCalledWith('preview_image', PNG);
      expect(onChange).toHaveBeenCalledWith('title', 'Wetland chart');
    },
  );

  it('asks for consent on every supported Image selection', () => {
    const { onChange } = renderWidget();
    fireEvent.click(screen.getByText('Choose PNG'));

    expect(screen.getByText('Generate Image metadata with AI?')).toBeVisible();
    expect(screen.getByText('Generate with AI')).toBeVisible();
    expect(screen.getByText('Upload without AI')).toBeVisible();
    expect(screen.getByText('Cancel')).toBeVisible();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('cancels without replacing the previous selected file', () => {
    const { onChange } = renderWidget({ value: PNG });
    fireEvent.click(screen.getByText('Choose PNG'));
    fireEvent.click(screen.getByText('Cancel'));

    expect(onChange).not.toHaveBeenCalled();
    expect(
      screen.queryByText('Generate Image metadata with AI?'),
    ).not.toBeInTheDocument();
  });

  it('aborts in-flight metadata analysis when the modal close button is pressed', async () => {
    const abort = jest.fn();
    const pendingRequest = new Promise(() => {});
    pendingRequest.request = { abort };
    mockPost.mockReturnValueOnce(pendingRequest);
    renderWidget();

    fireEvent.click(screen.getByText('Choose PNG'));
    fireEvent.click(screen.getByText('Generate with AI'));
    expect(screen.getByText('Analyzing image…')).toBeVisible();

    fireEvent.click(document.querySelector('.image-ai-consent-modal .close'));

    expect(abort).toHaveBeenCalledTimes(1);
    await waitFor(() =>
      expect(screen.queryByText('Analyzing image…')).not.toBeInTheDocument(),
    );
  });

  it('aborts and ignores results when the target type becomes excluded', async () => {
    let resolve;
    const pendingRequest = new Promise((done) => {
      resolve = done;
    });
    const abort = jest.fn();
    pendingRequest.request = { abort };
    mockPost.mockReturnValueOnce(pendingRequest);
    const { onChange, store } = renderWidget();
    fireEvent.click(screen.getByText('Choose PNG'));
    fireEvent.click(screen.getByText('Generate with AI'));

    act(() =>
      store.dispatch({
        type: 'TEST_SETTINGS',
        settings: {
          enabled: true,
          features: {
            image: { enabled: true, allowed_content_types: ['Chart'] },
          },
        },
      }),
    );
    expect(abort).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('image', PNG);
    expect(screen.queryByText('Generate with AI')).not.toBeInTheDocument();

    await act(async () =>
      resolve({ title: 'Stale title', description: 'Stale description.' }),
    );
    expect(onChange).not.toHaveBeenCalledWith('title', expect.anything());
    expect(onChange).not.toHaveBeenCalledWith('description', expect.anything());
  });

  it('aborts and ignores results after leaving the form', async () => {
    let resolve;
    const pendingRequest = new Promise((done) => {
      resolve = done;
    });
    const abort = jest.fn();
    pendingRequest.request = { abort };
    mockPost.mockReturnValueOnce(pendingRequest);
    const { onChange, unmount } = renderWidget();
    fireEvent.click(screen.getByText('Choose PNG'));
    fireEvent.click(screen.getByText('Generate with AI'));

    unmount();
    expect(abort).toHaveBeenCalledTimes(1);
    await act(async () =>
      resolve({ title: 'Stale title', description: 'Stale description.' }),
    );
    expect(onChange).not.toHaveBeenCalled();
  });

  it('uploads without AI while preserving title and description', () => {
    const { onChange } = renderWidget({
      formData: { title: 'Editor title', description: 'Editor description' },
    });
    fireEvent.click(screen.getByText('Choose PNG'));
    fireEvent.click(screen.getByText('Upload without AI'));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('image', PNG);
  });

  it('analyses first and atomically fills image, title, and description', async () => {
    mockPost.mockResolvedValueOnce({
      title: 'Héron dans les roseaux',
      description: 'Un héron se tient dans une zone humide.',
    });
    const { onChange } = renderWidget();
    fireEvent.click(screen.getByText('Choose PNG'));

    await act(async () =>
      fireEvent.click(screen.getByText('Generate with AI')),
    );

    expect(mockPost).toHaveBeenCalledWith('/folder/@image-metadata', {
      data: { image: PNG, language: 'fr', portal_type: 'Image' },
    });
    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith('image', PNG);
      expect(onChange).toHaveBeenCalledWith('title', 'Héron dans les roseaux');
      expect(onChange).toHaveBeenCalledWith(
        'description',
        'Un héron se tient dans une zone humide.',
      );
    });
  });

  it('does not offer known-unsupported SVG analysis', () => {
    renderWidget();
    fireEvent.click(screen.getByText('Choose SVG'));

    expect(screen.getByText(/AI metadata is unavailable/i)).toBeVisible();
    expect(screen.queryByText('Generate with AI')).not.toBeInTheDocument();
    expect(screen.getByText('Upload without AI')).toBeVisible();
  });

  it('offers Retry, non-AI upload, and Cancel after analysis failure', async () => {
    mockPost.mockRejectedValueOnce({
      response: {
        body: {
          error: { code: 'generation_failed', message: 'hidden detail' },
        },
      },
    });
    const { onChange } = renderWidget();
    fireEvent.click(screen.getByText('Choose PNG'));
    await act(async () =>
      fireEvent.click(screen.getByText('Generate with AI')),
    );

    expect(await screen.findByText('Retry')).toBeVisible();
    expect(screen.getByText('Upload without AI')).toBeVisible();
    expect(screen.getByText('Cancel')).toBeVisible();
    expect(onChange).not.toHaveBeenCalled();

    mockPost.mockResolvedValueOnce({
      title: 'Retry title',
      description: 'Retry description.',
    });
    await act(async () => fireEvent.click(screen.getByText('Retry')));
    expect(mockPost).toHaveBeenNthCalledWith(2, '/folder/@image-metadata', {
      data: { image: PNG, language: 'fr', portal_type: 'Image' },
    });
    expect(onChange.mock.calls).toEqual([
      ['image', PNG],
      ['title', 'Retry title'],
      ['description', 'Retry description.'],
    ]);
  });

  it('confirms before regenerating over existing metadata', async () => {
    mockPost.mockResolvedValueOnce({
      title: 'Replacement title',
      description: 'Replacement description.',
    });
    renderWidget({
      value: PNG,
      formData: { title: 'Editor title', description: 'Editor description' },
    });

    fireEvent.click(screen.getByText('Generate with AI'));
    expect(screen.getByText('Replace Image metadata?')).toBeVisible();
    expect(mockPost).not.toHaveBeenCalled();

    const generateButtons = screen.getAllByText('Generate with AI');
    await act(async () =>
      fireEvent.click(generateButtons[generateButtons.length - 1]),
    );
    await waitFor(() => expect(mockPost).toHaveBeenCalled());
  });

  it('regenerates stored image metadata using the loaded Edit content type without rewriting the image', async () => {
    mockPost.mockResolvedValueOnce({
      title: 'New title',
      description: 'New description.',
    });
    const stored = {
      download: '/folder/photo/@@images/image',
      'content-type': 'image/png',
    };
    const { onChange } = renderWidget({
      route: '/folder/photo/edit',
      value: stored,
      content: { '@type': 'Image' },
    });
    await act(async () =>
      fireEvent.click(screen.getByText('Regenerate with AI')),
    );
    expect(mockPost).toHaveBeenCalledWith(
      '/folder/photo/@image-metadata-regenerate',
      {
        data: { field: 'image', language: 'fr' },
      },
    );
    expect(onChange.mock.calls).toEqual([
      ['title', 'New title'],
      ['description', 'New description.'],
    ]);
    expect(screen.getByText('Regenerate with AI')).toBeVisible();
  });

  it('uses the existing Chart type and preview_image field on Edit, ignoring an Add-style type query', async () => {
    mockPost.mockResolvedValueOnce({
      title: 'Wetland chart',
      description: 'A wetland chart.',
    });
    const { onChange } = renderWidget({
      route: '/folder/chart/edit?type=Image',
      id: 'preview_image',
      value: {
        download: '/folder/chart/@@images/preview_image',
        'content-type': 'image/png',
      },
      content: { '@type': 'Chart' },
      formData: { '@type': 'Image' },
      genAISettings: {
        enabled: true,
        features: {
          image: { enabled: true, allowed_content_types: ['Chart'] },
        },
      },
    });
    await act(async () =>
      fireEvent.click(screen.getByText('Regenerate with AI')),
    );
    expect(mockPost).toHaveBeenCalledWith(
      '/folder/chart/@image-metadata-regenerate',
      {
        data: { field: 'preview_image', language: 'fr' },
      },
    );
    expect(onChange).not.toHaveBeenCalledWith(
      'preview_image',
      expect.anything(),
    );
    expect(onChange).toHaveBeenCalledWith('title', 'Wetland chart');
  });

  it('keeps normal Edit uploads when the actual object type is excluded', () => {
    const { onChange } = renderWidget({
      route: '/folder/chart/edit?type=Image',
      content: { '@type': 'Chart' },
      formData: { '@type': 'Image' },
    });
    fireEvent.click(screen.getByText('Choose PNG'));
    expect(onChange).toHaveBeenCalledWith('image', PNG);
    expect(screen.queryByText('Generate with AI')).not.toBeInTheDocument();
    expect(mockPost).not.toHaveBeenCalled();
  });

  it('generates from a replacement upload on Edit after warning about current metadata', async () => {
    mockPost.mockResolvedValueOnce({
      title: 'New upload',
      description: 'A new upload.',
    });
    const { onChange } = renderWidget({
      route: '/folder/photo/edit',
      value: { download: '/stored' },
      content: { '@type': 'Image' },
      formData: { title: 'Editor title' },
    });
    fireEvent.click(screen.getByText('Choose PNG'));
    expect(
      screen.getByText(
        'Generating metadata will replace the current title and description.',
      ),
    ).toBeVisible();
    expect(onChange).not.toHaveBeenCalled();
    await act(async () =>
      fireEvent.click(screen.getByText('Generate with AI')),
    );
    expect(mockPost).toHaveBeenCalledWith(
      '/folder/photo/@image-metadata-regenerate',
      {
        data: { field: 'image', language: 'fr', image: PNG },
      },
    );
    expect(onChange.mock.calls).toEqual([
      ['image', PNG],
      ['title', 'New upload'],
      ['description', 'A new upload.'],
    ]);
  });

  it('prefers an already unsaved replacement over stored data when regenerating', async () => {
    mockPost.mockResolvedValueOnce({
      title: 'Replacement',
      description: 'A replacement.',
    });
    const { onChange } = renderWidget({
      route: '/folder/photo/edit',
      value: PNG,
      formData: { '@type': 'Image' },
    });
    await act(async () =>
      fireEvent.click(screen.getByText('Regenerate with AI')),
    );
    expect(mockPost).toHaveBeenCalledWith(
      '/folder/photo/@image-metadata-regenerate',
      {
        data: { field: 'image', language: 'fr', image: PNG },
      },
    );
    expect(onChange).not.toHaveBeenCalledWith('image', expect.anything());
  });

  it('allows cancelling replacement confirmation without a request or form changes', () => {
    const { onChange } = renderWidget({
      route: '/folder/photo/edit',
      value: { download: '/stored' },
      formData: { '@type': 'Image', title: 'Keep this title' },
    });
    fireEvent.click(screen.getByText('Regenerate with AI'));
    expect(screen.getByText('Replace Image metadata?')).toBeVisible();
    fireEvent.click(screen.getByText('Cancel'));
    expect(mockPost).not.toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('offers Retry and Cancel but no upload action after stored-image regeneration fails', async () => {
    mockPost.mockRejectedValueOnce({
      response: { body: { error: { code: 'generation_failed' } } },
    });
    mockPost.mockResolvedValueOnce({
      title: 'Retry title',
      description: 'Retry description.',
    });
    const { onChange } = renderWidget({
      route: '/folder/photo/edit',
      value: { download: '/stored' },
      content: { '@type': 'Image' },
    });
    await act(async () =>
      fireEvent.click(screen.getByText('Regenerate with AI')),
    );
    expect(
      screen.getByText('Image analysis failed. No changes have been saved.'),
    ).toBeVisible();
    expect(screen.queryByText('Upload without AI')).not.toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
    await act(async () => fireEvent.click(screen.getByText('Retry')));
    expect(mockPost).toHaveBeenNthCalledWith(
      2,
      '/folder/photo/@image-metadata-regenerate',
      { data: { field: 'image', language: 'fr' } },
    );
    expect(onChange).toHaveBeenCalledWith('title', 'Retry title');
  });

  it('keeps metadata edited while generation was pending instead of overwriting it', async () => {
    let resolve;
    mockPost.mockReturnValueOnce(
      new Promise((done) => {
        resolve = done;
      }),
    );
    const { onChange, rerenderWidget } = renderWidget({
      route: '/folder/photo/edit',
      value: { download: '/stored' },
      content: { '@type': 'Image' },
    });
    fireEvent.click(screen.getByText('Regenerate with AI'));
    rerenderWidget({ formData: { title: 'Manually revised title' } });
    await act(async () =>
      resolve({ title: 'Stale title', description: 'Stale description.' }),
    );
    expect(onChange).not.toHaveBeenCalled();
    expect(
      screen.getByText(
        'The title or description changed during analysis. Your edits were kept. Retry to generate again.',
      ),
    ).toBeVisible();

    mockPost.mockResolvedValueOnce({
      title: 'Fresh title',
      description: 'Fresh description.',
    });
    await act(async () => fireEvent.click(screen.getByText('Retry')));
    expect(mockPost).toHaveBeenNthCalledWith(
      2,
      '/folder/photo/@image-metadata-regenerate',
      { data: { field: 'image', language: 'fr' } },
    );
    expect(onChange.mock.calls).toEqual([
      ['title', 'Fresh title'],
      ['description', 'Fresh description.'],
    ]);
  });

  it.each(
    ['source', 'route', 'policy', 'field', 'type'].flatMap((change) =>
      ['success', 'failure'].map((outcome) => [change, outcome]),
    ),
  )(
    'aborts stored-image analysis when the %s changes and ignores late %s',
    async (change, outcome) => {
      let resolve;
      let reject;
      const pending = new Promise((done, fail) => {
        resolve = done;
        reject = fail;
      });
      const abort = jest.fn();
      pending.request = { abort };
      mockPost.mockReturnValueOnce(pending);
      const { onChange, rerenderWidget, history, store } = renderWidget({
        route: '/folder/photo/edit',
        value: { download: '/stored' },
        content: { '@type': 'Image' },
        genAISettings: {
          enabled: true,
          features: {
            image: { enabled: true, allowed_content_types: ['Image', 'Chart'] },
          },
        },
      });
      fireEvent.click(screen.getByText('Regenerate with AI'));
      if (change === 'source')
        rerenderWidget({ value: { download: '/different' } });
      if (change === 'route') act(() => history.push('/folder/other/edit'));
      if (change === 'field') rerenderWidget({ id: 'preview_image' });
      if (change === 'type')
        act(() =>
          store.dispatch({
            type: 'TEST_CONTENT',
            content: { '@type': 'Chart' },
          }),
        );
      if (change === 'policy')
        act(() => store.dispatch({ type: 'TEST_SETTINGS', settings: null }));
      expect(abort).toHaveBeenCalledTimes(1);
      await act(async () => {
        if (outcome === 'success')
          resolve({ title: 'Stale title', description: 'Stale description.' });
        else reject(new Error('Late failure'));
      });
      expect(onChange).not.toHaveBeenCalled();
      expect(screen.queryByText('Retry')).not.toBeInTheDocument();
      if (change === 'policy') {
        act(() =>
          store.dispatch({ type: 'TEST_SETTINGS', settings: enabledSettings }),
        );
        expect(screen.queryByText('Analyzing image…')).not.toBeInTheDocument();
        expect(screen.getByText('Regenerate with AI')).toBeVisible();
      }
    },
  );

  it.each(['success', 'failure'])(
    'ignores a superseded selection request after late %s without disturbing the active request',
    async (outcome) => {
      let resolveFirst;
      let rejectFirst;
      let resolveSecond;
      const first = new Promise((resolve, reject) => {
        resolveFirst = resolve;
        rejectFirst = reject;
      });
      const second = new Promise((resolve) => {
        resolveSecond = resolve;
      });
      const abortFirst = jest.fn();
      const abortSecond = jest.fn();
      first.request = { abort: abortFirst };
      second.request = { abort: abortSecond };
      mockPost.mockReturnValueOnce(first).mockReturnValueOnce(second);
      const { onChange } = renderWidget();

      fireEvent.click(screen.getByText('Choose PNG'));
      fireEvent.click(screen.getByText('Generate with AI'));
      fireEvent.click(screen.getByText('Choose PNG'));
      expect(abortFirst).toHaveBeenCalledTimes(1);
      fireEvent.click(screen.getByText('Generate with AI'));
      await act(async () => {
        if (outcome === 'success')
          resolveFirst({ title: 'Stale', description: 'Stale.' });
        else rejectFirst(new Error('Stale failure'));
      });
      expect(onChange).not.toHaveBeenCalled();
      expect(screen.getByText('Analyzing image…')).toBeVisible();
      expect(screen.queryByText('Retry')).not.toBeInTheDocument();
      expect(abortSecond).not.toHaveBeenCalled();

      await act(async () =>
        resolveSecond({ title: 'Current', description: 'Current.' }),
      );
      expect(onChange.mock.calls).toEqual([
        ['image', PNG],
        ['title', 'Current'],
        ['description', 'Current.'],
      ]);
    },
  );

  it.each(['choice', 'failed'])(
    'releases a pending new selection exactly once when policy is lost during %s',
    async (status) => {
      mockPost.mockRejectedValueOnce(new Error('Analysis failed'));
      const { onChange, store, rerenderWidget } = renderWidget();
      fireEvent.click(screen.getByText('Choose PNG'));
      if (status === 'failed') {
        await act(async () =>
          fireEvent.click(screen.getByText('Generate with AI')),
        );
        expect(screen.getByText('Retry')).toBeVisible();
      }
      act(() => store.dispatch({ type: 'TEST_SETTINGS', settings: null }));
      expect(onChange.mock.calls).toEqual([['image', PNG]]);
      const nextOnChange = jest.fn();
      rerenderWidget({ onChange: nextOnChange });
      act(() =>
        store.dispatch({ type: 'TEST_SETTINGS', settings: enabledSettings }),
      );
      act(() => store.dispatch({ type: 'TEST_SETTINGS', settings: null }));
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(nextOnChange).not.toHaveBeenCalled();
    },
  );

  it.each(['route', 'type', 'field', 'source'])(
    'does not release an obsolete selection when capability is lost in another %s context',
    (change) => {
      const { onChange, history, rerenderWidget } = renderWidget();
      fireEvent.click(screen.getByText('Choose PNG'));
      if (change === 'route') {
        act(() => history.push('/other/add?type=Chart'));
      }
      if (change === 'type') {
        act(() => history.push('/folder/add?type=Chart'));
      }
      // Replace the provider state and widget props in the same render.
      // Dispatching first would legitimately release into the old context.
      if (change === 'field')
        rerenderWidget({ id: 'preview_image' }, makeStore({}, null));
      if (change === 'source')
        rerenderWidget({ value: PNG }, makeStore({}, null));
      expect(onChange).not.toHaveBeenCalled();
      expect(screen.queryByText('Generate with AI')).not.toBeInTheDocument();
    },
  );

  it.each(['analyzing', 'failed'])(
    'never reapplies a current base64 value on failure or policy loss during %s',
    async (status) => {
      let reject;
      const pending = new Promise((resolve, fail) => {
        reject = fail;
      });
      const abort = jest.fn();
      pending.request = { abort };
      mockPost.mockReturnValueOnce(pending);
      const { onChange, store } = renderWidget({
        route: '/folder/photo/edit',
        value: PNG,
        content: { '@type': 'Image', image: { download: '/stale-file' } },
      });
      fireEvent.click(screen.getByText('Regenerate with AI'));
      expect(mockPost).toHaveBeenCalledWith(
        '/folder/photo/@image-metadata-regenerate',
        { data: { field: 'image', language: 'fr', image: PNG } },
      );
      if (status === 'failed') {
        await act(async () => reject(new Error('Analysis failed')));
        expect(screen.getByText('Retry')).toBeVisible();
        expect(screen.queryByText('Upload without AI')).not.toBeInTheDocument();
      }
      act(() => store.dispatch({ type: 'TEST_SETTINGS', settings: null }));
      if (status === 'analyzing') {
        expect(abort).toHaveBeenCalledTimes(1);
        await act(async () => reject(new Error('Late failure')));
      }
      expect(onChange).not.toHaveBeenCalled();
      act(() =>
        store.dispatch({ type: 'TEST_SETTINGS', settings: enabledSettings }),
      );
      expect(screen.queryByText('Retry')).not.toBeInTheDocument();
      expect(screen.queryByText('Analyzing image…')).not.toBeInTheDocument();
    },
  );

  it('keeps generated label history across value changes and cancellation but resets it for another field', async () => {
    mockPost.mockResolvedValueOnce({
      title: 'Generated title',
      description: 'Generated description.',
    });
    const { rerenderWidget } = renderWidget({ value: PNG });
    await act(async () =>
      fireEvent.click(screen.getByText('Generate with AI')),
    );
    expect(screen.getByText('Regenerate with AI')).toBeVisible();
    rerenderWidget({ value: { ...PNG, filename: 'another.png' } });
    expect(screen.getByText('Regenerate with AI')).toBeVisible();
    fireEvent.click(screen.getByText('Choose PNG'));
    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.getByText('Regenerate with AI')).toBeVisible();
    rerenderWidget({ id: 'preview_image' });
    expect(screen.getByText('Generate with AI')).toBeVisible();
  });

  it('delegates unchanged without a known target content type', () => {
    const { onChange } = renderWidget({ route: '/folder/edit', value: PNG });
    fireEvent.click(screen.getByText('Choose SVG'));

    expect(onChange).toHaveBeenCalledWith('image', SVG);
    expect(
      screen.queryByText('Generate Image metadata with AI?'),
    ).not.toBeInTheDocument();
  });

  describe('FormFieldWrapper and FileWidget composition', () => {
    it('renders the AI action with decorative icon and scope note below the filename inside the 8-wide control column above help text and renders validation errors once', () => {
      mockUseRealFileWidget = true;
      const storedPreview = {
        download: '/folder/photo/@@images/preview_image',
        filename: 'cat-3.jpeg',
        'content-type': 'image/jpeg',
      };
      const { container } = renderWidget({
        route: '/folder/photo/edit',
        id: 'preview_image',
        title: 'Preview image',
        fieldSet: 'default',
        description:
          'Insert an image that will be used in listing and teaser blocks.',
        required: true,
        error: ['Preview image is required.'],
        value: storedPreview,
        content: { '@type': 'Image' },
      });

      const wrappers = container.querySelectorAll(
        '.field-wrapper-preview_image',
      );
      expect(wrappers).toHaveLength(1);
      const fieldWrapper = wrappers[0];
      expect(fieldWrapper).toHaveClass('file', 'image-ai-file-widget');

      const labels = screen.getAllByText('Preview image');
      expect(labels).toHaveLength(1);
      expect(labels[0].tagName).toBe('LABEL');
      expect(labels[0]).toHaveAttribute('for', 'field-preview_image');

      const errorLabels = screen.getAllByText('Preview image is required.');
      expect(errorLabels).toHaveLength(1);

      const controlColumn = fieldWrapper.querySelector('.eight.wide.column');
      expect(controlColumn).toBeInTheDocument();

      const fileNameRow = controlColumn.querySelector('.field-file-name');
      expect(fileNameRow).toBeInTheDocument();
      expect(within(fileNameRow).getByText('cat-3.jpeg')).toBeInTheDocument();
      expect(
        within(fileNameRow).getByRole('button', { name: 'delete file' }),
      ).toBeInTheDocument();

      const aiButton = within(controlColumn).getByRole('button', {
        name: 'Regenerate with AI',
      });
      expect(aiButton.tagName).toBe('BUTTON');
      expect(aiButton).toHaveAttribute('type', 'button');
      expect(aiButton).toHaveClass(
        'ui',
        'tiny',
        'basic',
        'primary',
        'button',
        'image-ai-file-button',
      );
      expect(aiButton).toHaveAccessibleName('Regenerate with AI');
      expect(aiButton).toHaveAccessibleDescription(
        "Updates this item's title and description.",
      );
      const iconSvg = aiButton.querySelector('svg.icon');
      expect(iconSvg).toBeInTheDocument();
      expect(iconSvg).toHaveAttribute('aria-hidden', 'true');

      const scopeNote = within(controlColumn).getByText(
        "Updates this item's title and description.",
      );
      expect(scopeNote).toHaveAttribute('id', 'field-preview_image-ai-scope');

      const helpRow = fieldWrapper.querySelector('p.help');
      expect(helpRow).toHaveTextContent(
        'Insert an image that will be used in listing and teaser blocks.',
      );

      expect(
        Boolean(
          fileNameRow.compareDocumentPosition(aiButton) &
            Node.DOCUMENT_POSITION_FOLLOWING,
        ),
      ).toBe(true);
      expect(
        Boolean(
          aiButton.compareDocumentPosition(scopeNote) &
            Node.DOCUMENT_POSITION_FOLLOWING,
        ),
      ).toBe(true);
      expect(
        Boolean(
          controlColumn.compareDocumentPosition(helpRow) &
            Node.DOCUMENT_POSITION_FOLLOWING,
        ),
      ).toBe(true);
    });

    it('honors caller wrapped={false}, columns={1}, toolbar props, and preserves single-wrapper semantics when AI is disabled', () => {
      mockUseRealFileWidget = true;
      const onEdit = jest.fn();
      const onDelete = jest.fn();
      const { container, rerenderWidget } = renderWidget({
        id: 'preview_image',
        title: 'Preview image',
        fieldSet: 'default',
        value: PNG,
        wrapped: false,
        error: ['Single unwrapped error'],
      });

      expect(
        container.querySelector('.field-wrapper-preview_image'),
      ).not.toBeInTheDocument();
      expect(screen.getAllByText('Single unwrapped error')).toHaveLength(1);
      expect(
        screen.getByRole('button', { name: 'Generate with AI' }),
      ).toBeInTheDocument();

      rerenderWidget({
        wrapped: true,
        columns: 1,
        onEdit,
        onDelete,
        description: 'Preview help text.',
      });
      expect(
        container.querySelector('.four.wide.column'),
      ).not.toBeInTheDocument();
      expect(
        container.querySelector('.twelve.wide.column'),
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Delete' }),
      ).toBeInTheDocument();

      // Feature-off ordinary uploads keep single FormFieldWrapper from FileWidget
      rerenderWidget(
        {
          columns: 2,
          error: ['Feature off error'],
        },
        makeStore({}, null, {}),
      );
      expect(
        container.querySelectorAll('.field-wrapper-preview_image'),
      ).toHaveLength(1);
      expect(screen.getAllByText('Feature off error')).toHaveLength(1);
      expect(
        screen.queryByRole('button', { name: /generate with ai/i }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText("Updates this item's title and description."),
      ).not.toBeInTheDocument();
    });

    it('disables the AI button for an unsupported existing file while keeping the scope note visible', () => {
      renderWidget({
        value: SVG,
      });

      const aiButton = screen.getByRole('button', {
        name: 'Generate with AI',
      });
      expect(aiButton).toBeDisabled();
      expect(aiButton).toHaveAccessibleDescription(
        "Updates this item's title and description.",
      );
    });
  });

  describe('disabled and read-only safety guards', () => {
    it.each(['isDisabled', 'disabled'])(
      'forwards %s to FileWidget, disables AI actions, and blocks file or metadata mutations when read-only',
      (disabledProp) => {
        mockUseRealFileWidget = true;
        const { container, onChange, rerenderWidget } = renderWidget({
          value: PNG,
          [disabledProp]: true,
        });

        expect(container.querySelector('#field-image')).toBeDisabled();
        expect(
          screen.getByRole('button', { name: 'delete file' }),
        ).toBeDisabled();
        const aiButton = screen.getByRole('button', {
          name: 'Generate with AI',
        });
        expect(aiButton).toBeDisabled();

        fireEvent.click(aiButton);
        expect(mockPost).not.toHaveBeenCalled();

        // Switch to mocked FileWidget to verify guarded onChange handlers when blocked
        mockUseRealFileWidget = false;
        rerenderWidget({ [disabledProp]: true });
        fireEvent.click(screen.getByText('Choose PNG'));
        expect(onChange).not.toHaveBeenCalled();
        expect(
          screen.queryByText('Generate Image metadata with AI?'),
        ).not.toBeInTheDocument();

        // Also blocks passthrough file changes when AI is disabled
        rerenderWidget({ [disabledProp]: true }, makeStore({}, null, {}));
        fireEvent.click(screen.getByText('Choose PNG'));
        expect(onChange).not.toHaveBeenCalled();
      },
    );

    it.each(['isDisabled', 'disabled'])(
      'aborts in-flight analysis and prevents file or metadata application when %s flips on during a request or capability loss',
      async (disabledProp) => {
        let resolve;
        const pending = new Promise((done) => {
          resolve = done;
        });
        const abort = jest.fn();
        pending.request = { abort };
        mockPost.mockReturnValueOnce(pending);

        const { onChange, rerenderWidget, store } = renderWidget();

        fireEvent.click(screen.getByText('Choose PNG'));
        fireEvent.click(screen.getByText('Generate with AI'));
        expect(screen.getByText('Analyzing image…')).toBeVisible();

        rerenderWidget({ [disabledProp]: true });
        expect(abort).toHaveBeenCalledTimes(1);
        await waitFor(() =>
          expect(
            screen.queryByText('Analyzing image…'),
          ).not.toBeInTheDocument(),
        );

        // Capability loss while read-only must not apply pending file selection
        act(() => store.dispatch({ type: 'TEST_SETTINGS', settings: null }));
        await act(async () =>
          resolve({
            title: 'Should not apply',
            description: 'Should not apply.',
          }),
        );
        expect(onChange).not.toHaveBeenCalled();
      },
    );
  });

  describe('GenAI settings gear', () => {
    it('shows the GenAI settings gear in actions when value is present', () => {
      renderWidget({ value: PNG });
      const gear = screen.getByRole('button', { name: 'GenAI settings' });
      expect(gear).toBeInTheDocument();
      expect(gear).toHaveClass('image-ai-settings-button');
      expect(gear).not.toBeDisabled();
    });

    it('does not show the gear when value is not present', () => {
      renderWidget();
      expect(
        screen.queryByRole('button', { name: 'GenAI settings' }),
      ).not.toBeInTheDocument();
    });

    it('disables the gear when the widget is read-only', () => {
      renderWidget({ value: PNG, isDisabled: true });
      const gear = screen.getByRole('button', { name: 'GenAI settings' });
      expect(gear).toBeDisabled();
    });
  });
});
