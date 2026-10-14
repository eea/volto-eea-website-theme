import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { IntlProvider } from 'react-intl';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import '@testing-library/jest-dom';

import ImageAddFileWidget from './ImageAddFileWidget';

const mockPost = jest.fn();
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

jest.mock('@plone/volto/components/manage/Widgets/FileWidget', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: (props) =>
      React.createElement(
        'div',
        null,
        React.createElement(
          'button',
          {
            type: 'button',
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
  features: { image: { enabled: true } },
};

const makeStore = (formData = {}, genAISettings = enabledSettings) => {
  const state = {
    intl: { locale: 'fr' },
    form: { global: formData },
    reduxAsyncConnect: { genAISettings },
  };
  return {
    getState: () => state,
    subscribe: () => () => {},
    dispatch: () => {},
  };
};

const renderWidget = ({
  route = '/folder/add?type=Image',
  value = null,
  formData = {},
  genAISettings = enabledSettings,
} = {}) => {
  const onChange = jest.fn();
  render(
    <Provider store={makeStore(formData, genAISettings)}>
      <IntlProvider locale="en" messages={{}}>
        <MemoryRouter initialEntries={[route]}>
          <ImageAddFileWidget
            id="image"
            title="Image"
            value={value}
            formData={formData}
            onChange={onChange}
          />
        </MemoryRouter>
      </IntlProvider>
    </Provider>,
  );
  return { onChange };
};

describe('ImageAddFileWidget', () => {
  beforeEach(() => jest.clearAllMocks());

  it.each([
    null,
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
      data: { image: PNG, language: 'fr' },
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
    renderWidget();
    fireEvent.click(screen.getByText('Choose PNG'));
    await act(async () =>
      fireEvent.click(screen.getByText('Generate with AI')),
    );

    expect(await screen.findByText('Retry')).toBeVisible();
    expect(screen.getByText('Upload without AI')).toBeVisible();
    expect(screen.getByText('Cancel')).toBeVisible();
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

    fireEvent.click(screen.getByText('Generate metadata with AI'));
    expect(screen.getByText('Replace Image metadata?')).toBeVisible();
    expect(mockPost).not.toHaveBeenCalled();

    const generateButtons = screen.getAllByText('Generate metadata with AI');
    await act(async () =>
      fireEvent.click(generateButtons[generateButtons.length - 1]),
    );
    await waitFor(() => expect(mockPost).toHaveBeenCalled());
  });

  it('delegates unchanged outside Add Image', () => {
    const { onChange } = renderWidget({ route: '/folder/edit', value: PNG });
    fireEvent.click(screen.getByText('Choose SVG'));

    expect(onChange).toHaveBeenCalledWith('image', SVG);
    expect(
      screen.queryByText('Generate Image metadata with AI?'),
    ).not.toBeInTheDocument();
  });
});
