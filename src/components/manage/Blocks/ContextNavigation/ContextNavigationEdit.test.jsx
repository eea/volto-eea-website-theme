import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import ContextNavigationEdit from './ContextNavigationEdit';
import { Router } from 'react-router-dom';
import { Provider } from 'react-intl-redux';
import configureStore from 'redux-mock-store';
import { createMemoryHistory } from 'history';
import '@testing-library/jest-dom/extend-expect';

jest.mock('@plone/volto/components', () => ({
  InlineForm: ({ onChangeField }) => (
    <div>
      <p>InlineForm</p>
      <input id="test" onChange={onChangeField} />
    </div>
  ),
  SidebarPortal: ({ children, selected }) =>
    selected ? (
      <div>
        <div>SidebarPortal</div>
        {children}
      </div>
    ) : null,
}));

jest.mock('@plone/volto/components/theme/Navigation/ContextNavigation', () => {
  return {
    __esModule: true,
    default: ({ params }) => {
      return <div>ConnectedContextNavigation {params.root_path}</div>;
    },
  };
});

jest.mock('@plone/volto/helpers', () => ({
  withBlockExtensions: jest.fn((Component) => Component),
  emptyBlocksForm: jest.fn(),
  getBlocksLayoutFieldname: () => 'blocks_layout',
  withVariationSchemaEnhancer: jest.fn((Component) => Component),
}));

const mockStore = configureStore();
const store = mockStore({
  intl: {
    locale: 'en',
    messages: {},
  },
});

describe('ContextNavigationEdit', () => {
  it('renders corectly', () => {
    const history = createMemoryHistory();
    const { getByText, queryByText } = render(
      <Provider store={store}>
        <Router history={history}>
          <ContextNavigationEdit selected={false} />
        </Router>
        ,
      </Provider>,
    );

    expect(getByText('Context navigation')).toBeInTheDocument();
    expect(getByText('ConnectedContextNavigation')).toBeInTheDocument();
    expect(queryByText('InlineForm')).toBeNull();
    expect(queryByText('SidebarPortal')).toBeNull();
  });

  it('renders corectly', () => {
    const history = createMemoryHistory();
    const { container, getByText } = render(
      <Provider store={store}>
        <Router history={history}>
          <ContextNavigationEdit selected={true} onChangeBlock={() => {}} />
        </Router>
        ,
      </Provider>,
    );

    expect(getByText('Context navigation')).toBeInTheDocument();
    expect(getByText('ConnectedContextNavigation')).toBeInTheDocument();
    expect(getByText('InlineForm')).toBeInTheDocument();
    expect(getByText('SidebarPortal')).toBeInTheDocument();

    fireEvent.change(container.querySelector('#test'), {
      target: { value: 'test' },
    });
  });
});
