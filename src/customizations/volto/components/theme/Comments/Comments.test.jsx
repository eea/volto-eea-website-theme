import React from 'react';
import { Provider } from 'react-intl-redux';
import { render, fireEvent } from '@testing-library/react';
import configureStore from 'redux-mock-store';
import Comments from './Comments';
import thunk from 'redux-thunk';
import renderer from 'react-test-renderer';
import '@testing-library/jest-dom/extend-expect';

const middleware = [thunk];
const mockStore = configureStore(middleware);

jest.mock('moment', () =>
  jest.fn(() => ({
    format: jest.fn(() => 'Tuesday, August 1, 2023 12:09 PM'),
    fromNow: jest.fn(() => 'a few seconds ago'),
  })),
);

jest.mock('@plone/volto/helpers/Loadable/Loadable');
beforeAll(
  async () =>
    await require('@plone/volto/helpers/Loadable/Loadable').__setLoadables(),
);

describe('Comments', () => {
  it('renders a comments component', () => {
    const props = {
      addComment: jest.fn(),
      deleteComment: jest.fn(),
      listComments: jest.fn(),
      listMoreComments: jest.fn(),
      pathname: '/comments',
      items: [
        {
          author_name: 'test',
          creation_date: '2021-01-01',
          text: {
            data: 'test',
            'mime-type': 'text/plain',
          },
          is_deletable: true,
          is_editable: true,
        },
      ],
      addRequest: { loading: false, loaded: false },
      deleteRequest: { loading: false, loaded: false },
    };
    const store = mockStore({
      comments: {
        items: [
          {
            '@id': 'someurl',
            comment_id: '1614094601171408',
            author_name: 'admin',
            creation_date: '2017-11-06T19:36:01',
            text: { data: 'Some comment' },
            is_deletable: true,
            is_editable: true,
            can_reply: true,
          },
          {
            '@id': 'someurl',
            comment_id: '1614094601171409',
            author_name: undefined,
            creation_date: '2017-11-06T19:36:01',
            text: { data: 'Some comment', 'mime-type': 'text/html' },
            is_deletable: true,
            is_editable: true,
            can_reply: true,
          },
        ],
        permissions: {
          view_comments: true,
          can_reply: true,
        },
        add: {
          loading: false,
          loaded: true,
        },
        delete: {
          loading: false,
          loaded: true,
        },
        update: {
          loading: false,
          loaded: true,
        },
      },
      intl: {
        locale: 'en',
        messages: {},
      },
    });
    const component = renderer.create(
      <Provider store={store}>
        <Comments {...props} />
      </Provider>,
    );
    const json = component.toJSON();
    expect(json).toMatchSnapshot();
  });

  it('renders a comments component withour viewing the comments', () => {
    const props = {
      addComment: jest.fn(),
      deleteComment: jest.fn(),
      listComments: jest.fn(),
      listMoreComments: jest.fn(),
      pathname: '/comments',
      items: [
        {
          author_name: 'test',
          creation_date: '2021-01-01',
          text: {
            data: 'test',
            'mime-type': 'text/plain',
          },
          is_deletable: true,
          is_editable: true,
        },
      ],
      addRequest: { loading: false, loaded: false },
      deleteRequest: { loading: false, loaded: false },
    };
    const store = mockStore({
      comments: {
        items: [
          {
            '@id': 'someurl',
            comment_id: '1614094601171408',
            author_name: 'admin',
            creation_date: '2017-11-06T19:36:01',
            text: { data: 'Some comment' },
            is_deletable: true,
            is_editable: true,
            can_reply: true,
          },
          {
            '@id': 'someurl',
            comment_id: '1614094601171409',
            author_name: undefined,
            creation_date: '2017-11-06T19:36:01',
            text: { data: 'Some comment', 'mime-type': 'text/html' },
            is_deletable: true,
            is_editable: true,
            can_reply: true,
          },
        ],
        permissions: {
          view_comments: false,
          can_reply: true,
        },
        add: {
          loading: false,
          loaded: true,
        },
        delete: {
          loading: false,
          loaded: true,
        },
        update: {
          loading: false,
          loaded: true,
        },
      },
      intl: {
        locale: 'en',
        messages: {},
      },
    });
    const component = renderer.create(
      <Provider store={store}>
        <Comments {...props} />
      </Provider>,
    );
    const json = component.toJSON();
    expect(json).toMatchSnapshot();
  });

  it('renders a comments component without permissions', () => {
    const props = {
      addComment: jest.fn(),
      deleteComment: jest.fn(),
      listComments: jest.fn(),
      listMoreComments: jest.fn(),
      pathname: '/comments',
      items: [
        {
          author_name: 'test',
          creation_date: '2021-01-01',
          text: {
            data: 'test',
            'mime-type': 'text/plain',
          },
          is_deletable: true,
          is_editable: true,
        },
      ],
      addRequest: { loading: false, loaded: false },
      deleteRequest: { loading: false, loaded: false },
    };
    const store = mockStore({
      comments: {
        items: [
          {
            '@id': 'someurl',
            comment_id: '1614094601171408',
            author_name: 'admin',
            creation_date: '2017-11-06T19:36:01',
            text: { data: 'Some comment' },
            is_deletable: true,
            is_editable: true,
            can_reply: true,
          },
          {
            '@id': 'someurl',
            comment_id: '1614094601171409',
            author_name: undefined,
            creation_date: '2017-11-06T19:36:01',
            text: { data: 'Some comment', 'mime-type': 'text/html' },
            is_deletable: true,
            is_editable: true,
            can_reply: true,
          },
        ],
        permissions: undefined,
        add: {
          loading: false,
          loaded: true,
        },
        delete: {
          loading: false,
          loaded: true,
        },
        update: {
          loading: false,
          loaded: true,
        },
      },
      intl: {
        locale: 'en',
        messages: {},
      },
    });
    const component = renderer.create(
      <Provider store={store}>
        <Comments {...props} />
      </Provider>,
    );
    const json = component.toJSON();
    expect(json).toMatchSnapshot();
  });

  it('renders a comments component, fires onClick events on comment and rerenders', () => {
    const props = {
      addComment: jest.fn(),
      deleteComment: jest.fn(),
      listComments: jest.fn(),
      listMoreComments: jest.fn(),
      pathname: '/comments',
      items: [
        {
          '@id': 'someurl',
          comment_id: '1614094601171408',
          author_name: 'admin',
          creation_date: '2017-11-06T19:36:01',
          text: { data: 'Some comment' },
          is_deletable: true,
          is_editable: true,
          can_reply: true,
        },
        {
          '@id': 'someurl',
          comment_id: '1614094601171409',
          author_name: undefined,
          creation_date: '2017-11-06T19:36:01',
          text: { data: 'Some comment', 'mime-type': 'text/html' },
          is_deletable: true,
          is_editable: true,
          can_reply: true,
          in_reply_to: '1614094601171408',
        },
        {
          '@id': 'someurl',
          comment_id: '1614094601171410',
          author_name: undefined,
          creation_date: '2017-11-06T19:36:01',
          text: { data: 'Some comment', 'mime-type': 'text/html' },
          is_deletable: true,
          is_editable: true,
          can_reply: true,
          in_reply_to: '1614094601171408',
        },
      ],
      items_total: 4,
      addRequest: { loading: true, loaded: false },
      deleteRequest: { loading: true, loaded: false },
    };
    const store = mockStore({
      comments: {
        items: [
          {
            '@id': 'someurl',
            comment_id: '1614094601171408',
            author_name: 'admin',
            creation_date: '2017-11-06T19:36:01',
            text: { data: 'Some comment' },
            is_deletable: true,
            is_editable: true,
            can_reply: true,
          },
          {
            '@id': 'someurl',
            comment_id: '1614094601171409',
            author_name: undefined,
            creation_date: '2017-11-06T19:36:01',
            text: { data: 'Some comment', 'mime-type': 'text/html' },
            is_deletable: true,
            is_editable: true,
            can_reply: true,
            in_reply_to: '1614094601171408',
          },
          {
            '@id': 'someurl',
            comment_id: '1614094601171410',
            author_name: undefined,
            creation_date: '2017-11-06T19:36:01',
            text: { data: 'Some comment', 'mime-type': 'text/html' },
            is_deletable: true,
            is_editable: true,
            can_reply: true,
            in_reply_to: '1614094601171408',
          },
        ],
        items_total: 4,
        permissions: {
          view_comments: true,
          can_reply: true,
        },
        add: {
          loading: true,
          loaded: false,
        },
        delete: {
          loading: true,
          loaded: false,
        },
        update: {
          loading: false,
          loaded: true,
        },
      },
      intl: {
        locale: 'en',
        messages: {},
      },
    });
    const { container, rerender } = render(
      <Provider store={store}>
        <Comments {...props} />
      </Provider>,
    );

    const actions = container.querySelectorAll('.actions button');

    fireEvent.click(container.querySelector('button[aria-label="Reply"]'));
    fireEvent.click(container.querySelector('button[aria-label="Edit"]'));
    fireEvent.click(container.querySelector('button[aria-label="Delete"]'));
    fireEvent.click(actions[actions.length - 1]);
    fireEvent.click(
      container.querySelector('#comment-add-id button[aria-label="Comment"]'),
    );
    fireEvent.click(container.querySelector('.ui.blue.basic.fluid.button'));

    rerender(
      <Provider store={store}>
        <Comments
          {...props}
          pathname={'/new-comments'}
          addRequest={{ loading: true, loaded: true }}
        />
      </Provider>,
    );

    rerender(
      <Provider store={store}>
        <Comments
          {...props}
          pathname={'/new-comments'}
          addRequest={{ loading: true, loaded: true }}
        />
      </Provider>,
    );

    rerender(
      <Provider store={store}>
        <Comments
          {...props}
          pathname={'/new-comments'}
          addRequest={{ loading: false, loaded: false }}
          deleteRequest={{ loading: true, loaded: true }}
        />
      </Provider>,
    );
  });
});
