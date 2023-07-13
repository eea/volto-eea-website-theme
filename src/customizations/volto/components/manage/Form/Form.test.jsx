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

describe('Form', () => {
  beforeEach(() => {
    store = mockStore({
      intl: {
        locale: 'en',
        messages: {},
      },
    });
  });

  it('renders without crashing', () => {
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

    const { container } = render(
      <Provider store={store}>
        <Form {...props} />
      </Provider>,
    );
    expect(container).toBeTruthy();
  });

  it('renders without crashing', () => {
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

    const { container } = render(
      <Provider store={store}>
        <Form {...props} />
      </Provider>,
    );
    expect(container).toBeTruthy();
  });

  it('renders without crashing', () => {
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

    const { container } = render(
      <Provider store={store}>
        <Form {...props} />
      </Provider>,
    );
    expect(container).toBeTruthy();
  });

  it('renders without crashing', () => {
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

    const { container } = render(
      <Provider store={store}>
        <Form {...props} />
      </Provider>,
    );
    expect(container).toBeTruthy();
  });

  it('renders without crashing', () => {
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
          field1: { title: 'Field 1', description: 'Field 1 description' },
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

    fireEvent.click(container.querySelector('#mocked-field-field2'));
    fireEvent.click(getByText('Fieldset 2'));

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

  it('renders without crashing', () => {
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
      isClient: true,
      title: 'Test title',
      description: 'Test description',
      error: {
        message: 'Sample error message',
      },
      onSubmit: jest.fn(),
      onCancel: jest.fn(),
    };

    render(
      <Provider store={store}>
        <Form {...props} />
      </Provider>,
    );
  });

  it('renders without crashing', () => {
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

    render(
      <Provider store={store}>
        <Form {...props} />
      </Provider>,
    );
  });
});
