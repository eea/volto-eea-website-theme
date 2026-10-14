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
import Toast from '@plone/volto/components/manage/Toast/Toast';

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
        disabled: props.isDisabled,
        onChange: (event) => props.onChange(props.id, event.target.value),
      }),
  };
});

jest.mock('react-toastify', () => ({
  __esModule: true,
  toast: { success: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

jest.mock('@eeacms/volto-eea-website-theme/helpers/toApiPath', () => ({
  __esModule: true,
  toApiPath: (url) => mockToApiPath(url),
}));

jest.mock('./imageAltWidget.less', () => ({}));

const enabledSettings = {
  enabled: true,
  features: { image: { enabled: true } },
};

const makeStore = (blocksData = {}, genAISettings = enabledSettings) => {
  const state = {
    form: { global: { blocks: blocksData } },
    intl: { locale: 'en' },
    reduxAsyncConnect: { genAISettings },
  };
  return {
    getState: () => state,
    subscribe: () => () => {},
    dispatch: () => {},
  };
};

const renderWidget = ({
  blocksData,
  block,
  genAISettings = enabledSettings,
  ...props
} = {}) => {
  const store = makeStore(
    blocksData || {
      b1: {
        url: '/eea/en/two.jpeg',
        image_title: 'Cat on a sofa',
        alt_source: 'image-title',
        alt: '',
      },
    },
    genAISettings,
  );
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

  it('shows the live title while in Image-title mode', () => {
    renderWidget();
    expect(screen.getByLabelText('alt')).toHaveValue('Cat on a sofa');
    expect(screen.getByText('Using linked Image title')).toBeInTheDocument();
    expect(screen.getByText('Generate AI alt')).toBeInTheDocument();
  });

  it('shows Regenerate only for a non-empty custom alt', () => {
    renderWidget({
      value: 'Hand-written alt',
      blocksData: {
        b1: {
          url: '/eea/en/two.jpeg',
          image_title: 'Cat on a sofa',
          alt_source: 'custom',
          alt: 'Hand-written alt',
        },
      },
    });
    expect(screen.getByText('Regenerate AI alt')).toBeInTheDocument();
  });

  it('shows an accessibility warning for an unresolved external image', () => {
    renderWidget({
      blocksData: {
        b1: { url: 'https://cdn.example.com/img.jpg', alt_source: 'custom' },
      },
    });
    expect(screen.queryByText('Generate AI alt')).not.toBeInTheDocument();
    expect(
      screen.getByText(/external image needs custom alt text/i),
    ).toBeInTheDocument();
  });

  it('generates plain alt text through @image-alt', async () => {
    mockPost.mockResolvedValueOnce({ alt: 'A cat rests on a sofa.' });
    const { onChange } = renderWidget();

    await act(async () => {
      fireEvent.click(screen.getByText('Generate AI alt'));
    });

    expect(mockPost).toHaveBeenCalledWith('/eea/en/two.jpeg/@image-alt', {
      data: { language: 'en' },
    });
    await waitFor(() =>
      expect(onChange).toHaveBeenCalledWith('alt', 'A cat rests on a sofa.'),
    );
    expect(onChange).toHaveBeenCalledWith('alt_source', 'custom');
    expect(toast.success).toHaveBeenCalled();
    const [notification] = toast.success.mock.calls[0];
    expect(notification.type).toBe(Toast);
    expect(notification.props).toMatchObject({
      success: true,
      title: 'Success',
      content: 'AI alt generated',
    });
  });

  it('renders an empty-result warning with Volto Toast', async () => {
    mockPost.mockResolvedValueOnce({ alt: '   ' });
    const { onChange } = renderWidget();

    await act(async () => {
      fireEvent.click(screen.getByText('Generate AI alt'));
    });

    await waitFor(() => expect(toast.warn).toHaveBeenCalled());
    const [notification] = toast.warn.mock.calls[0];
    expect(notification.type).toBe(Toast);
    expect(notification.props).toMatchObject({
      warning: true,
      title: 'Warning',
      content: 'The AI service returned no valid alt text.',
    });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('normalizes generated text equal to the title back to Image-title mode', async () => {
    mockPost.mockResolvedValueOnce({ alt: '  Cat   on a sofa  ' });
    const { onChange } = renderWidget();

    await act(async () => {
      fireEvent.click(screen.getByText('Generate AI alt'));
    });

    await waitFor(() =>
      expect(onChange).toHaveBeenCalledWith('alt_source', 'image-title'),
    );
    expect(onChange).toHaveBeenCalledWith('alt', '');
  });

  it('shows initial generation progress in the button and disables the alt field without opening a modal', async () => {
    let resolvePost;
    mockPost.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolvePost = resolve;
        }),
    );
    renderWidget();

    fireEvent.click(screen.getByText('Generate AI alt'));

    expect(screen.getByText('Generate AI alt').closest('button')).toHaveClass(
      'loading',
    );
    expect(
      screen.getByText('Generate AI alt').closest('button'),
    ).toBeDisabled();
    expect(screen.getByLabelText('alt')).toBeDisabled();
    expect(
      document.querySelector('.image-ai-alt-confirm-modal'),
    ).not.toBeInTheDocument();

    await act(async () => resolvePost({ alt: 'A cat rests on a sofa.' }));
    await waitFor(() =>
      expect(
        screen.getByText('Generate AI alt').closest('button'),
      ).toBeEnabled(),
    );
    expect(screen.getByLabelText('alt')).toBeEnabled();
  });

  it('keeps a loader in the confirmation modal while regenerating alt text', async () => {
    let resolvePost;
    mockPost.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolvePost = resolve;
        }),
    );
    renderWidget({
      value: 'Hand-written alt',
      blocksData: {
        b1: {
          url: '/eea/en/two.jpeg',
          image_title: 'Cat on a sofa',
          alt_source: 'custom',
          alt: 'Hand-written alt',
        },
      },
    });

    fireEvent.click(screen.getByText('Regenerate AI alt'));
    const buttons = screen.getAllByText('Regenerate AI alt');
    fireEvent.click(buttons[buttons.length - 1]);

    expect(screen.getByText('Regenerate AI alt?')).toBeVisible();
    expect(screen.getByText('Generating AI alt…')).toBeVisible();

    await act(async () => resolvePost({ alt: 'A cat rests on a sofa.' }));
    await waitFor(() =>
      expect(
        document.querySelector('.image-ai-alt-confirm-modal'),
      ).not.toBeInTheDocument(),
    );
  });

  it('asks before overwriting custom alt and preserves it on error', async () => {
    mockPost.mockRejectedValueOnce({
      response: {
        body: { error: { code: 'generation_failed', message: 'Localized' } },
      },
    });
    const { onChange } = renderWidget({
      value: 'Hand-written alt',
      blocksData: {
        b1: {
          url: '/eea/en/two.jpeg',
          image_title: 'Cat on a sofa',
          alt_source: 'custom',
          alt: 'Hand-written alt',
        },
      },
    });

    fireEvent.click(screen.getByText('Regenerate AI alt'));
    expect(screen.getByText('Regenerate AI alt?')).toBeInTheDocument();
    expect(mockPost).not.toHaveBeenCalled();

    const buttons = screen.getAllByText('Regenerate AI alt');
    await act(async () => fireEvent.click(buttons[buttons.length - 1]));

    await waitFor(() => expect(toast.error).toHaveBeenCalled());
    const [notification] = toast.error.mock.calls[0];
    expect(notification.type).toBe(Toast);
    expect(notification.props).toMatchObject({
      error: true,
      title: 'Error',
      content: 'AI alt generation failed.',
    });
    expect(
      document.querySelector('.image-ai-alt-confirm-modal'),
    ).not.toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('uses the Image title action without storing a duplicate', () => {
    const { onChange } = renderWidget({
      value: 'Custom alt',
      blocksData: {
        b1: {
          url: '/eea/en/two.jpeg',
          image_title: 'Cat on a sofa',
          alt_source: 'custom',
          alt: 'Custom alt',
        },
      },
    });

    fireEvent.click(screen.getByText('Use Image title'));
    expect(onChange).toHaveBeenCalledWith('alt', '');
    expect(onChange).toHaveBeenCalledWith('alt_source', 'image-title');
  });

  it.each([
    null,
    { enabled: false, features: { image: { enabled: true } } },
    { enabled: true, features: { image: { enabled: false } } },
  ])(
    'hides only AI actions when settings are unavailable or disabled',
    (genAISettings) => {
      const { onChange } = renderWidget({
        genAISettings,
        value: 'Preserved custom alt',
        blocksData: {
          b1: {
            url: '/eea/en/two.jpeg',
            image_title: 'Cat on a sofa',
            alt_source: 'custom',
            alt: 'Preserved custom alt',
          },
        },
      });

      expect(screen.getByLabelText('alt')).toBeEnabled();
      expect(screen.queryByText('Regenerate AI alt')).not.toBeInTheDocument();
      fireEvent.change(screen.getByLabelText('alt'), {
        target: { value: 'Manual alt' },
      });
      expect(onChange).toHaveBeenCalledWith('alt', 'Manual alt');
      fireEvent.click(screen.getByText('Use Image title'));
      expect(onChange).toHaveBeenCalledWith('alt_source', 'image-title');
      expect(mockPost).not.toHaveBeenCalled();
    },
  );

  it('discards a stale response after the linked image changes', async () => {
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
      element(
        makeStore({
          b1: {
            url: '/eea/en/two.jpeg',
            image_title: 'Two',
            alt_source: 'image-title',
          },
        }),
      ),
    );

    fireEvent.click(screen.getByText('Generate AI alt'));
    utils.rerender(
      element(
        makeStore({
          b1: {
            url: '/eea/en/three.jpeg',
            image_title: 'Three',
            alt_source: 'image-title',
          },
        }),
      ),
    );

    await waitFor(() =>
      expect(
        screen.getByText('Generate AI alt').closest('button'),
      ).toBeEnabled(),
    );
    expect(
      document.querySelector('.image-ai-alt-confirm-modal'),
    ).not.toBeInTheDocument();
    await act(async () => resolvePost({ alt: 'Stale response' }));
    expect(onChange).not.toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
  });
});
