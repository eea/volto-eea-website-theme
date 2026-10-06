import React from 'react';
import { Provider } from 'react-redux';
import { IntlProvider } from 'react-intl';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import { toast } from 'react-toastify';

import ImageAltWidget from './ImageAltWidget';

const mockPost = jest.fn();
const mockToApiPath = jest.fn();

jest.mock('@plone/volto/helpers/Api/Api', () => ({
  __esModule: true,
  default: jest.fn(() => ({ post: mockPost })),
}));

jest.mock('@plone/volto/components/theme/Icon/Icon', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: () => React.createElement('span', null, 'Icon'),
  };
});

jest.mock('@plone/volto/components/manage/Widgets/TextareaWidget', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: (props) =>
      React.createElement('textarea', {
        'aria-label': 'alt',
        value: props.value || '',
        onChange: (e) => props.onChange(props.id, e.target.value),
      }),
  };
});

jest.mock('react-toastify', () => ({
  __esModule: true,
  toast: { success: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

jest.mock('../../../helpers/toApiPath', () => ({
  __esModule: true,
  toApiPath: (url) => mockToApiPath(url),
}));

jest.mock('./imageAltWidget.less', () => ({}));

const MARKED =
  '[AI Generated description] A cat on a sofa. [End of AI Generated description]';

// Minimal redux store: the state object is cached because
// useSyncExternalStore requires a stable snapshot for unchanged state.
const makeStore = (blocksData = {}) => {
  const state = { form: { global: { blocks: blocksData } } };
  return {
    getState: () => state,
    subscribe: () => () => {},
    dispatch: () => {},
  };
};

const renderWidget = ({ blocksData, block, ...props } = {}) => {
  const store = makeStore(blocksData || { b1: { url: '/eea/en/two.jpeg' } });
  const onChange = jest.fn();
  const utils = render(
    <Provider store={store}>
      <IntlProvider locale="en" messages={{}}>
        <ImageAltWidget
          id="alt"
          title="Alt text"
          value=""
          onChange={onChange}
          block={block === undefined ? 'b1' : block}
          {...props}
        />
      </IntlProvider>
    </Provider>,
  );
  return { onChange, ...utils };
};

describe('ImageAltWidget', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockToApiPath.mockImplementation((url) =>
      url && url.startsWith('/') ? url : null,
    );
  });

  it('shows the generate label when there is no alt', () => {
    renderWidget();
    expect(screen.getByText('Generate AI alt')).toBeInTheDocument();
  });

  it('shows the regenerate label when an alt exists', () => {
    renderWidget({ value: 'hand written alt' });
    expect(screen.getByText('Regenerate AI alt')).toBeInTheDocument();
  });

  it('hides the button when the url is not an internal image object', () => {
    renderWidget({
      blocksData: { b1: { url: 'https://cdn.example.com/img.jpg' } },
    });
    expect(screen.queryByText('Generate AI alt')).not.toBeInTheDocument();
    expect(screen.queryByText('Regenerate AI alt')).not.toBeInTheDocument();
  });

  it('hides the button when the block has no linked image', () => {
    renderWidget({ blocksData: { b1: {} } });
    expect(screen.queryByText('Generate AI alt')).not.toBeInTheDocument();
  });

  it('hides the button when the block id resolves to no block data', () => {
    renderWidget({ block: '' });
    expect(screen.queryByText('Generate AI alt')).not.toBeInTheDocument();
  });

  it('generates an alt, strips the markers and posts body-less', async () => {
    mockPost.mockResolvedValueOnce({ llm_summary: MARKED });
    const { onChange } = renderWidget();

    await act(async () => {
      fireEvent.click(screen.getByText('Generate AI alt'));
    });

    expect(mockPost).toHaveBeenCalledWith('/eea/en/two.jpeg/@llm-summary');
    await waitFor(() =>
      expect(onChange).toHaveBeenCalledWith('alt', 'A cat on a sofa.'),
    );
    expect(toast.success).toHaveBeenCalled();
  });

  it('warns when the backend returns an empty summary', async () => {
    mockPost.mockResolvedValueOnce({ llm_summary: '   ' });
    const { onChange } = renderWidget();

    await act(async () => {
      fireEvent.click(screen.getByText('Generate AI alt'));
    });

    await waitFor(() => expect(toast.warn).toHaveBeenCalled());
    expect(onChange).not.toHaveBeenCalled();
  });

  it('reports an error and keeps the alt when generation fails', async () => {
    mockPost.mockRejectedValueOnce(
      Object.assign(new Error('Forbidden'), {
        response: { body: { error: 'No permission' } },
      }),
    );
    const { onChange } = renderWidget({ value: 'hand written alt' });

    await act(async () => {
      fireEvent.click(screen.getByText('Regenerate AI alt'));
    });
    // confirm dialog: click the dialog's confirm button (last match)
    const buttons = screen.getAllByText('Regenerate AI alt');
    await act(async () => {
      fireEvent.click(buttons[buttons.length - 1]);
    });

    await waitFor(() => expect(toast.error).toHaveBeenCalled());
    expect(onChange).not.toHaveBeenCalled();
  });

  it('asks for confirmation before overwriting an existing alt', async () => {
    renderWidget({ value: 'hand written alt' });

    fireEvent.click(screen.getByText('Regenerate AI alt'));

    expect(screen.getByText('Regenerate AI alt?')).toBeInTheDocument();
    expect(mockPost).not.toHaveBeenCalled();
  });

  it('discards stale responses when the linked image changes mid-request', async () => {
    let resolvePost;
    mockPost.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolvePost = resolve;
        }),
    );
    const onChange = jest.fn();
    const element = (store) => (
      <Provider store={store}>
        <IntlProvider locale="en" messages={{}}>
          <ImageAltWidget
            id="alt"
            title="Alt text"
            value=""
            onChange={onChange}
            block="b1"
          />
        </IntlProvider>
      </Provider>
    );
    const utils = render(
      element(makeStore({ b1: { url: '/eea/en/two.jpeg' } })),
    );

    fireEvent.click(screen.getByText('Generate AI alt'));
    // the user links a different image while the request is in flight
    utils.rerender(element(makeStore({ b1: { url: '/eea/en/three.jpeg' } })));

    await act(async () => {
      resolvePost({ llm_summary: MARKED });
    });

    expect(mockPost).toHaveBeenCalledWith('/eea/en/two.jpeg/@llm-summary');
    expect(onChange).not.toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
  });
});
