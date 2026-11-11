import { getLegacyRedirect, buildLegacyRedirect } from './legacyRoutes';

const enabled = { views: true, search: '/en/advanced-search' };

describe('getLegacyRedirect', () => {
  it('does nothing when the site did not opt in', () => {
    expect(getLegacyRedirect('/en/@@search', undefined)).toBe(null);
    expect(getLegacyRedirect('/en/about/view', {})).toBe(null);
    expect(
      getLegacyRedirect('/en/about/view', { views: false, search: null }),
    ).toBe(null);
  });

  it('redirects legacy Plone search routes', () => {
    expect(getLegacyRedirect('/@@search', enabled)).toBe('/en/advanced-search');
    expect(getLegacyRedirect('/search', enabled)).toBe('/en/advanced-search');
    expect(getLegacyRedirect('/fr/@@search/', enabled)).toBe(
      '/en/advanced-search',
    );
    expect(
      getLegacyRedirect('/en/europe-environment-2025/@@search', enabled),
    ).toBe('/en/advanced-search');
    expect(getLegacyRedirect('/en/search', enabled)).toBe(
      '/en/advanced-search',
    );
  });

  it('leaves section pages that merely end in /search alone', () => {
    // getBaseUrl strips `/search`, so these render the parent section today
    expect(getLegacyRedirect('/en/newsroom/search', enabled)).toBe(null);
    expect(getLegacyRedirect('/en/analysis/search', enabled)).toBe(null);
  });

  it('redirects legacy Plone view and file routes to the parent', () => {
    expect(getLegacyRedirect('/en/about/view', enabled)).toBe('/en/about');
    expect(getLegacyRedirect('/en/about/@@view', enabled)).toBe('/en/about');
    expect(getLegacyRedirect('/en/about/folder_listing', enabled)).toBe(
      '/en/about',
    );
    expect(getLegacyRedirect('/en/about/at_download/file', enabled)).toBe(
      '/en/about',
    );
    expect(
      getLegacyRedirect('/en/analysis/publications/report/view', enabled),
    ).toBe('/en/analysis/publications/report');
  });

  it('leaves content, the search target and the API alone', () => {
    expect(getLegacyRedirect('/en/about', enabled)).toBe(null);
    expect(getLegacyRedirect('/en/advanced-search', enabled)).toBe(null);
    expect(getLegacyRedirect('/en/about/overview', enabled)).toBe(null);
    expect(getLegacyRedirect('/++api++/en/@@search', enabled)).toBe(null);
    expect(getLegacyRedirect(undefined, enabled)).toBe(null);
  });

  it('honours views being disabled while search is enabled', () => {
    const searchOnly = { views: false, search: '/en/advanced-search' };
    expect(getLegacyRedirect('/en/@@search', searchOnly)).toBe(
      '/en/advanced-search',
    );
    expect(getLegacyRedirect('/en/about/view', searchOnly)).toBe(null);
  });
});

describe('buildLegacyRedirect', () => {
  it('carries the query string over', () => {
    expect(buildLegacyRedirect('/en/search', 'q=pfas&sort=date', enabled)).toBe(
      '/en/advanced-search?q=pfas&sort=date',
    );
  });

  it('maps Plone SearchableText to q', () => {
    expect(
      buildLegacyRedirect('/en/@@search', 'SearchableText=pfas', enabled),
    ).toBe('/en/advanced-search?q=pfas');
  });

  it('returns the bare target without a query string', () => {
    expect(buildLegacyRedirect('/en/about/view', '', enabled)).toBe(
      '/en/about',
    );
  });

  it('returns null for content routes', () => {
    expect(buildLegacyRedirect('/en/about', 'q=pfas', enabled)).toBe(null);
  });
});
