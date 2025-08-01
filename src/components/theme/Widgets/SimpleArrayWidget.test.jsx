import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-intl-redux';
import configureStore from 'redux-mock-store';
import SimpleArrayWidget from './SimpleArrayWidget';

// Add jest-dom matchers
import '@testing-library/jest-dom';

const mockStore = configureStore();

describe('SimpleArrayWidget', () => {
  let store;
  const mockOnChange = jest.fn();

  beforeEach(() => {
    store = mockStore({
      intl: {
        locale: 'en',
        messages: {
          Add: 'Add',
          Remove: 'Remove',
        },
      },
    });
    mockOnChange.mockClear();
  });

  const defaultProps = {
    id: 'test-field',
    title: 'Test Field',
    description: 'Test description',
    value: [],
    onChange: mockOnChange,
    items: {
      minimum: 1,
      maximum: 5,
    },
  };

  it('renders without crashing', () => {
    const { container } = render(
      <Provider store={store}>
        <SimpleArrayWidget {...defaultProps} />
      </Provider>,
    );
    expect(container).toBeTruthy();
  });

  it('displays the title and description', () => {
    render(
      <Provider store={store}>
        <SimpleArrayWidget {...defaultProps} />
      </Provider>,
    );

    expect(screen.getByText('Test Field')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('shows Add button when no input is shown', () => {
    render(
      <Provider store={store}>
        <SimpleArrayWidget {...defaultProps} />
      </Provider>,
    );

    expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();
  });

  it('shows input field when Add button is clicked', () => {
    render(
      <Provider store={store}>
        <SimpleArrayWidget {...defaultProps} />
      </Provider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /add/i }));

    expect(screen.getByRole('spinbutton')).toBeInTheDocument();
    expect(screen.getByTitle('Add')).toBeInTheDocument();
    expect(screen.getByTitle('Cancel')).toBeInTheDocument();
  });

  it('adds a valid number to the array', () => {
    render(
      <Provider store={store}>
        <SimpleArrayWidget {...defaultProps} />
      </Provider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /add/i }));

    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: '3' } });
    fireEvent.click(screen.getByTitle('Add'));

    expect(mockOnChange).toHaveBeenCalledWith('test-field', [3]);
  });

  it('does not add invalid numbers', () => {
    render(
      <Provider store={store}>
        <SimpleArrayWidget {...defaultProps} />
      </Provider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /add/i }));

    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: '10' } }); // Above maximum
    fireEvent.click(screen.getByTitle('Add'));

    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('adds number on Enter key press', () => {
    render(
      <Provider store={store}>
        <SimpleArrayWidget {...defaultProps} />
      </Provider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /add/i }));

    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: '2' } });
    fireEvent.keyPress(input, { key: 'Enter', code: 'Enter' });

    expect(mockOnChange).toHaveBeenCalledWith('test-field', [2]);
  });

  it('cancels input on Escape key press', async () => {
    render(
      <Provider store={store}>
        <SimpleArrayWidget {...defaultProps} />
      </Provider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /add/i }));

    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: '2' } });
    fireEvent.keyPress(input, { key: 'Escape', code: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
    });
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('cancels input when cancel button is clicked', async () => {
    render(
      <Provider store={store}>
        <SimpleArrayWidget {...defaultProps} />
      </Provider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /add/i }));

    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: '2' } });
    fireEvent.click(screen.getByTitle('Cancel'));

    await waitFor(() => {
      expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
    });
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('displays existing values as labels', () => {
    const props = {
      ...defaultProps,
      value: [1, 3, 5],
    };

    render(
      <Provider store={store}>
        <SimpleArrayWidget {...props} />
      </Provider>,
    );

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('removes value when × is clicked', () => {
    const props = {
      ...defaultProps,
      value: [1, 3, 5],
    };

    render(
      <Provider store={store}>
        <SimpleArrayWidget {...props} />
      </Provider>,
    );

    const removeButtons = screen.getAllByText('×');
    fireEvent.click(removeButtons[1]); // Remove second item (value 3)

    expect(mockOnChange).toHaveBeenCalledWith('test-field', [1, 5]);
  });

  it('passes null when removing last item', () => {
    const props = {
      ...defaultProps,
      value: [1],
    };

    render(
      <Provider store={store}>
        <SimpleArrayWidget {...props} />
      </Provider>,
    );

    const removeButton = screen.getByText('×');
    fireEvent.click(removeButton);

    expect(mockOnChange).toHaveBeenCalledWith('test-field', null);
  });

  it('handles non-array value gracefully', () => {
    const props = {
      ...defaultProps,
      value: null,
    };

    const { container } = render(
      <Provider store={store}>
        <SimpleArrayWidget {...props} />
      </Provider>,
    );

    expect(container).toBeTruthy();
    expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();
  });

  it('converts string values to numbers for display', () => {
    const props = {
      ...defaultProps,
      value: ['1', '2', '3'],
    };

    render(
      <Provider store={store}>
        <SimpleArrayWidget {...props} />
      </Provider>,
    );

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('uses default min/max values when not provided', () => {
    const props = {
      ...defaultProps,
      items: undefined,
    };

    render(
      <Provider store={store}>
        <SimpleArrayWidget {...props} />
      </Provider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /add/i }));

    const input = screen.getByRole('spinbutton');
    expect(input).toHaveAttribute('min', '1');
    expect(input).toHaveAttribute('max', '10');
    expect(input).toHaveAttribute('placeholder', '1-10');
  });

  it('uses custom min/max values when provided', () => {
    render(
      <Provider store={store}>
        <SimpleArrayWidget {...defaultProps} />
      </Provider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /add/i }));

    const input = screen.getByRole('spinbutton');
    expect(input).toHaveAttribute('min', '1');
    expect(input).toHaveAttribute('max', '5');
    expect(input).toHaveAttribute('placeholder', '1-5');
  });

  it('disables add button when input is empty', () => {
    render(
      <Provider store={store}>
        <SimpleArrayWidget {...defaultProps} />
      </Provider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /add/i }));

    const addButton = screen.getByTitle('Add');
    expect(addButton).toBeDisabled();
  });

  it('does not add empty or whitespace-only values', () => {
    render(
      <Provider store={store}>
        <SimpleArrayWidget {...defaultProps} />
      </Provider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /add/i }));

    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.click(screen.getByTitle('Add'));

    expect(mockOnChange).not.toHaveBeenCalled();
  });
});
