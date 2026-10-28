import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-intl-redux';
import { MemoryRouter } from 'react-router-dom';
import ContentsItem from './ContentsItemDndKit';

vi.mock('@plone/volto/helpers/Loadable/Loadable');

beforeAll(async () => {
  const { __setLoadables } = await import(
    '@plone/volto/helpers/Loadable/Loadable'
  );
  await __setLoadables();
});

const DAY = 24 * 60 * 60 * 1000;
const iso = (offset) => new Date(Date.now() + offset).toISOString();

const makeItem = (extra = {}) => ({
  '@id': '/folder/page',
  title: 'A page',
  '@type': 'Document',
  Type: 'Page',
  is_folderish: false,
  ExpirationDate: 'None',
  EffectiveDate: 'None',
  review_state: 'published',
  exclude_from_nav: true,
  Creator: 'admin',
  ModificationDate: '2026-10-01T10:00:00+00:00',
  Subject: ['air', 'water'],
  ...extra,
});

const indexes = [
  { id: 'review_state', type: 'string' },
  { id: 'exclude_from_nav', type: 'boolean' },
  { id: 'Creator', type: 'string' },
  { id: 'ModificationDate', type: 'date' },
  { id: 'Subject', type: 'array' },
];

const renderItem = (props = {}) => {
  const handlers = {
    onClick: vi.fn(),
    onCut: vi.fn(),
    onCopy: vi.fn(),
    onDelete: vi.fn(),
    onMoveToTop: vi.fn(),
    onMoveToBottom: vi.fn(),
  };
  const store = configureStore()({ intl: { locale: 'en', messages: {} } });
  const item = props.item || makeItem();
  render(
    <Provider store={store}>
      <MemoryRouter>
        <table>
          <tbody>
            <ContentsItem
              item={item}
              selected={false}
              indexes={indexes}
              order={2}
              {...handlers}
              {...props}
            />
          </tbody>
        </table>
      </MemoryRouter>
    </Provider>,
  );
  return { handlers, item };
};

describe('ContentsItemDndKit', () => {
  it('renders the item link and its index columns', async () => {
    renderItem();
    const title = await screen.findByText('A page');
    expect(title.closest('a')).toHaveAttribute('href', '/folder/page');
    expect(screen.getByText('Published')).toBeInTheDocument();
    expect(screen.getByText('Yes')).toBeInTheDocument();
    expect(screen.getByText('admin')).toBeInTheDocument();
    expect(screen.getByText('air, water')).toBeInTheDocument();
  });

  it('links folders to their contents view and shows boolean false', async () => {
    renderItem({
      item: makeItem({ is_folderish: true, exclude_from_nav: false }),
    });
    const title = await screen.findByText('A page');
    expect(title.closest('a')).toHaveAttribute('href', '/folder/page/contents');
    expect(screen.getByText('No')).toBeInTheDocument();
  });

  it('shows no status badges for a published item without dates', async () => {
    renderItem();
    await screen.findByText('A page');
    expect(screen.queryByText('Expired')).not.toBeInTheDocument();
    expect(screen.queryByText('Scheduled')).not.toBeInTheDocument();
    expect(screen.queryByText('Working copy')).not.toBeInTheDocument();
  });

  it('shows the expired, scheduled and working copy badges', async () => {
    renderItem({
      item: makeItem({
        ExpirationDate: iso(-DAY),
        EffectiveDate: iso(DAY),
        is_working_copy: true,
      }),
    });
    expect(await screen.findByText('Expired')).toBeInTheDocument();
    expect(screen.getByText('Scheduled')).toBeInTheDocument();
    expect(screen.getByText('Working copy')).toBeInTheDocument();
  });

  it('lets the title shrink next to the badges', async () => {
    renderItem({ item: makeItem({ ExpirationDate: iso(-DAY) }) });
    const title = await screen.findByText('A page');
    expect(title.getAttribute('style')).toContain('min-width: 0');
    expect(
      screen.getByText('Expired').closest('button').getAttribute('style'),
    ).toContain('flex-shrink: 0');
  });

  it('toggles the selection with the checkbox', async () => {
    const { handlers } = renderItem();
    fireEvent.click(await screen.findByLabelText('Checked'));
    expect(handlers.onClick).toHaveBeenCalledWith(
      expect.anything(),
      '/folder/page',
    );
  });

  it('renders the checked box for a selected item', async () => {
    renderItem({ selected: true });
    expect(await screen.findByLabelText('Unchecked')).toBeInTheDocument();
  });

  it('runs the actions of the item menu', async () => {
    const { handlers } = renderItem();
    await screen.findByText('A page');
    fireEvent.click(document.querySelector('.dropdown-popup-trigger'));
    fireEvent.click(await screen.findByText('Cut'));
    fireEvent.click(screen.getByText('Copy'));
    fireEvent.click(screen.getByText('Delete'));
    fireEvent.click(screen.getByText('Move to top of folder'));
    fireEvent.click(screen.getByText('Move to bottom of folder'));
    expect(handlers.onCut).toHaveBeenCalled();
    expect(handlers.onCopy).toHaveBeenCalled();
    expect(handlers.onDelete).toHaveBeenCalled();
    expect(handlers.onMoveToTop).toHaveBeenCalled();
    expect(handlers.onMoveToBottom).toHaveBeenCalled();
  });
});
