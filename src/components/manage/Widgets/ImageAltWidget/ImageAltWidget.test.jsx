import React from 'react';
import { Provider } from 'react-redux';
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

import Api from '@plone/volto/helpers/Api/Api';
import { toast as mockToast } from 'react-toastify';
import ImageAltWidget from './ImageAltWidget';
import { ImageSchema } from '@eeacms/volto-eea-website-theme/customizations/volto/components/manage/Blocks/Image/schema';

const mockPost = jest.fn();
const mockGet = jest.fn();
const mockPatch = jest.fn();

jest.mock('@plone/volto/helpers/Api/Api', () => ({
  __esModule: true,
  default: jest.fn(() => ({ post: mockPost, get: mockGet, patch: mockPatch })),
}));

jest.mock('react-toastify', () => ({
  __esModule: true,
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
    info: jest.fn(),
  },
}));

jest.mock('@plone/volto/components/theme/Icon/Icon', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: (props) =>
      React.createElement(
        'span',
        { 'data-testid': 'volto-icon', title: props.title },
        'Icon',
      ),
  };
});

jest.mock('@plone/volto/components/manage/Form/Field', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: ({ id, title, type, value, onChange, disabled }) =>
      React.createElement(
        'div',
        { 'data-testid': `field-${id}` },
        React.createElement('label', { htmlFor: id }, title),
        React.createElement('input', {
          id,
          type: type === 'integer' || type === 'number' ? 'number' : undefined,
          'aria-label': title,
          value: value ?? '',
          disabled,
          onChange: (e) => onChange(id, e.target.value),
        }),
      ),
  };
});

jest.mock('@plone/volto/registry', () => ({
  __esModule: true,
  default: {
    settings: {
      apiPath: 'https://api.example.com/Plone',
      internalApiPath: 'http://backend:8080/Plone',
      publicURL: 'https://www.example.com',
    },
    widgets: {
      vocabulary: {},
      views: { widget: {}, id: {} },
      widget: {},
      id: {},
      choices: {},
      type: {},
      default: () => null,
    },
  },
}));

jest.mock('./imageAltWidget.less', () => ({}));

