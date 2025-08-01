import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import LayoutSettingsEdit from './LayoutSettingsEdit';
import { EditSchema } from './schema';

// Add jest-dom matchers
import '@testing-library/jest-dom';

// Mock dependencies
jest.mock('./schema', () => ({
  EditSchema: jest.fn(),
}));

jest.mock('@plone/volto/components', () => ({
  BlockDataForm: jest.fn(({ title, schema, formData, onChangeField }) => (
    <div data-testid="block-data-form">
      <div data-testid="form-title">{title}</div>
      <div data-testid="form-schema">{JSON.stringify(schema)}</div>
      <div data-testid="form-data">{JSON.stringify(formData)}</div>
      <button
        data-testid="change-field-button"
        onClick={() => onChangeField('test-field', 'test-value')}
      >
        Change Field
      </button>
    </div>
  )),
  SidebarPortal: jest.fn(({ selected, children }) => (
    <div data-testid="sidebar-portal" data-selected={selected}>
      {children}
    </div>
  )),
}));

jest.mock('./LayoutSettingsView', () =>
  jest.fn((props) => (
    <div data-testid="layout-settings-view" data-props={JSON.stringify(props)}>
      Layout Settings View
    </div>
  )),
);

const { BlockDataForm, SidebarPortal } = require('@plone/volto/components');
const LayoutSettingsView = require('./LayoutSettingsView').default;

