import config from '@plone/volto/registry';
import { getDefaultLanguage, getIsMultilingual } from './multilingual';

const siteState = (data) => ({ site: { data } });

describe('multilingual', () => {
  beforeEach(() => {
    config.settings.isMultilingual = undefined;
    config.settings.defaultLanguage = undefined;
  });

  it('reads the multilingual flag from the backend site data', () => {
    config.settings.isMultilingual = false;
    expect(
      getIsMultilingual(siteState({ features: { multilingual: true } })),
    ).toBe(true);
  });

  it('falls back to the multilingual setting without site data', () => {
    config.settings.isMultilingual = true;
    expect(getIsMultilingual(siteState({}))).toBe(true);
    expect(getIsMultilingual({})).toBe(true);
  });

  it('reads the default language from the backend site data', () => {
    config.settings.defaultLanguage = 'fr';
    expect(
      getDefaultLanguage(siteState({ 'plone.default_language': 'de' })),
    ).toBe('de');
  });

  it('falls back to the setting, then to English', () => {
    config.settings.defaultLanguage = 'fr';
    expect(getDefaultLanguage(siteState({}))).toBe('fr');
    config.settings.defaultLanguage = undefined;
    expect(getDefaultLanguage({})).toBe('en');
  });
});
