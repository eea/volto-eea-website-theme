import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import ContextNavigationEdit from './ContextNavigationEdit';
import { Router } from 'react-router-dom';
import { Provider } from 'react-intl-redux';
import configureStore from 'redux-mock-store';
import { createMemoryHistory } from 'history';
import '@testing-library/jest-dom';

jest.mock('@plone/volto/components/manage/Form/BlockDataForm', () => ({
  __esModule: true,
  default: ({ onChangeField }) => (
    <div>
      <p>BlockDataForm</p>
      <input id="test" onChange={onChangeField} />
    </div>
  ),
}));

jest.mock('@plone/volto/components/theme/Navigation/ContextNavigation', () => {
  return {
    __esModule: true,
    default: ({ params }) => {
      return <div>ConnectedContextNavigation {params.root_path}</div>;
    },
  };
});

jest.mock('@plone/volto/components/manage/Sidebar/SidebarPortal', () => ({
  __esModule: true,
  default: ({ children, selected }) =>
    selected ? (
      <div>
        <div>SidebarPortal</div>
        {children}
      </div>
    ) : null,
}));

jest.mock('@plone/volto/helpers/Extensions', () => ({
  withBlockExtensions: jest.fn((Component) => Component),
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
          <ContextNavigationEdit selected={false} data={{}} />
        </Router>
      </Provider>,
    );

    expect(getByText('Context navigation')).toBeInTheDocument();
    expect(getByText('ConnectedContextNavigation')).toBeInTheDocument();
    expect(queryByText('BlockDataForm')).toBeNull();
    expect(queryByText('SidebarPortal')).toBeNull();
  });

  it('renders corectly', () => {
    const history = createMemoryHistory();
    const { container, getByText } = render(
      <Provider store={store}>
        <Router history={history}>
          <ContextNavigationEdit
            selected={true}
            onChangeBlock={() => {}}
            data={{}}
          />
        </Router>
      </Provider>,
    );

    expect(getByText('Context navigation')).toBeInTheDocument();
    expect(getByText('ConnectedContextNavigation')).toBeInTheDocument();
    expect(getByText('BlockDataForm')).toBeInTheDocument();
    expect(getByText('SidebarPortal')).toBeInTheDocument();

    fireEvent.change(container.querySelector('#test'), {
      target: { value: 'test' },
    });
  });
});
