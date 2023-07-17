import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { Provider } from 'react-intl-redux';
import configureMockStore from 'redux-mock-store';
import Form from './Form';
import config from '@plone/volto/registry';
import { FormValidation } from '@plone/volto/helpers';
import '@testing-library/jest-dom/extend-expect';

const mockStore = configureMockStore();
let store;

jest.mock('@plone/volto/components/manage/Form/Field', () => (props) => {
  return (
    <div id={`mocked-field-${props.id}`}>
      {props.id}
      {props.description}
      <textarea
        onClick={props.onClick}
        onBlur={props.onBlur}
        onChange={(target) => props.onChange(props.id, target?.target?.value)}
      />
    </div>
  );
});

jest.mock(
  '@plone/volto/components/manage/Form/BlocksToolbar',
  () => (props) => {
    return (
      <input
        id={'blocks-toolbar'}
        onClick={(target) => {
          props.onSetSelectedBlocks(
            target.target.value ? [...target.target.value.split(',')] : [],
          );
        }}
        onChange={props.onChangeBlocks}
        onSelect={(target) => {
          props.onSelectBlock(
            target.target.id,
            target.target.isMultipleSelection,
            target.target.event,
          );
        }}
      />
    );
  },
);

jest.mock('@plone/volto/components/manage/Form/UndoToolbar', () => (props) => {
  return <div>UndoToolbar</div>;
});

jest.mock(
  '@plone/volto/components/manage/Blocks/Block/BlocksForm',
  () => (props) => {
    return <input id={'blocks-form'} onChange={props.onChangeFormData} />;
  },
);

