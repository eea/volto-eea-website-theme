import {
  getLegacyRedirect,
  buildLegacyRedirect,
  isLegacyGone,
} from './legacyRoutes';

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
    expect(getLegacyRedirect('/en/about/folder_contents', enabled)).toBe(
      '/en/about',
    );
    expect(getLegacyRedirect('/en/topics/folder_contents/', enabled)).toBe(
      '/en/topics',
    );
    expect(getLegacyRedirect('/en/about/at_download/file', enabled)).toBe(
      '/en/about',
    );
    expect(
      getLegacyRedirect('/en/analysis/publications/report/view', enabled),
    ).toBe('/en/analysis/publications/report');
  });

  it('leaves the Volto folder contents route alone', () => {
    // `/contents` is a Volto route (routes.js), unlike Plone's /folder_contents
    expect(getLegacyRedirect('/en/about/contents', enabled)).toBe(null);
  });

  it('does not treat gone paths as view redirects', () => {
    expect(getLegacyRedirect('/RSS', enabled)).toBe(null);
    expect(getLegacyRedirect('/atom.xml', enabled)).toBe(null);
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

describe('isLegacyGone', () => {
  const gone = { gone: ['/RSS', '/atom.xml', '/mail_password_form'] };

  it('does nothing when the site did not opt in', () => {
    expect(isLegacyGone('/RSS', undefined)).toBe(false);
    expect(isLegacyGone('/RSS', {})).toBe(false);
    expect(isLegacyGone('/RSS', { gone: [] })).toBe(false);
  });

  it('matches the listed paths exactly', () => {
    expect(isLegacyGone('/RSS', gone)).toBe(true);
    expect(isLegacyGone('/atom.xml', gone)).toBe(true);
    expect(isLegacyGone('/mail_password_form', gone)).toBe(true);
  });

  it('matches the language prefixed form and a trailing slash', () => {
    expect(isLegacyGone('/en/mail_password_form', gone)).toBe(true);
    expect(isLegacyGone('/RSS/', gone)).toBe(true);
  });

  it('leaves everything else alone', () => {
    expect(isLegacyGone('/en/about', gone)).toBe(false);
    expect(isLegacyGone('/en/newsroom/RSS', gone)).toBe(false);
    expect(isLegacyGone('/++api++/RSS', gone)).toBe(false);
    expect(isLegacyGone(undefined, gone)).toBe(false);
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
