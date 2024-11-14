import React from 'react';
import renderer from 'react-test-renderer';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-intl-redux';
import { MemoryRouter } from 'react-router-dom';
import config from '@plone/volto/registry';

import Breadcrumbs from './Breadcrumbs';

const mockStore = configureStore();

describe('Breadcrumbs', () => {
  it('renders a breadcrumbs component', () => {
    const store = mockStore({
      breadcrumbs: {
        items: [
          { title: 'Blog', url: '/blog' },
          { title: 'My first blog', url: '/blog/my-first-blog' },
        ],
      },
      intl: {
        locale: 'en',
        messages: {},
      },
    });
    const component = renderer.create(
      <Provider store={store}>
        <MemoryRouter>
          <Breadcrumbs pathname="/blog" />
        </MemoryRouter>
      </Provider>,
    );
    const json = component.toJSON();
    expect(json).toMatchSnapshot();
  });

  it('renders breadcrumbs with contentTypesAsBreadcrumbSection', () => {
    // Mock the config settings
    config.settings = {
      ...config.settings,
      contentTypesAsBreadcrumbSection: ['Folder', 'News Item'],
    };

    const store = mockStore({
      breadcrumbs: {
        items: [
          { title: 'Home', url: '/' },
          { title: 'News', url: '/news', portal_type: 'Folder' },
          {
            title: 'Latest Update',
            url: '/news/latest-update',
            portal_type: 'News Item',
          },
        ],
      },
      intl: {
        locale: 'en',
        messages: {},
      },
      userSession: {
        token: null,
      },
    });

    const component = renderer.create(
      <Provider store={store}>
        <MemoryRouter>
          <Breadcrumbs pathname="/news/latest-update" />
        </MemoryRouter>
      </Provider>,
    );
    const json = component.toJSON();
    expect(json).toMatchSnapshot();
  });
});
