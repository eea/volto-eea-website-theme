jest.mock('@plone/volto/registry', () => ({
  __esModule: true,
  default: {
    settings: {
      apiPath: 'http://localhost:3000',
      internalApiPath: 'http://localhost:8080/eea',
      publicURL: 'https://www.eea.europa.eu',
    },
  },
}));

import { toApiPath } from './toApiPath';

describe('toApiPath', () => {
  it('passes path-form urls through unchanged', () => {
    expect(toApiPath('/eea/en/amenda.jpeg')).toBe('/eea/en/amenda.jpeg');
  });

  it('converts a dev backend url (internalApiPath origin) to its pathname', () => {
    expect(toApiPath('http://localhost:8080/eea/en/amenda.jpeg')).toBe(
      '/eea/en/amenda.jpeg',
    );
  });

  it('converts a production public url (publicURL origin) to its pathname', () => {
    expect(toApiPath('https://www.eea.europa.eu/eea/en/amenda.jpeg')).toBe(
      '/eea/en/amenda.jpeg',
    );
  });

  it('converts same-origin urls to their pathname', () => {
    // jsdom window.location is http://localhost
    expect(toApiPath('http://localhost/eea/en/amenda.jpeg')).toBe(
      '/eea/en/amenda.jpeg',
    );
  });

  it('returns null for external urls', () => {
    expect(toApiPath('https://cdn.example.com/img.jpg')).toBeNull();
  });

  it('returns null for protocol-relative urls', () => {
    expect(toApiPath('//cdn.example.com/img.jpg')).toBeNull();
  });

  it('returns null for empty or non-http values', () => {
    expect(toApiPath('')).toBeNull();
    expect(toApiPath(null)).toBeNull();
    expect(toApiPath(undefined)).toBeNull();
    expect(toApiPath('not a url')).toBeNull();
  });
});