describe('LayoutSettingsEdit', () => {
  const mockSchema = {
    title: 'Page layout settings',
    fieldsets: [
      {
        id: 'default',
        title: 'Default',
        fields: ['layout_size', 'body_class'],
      },
    ],
    properties: {
      layout_size: {
        widget: 'style_align',
        title: 'Layout size',
      },
      body_class: {
        title: 'Body class',
        widget: 'creatable_select',
      },
    },
  };

  const defaultProps = {
    selected: true,
    block: 'block-id',
    data: {
      layout_size: 'container_view',
      body_class: 'homepage',
    },
    onChangeBlock: jest.fn(),
  };

  beforeEach(() => {
    EditSchema.mockReturnValue(mockSchema);
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<LayoutSettingsEdit {...defaultProps} />);
    expect(container).toBeTruthy();
  });

  it('renders the page title', () => {
    render(<LayoutSettingsEdit {...defaultProps} />);
    expect(screen.getByText('Page layout settings')).toBeInTheDocument();
  });

  it('renders LayoutSettingsView with correct props', () => {
    render(<LayoutSettingsEdit {...defaultProps} />);

    expect(LayoutSettingsView).toHaveBeenCalledWith(defaultProps, {});
    expect(screen.getByTestId('layout-settings-view')).toBeInTheDocument();
  });

  it('renders SidebarPortal with correct selected prop', () => {
    render(<LayoutSettingsEdit {...defaultProps} />);

    expect(SidebarPortal).toHaveBeenCalledWith(
      expect.objectContaining({
        selected: true,
      }),
      {},
    );
    expect(screen.getByTestId('sidebar-portal')).toHaveAttribute(
      'data-selected',
      'true',
    );
  });

  it('renders SidebarPortal with selected false', () => {
    const props = { ...defaultProps, selected: false };
    render(<LayoutSettingsEdit {...props} />);

    expect(SidebarPortal).toHaveBeenCalledWith(
      expect.objectContaining({
        selected: false,
      }),
      {},
    );
    expect(screen.getByTestId('sidebar-portal')).toHaveAttribute(
      'data-selected',
      'false',
    );
  });

  it('renders BlockDataForm when selected is true', () => {
    render(<LayoutSettingsEdit {...defaultProps} />);

    expect(BlockDataForm).toHaveBeenCalledWith(
      expect.objectContaining({
        title: mockSchema.title,
        schema: mockSchema,
        formData: defaultProps.data,
        onChangeField: expect.any(Function),
      }),
      {},
    );
    expect(screen.getByTestId('block-data-form')).toBeInTheDocument();
  });

  it('does not render BlockDataForm when selected is false', () => {
    const props = { ...defaultProps, selected: false };
    render(<LayoutSettingsEdit {...props} />);

    expect(BlockDataForm).not.toHaveBeenCalled();
    expect(screen.queryByTestId('block-data-form')).not.toBeInTheDocument();
  });

  it('calls EditSchema to get schema', () => {
    render(<LayoutSettingsEdit {...defaultProps} />);

    expect(EditSchema).toHaveBeenCalled();
  });

  it('passes correct title to BlockDataForm', () => {
    render(<LayoutSettingsEdit {...defaultProps} />);

    expect(screen.getByTestId('form-title')).toHaveTextContent(
      'Page layout settings',
    );
  });

  it('passes correct schema to BlockDataForm', () => {
    render(<LayoutSettingsEdit {...defaultProps} />);

    expect(screen.getByTestId('form-schema')).toHaveTextContent(
      JSON.stringify(mockSchema),
    );
  });

  it('passes correct formData to BlockDataForm', () => {
    render(<LayoutSettingsEdit {...defaultProps} />);

    expect(screen.getByTestId('form-data')).toHaveTextContent(
      JSON.stringify(defaultProps.data),
    );
  });

  it('handles onChangeField correctly', () => {
    render(<LayoutSettingsEdit {...defaultProps} />);

    const changeButton = screen.getByTestId('change-field-button');
    fireEvent.click(changeButton);

    expect(defaultProps.onChangeBlock).toHaveBeenCalledWith('block-id', {
      ...defaultProps.data,
      'test-field': 'test-value',
    });
  });

  it('preserves existing data when changing field', () => {
    const propsWithData = {
      ...defaultProps,
      data: {
        layout_size: 'wide_view',
        body_class: 'homepage-inverse',
        existing_field: 'existing_value',
      },
    };

    render(<LayoutSettingsEdit {...propsWithData} />);

    const changeButton = screen.getByTestId('change-field-button');
    fireEvent.click(changeButton);

    expect(defaultProps.onChangeBlock).toHaveBeenCalledWith('block-id', {
      layout_size: 'wide_view',
      body_class: 'homepage-inverse',
      existing_field: 'existing_value',
      'test-field': 'test-value',
    });
  });

  it('handles empty data object', () => {
    const propsWithEmptyData = {
      ...defaultProps,
      data: {},
    };

    render(<LayoutSettingsEdit {...propsWithEmptyData} />);

    const changeButton = screen.getByTestId('change-field-button');
    fireEvent.click(changeButton);

    expect(defaultProps.onChangeBlock).toHaveBeenCalledWith('block-id', {
      'test-field': 'test-value',
    });
  });

  it('handles null data', () => {
    const propsWithNullData = {
      ...defaultProps,
      data: null,
    };

    render(<LayoutSettingsEdit {...propsWithNullData} />);

    const changeButton = screen.getByTestId('change-field-button');
    fireEvent.click(changeButton);

    expect(defaultProps.onChangeBlock).toHaveBeenCalledWith('block-id', {
      'test-field': 'test-value',
    });
  });

  it('handles undefined data', () => {
    const propsWithUndefinedData = {
      ...defaultProps,
      data: undefined,
    };

    render(<LayoutSettingsEdit {...propsWithUndefinedData} />);

    const changeButton = screen.getByTestId('change-field-button');
    fireEvent.click(changeButton);

    expect(defaultProps.onChangeBlock).toHaveBeenCalledWith('block-id', {
      'test-field': 'test-value',
    });
  });

  it('works with different block IDs', () => {
    const propsWithDifferentBlock = {
      ...defaultProps,
      block: 'different-block-id',
    };

    render(<LayoutSettingsEdit {...propsWithDifferentBlock} />);

    const changeButton = screen.getByTestId('change-field-button');
    fireEvent.click(changeButton);

    expect(defaultProps.onChangeBlock).toHaveBeenCalledWith(
      'different-block-id',
      {
        ...defaultProps.data,
        'test-field': 'test-value',
      },
    );
  });

  it('handles different schema configurations', () => {
    const customSchema = {
      title: 'Custom Layout Settings',
      fieldsets: [
        {
          id: 'advanced',
          title: 'Advanced',
          fields: ['custom_field'],
        },
      ],
      properties: {
        custom_field: {
          title: 'Custom Field',
          widget: 'text',
        },
      },
    };

    EditSchema.mockReturnValue(customSchema);

    render(<LayoutSettingsEdit {...defaultProps} />);

    expect(screen.getByTestId('form-title')).toHaveTextContent(
      'Custom Layout Settings',
    );
    expect(screen.getByTestId('form-schema')).toHaveTextContent(
      JSON.stringify(customSchema),
    );
  });

  it('passes all props to LayoutSettingsView', () => {
    const customProps = {
      ...defaultProps,
      customProp: 'custom-value',
      anotherProp: { nested: 'object' },
    };

    render(<LayoutSettingsEdit {...customProps} />);

    expect(LayoutSettingsView).toHaveBeenCalledWith(customProps, {});
  });

  it('renders all components in correct structure', () => {
    const { container } = render(<LayoutSettingsEdit {...defaultProps} />);

    // Check that h3 is rendered
    expect(container.querySelector('h3')).toHaveTextContent(
      'Page layout settings',
    );

    // Check that LayoutSettingsView is rendered
    expect(screen.getByTestId('layout-settings-view')).toBeInTheDocument();

    // Check that SidebarPortal is rendered
    expect(screen.getByTestId('sidebar-portal')).toBeInTheDocument();

    // Check that BlockDataForm is rendered inside SidebarPortal when selected
    expect(screen.getByTestId('block-data-form')).toBeInTheDocument();
  });

  it('handles re-renders correctly', () => {
    const { rerender } = render(<LayoutSettingsEdit {...defaultProps} />);

    expect(EditSchema).toHaveBeenCalledTimes(1);

    // Re-render with different props
    const newProps = { ...defaultProps, selected: false };
    rerender(<LayoutSettingsEdit {...newProps} />);

    expect(EditSchema).toHaveBeenCalledTimes(2);
    expect(screen.queryByTestId('block-data-form')).not.toBeInTheDocument();
  });

  it('handles onChangeBlock function prop correctly', () => {
    const mockOnChangeBlock = jest.fn();
    const propsWithMockFunction = {
      ...defaultProps,
      onChangeBlock: mockOnChangeBlock,
    };

    render(<LayoutSettingsEdit {...propsWithMockFunction} />);

    const changeButton = screen.getByTestId('change-field-button');
    fireEvent.click(changeButton);

    expect(mockOnChangeBlock).toHaveBeenCalledWith('block-id', {
      ...defaultProps.data,
      'test-field': 'test-value',
    });
    expect(defaultProps.onChangeBlock).not.toHaveBeenCalled();
  });
});
