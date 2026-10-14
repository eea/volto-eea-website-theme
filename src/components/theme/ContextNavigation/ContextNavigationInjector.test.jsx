import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import ContextNavigationInjector from './ContextNavigationInjector';

const ACTIONS = [
  {
    url: '/en/epanet/reports-letters',
    title: 'Navigation',
    children_sort_type: ['News Item'],
    children_sort_on: 'effective',
    children_sort_order: 'descending',
  },
];

jest.mock('react-redux', () => ({
  shallowEqual: (a, b) => a === b,
  useSelector: (selector) =>
    selector({
      actions: { actions: { context_navigation: global.__navActions } },
    }),
}));

jest.mock('@plone/volto/helpers/Url/Url', () => ({
  __esModule: true,
  flattenToAppURL: (url) => url?.replace('http://localhost:3000', ''),
  getBaseUrl: (pathname) => pathname,
}));

jest.mock(
  '@eeacms/volto-eea-website-theme/components/manage/Blocks/ContextNavigation/variations/Accordion',
  () => ({
    __esModule: true,
    default: ({ params }) => (
      <div data-testid="nav" data-params={JSON.stringify(params)} />
    ),
  }),
);

const PAGE_PATH = '/en/epanet/reports-letters/plenary-meetings';

const renderInjector = (content = { '@type': 'Document' }) =>
  render(
    <ContextNavigationInjector
      content={content}
      location={{ pathname: PAGE_PATH }}
    />,
  );

const params = (getByTestId) =>
  JSON.parse(getByTestId('nav').getAttribute('data-params'));

describe('ContextNavigationInjector children sort', () => {
  it('forwards the action children sort fields to the navigation request', () => {
    global.__navActions = ACTIONS;
    const { getByTestId } = renderInjector();

    expect(params(getByTestId)).toMatchObject({
      children_sort_type: ['News Item'],
      children_sort_on: 'effective',
      children_sort_order: 'descending',
    });
  });

  it('omits the children sort params when the action does not set them', () => {
    global.__navActions = [
      { url: '/en/epanet/reports-letters', title: 'Navigation' },
    ];
    const { getByTestId } = renderInjector();
    const result = params(getByTestId);

    expect(result).not.toHaveProperty('children_sort_type');
    expect(result).not.toHaveProperty('children_sort_on');
    expect(result).not.toHaveProperty('children_sort_order');
  });
});

describe('ContextNavigationInjector content guard', () => {
  beforeEach(() => {
    global.__navActions = ACTIONS;
  });

  it('renders while the content has no @id yet', () => {
    const { queryByTestId } = renderInjector({ '@type': 'Document' });

    expect(queryByTestId('nav')).toBeInTheDocument();
  });

  it('renders when the content matches the current page', () => {
    const { queryByTestId } = renderInjector({
      '@type': 'Document',
      '@id': `http://localhost:3000${PAGE_PATH}`,
    });

    expect(queryByTestId('nav')).toBeInTheDocument();
  });

  it('tolerates a trailing slash difference', () => {
    const { queryByTestId } = renderInjector({
      '@type': 'Document',
      '@id': `http://localhost:3000${PAGE_PATH}/`,
    });

    expect(queryByTestId('nav')).toBeInTheDocument();
  });

  it('suppresses while the content still belongs to the previous page', () => {
    const { queryByTestId } = renderInjector({
      '@type': 'Document',
      '@id': 'http://localhost:3000/en/epanet/our-group',
    });

    expect(queryByTestId('nav')).not.toBeInTheDocument();
  });

  it('does not suppress when the @id is not an app path', () => {
    const { queryByTestId } = renderInjector({
      '@type': 'Document',
      '@id': 'http://backend:8080/Plone/en/epanet/our-group',
    });

    expect(queryByTestId('nav')).toBeInTheDocument();
  });
});