describe('Form', () => {
  beforeEach(() => {
    store = mockStore({
      intl: {
        locale: 'en',
        messages: {},
      },
    });
  });

  it('renders "Test title" and has the correct structure without formData without crashing', () => {
    config.blocks = {
      initialBlocksFocus: {
        typeB: 'typeB',
      },
    };
    config.settings = {
      verticalFormTabs: false,
    };
    const props = {
      isFormSelected: false,
      schema: {
        fieldsets: [{ fields: [], id: 'default', title: 'Default' }],
        properties: {},
        definitions: {},
        required: [],
      },
      formData: {
        blocks: undefined,
        blocks_layout: undefined,
      },
      type: 'typeB',
      title: 'Test title',
    };

    const { container, getByText } = render(
      <Provider store={store}>
        <Form {...props} />
      </Provider>,
    );
    expect(container).toBeTruthy();
    expect(
      container.querySelector('.ui.form .invisible .ui.raised.segments'),
    ).toBeInTheDocument();
    expect(getByText('Test title')).toBeInTheDocument();
  });

  it('renders "Test title" and has the correct structure with formData without crashing with same types', () => {
    config.blocks = {
      initialBlocksFocus: {
        typeB: 'typeB',
      },
    };
    config.settings = {
      verticalFormTabs: false,
    };
    const props = {
      schema: {
        fieldsets: [{ fields: [], id: 'default', title: 'Default' }],
        properties: {},
        definitions: {},
        required: [],
      },
      formData: {
        blocks: {
          id1: {
            '@type': 'typeB',
            plaintext: 'Block A',
            override_toc: false,
          },
        },
        blocks_layout: {
          items: ['id1'],
        },
      },
      type: 'typeB',
      title: 'Test title',
    };

    const { container, getByText } = render(
      <Provider store={store}>
        <Form {...props} />
      </Provider>,
    );
    expect(container).toBeTruthy();
    expect(
      container.querySelector('.ui.form .invisible .ui.raised.segments'),
    ).toBeInTheDocument();
    expect(getByText('Test title')).toBeInTheDocument();
  });

  it('renders "Test title" and has the correct structure with formData without crashing with different types and isEditForm true', () => {
    config.blocks = {
      initialBlocksFocus: {
        typeA: 'typeA',
      },
    };
    config.settings = {
      verticalFormTabs: false,
    };
    const props = {
      schema: {
        fieldsets: [{ fields: [], id: 'default', title: 'Default' }],
        properties: {},
        definitions: {},
        required: [],
      },
      formData: {
        blocks: {
          id1: {
            '@type': 'typeB',
            plaintext: 'Block A',
            override_toc: false,
          },
        },
        blocks_layout: {
          items: ['id1'],
        },
      },
      type: 'typeB',
      title: 'Test title',
      isEditForm: true,
    };

    const { container, getByText } = render(
      <Provider store={store}>
        <Form {...props} />
      </Provider>,
    );
    expect(container).toBeTruthy();
    expect(
      container.querySelector('.ui.form .invisible .ui.raised.segments'),
    ).toBeInTheDocument();
    expect(getByText('Test title')).toBeInTheDocument();
  });

  it('renders "Test title" and has the correct structure with formData without crashing with no focused block', () => {
    config.blocks = {
      initialBlocksFocus: null,
    };
    config.settings = {
      verticalFormTabs: false,
    };
    const props = {
      schema: {
        fieldsets: [{ fields: [], id: 'default', title: 'Default' }],
        properties: {},
        definitions: {},
        required: [],
      },
      formData: {
        blocks: {
          id1: {
            '@type': 'typeB',
            plaintext: 'Block A',
            override_toc: false,
          },
        },
        blocks_layout: {
          items: ['id1'],
        },
      },
      type: 'typeB',
      title: 'Test title',
    };

    const { container, getByText } = render(
      <Provider store={store}>
        <Form {...props} />
      </Provider>,
    );
    expect(container).toBeTruthy();
    expect(
      container.querySelector('.ui.form .invisible .ui.raised.segments'),
    ).toBeInTheDocument();
    expect(getByText('Test title')).toBeInTheDocument();
  });

  it('should display the correct fields on the currently selected fieldset', () => {
    config.blocks = {
      initialBlocksFocus: null,
    };
    config.settings = {
      verticalFormTabs: false,
    };
    const props = {
      schema: {
        fieldsets: [
          {
            fields: ['field1', 'field2'],
            id: 'fieldset1',
            title: 'Fieldset 1',
            description: 'Fieldset 1 description',
          },
          {
            fields: ['field3', 'field4'],
            id: 'fieldset2',
            title: 'Fieldset 2',
          },
        ],
        properties: {
          field1: {
            title: 'Field 1',
            description: 'Field 1 description',
            items: ['field4'],
          },
          field2: { title: 'Field 2' },
          field3: { title: 'Field 3' },
          field4: { title: 'Field 4' },
        },
        definitions: {},
        required: [],
      },
      formData: {
        testBlocks: {
          id1: {
            '@type': 'typeB',
            plaintext: 'Block A',
            override_toc: false,
          },
        },
        TestBlocks_layout: {
          items: ['id1'],
        },
      },
      type: 'typeB',
      title: 'Test title',
      description: 'Test description',
      onChangeFormData: jest.fn(),
    };

    const prevProps = { requestError: null };
    const prevState = { formData: {}, errors: {}, activeIndex: 0 };
    const giveServerErrorsToCorrespondingFieldsMock = jest.spyOn(
      FormValidation,
      'giveServerErrorsToCorrespondingFields',
    );
    giveServerErrorsToCorrespondingFieldsMock.mockImplementation(() => [
      { message: 'Sample error message' },
      { message: 'Sample error message' },
    ]);
    const requestError = 'Sample error message';

    const { container, getByText, rerender } = render(
      <Provider store={store}>
        <Form
          {...props}
          requestError={prevProps.requestError}
          formData={prevState.formData}
        />
      </Provider>,
    );

    expect(getByText('Fieldset 1')).toBeInTheDocument();
    expect(getByText('Fieldset 2')).toBeInTheDocument();
    expect(getByText('Fieldset 1 description')).toBeInTheDocument();
    expect(getByText('Test title')).toBeInTheDocument();
    expect(container.querySelector('#mocked-field-field1')).toBeInTheDocument();
    expect(container.querySelector('#mocked-field-field2')).toBeInTheDocument();
    expect(
      container.querySelector('#mocked-field-field3'),
    ).not.toBeInTheDocument();
    expect(
      container.querySelector('#mocked-field-field4'),
    ).not.toBeInTheDocument();

    fireEvent.click(container.querySelector('#mocked-field-field2'));
    fireEvent.click(getByText('Fieldset 2'));

    expect(
      container.querySelector('#mocked-field-field1'),
    ).not.toBeInTheDocument();
    expect(
      container.querySelector('#mocked-field-field2'),
    ).not.toBeInTheDocument();
    expect(container.querySelector('#mocked-field-field3')).toBeInTheDocument();
    expect(container.querySelector('#mocked-field-field4')).toBeInTheDocument();

    rerender(
      <Provider store={store}>
        <Form
          {...props}
          requestError={requestError}
          formData={props.formData}
          errors={prevState.errors}
          activeIndex={prevState.activeIndex}
        />
      </Provider>,
    );

    expect(giveServerErrorsToCorrespondingFieldsMock).toHaveBeenCalledWith(
      requestError,
    );
  });

  it('renders without crashing and selecting Submit/Cancel button with resetAfterSubmit and errors', () => {
    config.blocks = {
      initialBlocksFocus: null,
    };
    config.settings = {
      verticalFormTabs: true,
    };

    const props = {
      schema: {
        fieldsets: [
          {
            fields: ['field1', 'field2'],
            id: 'fieldset1',
            title: 'Fieldset 1',
          },
          {
            fields: ['field3', 'field4'],
            id: 'fieldset2',
            title: 'Fieldset 2',
          },
        ],
        properties: {
          field1: {
            title: 'Field 1',
            description: 'Field 1 description',
            items: ['field4'],
            widget: 'textarea',
          },
          field2: { widget: 'textarea' },
        },
        definitions: {},
        required: [],
      },
      formData: {
        blocks: {
          id1: {
            '@type': 'typeB',
            plaintext: 'Block A',
            override_toc: false,
          },
        },
        blocks_layout: {
          items: ['id1'],
        },
      },
      type: 'typeB',
      isClient: true,
      title: 'Test title',
      description: 'Test description',
      error: {
        message: 'Sample error message',
      },
      onSubmit: jest.fn(),
      onCancel: jest.fn(),
      resetAfterSubmit: true,
      submitLabel: 'Submit',
    };

    const validateFieldsPerFieldsetMock = jest.spyOn(
      FormValidation,
      'validateFieldsPerFieldset',
    );
    validateFieldsPerFieldsetMock.mockImplementation(() => ({
      field1: [],
      field2: [],
    }));

    const { container, getByText } = render(
      <Provider store={store}>
        <Form {...props} />
      </Provider>,
    );

    expect(getByText('Fieldset 1')).toBeInTheDocument();
    expect(getByText('Fieldset 2')).toBeInTheDocument();
    expect(getByText('Test title')).toBeInTheDocument();
    expect(container.querySelector('#mocked-field-field1')).toBeInTheDocument();
    expect(container.querySelector('#mocked-field-field2')).toBeInTheDocument();
    expect(
      container.querySelector('#mocked-field-field3'),
    ).not.toBeInTheDocument();
    expect(
      container.querySelector('#mocked-field-field4'),
    ).not.toBeInTheDocument();

    fireEvent.click(container.querySelector('button[aria-label="Submit"]'));
    fireEvent.click(container.querySelector('button[aria-label="Cancel"]'));
  });

  it('renders without crashing and selecting Submit/Cancel button with resetAfterSubmit and isaEditForm and no errors', () => {
    config.blocks = {
      initialBlocksFocus: null,
    };
    config.settings = {
      verticalFormTabs: true,
    };

    const props = {
      schema: {
        fieldsets: [
          {
            fields: ['field1', 'field2'],
            id: 'fieldset1',
            title: 'Fieldset 1',
          },
          {
            fields: ['field3', 'field4'],
            id: 'fieldset2',
            title: 'Fieldset 2',
          },
        ],
        properties: {
          field1: {
            title: 'Field 1',
            description: 'Field 1 description',
            items: ['field4'],
            widget: 'textarea',
          },
          field2: { widget: 'textarea' },
        },
        definitions: {},
        required: [],
      },
      formData: {
        blocks: {
          id1: {
            '@type': 'typeB',
            plaintext: 'Block A',
            override_toc: false,
          },
        },
        blocks_layout: {
          items: ['id1'],
        },
      },
      type: 'typeB',
      isClient: true,
      title: 'Test title',
      description: 'Test description',
      error: {
        message: 'Sample error message',
      },
      onSubmit: jest.fn(),
      onCancel: jest.fn(),
      resetAfterSubmit: true,
      isEditForm: true,
      submitLabel: 'Submit',
    };

    const validateFieldsPerFieldsetMock = jest.spyOn(
      FormValidation,
      'validateFieldsPerFieldset',
    );
    validateFieldsPerFieldsetMock.mockImplementation(() => ({}));

    const { container, getByText } = render(
      <Provider store={store}>
        <Form {...props} />
      </Provider>,
    );

    expect(getByText('Fieldset 1')).toBeInTheDocument();
    expect(getByText('Fieldset 2')).toBeInTheDocument();
    expect(getByText('Test title')).toBeInTheDocument();
    expect(container.querySelector('#mocked-field-field1')).toBeInTheDocument();
    expect(container.querySelector('#mocked-field-field2')).toBeInTheDocument();
    expect(
      container.querySelector('#mocked-field-field3'),
    ).not.toBeInTheDocument();
    expect(
      container.querySelector('#mocked-field-field4'),
    ).not.toBeInTheDocument();

    fireEvent.click(container.querySelector('button[aria-label="Submit"]'));
    fireEvent.click(container.querySelector('button[aria-label="Cancel"]'));
  });

  it('renders without crashing and selecting Submit/Cancel button with no errors', () => {
    config.blocks = {
      initialBlocksFocus: null,
    };
    config.settings = {
      verticalFormTabs: true,
    };

    const props = {
      schema: {
        fieldsets: [
          {
            fields: ['field1', 'field2'],
            id: 'fieldset1',
            title: 'Fieldset 1',
          },
          {
            fields: ['field3', 'field4'],
            id: 'fieldset2',
            title: 'Fieldset 2',
          },
        ],
        properties: {
          field1: {
            title: 'Field 1',
            description: 'Field 1 description',
            items: ['field4'],
            widget: 'textarea',
          },
          field2: { widget: 'textarea' },
        },
        definitions: {},
        required: [],
      },
      formData: {
        blocks: {
          id1: {
            '@type': 'typeB',
            plaintext: 'Block A',
            override_toc: false,
          },
        },
        blocks_layout: {
          items: ['id1'],
        },
      },
      type: 'typeB',
      isClient: true,
      title: 'Test title',
      description: 'Test description',
      error: {
        message: 'Sample error message',
      },
      onSubmit: jest.fn(),
      onCancel: jest.fn(),
      submitLabel: 'Submit',
    };

    const validateFieldsPerFieldsetMock = jest.spyOn(
      FormValidation,
      'validateFieldsPerFieldset',
    );
    validateFieldsPerFieldsetMock.mockImplementation(() => ({}));

    const { container, getByText } = render(
      <Provider store={store}>
        <Form {...props} />
      </Provider>,
    );

    expect(getByText('Fieldset 1')).toBeInTheDocument();
    expect(getByText('Fieldset 2')).toBeInTheDocument();
    expect(getByText('Test title')).toBeInTheDocument();
    expect(container.querySelector('#mocked-field-field1')).toBeInTheDocument();
    expect(container.querySelector('#mocked-field-field2')).toBeInTheDocument();
    expect(
      container.querySelector('#mocked-field-field3'),
    ).not.toBeInTheDocument();
    expect(
      container.querySelector('#mocked-field-field4'),
    ).not.toBeInTheDocument();

    fireEvent.click(container.querySelector('button[aria-label="Submit"]'));
    fireEvent.click(container.querySelector('button[aria-label="Cancel"]'));
  });

  it('renders only one fieldset and the actions to save/cancel', () => {
    config.blocks = {
      initialBlocksFocus: null,
    };
    config.settings = {
      verticalFormTabs: true,
    };

    const props = {
      schema: {
        fieldsets: [
          {
            fields: ['field1', 'field2'],
            id: 'fieldset1',
            title: 'Fieldset 1',
          },
        ],
        properties: {
          field1: {
            title: 'Field 1',
            description: 'Field 1 description',
            items: ['field4'],
            widget: 'textarea',
          },
          field2: { title: 'Field 2', widget: 'textarea' },
        },
        definitions: {},
        required: [],
      },
      formData: {
        blocks: {
          id1: {
            '@type': 'typeB',
            plaintext: 'Block A',
            override_toc: false,
          },
        },
        blocks_layout: {
          items: ['id1'],
        },
      },
      type: 'typeB',
      isClient: true,
      title: 'Test title',
      description: 'Test description',
      error: {
        message: 'Sample error message',
      },
      onSubmit: jest.fn(),
      onCancel: jest.fn(),
    };

    const validateFieldsPerFieldsetMock = jest.spyOn(
      FormValidation,
      'validateFieldsPerFieldset',
    );
    validateFieldsPerFieldsetMock.mockImplementation(() => [
      'field1',
      'field2',
    ]);

    const { container, getByText } = render(
      <Provider store={store}>
        <Form {...props} />
      </Provider>,
    );

    expect(getByText('Error')).toBeInTheDocument();
    expect(getByText('Sample error message')).toBeInTheDocument();

    expect(container.querySelector('#mocked-field-field1')).toBeInTheDocument();
    expect(container.querySelector('#mocked-field-field2')).toBeInTheDocument();

    fireEvent.click(container.querySelector('#mocked-field-field2 textarea'));
    fireEvent.blur(container.querySelector('#mocked-field-field2 textarea'));
    fireEvent.change(container.querySelector('#mocked-field-field2 textarea'), {
      target: { value: 'test change' },
    });
  });

  it('triggers the onSubmit with the shiftKey and multiple selected blocks and multiple erorrs', () => {
    config.blocks = {
      initialBlocksFocus: null,
    };
    config.settings = {
      verticalFormTabs: true,
    };

    const props = {
      schema: {
        fieldsets: [
          {
            fields: ['field1', 'field2'],
            id: 'fieldset1',
            title: 'Fieldset 1',
          },
        ],
        properties: {
          field1: {
            title: 'Field 1',
            description: 'Field 1 description',
            items: ['field4'],
            widget: 'textarea',
          },
          field2: { title: 'Field 2', widget: 'textarea' },
        },
        definitions: {},
        required: [],
      },
      formData: {
        blocks: {
          id1: {
            '@type': 'typeB',
            plaintext: 'Block A',
            override_toc: false,
          },
        },
        blocks_layout: {
          items: ['id1'],
        },
      },
      type: 'typeB',
      isClient: true,
      visual: true,
      title: 'Test title',
      description: 'Test description',
      error: {
        message: 'Sample error message',
      },
      onSubmit: jest.fn(),
      onCancel: jest.fn(),
    };

    const validateFieldsPerFieldsetMock = jest.spyOn(
      FormValidation,
      'validateFieldsPerFieldset',
    );
    validateFieldsPerFieldsetMock.mockImplementation(() => [
      'field1',
      'field2',
    ]);

    const { container } = render(
      <Provider store={store}>
        <Form {...props} />
      </Provider>,
    );

    fireEvent.click(container.querySelector('#blocks-toolbar'), {
      target: { value: 'id1,id2' },
    });
    fireEvent.change(container.querySelector('#blocks-toolbar'), {
      target: { value: 'test change' },
    });
    fireEvent.select(container.querySelector('#blocks-toolbar'), {
      target: {
        id: 'id1',
        isMultipleSelection: true,
        event: { shiftKey: true },
      },
    });

    fireEvent.change(container.querySelector('#blocks-form'), {
      target: { value: 'test change' },
    });
  });

  it('triggers the onSubmit with the shiftKey and multiple selected blocks when the selected blocks are in another order and multiple errors', () => {
    config.blocks = {
      initialBlocksFocus: null,
    };
    config.settings = {
      verticalFormTabs: true,
    };

    const props = {
      schema: {
        fieldsets: [
          {
            fields: ['field1', 'field2'],
            id: 'fieldset1',
            title: 'Fieldset 1',
          },
        ],
        properties: {
          field1: {
            title: 'Field 1',
            description: 'Field 1 description',
            items: ['field4'],
            widget: 'textarea',
          },
          field2: { title: 'Field 2', widget: 'textarea' },
        },
        definitions: {},
        required: [],
      },
      formData: {
        blocks: {
          id1: {
            '@type': 'typeB',
            plaintext: 'Block A',
            override_toc: false,
          },
          id2: {
            '@type': 'typeB',
            plaintext: 'Block A',
            override_toc: false,
          },
        },
        blocks_layout: {
          items: ['id1', 'id2'],
        },
      },
      type: 'typeB',
      isClient: true,
      visual: true,
      title: 'Test title',
      description: 'Test description',
      error: {
        message: 'Sample error message',
      },
      onSubmit: jest.fn(),
      onCancel: jest.fn(),
    };

    const validateFieldsPerFieldsetMock = jest.spyOn(
      FormValidation,
      'validateFieldsPerFieldset',
    );
    validateFieldsPerFieldsetMock.mockImplementation(() => [
      'field1',
      'field2',
    ]);

    const { container } = render(
      <Provider store={store}>
        <Form {...props} />
      </Provider>,
    );

    fireEvent.click(container.querySelector('#blocks-toolbar'), {
      target: { value: 'id2,id1' },
    });
    fireEvent.change(container.querySelector('#blocks-toolbar'), {
      target: { value: 'test change' },
    });
    fireEvent.select(container.querySelector('#blocks-toolbar'), {
      target: {
        id: 'id1',
        isMultipleSelection: true,
        event: { shiftKey: true },
      },
    });
  });

  it('triggers the onSubmit with the shiftKey and multiple selected blocks when there are no selected blocks and multiple errors', () => {
    config.blocks = {
      initialBlocksFocus: null,
    };
    config.settings = {
      verticalFormTabs: true,
    };

    const props = {
      schema: {
        fieldsets: [
          {
            fields: ['field1', 'field2'],
            id: 'fieldset1',
            title: 'Fieldset 1',
          },
        ],
        properties: {
          field1: {
            title: 'Field 1',
            description: 'Field 1 description',
            items: ['field4'],
            widget: 'textarea',
          },
          field2: { title: 'Field 2', widget: 'textarea' },
        },
        definitions: {},
        required: [],
      },
      formData: {
        blocks: {
          id1: {
            '@type': 'typeB',
            plaintext: 'Block A',
            override_toc: false,
          },
        },
        blocks_layout: {
          items: ['id1'],
        },
      },
      type: 'typeB',
      isClient: true,
      visual: true,
      title: 'Test title',
      description: 'Test description',
      error: {
        message: 'Sample error message',
      },
      onSubmit: jest.fn(),
      onCancel: jest.fn(),
    };

    const validateFieldsPerFieldsetMock = jest.spyOn(
      FormValidation,
      'validateFieldsPerFieldset',
    );
    validateFieldsPerFieldsetMock.mockImplementation(() => [
      'field1',
      'field2',
    ]);

    const { container } = render(
      <Provider store={store}>
        <Form {...props} />
      </Provider>,
    );

    fireEvent.click(container.querySelector('#blocks-toolbar'), {
      target: { value: undefined },
    });
    fireEvent.change(container.querySelector('#blocks-toolbar'), {
      target: { value: 'test change' },
    });
    fireEvent.select(container.querySelector('#blocks-toolbar'), {
      target: {
        id: 'id1',
        isMultipleSelection: true,
        event: { shiftKey: true },
      },
    });
  });

  it('triggers the onSubmit with the ctrlKey and multiple selected blocks and multiple errors', () => {
    config.blocks = {
      initialBlocksFocus: null,
    };
    config.settings = {
      verticalFormTabs: true,
    };

    const props = {
      schema: {
        fieldsets: [
          {
            fields: ['field1', 'field2'],
            id: 'fieldset1',
            title: 'Fieldset 1',
          },
        ],
        properties: {
          field1: {
            title: 'Field 1',
            description: 'Field 1 description',
            items: ['field4'],
            widget: 'textarea',
          },
          field2: { title: 'Field 2', widget: 'textarea' },
        },
        definitions: {},
        required: [],
      },
      formData: {
        blocks: {
          id1: {
            '@type': 'typeB',
            plaintext: 'Block A',
            override_toc: false,
          },
        },
        blocks_layout: {
          items: ['id1'],
        },
      },
      type: 'typeB',
      isClient: true,
      visual: true,
      title: 'Test title',
      description: 'Test description',
      error: {
        message: 'Sample error message',
      },
      onSubmit: jest.fn(),
      onCancel: jest.fn(),
    };

    const validateFieldsPerFieldsetMock = jest.spyOn(
      FormValidation,
      'validateFieldsPerFieldset',
    );
    validateFieldsPerFieldsetMock.mockImplementation(() => [
      'field1',
      'field2',
    ]);

    const { container } = render(
      <Provider store={store}>
        <Form {...props} />
      </Provider>,
    );

    fireEvent.click(container.querySelector('#blocks-toolbar'), {
      target: { value: 'id1,id2' },
    });
    fireEvent.change(container.querySelector('#blocks-toolbar'), {
      target: { value: 'test change' },
    });
    fireEvent.select(container.querySelector('#blocks-toolbar'), {
      target: {
        id: 'id1',
        isMultipleSelection: true,
        event: { ctrlKey: true },
      },
    });
  });

  it('triggers the onSubmit with the ctrlKey and multiple selected blocks and multiple errors when the selected block in not in the list of selected blocks', () => {
    config.blocks = {
      initialBlocksFocus: null,
    };
    config.settings = {
      verticalFormTabs: true,
    };

    const props = {
      schema: {
        fieldsets: [
          {
            fields: ['field1', 'field2'],
            id: 'fieldset1',
            title: 'Fieldset 1',
          },
        ],
        properties: {
          field1: {
            title: 'Field 1',
            description: 'Field 1 description',
            items: ['field4'],
            widget: 'textarea',
          },
          field2: { title: 'Field 2', widget: 'textarea' },
        },
        definitions: {},
        required: [],
      },
      formData: {
        blocks: {
          id1: {
            '@type': 'typeB',
            plaintext: 'Block A',
            override_toc: false,
          },
        },
        blocks_layout: {
          items: ['id1'],
        },
      },
      type: 'typeB',
      isClient: true,
      visual: true,
      title: 'Test title',
      description: 'Test description',
      error: {
        message: 'Sample error message',
      },
      onSubmit: jest.fn(),
      onCancel: jest.fn(),
    };

    const validateFieldsPerFieldsetMock = jest.spyOn(
      FormValidation,
      'validateFieldsPerFieldset',
    );
    validateFieldsPerFieldsetMock.mockImplementation(() => [
      'field1',
      'field2',
    ]);

    const { container } = render(
      <Provider store={store}>
        <Form {...props} />
      </Provider>,
    );

    fireEvent.click(container.querySelector('#blocks-toolbar'), {
      target: { value: 'id1,id2' },
    });
    fireEvent.change(container.querySelector('#blocks-toolbar'), {
      target: { value: 'test change' },
    });
    fireEvent.select(container.querySelector('#blocks-toolbar'), {
      target: {
        id: 'id3',
        isMultipleSelection: true,
        event: { ctrlKey: true },
      },
    });
  });
});
