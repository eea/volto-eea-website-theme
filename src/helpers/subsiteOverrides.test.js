import config from '@plone/volto/registry';
import {
  getSubsitePath,
  shouldHideSubsiteFooter,
  shouldUseSubsiteMainLogo,
} from './subsiteOverrides';

const subsite = (path, extra = {}) => ({
  '@type': 'Subsite',
  '@id': `http://localhost:3000${path}`,
  ...extra,
});

const logo = { scales: { preview: { download: '/logo.png' } } };

describe('subsiteOverrides', () => {
  beforeEach(() => {
    config.settings.eea = {
      ...config.settings.eea,
      subsiteMainLogoPaths: [/^\/[a-z]{2}\/epanet$/],
      subsiteHideFooterPaths: [/^\/[a-z]{2}\/epanet$/],
    };
  });

  it('returns the subsite app path without trailing slash', () => {
    expect(getSubsitePath(subsite('/en/epanet'))).toBe('/en/epanet');
    expect(getSubsitePath(subsite('/en/epanet/'))).toBe('/en/epanet');
  });

  it('uses the subsite logo as main logo only on the hardcoded subsite', () => {
    expect(
      shouldUseSubsiteMainLogo(subsite('/en/epanet', { subsite_logo: logo })),
    ).toBe(true);
    expect(
      shouldUseSubsiteMainLogo(subsite('/en/epanet/', { subsite_logo: logo })),
    ).toBe(true);
    expect(
      shouldUseSubsiteMainLogo(subsite('/en/other', { subsite_logo: logo })),
    ).toBe(false);
    expect(
      shouldUseSubsiteMainLogo(
        subsite('/en/epanet-archive', { subsite_logo: logo }),
      ),
    ).toBe(false);
    expect(
      shouldUseSubsiteMainLogo(
        subsite('/en/about/epanet', { subsite_logo: logo }),
      ),
    ).toBe(false);
  });

  it('keeps the EEA logo when no subsite logo is uploaded', () => {
    expect(shouldUseSubsiteMainLogo(subsite('/en/epanet'))).toBe(false);
  });

  it('hides the footer content only on the hardcoded subsite', () => {
    expect(shouldHideSubsiteFooter(subsite('/en/epanet'))).toBe(true);
    expect(shouldHideSubsiteFooter(subsite('/en/other'))).toBe(false);
  });

  it('ignores missing or non-subsite data', () => {
    expect(shouldHideSubsiteFooter(undefined)).toBe(false);
    expect(shouldHideSubsiteFooter({})).toBe(false);
    expect(
      shouldHideSubsiteFooter({ '@type': 'Document', '@id': '/en/epanet' }),
    ).toBe(false);
  });
});
