import config from '@plone/volto/registry';
import {
  isSubsiteFooterHidden,
  isSubsiteLogoMain,
  matchesSubsitePaths,
} from './subsiteOverrides';

const EPANET = /^\/[a-z]{2}\/epanet$/;

const logo = { scales: { preview: { download: '/logo.png' } } };

describe('subsiteOverrides', () => {
  beforeEach(() => {
    config.settings.eea = {
      ...config.settings.eea,
      subsiteMainLogoPaths: [EPANET],
      subsiteHideFooterPaths: [EPANET],
    };
  });

  it('matches the hardcoded subsite path', () => {
    const subsite = {
      '@type': 'Subsite',
      '@id': 'http://localhost:3000/en/epanet',
    };
    expect(matchesSubsitePaths(subsite, 'subsiteMainLogoPaths')).toBe(true);
    expect(
      matchesSubsitePaths(
        { ...subsite, '@id': 'http://localhost:3000/en/epanet/' },
        'subsiteMainLogoPaths',
      ),
    ).toBe(true);
  });

  it('does not match other subsites or missing data', () => {
    expect(
      matchesSubsitePaths(
        { '@type': 'Subsite', '@id': 'http://localhost:3000/en/other' },
        'subsiteMainLogoPaths',
      ),
    ).toBe(false);
    expect(
      matchesSubsitePaths(
        { '@type': 'Subsite', '@id': 'http://localhost:3000/en/x/epanet' },
        'subsiteMainLogoPaths',
      ),
    ).toBe(false);
    expect(matchesSubsitePaths(undefined, 'subsiteMainLogoPaths')).toBe(false);
    expect(matchesSubsitePaths({}, 'subsiteMainLogoPaths')).toBe(false);
    expect(
      matchesSubsitePaths(
        { '@type': 'Subsite', '@id': 'http://localhost:3000/en/epanet' },
        'unknownSetting',
      ),
    ).toBe(false);
  });

  it('replaces the main logo only when a subsite logo is uploaded', () => {
    const subsite = {
      '@type': 'Subsite',
      '@id': 'http://localhost:3000/en/epanet',
    };
    expect(isSubsiteLogoMain(subsite)).toBe(false);
    expect(isSubsiteLogoMain({ ...subsite, subsite_logo: logo })).toBe(true);
  });

  it('hides the footer content for the hardcoded subsite', () => {
    expect(
      isSubsiteFooterHidden({
        '@type': 'Subsite',
        '@id': 'http://localhost:3000/en/epanet',
      }),
    ).toBe(true);
    expect(
      isSubsiteFooterHidden({
        '@type': 'Subsite',
        '@id': 'http://localhost:3000/en/other',
      }),
    ).toBe(false);
  });
});