const enabledSettings = {
  enabled: true,
  features: { image: { enabled: true, allowed_content_types: ['Image'] } },
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

const defaultBlocksData = () => ({
  b1: {
    url: '/eea/en/two.jpeg',
    image_title: 'Cat on a sofa',
    alt_source: 'image-metadata',
    alt: '',
  },
});

const renderWidget = ({
  blocksData,
  block,
  genAISettings = enabledSettings,
  ...props
} = {}) => {
  const store = makeStore(blocksData || defaultBlocksData(), genAISettings);
  const onChange = jest.fn();
  const utils = render(
    <Provider store={store}>
      <IntlProvider locale="en" messages={{}}>
        <ImageAltWidget
          id="alt"
          title="Alt text"
          fieldSet="default"
          value=""
          onChange={onChange}
          block={block === undefined ? 'b1' : block}
          {...props}
        />
      </IntlProvider>
    </Provider>,
  );
  return { onChange, store, ...utils };
};

const ControlledAltWidget = ({ initialValue = '', initialFormData }) => {
  const [state, setState] = React.useState({
    value: initialValue,
    formData: initialFormData || defaultBlocksData().b1,
  });
  const onChange = (field, nextValue) =>
    setState((current) =>
      field === 'alt'
        ? {
            value: nextValue,
            formData: { ...current.formData, alt: nextValue },
          }
        : {
            ...current,
            formData: { ...current.formData, [field]: nextValue },
          },
    );
  return (
    <ImageAltWidget
      id="alt"
      title="Alt text"
      fieldSet="default"
      value={state.value}
      formData={state.formData}
      onChange={onChange}
      block="b1"
    />
  );
};

const renderControlledWidget = (props) =>
  render(
    <Provider store={makeStore()}>
      <IntlProvider locale="en" messages={{}}>
        <ControlledAltWidget {...props} />
      </IntlProvider>
    </Provider>,
  );

const createControllableRequest = () => {
  let resolve;
  let reject;
  const abort = jest.fn();
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  promise.request = { abort };
  return { promise, resolve, reject, abort };
};

const genaiControlpanel = {
  id: 'genai',
  title: 'GenAI Settings',
  description: '',
  schema: {
    id: 'genai',
    title: 'GenAI Settings',
    description: '',
    properties: {
      enabled: {
        id: 'enabled',
        title: 'Enabled',
        type: 'boolean',
        default: true,
      },
      image_ai_enabled: {
        id: 'image_ai_enabled',
        title: 'Enable Image AI features',
        type: 'boolean',
        default: true,
      },
      image_ai_allowed_content_types: {
        id: 'image_ai_allowed_content_types',
        title: 'Allowed content types',
        type: 'array',
      },
      image_title_alt_max_length: {
        id: 'image_title_alt_max_length',
        title: 'Maximum Image title/alt length',
        type: 'number',
        minimum: 1,
        default: 64,
      },
      image_description_max_length: {
        id: 'image_description_max_length',
        title: 'Maximum Image description length',
        type: 'number',
        minimum: 1,
        default: 500,
      },
      summary_enabled: {
        id: 'summary_enabled',
        title: 'Enable summaries',
        type: 'boolean',
        default: true,
      },
    },
    fieldsets: [
      {
        id: 'default',
        title: 'Default',
        fields: [
          'enabled',
          'image_ai_enabled',
          'image_ai_allowed_content_types',
          'image_title_alt_max_length',
          'image_description_max_length',
          'summary_enabled',
        ],
      },
    ],
  },
  data: {
    enabled: true,
    image_ai_enabled: true,
    image_ai_allowed_content_types: ['Image'],
    image_title_alt_max_length: 64,
    image_description_max_length: 500,
    summary_enabled: true,
  },
  subitems: [],
};

const toastTitles = (fn) =>
  fn.mock.calls.map(([element]) => element?.props?.title || '');

describe('ImageAltWidget', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPost.mockReset();
    mockGet.mockReset();
    mockPatch.mockReset();
  });

  describe('FormFieldWrapper and TextareaWidget composition', () => {
    it('renders provenance and AI controls inside the 8-wide control column above help text without alert boxes or duplicate labels/errors', () => {
      const { container } = renderWidget({
        description: 'Describe the purpose of the image.',
        required: true,
        error: ['Alt text is required.'],
      });

      const fieldWrapper = container.querySelector(
        '.field-wrapper-alt.textarea.image-alt-widget',
      );
      expect(fieldWrapper).toBeInTheDocument();

      const labels = screen.getAllByText('Alt text');
      expect(labels).toHaveLength(1);
      expect(labels[0].tagName).toBe('LABEL');
      expect(labels[0]).toHaveAttribute('for', 'field-alt');

      const errorLabels = screen.getAllByText('Alt text is required.');
      expect(errorLabels).toHaveLength(1);

      const controlColumn = fieldWrapper.querySelector('.eight.wide.column');
      expect(controlColumn).toBeInTheDocument();
      expect(
        within(controlColumn).getByLabelText('Alt text'),
      ).toBeInTheDocument();
      expect(
        within(controlColumn).getByText('Using linked Image metadata'),
      ).toBeInTheDocument();
      expect(
        within(controlColumn).getByRole('button', {
          name: 'Generate with AI (Alt text)',
        }),
      ).toBeInTheDocument();

      expect(container.querySelector('.ui.message')).not.toBeInTheDocument();

      const helpRow = fieldWrapper.querySelector('p.help');
      expect(helpRow).toHaveTextContent('Describe the purpose of the image.');
      expect(
        Boolean(
          controlColumn.compareDocumentPosition(helpRow) &
            Node.DOCUMENT_POSITION_FOLLOWING,
        ),
      ).toBe(true);
    });

    it('honors wrapped={false}, columns={1}, and toolbar props on FormFieldWrapper', () => {
      const onEdit = jest.fn();
      const onDelete = jest.fn();
      const { container, rerender } = renderWidget({
        wrapped: false,
        error: ['Single unwrapped error'],
      });

      expect(
        container.querySelector('.field-wrapper-alt'),
      ).not.toBeInTheDocument();
      expect(screen.getAllByText('Single unwrapped error')).toHaveLength(1);
      expect(
        screen.getByRole('button', { name: 'Generate with AI (Alt text)' }),
      ).toBeInTheDocument();

      const store = makeStore(defaultBlocksData(), enabledSettings);
      rerender(
        <Provider store={store}>
          <IntlProvider locale="en" messages={{}}>
            <ImageAltWidget
              id="alt"
              title="Alt text"
              fieldSet="default"
              value=""
              columns={1}
              onEdit={onEdit}
              onDelete={onDelete}
              onChange={jest.fn()}
              block="b1"
            />
          </IntlProvider>
        </Provider>,
      );

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
    });

    it('drops the redundant clear-custom-text hint from ImageSchema alt description', () => {
      const intl = {
        formatMessage: (msg) => msg.defaultMessage,
      };
      const schema = ImageSchema({
        formData: { url: '/eea/en/two.jpeg' },
        intl,
      });
      expect(schema.properties.alt.description).toBe(
        'Describe the purpose of the image.',
      );
    });
  });

  it('shows the live title while in Image-title mode and does not construct Api on render', () => {
    renderWidget();
    expect(Api).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Alt text')).toHaveValue('Cat on a sofa');
    expect(screen.getByText('Using linked Image metadata')).toBeInTheDocument();
    const button = screen.getByRole('button', {
      name: 'Generate with AI (Alt text)',
    });
    expect(button).toHaveTextContent('Generate with AI');
    expect(within(button).getByTestId('volto-icon')).toBeInTheDocument();
  });

  it('shows Regenerate with AI and link-styled reset button only for a non-empty custom alt', () => {
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
    expect(screen.getByText('Custom alt')).toBeInTheDocument();
    const regenerateBtn = screen.getByRole('button', {
      name: 'Regenerate with AI (Alt text)',
    });
    expect(regenerateBtn).toHaveTextContent('Regenerate with AI');
    const resetBtn = screen.getByRole('button', { name: 'Use Image metadata' });
    expect(resetBtn.tagName).toBe('BUTTON');
    expect(resetBtn).toHaveAttribute('type', 'button');
    expect(resetBtn).toHaveClass('image-alt-link-button');
  });

  it('shows "Use Image metadata" button when custom alt text happens to match metadata', () => {
    const onChange = jest.fn();
    renderWidget({
      blocksData: {
        b1: {
          url: '/eea/en/photo.jpeg',
          image_metadata: 'Cat on sofa: A sleeping cat.',
          alt_source: 'custom',
          alt: 'Cat on sofa: A sleeping cat.',
        },
      },
      value: 'Cat on sofa: A sleeping cat.',
      onChange,
    });
    expect(screen.getByText('Custom alt')).toBeInTheDocument();
    const resetBtn = screen.getByRole('button', { name: 'Use Image metadata' });
    expect(resetBtn).toBeInTheDocument();
    fireEvent.click(resetBtn);
    expect(onChange).toHaveBeenCalledWith('alt', '');
    expect(onChange).toHaveBeenCalledWith('alt_source', 'image-metadata');
  });

  it('shows an accessibility warning for an unresolved external image', () => {
    renderWidget({
      blocksData: {
        b1: { url: 'https://cdn.example.com/img.jpg', alt_source: 'custom' },
      },
    });
    expect(
      screen.queryByRole('button', { name: /generate with ai/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(/external image needs custom alt text/i),
    ).toBeInTheDocument();
  });

  it('uses the application-relative path for a stored absolute backend URL', async () => {
    mockPost.mockResolvedValueOnce({ alt: 'A cat rests on a sofa.' });
    renderWidget({
      blocksData: {
        b1: {
          url: 'http://backend:8080/Plone/en/photo',
          image_title: 'Cat',
          alt_source: 'image-metadata',
        },
      },
    });
    await act(async () =>
      fireEvent.click(screen.getByText('Generate with AI')),
    );
    expect(mockPost).toHaveBeenCalledWith('/en/photo/@image-alt', {
      data: { language: 'en' },
    });
  });

  it('generates plain alt text through @image-alt and updates the field provenance', async () => {
    mockPost.mockResolvedValueOnce({ alt: 'A cat rests on a sofa.' });
    const { onChange } = renderWidget();

    await act(async () => {
      fireEvent.click(screen.getByText('Generate with AI'));
    });

    expect(mockPost).toHaveBeenCalledWith('/eea/en/two.jpeg/@image-alt', {
      data: { language: 'en' },
    });
    await waitFor(() =>
      expect(onChange).toHaveBeenCalledWith('alt', 'A cat rests on a sofa.'),
    );
    expect(onChange).toHaveBeenCalledWith('alt_source', 'custom');
    expect(screen.queryByText('AI alt generated')).not.toBeInTheDocument();
  });

  it('moves focus to Cancel for direct generation and back to the trigger after a controlled success', async () => {
    const req = createControllableRequest();
    mockPost.mockReturnValueOnce(req.promise);
    renderControlledWidget();

    fireEvent.click(
      screen.getByRole('button', { name: 'Generate with AI (Alt text)' }),
    );
    expect(
      screen.getByRole('button', {
        name: 'Cancel AI alt generation (Alt text)',
      }),
    ).toHaveFocus();

    await act(async () => req.resolve({ alt: 'A cat rests on a sofa.' }));

    expect(screen.getByLabelText('Alt text')).toHaveValue(
      'A cat rests on a sofa.',
    );
    expect(screen.getByRole('status')).toHaveTextContent('Custom alt');
    expect(
      screen.getByRole('button', { name: 'Regenerate with AI (Alt text)' }),
    ).toHaveFocus();
  });

  it('moves focus to Retry after failure and to Cancel when retrying', async () => {
    const retryRequest = createControllableRequest();
    mockPost
      .mockRejectedValueOnce(new Error('network error'))
      .mockReturnValueOnce(retryRequest.promise);
    renderControlledWidget();

    await act(async () => {
      fireEvent.click(
        screen.getByRole('button', { name: 'Generate with AI (Alt text)' }),
      );
    });

    const retryButton = await screen.findByRole('button', {
      name: 'Retry AI alt generation (Alt text)',
    });
    expect(retryButton).toHaveFocus();

    fireEvent.click(retryButton);
    expect(
      screen.getByRole('button', {
        name: 'Cancel AI alt generation (Alt text)',
      }),
    ).toHaveFocus();

    await act(async () => retryRequest.resolve({ alt: '   ' }));
    expect(
      screen.getByRole('button', {
        name: 'Retry AI alt generation (Alt text)',
      }),
    ).toHaveFocus();
  });

  it('renders an inline empty-result error with Retry without overwriting alt', async () => {
    mockPost
      .mockResolvedValueOnce({ alt: '   ' })
      .mockResolvedValueOnce({ alt: 'A cat rests on a sofa.' });
    const { onChange } = renderWidget();

    await act(async () => {
      fireEvent.click(screen.getByText('Generate with AI'));
    });

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(
      'The AI service returned no valid alt text.',
    );
    expect(onChange).not.toHaveBeenCalled();

    const retryBtn = within(alert).getByRole('button', {
      name: 'Retry AI alt generation (Alt text)',
    });
    await act(async () => {
      fireEvent.click(retryBtn);
    });

    expect(mockPost).toHaveBeenCalledTimes(2);
    expect(onChange).toHaveBeenCalledWith('alt', 'A cat rests on a sofa.');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('normalizes generated text equal to the title back to Image-title mode', async () => {
    mockPost.mockResolvedValueOnce({ alt: '  Cat   on a sofa  ' });
    const { onChange } = renderWidget();

    await act(async () => {
      fireEvent.click(screen.getByText('Generate with AI'));
    });

    await waitFor(() =>
      expect(onChange).toHaveBeenCalledWith('alt_source', 'image-metadata'),
    );
    expect(onChange).toHaveBeenCalledWith('alt', '');
  });

  it('shows initial generation progress inline with Cancel and disables the alt field without opening a modal', async () => {
    const req = createControllableRequest();
    mockPost.mockReturnValueOnce(req.promise);
    renderWidget();

    fireEvent.click(screen.getByText('Generate with AI'));

    expect(screen.getByLabelText('Alt text')).toBeDisabled();
    expect(screen.getByRole('status')).toHaveTextContent('Generating AI alt…');
    const cancelBtn = screen.getByRole('button', {
      name: 'Cancel AI alt generation (Alt text)',
    });
    expect(cancelBtn).toBeInTheDocument();
    expect(cancelBtn).not.toBeDisabled();
    expect(
      document.querySelector('.image-ai-alt-confirm-modal'),
    ).not.toBeInTheDocument();

    await act(async () => req.resolve({ alt: 'A cat rests on a sofa.' }));
    expect(
      screen.getByRole('button', {
        name: 'Generate with AI (Alt text)',
      }),
    ).toBeEnabled();
    expect(screen.getByLabelText('Alt text')).toBeEnabled();
    expect(
      screen.queryByRole('button', {
        name: 'Cancel AI alt generation (Alt text)',
      }),
    ).not.toBeInTheDocument();
  });

  it('closes the confirmation modal immediately on confirm and runs inline progress with Cancel', async () => {
    const req = createControllableRequest();
    mockPost.mockReturnValueOnce(req.promise);
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

    fireEvent.click(
      screen.getByRole('button', { name: 'Regenerate with AI (Alt text)' }),
    );
    expect(screen.getByText('Regenerate AI alt?')).toBeVisible();

    const modal = document.querySelector('.image-ai-alt-confirm-modal');
    fireEvent.click(
      within(modal).getByRole('button', { name: 'Regenerate with AI' }),
    );

    expect(
      document.querySelector('.image-ai-alt-confirm-modal'),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Generating AI alt…');
    const cancelBtn = screen.getByRole('button', {
      name: 'Cancel AI alt generation (Alt text)',
    });
    expect(cancelBtn).toBeInTheDocument();
    expect(cancelBtn).toHaveFocus();

    await act(async () => req.resolve({ alt: 'A cat rests on a sofa.' }));
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Regenerate with AI (Alt text)' }),
      ).toBeEnabled(),
    );
  });

  it('asks before overwriting custom alt, preserves it on error, and maps error codes to inline messages with Retry', async () => {
    mockPost
      .mockRejectedValueOnce({
        response: {
          body: { error: { code: 'generation_failed', message: 'Localized' } },
        },
      })
      .mockRejectedValueOnce({
        response: {
          body: { error: { code: 'unsupported_media_type' } },
        },
      })
      .mockRejectedValueOnce({
        response: {
          body: { error: { code: 'image_too_large' } },
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

    fireEvent.click(
      screen.getByRole('button', { name: 'Regenerate with AI (Alt text)' }),
    );
    expect(screen.getByText('Regenerate AI alt?')).toBeInTheDocument();
    expect(mockPost).not.toHaveBeenCalled();

    const modal = document.querySelector('.image-ai-alt-confirm-modal');
    await act(async () =>
      fireEvent.click(
        within(modal).getByRole('button', { name: 'Regenerate with AI' }),
      ),
    );

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('AI alt generation failed.');
    expect(
      document.querySelector('.image-ai-alt-confirm-modal'),
    ).not.toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();

    await act(async () =>
      fireEvent.click(
        within(alert).getByRole('button', {
          name: 'Retry AI alt generation (Alt text)',
        }),
      ),
    );
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'AI alt generation is unavailable for this image format.',
    );

    await act(async () =>
      fireEvent.click(
        screen.getByRole('button', {
          name: 'Retry AI alt generation (Alt text)',
        }),
      ),
    );
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'The image is too large for AI alt generation.',
    );
  });

  it('clears stale error feedback when the user edits alt text after failure and requires confirmation before overwriting new custom alt', async () => {
    mockPost.mockRejectedValueOnce(new Error('network error'));
    const { onChange, rerender, store } = renderWidget();

    await act(async () => {
      fireEvent.click(screen.getByText('Generate with AI'));
    });
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'AI alt generation failed.',
    );

    fireEvent.change(screen.getByLabelText('Alt text'), {
      target: { value: 'Updated custom alt' },
    });
    expect(onChange).toHaveBeenCalledWith('alt', 'Updated custom alt');
    expect(onChange).toHaveBeenCalledWith('alt_source', 'custom');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    rerender(
      <Provider store={store}>
        <IntlProvider locale="en" messages={{}}>
          <ImageAltWidget
            id="alt"
            title="Alt text"
            fieldSet="default"
            value="Updated custom alt"
            formData={{
              url: '/eea/en/two.jpeg',
              image_title: 'Cat on a sofa',
              alt_source: 'custom',
              alt: 'Updated custom alt',
            }}
            onChange={onChange}
            block="b1"
          />
        </IntlProvider>
      </Provider>,
    );

    fireEvent.click(
      screen.getByRole('button', { name: 'Regenerate with AI (Alt text)' }),
    );
    expect(screen.getByText('Regenerate AI alt?')).toBeInTheDocument();
    expect(mockPost).toHaveBeenCalledTimes(1);
  });

  it('aborts in-flight generation on Cancel, restores focus to trigger button, and ignores late success or failure', async () => {
    let abortRejects = false;
    const req1 = createControllableRequest();
    req1.abort.mockImplementation(() => {
      if (abortRejects) {
        req1.reject(new Error('aborted synchronously'));
      }
    });
    mockPost.mockReturnValueOnce(req1.promise);
    const { onChange } = renderWidget();

    fireEvent.click(screen.getByText('Generate with AI'));
    const cancelBtn = screen.getByRole('button', {
      name: 'Cancel AI alt generation (Alt text)',
    });
    fireEvent.click(cancelBtn);

    expect(req1.abort).toHaveBeenCalledTimes(1);
    const triggerBtn = screen.getByRole('button', {
      name: 'Generate with AI (Alt text)',
    });
    expect(triggerBtn).toBeEnabled();
    expect(triggerBtn).toHaveFocus();

    await act(async () => {
      req1.resolve({ alt: 'Late cancelled alt' });
    });
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    abortRejects = true;
    const req2 = createControllableRequest();
    req2.abort.mockImplementation(() => {
      req2.reject(new Error('aborted synchronously'));
    });
    mockPost.mockReturnValueOnce(req2.promise);

    fireEvent.click(triggerBtn);
    await act(async () => {
      fireEvent.click(
        screen.getByRole('button', {
          name: 'Cancel AI alt generation (Alt text)',
        }),
      );
    });
    expect(req2.abort).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('restores focus to the trigger button when the overwrite confirmation modal is cancelled', () => {
    renderWidget({
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

    const triggerBtn = screen.getByRole('button', {
      name: 'Regenerate with AI (Alt text)',
    });
    fireEvent.click(triggerBtn);
    const modal = document.querySelector('.image-ai-alt-confirm-modal');
    fireEvent.click(within(modal).getByRole('button', { name: 'Cancel' }));

    expect(
      document.querySelector('.image-ai-alt-confirm-modal'),
    ).not.toBeInTheDocument();
    expect(triggerBtn).toHaveFocus();
  });

  it('uses the Image title action and empty textarea normalization without storing a duplicate', () => {
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

    fireEvent.click(screen.getByRole('button', { name: 'Use Image metadata' }));
    expect(onChange).toHaveBeenCalledWith('alt', '');
    expect(onChange).toHaveBeenCalledWith('alt_source', 'image-metadata');

    onChange.mockClear();
    fireEvent.change(screen.getByLabelText('Alt text'), {
      target: { value: '' },
    });
    expect(onChange).toHaveBeenCalledWith('alt', '');
    expect(onChange).toHaveBeenCalledWith('alt_source', 'image-metadata');
  });

  it.each([
    null,
    {
      enabled: true,
      features: { image: { enabled: true, allowed_content_types: ['Chart'] } },
    },
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

      expect(screen.getByLabelText('Alt text')).toBeEnabled();
      expect(
        screen.queryByRole('button', { name: /regenerate with ai/i }),
      ).not.toBeInTheDocument();
      fireEvent.change(screen.getByLabelText('Alt text'), {
        target: { value: 'Manual alt' },
      });
      expect(onChange).toHaveBeenCalledWith('alt', 'Manual alt');
      fireEvent.click(
        screen.getByRole('button', { name: 'Use Image metadata' }),
      );
      expect(onChange).toHaveBeenCalledWith('alt_source', 'image-metadata');
      expect(mockPost).not.toHaveBeenCalled();
    },
  );

  it('discards a stale response and aborts when the linked image or raw URL changes', async () => {
    const req1 = createControllableRequest();
    const req2 = createControllableRequest();
    mockPost
      .mockReturnValueOnce(req1.promise)
      .mockReturnValueOnce(req2.promise);
    const onChange = jest.fn();
    const element = (store) => (
      <Provider store={store}>
        <IntlProvider locale="en" messages={{}}>
          <ImageAltWidget
            id="alt"
            title="Alt text"
            fieldSet="default"
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
            url: 'http://backend:8080/Plone/eea/en/two.jpeg',
            image_title: 'Two',
            alt_source: 'image-metadata',
          },
        }),
      ),
    );

    fireEvent.click(screen.getByText('Generate with AI'));
    // Change raw URL while keeping the same flattened path
    utils.rerender(
      element(
        makeStore({
          b1: {
            url: '/eea/en/two.jpeg',
            image_title: 'Two',
            alt_source: 'image-metadata',
          },
        }),
      ),
    );

    expect(req1.abort).toHaveBeenCalledTimes(1);
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Generate with AI (Alt text)' }),
      ).toBeEnabled(),
    );
    await act(async () => req1.resolve({ alt: 'Stale from raw URL' }));
    expect(onChange).not.toHaveBeenCalled();

    // Start replacement request, then change image target and verify late failure is ignored without stealing focus
    const externalInput = document.createElement('input');
    document.body.appendChild(externalInput);
    fireEvent.click(screen.getByText('Generate with AI'));
    externalInput.focus();
    expect(externalInput).toHaveFocus();

    utils.rerender(
      element(
        makeStore({
          b1: {
            url: '/eea/en/three.jpeg',
            image_title: 'Three',
            alt_source: 'image-metadata',
          },
        }),
      ),
    );

    expect(req2.abort).toHaveBeenCalledTimes(1);
    expect(externalInput).toHaveFocus();
    await act(async () => req2.reject(new Error('Stale error')));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
    document.body.removeChild(externalInput);
  });

  it('aborts and ignores pending AI responses after manual external form updates, block/id/policy changes, or unmount', async () => {
    const req1 = createControllableRequest();
    const req2 = createControllableRequest();
    const req3 = createControllableRequest();
    const req4 = createControllableRequest();
    const req5 = createControllableRequest();
    mockPost
      .mockReturnValueOnce(req1.promise)
      .mockReturnValueOnce(req2.promise)
      .mockReturnValueOnce(req3.promise)
      .mockReturnValueOnce(req4.promise)
      .mockReturnValueOnce(req5.promise);
    const onChange = jest.fn();

    const renderWithProps = (
      overrideProps = {},
      settings = enabledSettings,
    ) => (
      <Provider store={makeStore(defaultBlocksData(), settings)}>
        <IntlProvider locale="en" messages={{}}>
          <ImageAltWidget
            id="alt"
            title="Alt text"
            fieldSet="default"
            value=""
            onChange={onChange}
            block="b1"
            {...overrideProps}
          />
        </IntlProvider>
      </Provider>
    );

    const utils = render(renderWithProps());

    // 1. External form value update while generating
    fireEvent.click(screen.getByText('Generate with AI'));
    utils.rerender(
      renderWithProps({
        value: 'Externally updated alt',
        formData: {
          url: '/eea/en/two.jpeg',
          image_title: 'Cat on a sofa',
          alt_source: 'custom',
          alt: 'Externally updated alt',
        },
      }),
    );
    expect(req1.abort).toHaveBeenCalledTimes(1);
    await act(async () => req1.resolve({ alt: 'Should be ignored' }));
    expect(onChange).not.toHaveBeenCalled();

    // 2. Block ID change while generating (and old request finally does not clear replacement)
    utils.rerender(renderWithProps());
    fireEvent.click(screen.getByText('Generate with AI'));
    utils.rerender(
      renderWithProps({
        block: 'b2',
        formData: {
          url: '/eea/en/two.jpeg',
          image_title: 'Cat on a sofa',
          alt_source: 'image-metadata',
        },
      }),
    );
    expect(req2.abort).toHaveBeenCalledTimes(1);

    // Start req3 on b2 before req2 settles
    fireEvent.click(screen.getByText('Generate with AI'));
    await act(async () => req2.resolve({ alt: 'Stale block b1 response' }));
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole('status')).toHaveTextContent('Generating AI alt…');

    // 3. Field id change while generating aborts req3
    utils.rerender(
      renderWithProps({
        id: 'custom_alt',
        block: 'b2',
        formData: {
          url: '/eea/en/two.jpeg',
          image_title: 'Cat on a sofa',
          alt_source: 'image-metadata',
        },
      }),
    );
    expect(req3.abort).toHaveBeenCalledTimes(1);
    await act(async () => req3.resolve({ alt: 'Stale field id response' }));
    expect(onChange).not.toHaveBeenCalled();

    // 4. Policy disabled while generating aborts req4 and ignores late failure
    fireEvent.click(screen.getByText('Generate with AI'));
    utils.rerender(
      renderWithProps(
        {
          id: 'custom_alt',
          block: 'b2',
          formData: {
            url: '/eea/en/two.jpeg',
            image_title: 'Cat on a sofa',
            alt_source: 'image-metadata',
          },
        },
        { enabled: false, features: { image: { enabled: false } } },
      ),
    );
    expect(req4.abort).toHaveBeenCalledTimes(1);
    await act(async () => req4.reject(new Error('Stale policy error')));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    // 5. Re-enable and verify unmount aborts req5
    utils.rerender(
      renderWithProps({
        id: 'custom_alt',
        block: 'b2',
        formData: {
          url: '/eea/en/two.jpeg',
          image_title: 'Cat on a sofa',
          alt_source: 'image-metadata',
        },
      }),
    );
    fireEvent.click(screen.getByText('Generate with AI'));
    utils.unmount();
    expect(req5.abort).toHaveBeenCalledTimes(1);
  });

  it.each(['isDisabled', 'disabled'])(
    'honors %s prop for input, generate, reset, retry, and aborts active generation when toggled on',
    async (disabledProp) => {
      const req = createControllableRequest();
      mockPost.mockReturnValueOnce(req.promise);
      const onChange = jest.fn();
      const formData = {
        url: '/eea/en/two.jpeg',
        image_title: 'Cat on a sofa',
        alt_source: 'custom',
        alt: 'Custom alt',
      };

      const renderDisabled = (isOff) => (
        <Provider store={makeStore(defaultBlocksData(), enabledSettings)}>
          <IntlProvider locale="en" messages={{}}>
            <ImageAltWidget
              id="alt"
              title="Alt text"
              fieldSet="default"
              value="Custom alt"
              formData={formData}
              onChange={onChange}
              block="b1"
              {...{ [disabledProp]: isOff }}
            />
          </IntlProvider>
        </Provider>
      );

      const utils = render(renderDisabled(true));
      expect(screen.getByLabelText('Alt text')).toBeDisabled();
      expect(
        screen.getByRole('button', { name: 'Regenerate with AI (Alt text)' }),
      ).toBeDisabled();
      expect(
        screen.getByRole('button', { name: 'Use Image metadata' }),
      ).toBeDisabled();

      // Enable, start generation, then toggle disabled prop on while in flight
      utils.rerender(renderDisabled(false));
      fireEvent.click(
        screen.getByRole('button', { name: 'Regenerate with AI (Alt text)' }),
      );
      const modal = document.querySelector('.image-ai-alt-confirm-modal');
      fireEvent.click(
        within(modal).getByRole('button', { name: 'Regenerate with AI' }),
      );
      expect(screen.getByRole('status')).toHaveTextContent(
        'Generating AI alt…',
      );

      utils.rerender(renderDisabled(true));
      expect(req.abort).toHaveBeenCalledTimes(1);
      expect(
        document.querySelector('.image-ai-alt-confirm-modal'),
      ).not.toBeInTheDocument();

      await act(async () => req.resolve({ alt: 'Should not apply' }));
      expect(onChange).not.toHaveBeenCalled();
      utils.unmount();
    },
  );

  describe('GenAI length settings (controlpanel gear)', () => {
    it('shows a GenAI settings gear inside the alt actions row', () => {
      renderWidget();
      const gear = screen.getByRole('button', { name: 'GenAI settings' });
      expect(gear).toBeInTheDocument();
      expect(gear.closest('.image-alt-actions')).not.toBeNull();
    });

    it('does not show the gear when AI is disabled or the image is external', () => {
      const { unmount } = renderWidget({
        genAISettings: { enabled: false },
      });
      expect(
        screen.queryByRole('button', { name: 'GenAI settings' }),
      ).not.toBeInTheDocument();
      unmount();

      renderWidget({
        blocksData: {
          b1: {
            url: 'https://external.example.com/photo.jpg',
            image_title: 'External photo',
            alt_source: 'image-metadata',
            alt: '',
          },
        },
      });
      expect(
        screen.queryByRole('button', { name: 'GenAI settings' }),
      ).not.toBeInTheDocument();
    });

    it('fetches a fresh controlpanel payload on every gear click (no caching)', async () => {
      mockGet.mockResolvedValue(genaiControlpanel);
      renderWidget();
      const gear = screen.getByRole('button', { name: 'GenAI settings' });

      await act(async () => {
        fireEvent.click(gear);
      });
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(mockGet).toHaveBeenCalledWith('@controlpanels/genai');

      fireEvent.click(
        within(screen.getByRole('dialog')).getByRole('button', {
          name: 'Cancel',
        }),
      );
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

      await act(async () => {
        fireEvent.click(gear);
      });
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(mockGet).toHaveBeenCalledTimes(2);
    });

    it('disables the gear while the controlpanel fetch is pending', async () => {
      let resolveGet;
      mockGet.mockReturnValue(
        new Promise((resolve) => {
          resolveGet = resolve;
        }),
      );
      renderWidget();
      const gear = screen.getByRole('button', { name: 'GenAI settings' });

      act(() => {
        fireEvent.click(gear);
      });
      expect(gear).toBeDisabled();
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

      await act(async () => {
        resolveGet(genaiControlpanel);
      });
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(gear).toBeEnabled();
    });

    it('shows only the two length fields prefilled from the controlpanel data', async () => {
      mockGet.mockResolvedValue(genaiControlpanel);
      renderWidget();

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'GenAI settings' }));
      });

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveTextContent('GenAI image length settings');
      expect(
        within(dialog).getByLabelText('Maximum Image title/alt length'),
      ).toHaveValue(64);
      expect(
        within(dialog).getByLabelText('Maximum Image description length'),
      ).toHaveValue(500);
      expect(
        within(dialog).queryByText('Enable summaries'),
      ).not.toBeInTheDocument();
      expect(
        within(dialog).queryByText('Enable Image AI features'),
      ).not.toBeInTheDocument();
      expect(
        within(dialog).queryByLabelText('Allowed content types'),
      ).not.toBeInTheDocument();
    });

    it('saves with a PATCH containing only the two length fields', async () => {
      mockGet.mockResolvedValue(genaiControlpanel);
      mockPatch.mockResolvedValue(undefined);
      renderWidget();

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'GenAI settings' }));
      });
      const dialog = screen.getByRole('dialog');
      fireEvent.change(
        within(dialog).getByLabelText('Maximum Image title/alt length'),
        {
          target: { value: '40' },
        },
      );

      await act(async () => {
        fireEvent.click(within(dialog).getByRole('button', { name: 'Save' }));
      });

      expect(mockPatch).toHaveBeenCalledTimes(1);
      expect(mockPatch).toHaveBeenCalledWith('@controlpanels/genai', {
        data: {
          image_title_alt_max_length: 40,
          image_description_max_length: 500,
        },
      });
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(
        toastTitles(mockToast.success).some((title) =>
          /GenAI settings updated/i.test(title),
        ),
      ).toBe(true);
    });

    it('disables Save when a length is empty or below the minimum of 1', async () => {
      mockGet.mockResolvedValue(genaiControlpanel);
      renderWidget();

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'GenAI settings' }));
      });
      const dialog = screen.getByRole('dialog');
      const titleInput = within(dialog).getByLabelText(
        'Maximum Image title/alt length',
      );
      expect(
        within(dialog).getByRole('button', { name: 'Save' }),
      ).toBeEnabled();

      fireEvent.change(titleInput, { target: { value: '0' } });
      expect(
        within(dialog).getByRole('button', { name: 'Save' }),
      ).toBeDisabled();

      fireEvent.change(titleInput, { target: { value: '' } });
      expect(
        within(dialog).getByRole('button', { name: 'Save' }),
      ).toBeDisabled();
      expect(mockPatch).not.toHaveBeenCalled();
    });

    it('disables the gear and shows an error toast when the controlpanel is not accessible (403)', async () => {
      mockGet.mockRejectedValue(
        Object.assign(new Error('Forbidden'), { status: 403 }),
      );
      renderWidget();
      const gear = screen.getByRole('button', { name: 'GenAI settings' });

      await act(async () => {
        fireEvent.click(gear);
      });

      expect(mockToast.error).toHaveBeenCalledTimes(1);
      expect(
        toastTitles(mockToast.error).some((title) =>
          /GenAI settings are not available/i.test(title),
        ),
      ).toBe(true);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(gear).toBeDisabled();

      fireEvent.click(gear);
      expect(mockGet).toHaveBeenCalledTimes(1);
    });

    it('keeps the gear enabled after a non-permission fetch failure (500)', async () => {
      mockGet.mockRejectedValue(
        Object.assign(new Error('Server Error'), { status: 500 }),
      );
      renderWidget();
      const gear = screen.getByRole('button', { name: 'GenAI settings' });

      await act(async () => {
        fireEvent.click(gear);
      });

      expect(mockToast.error).toHaveBeenCalledTimes(1);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(gear).toBeEnabled();
    });

    it('keeps the modal open and shows an error toast when the PATCH is rejected (403)', async () => {
      mockGet.mockResolvedValue(genaiControlpanel);
      mockPatch.mockRejectedValue(
        Object.assign(new Error('Forbidden'), { status: 403 }),
      );
      renderWidget();

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'GenAI settings' }));
      });
      const dialog = screen.getByRole('dialog');
      fireEvent.change(
        within(dialog).getByLabelText('Maximum Image title/alt length'),
        {
          target: { value: '40' },
        },
      );

      await act(async () => {
        fireEvent.click(within(dialog).getByRole('button', { name: 'Save' }));
      });

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(
        within(screen.getByRole('dialog')).getByLabelText(
          'Maximum Image title/alt length',
        ),
      ).toHaveValue(40);
      expect(mockToast.error).toHaveBeenCalledTimes(1);
    });
  });
});
