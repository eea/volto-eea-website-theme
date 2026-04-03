/**
 * RenderGroups — unit tests
 *
 * Volto 17 / 18 dual-support notes
 * ---------------------------------
 * The EEA change is a single-line tweak on line 80:
 *   `{this.props.group.title || this.props.group.groupname}`
 * instead of showing only `groupname`.
 *
 * V17 and V18 upstream are byte-for-byte identical, so this shadow is
 * compatible with both versions without any rebase.
 *
 * The `@plone/volto/components` barrel is mocked to prevent the chain:
 *   TranslationObject.jsx → store.js → @root/reducers
 * that cannot be resolved in this Jest environment.  The previous snapshot
 * test used `react-test-renderer` which produced a snapshot that contained
 * the full icon SVG tree; the new tests use @testing-library/react and
 * assert on the actual EEA-specific behavior instead.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-intl-redux';

import RenderGroups from './RenderGroups';

jest.mock('@plone/volto/components', () => ({
  // RenderGroups.jsx uses only Icon from the barrel
  Icon: () => null,
}));

const mockStore = configureStore();

const makeStore = () =>
  mockStore({
    intl: { locale: 'en', messages: {} },
  });

const testRoles = [
  { '@id': 'http://localhost:8080/Plone/@roles/Member', id: 'Member' },
  { '@id': 'http://localhost:8080/Plone/@roles/Reader', id: 'Reader' },
  { '@id': 'http://localhost:8080/Plone/@roles/Manager', id: 'Manager' },
];

describe('RenderGroups — EEA: title || groupname display', () => {
  it('shows the group title when available (EEA change)', () => {
    const group = {
      groupname: 'editors',
      title: 'Site Editors',
      roles: [],
    };
    render(
      <Provider store={makeStore()}>
        <RenderGroups group={group} roles={testRoles} onDelete={() => {}} />
      </Provider>,
    );
    // EEA customization: title takes precedence over groupname
    expect(screen.getByText('Site Editors')).toBeInTheDocument();
  });

  it('falls back to groupname when title is absent', () => {
    const group = {
      groupname: 'Administrators',
      title: '',
      roles: ['Manager'],
    };
    render(
      <Provider store={makeStore()}>
        <RenderGroups group={group} roles={testRoles} onDelete={() => {}} />
      </Provider>,
    );
    expect(screen.getByText('Administrators')).toBeInTheDocument();
  });

  it('falls back to groupname when title is undefined', () => {
    const group = {
      groupname: 'Reviewers',
      // no title key at all
      roles: [],
    };
    render(
      <Provider store={makeStore()}>
        <RenderGroups group={group} roles={testRoles} onDelete={() => {}} />
      </Provider>,
    );
    expect(screen.getByText('Reviewers')).toBeInTheDocument();
  });

  it('renders a checkbox for each role', () => {
    const group = {
      groupname: 'Administrators',
      title: 'Administrators',
      roles: ['Manager'],
    };
    const { container } = render(
      <Provider store={makeStore()}>
        <RenderGroups group={group} roles={testRoles} onDelete={() => {}} />
      </Provider>,
    );
    // One checkbox per role
    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    expect(checkboxes).toHaveLength(testRoles.length);
  });

  it('checks the checkbox for roles the group already has', () => {
    const group = {
      groupname: 'managers',
      title: 'Managers',
      roles: ['Manager'],
    };
    const { container } = render(
      <Provider store={makeStore()}>
        <RenderGroups group={group} roles={testRoles} onDelete={() => {}} />
      </Provider>,
    );
    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    // Member → unchecked, Reader → unchecked, Manager → checked
    expect(checkboxes[0]).not.toBeChecked();
    expect(checkboxes[1]).not.toBeChecked();
    expect(checkboxes[2]).toBeChecked();
  });
});
