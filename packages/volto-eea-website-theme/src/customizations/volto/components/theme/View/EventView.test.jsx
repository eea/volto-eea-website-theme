import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-intl-redux';
import { MemoryRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import config from '@plone/volto/registry';
import EventView from './EventView';

const mockStore = configureStore();

const store = mockStore({
  intl: {
    locale: 'en',
    messages: {},
  },
});

beforeAll(async () => {
  const { __setLoadables } = await import(
    '@plone/volto/helpers/Loadable/Loadable'
  );
  await __setLoadables();
});

const baseContent = {
  '@id': 'http://localhost:8080/Plone/my-event',
  title: 'Hello World!',
  attendees: [],
  end: '2019-06-23T16:20:00+00:00',
  start: '2019-06-23T15:20:00+00:00',
  subjects: [],
  location: 'Copenhagen',
};

const renderView = (content) =>
  render(
    <Provider store={store}>
      <MemoryRouter>
        <EventView content={content} />
      </MemoryRouter>
    </Provider>,
  );

describe('EventView', () => {
  it('keeps the EEA event box above the content in a view-wrapper container', () => {
    const { container } = renderView({
      ...baseContent,
      description: 'Hi',
      text: { data: '<p>Event text</p>' },
    });

    const page = container.querySelector('#page-document');
    expect(page).toHaveClass('ui', 'container', 'view-wrapper', 'event-view');
    expect(page).not.toHaveClass('viewwrapper');
    expect(page.querySelector('.ui.grid')).toBeNull();

    const box = page.firstElementChild;
    expect(box).toHaveClass('event-view-box');
    expect(box.querySelector('aside')).toBeInTheDocument();
    expect(box).toHaveTextContent('Copenhagen');

    expect(page.querySelectorAll('.event-view-box')).toHaveLength(1);
    expect(page.querySelector('h1.documentFirstHeading')).toHaveTextContent(
      'Hello World!',
    );
    expect(page.querySelector('.documentDescription')).toHaveTextContent('Hi');
    expect(page).toHaveTextContent('Event text');
  });

  it('renders the blocks once, after the event box', () => {
    const { container } = renderView({
      ...baseContent,
      blocks: {
        a: { '@type': 'title' },
      },
      blocks_layout: { items: ['a'] },
    });

    const page = container.querySelector('#page-document');
    expect(page.firstElementChild).toHaveClass('event-view-box');
    expect(page.querySelectorAll('aside')).toHaveLength(1);
    expect(page.querySelectorAll('h1.documentFirstHeading')).toHaveLength(1);
  });

  it('uses the registry Image component in the no-blocks fallback', () => {
    const Image = vi.fn(({ className }) => (
      <img className={className} alt="" src="/image.png" />
    ));
    const original = config.getComponent({ name: 'Image' }).component;
    config.registerComponent({ name: 'Image', component: Image });

    try {
      const { container } = renderView({
        ...baseContent,
        image: { scales: { thumb: { download: '/thumb.png' } } },
      });
      expect(Image).toHaveBeenCalled();
      expect(Image.mock.calls[0][0]).toMatchObject({
        imageField: 'image',
        item: expect.objectContaining({ title: 'Hello World!' }),
      });
      expect(
        container.querySelector('img.document-image.ui.right.floated.image'),
      ).toBeInTheDocument();
    } finally {
      config.registerComponent({ name: 'Image', component: original });
    }
  });
});
