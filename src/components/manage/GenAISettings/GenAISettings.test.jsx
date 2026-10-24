import React from 'react';
import { IntlProvider } from 'react-intl';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

import GenAISettings from './GenAISettings';
import * as genAISettingsModule from '@eeacms/volto-eea-website-theme/helpers/genAISettings';

const mockToast = {
  info: jest.fn(),
  success: jest.fn(),
  error: jest.fn(),
};

jest.mock('react-toastify', () => ({
  __esModule: true,
  toast: {
    info: (...args) => mockToast.info(...args),
    success: (...args) => mockToast.success(...args),
    error: (...args) => mockToast.error(...args),
  },
}));

jest.mock('@plone/volto/components/manage/Toast/Toast', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: ({ title }) => React.createElement('div', null, title),
  };
});

jest.mock('@plone/volto/components/manage/Form/Field', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: ({ id, title, value, onChange, disabled }) =>
      React.createElement(
        'div',
        { 'data-testid': `field-${id}` },
        React.createElement('label', { htmlFor: id }, title),
        React.createElement('input', {
          id,
          'aria-label': title,
          value: value ?? '',
          disabled,
          onChange: (e) => onChange(id, e.target.value),
        }),
      ),
  };
});

function renderComponent(props = {}) {
  return render(
    <IntlProvider locale="en" messages={{}}>
      <GenAISettings {...props} />
    </IntlProvider>,
  );
}

describe('GenAISettings', () => {
  let requestSpy;
  let updateSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    requestSpy = jest
      .spyOn(genAISettingsModule, 'requestGenAIControlpanel')
      .mockResolvedValue({
        data: {
          image_title_alt_max_length: 40,
          image_description_max_length: 500,
        },
        schema: {
          fieldsets: [
            {
              id: 'default',
              title: 'Default',
              fields: [
                'image_title_alt_max_length',
                'image_description_max_length',
              ],
            },
          ],
          properties: {
            image_title_alt_max_length: {
              title: 'Max title length for alt text',
              type: 'integer',
              minimum: 1,
              default: 40,
            },
            image_description_max_length: {
              title: 'Max description length',
              type: 'integer',
              minimum: 1,
              default: 500,
            },
          },
          required: [],
        },
      });
    updateSpy = jest
      .spyOn(genAISettingsModule, 'updateGenAILengthSettings')
      .mockResolvedValue({});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders a gear button with accessible title and aria-label', () => {
    renderComponent();
    const button = screen.getByRole('button', { name: 'GenAI settings' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('image-ai-settings-button');
    expect(button).not.toBeDisabled();
  });

  it('applies custom className and honors isDisabled/disabled prop', () => {
    const { rerender } = render(
      <IntlProvider locale="en" messages={{}}>
        <GenAISettings isDisabled className="custom-gear-class" />
      </IntlProvider>,
    );
    let button = screen.getByRole('button', { name: 'GenAI settings' });
    expect(button).toHaveClass('custom-gear-class');
    expect(button).toBeDisabled();

    rerender(
      <IntlProvider locale="en" messages={{}}>
        <GenAISettings disabled className="custom-gear-class" />
      </IntlProvider>,
    );
    button = screen.getByRole('button', { name: 'GenAI settings' });
    expect(button).toBeDisabled();
  });

  it('fetches controlpanel settings on click, opens modal, and prefills values', async () => {
    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: 'GenAI settings' }));

    expect(requestSpy).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(
        screen.getByText('GenAI image length settings'),
      ).toBeInTheDocument();
    });

    const titleInput = screen.getByLabelText('Max title length for alt text');
    const descInput = screen.getByLabelText('Max description length');
    expect(titleInput).toHaveValue('40');
    expect(descInput).toHaveValue('500');
  });

  it('disables the gear button permanently and shows error toast on 401/403', async () => {
    requestSpy.mockRejectedValueOnce({ status: 403 });
    renderComponent();

    fireEvent.click(screen.getByRole('button', { name: 'GenAI settings' }));
    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalled();
    });

    const button = screen.getByRole('button', { name: 'GenAI settings' });
    expect(button).toBeDisabled();
    expect(
      screen.queryByText('GenAI image length settings'),
    ).not.toBeInTheDocument();
  });

  it('keeps the gear button enabled on non-permission fetch errors', async () => {
    requestSpy.mockRejectedValueOnce({ status: 500 });
    renderComponent();

    fireEvent.click(screen.getByRole('button', { name: 'GenAI settings' }));
    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalled();
    });

    const button = screen.getByRole('button', { name: 'GenAI settings' });
    expect(button).not.toBeDisabled();
  });

  it('saves updated lengths and closes modal on success', async () => {
    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: 'GenAI settings' }));
    await waitFor(() => {
      expect(
        screen.getByText('GenAI image length settings'),
      ).toBeInTheDocument();
    });

    const titleInput = screen.getByLabelText('Max title length for alt text');
    fireEvent.change(titleInput, { target: { value: '60' } });

    const saveButton = screen.getByRole('button', { name: 'Save' });
    expect(saveButton).not.toBeDisabled();
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(updateSpy).toHaveBeenCalledWith({
        image_title_alt_max_length: 60,
        image_description_max_length: 500,
      });
      expect(mockToast.success).toHaveBeenCalled();
      expect(
        screen.queryByText('GenAI image length settings'),
      ).not.toBeInTheDocument();
    });
  });

  it('disables Save when a length value is invalid (< 1 or empty)', async () => {
    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: 'GenAI settings' }));
    await waitFor(() => {
      expect(
        screen.getByText('GenAI image length settings'),
      ).toBeInTheDocument();
    });

    const titleInput = screen.getByLabelText('Max title length for alt text');
    fireEvent.change(titleInput, { target: { value: '0' } });

    const saveButton = screen.getByRole('button', { name: 'Save' });
    expect(saveButton).toBeDisabled();
  });

  it('shows error toast and keeps modal open when saving fails', async () => {
    updateSpy.mockRejectedValueOnce({ status: 500 });
    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: 'GenAI settings' }));
    await waitFor(() => {
      expect(
        screen.getByText('GenAI image length settings'),
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalled();
      expect(
        screen.getByText('GenAI image length settings'),
      ).toBeInTheDocument();
    });
  });

  it('closes modal on Cancel without saving', async () => {
    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: 'GenAI settings' }));
    await waitFor(() => {
      expect(
        screen.getByText('GenAI image length settings'),
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(updateSpy).not.toHaveBeenCalled();
    expect(
      screen.queryByText('GenAI image length settings'),
    ).not.toBeInTheDocument();
  });
});
