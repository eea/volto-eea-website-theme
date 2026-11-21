import languages from '@plone/volto/constants/Languages.cjs';
import { toReactIntlLang } from '@plone/volto/helpers/Utils/Utils';
import {
  getSupportedLocales,
  negotiateLocale,
  resolveContentLocale,
} from './locale';

// Ported from Volto 19 helpers/Locale/Locale.test.ts, plus the EEA case that
// broke the server.jsx customization (browser language outside the site's
// supportedLanguages).

const allLanguages = Object.keys(languages);
const codes = (supported) => Array.from(supported, (l) => l.code);

describe('getSupportedLocales', () => {
  it('contains only the supported languages', () => {
    expect(codes(getSupportedLocales(['pt-br', 'de']))).toEqual([
      'pt-br',
      'de',
    ]);
  });

  it('falls back to English when it is supported', () => {
    expect(getSupportedLocales(['ca', 'de', 'en']).default?.code).toBe('en');
  });

  it('falls back to the first supported language without English', () => {
    expect(getSupportedLocales(['pt-br']).default?.code).toBe('pt-br');
  });

  it('falls back to English when the setting is missing or empty', () => {
    expect(codes(getSupportedLocales(undefined))).toEqual([]);
    expect(getSupportedLocales(undefined).default?.code).toBe('en');
    expect(getSupportedLocales([]).default?.code).toBe('en');
  });
});

describe('negotiateLocale', () => {
  const supported = getSupportedLocales(['en', 'de', 'pt-br']);

  it.each([
    ['en-US', 'en'],
    ['de-AT', 'de'],
    ['pt-BR', 'pt-BR'],
    ['pt_BR', 'pt-BR'],
  ])('maps %s to %s', (header, expected) => {
    expect(negotiateLocale(header, supported)).toBe(expected);
  });

  it('honours quality weights', () => {
    expect(negotiateLocale('en;q=0.5,de;q=0.9', supported)).toBe('de');
  });

  it('falls back to English when nothing matches', () => {
    expect(negotiateLocale('fr-FR,fr;q=0.9', supported)).toBe('en');
  });

  it.each([undefined, null, ''])('returns the fallback for %s', (pref) => {
    expect(negotiateLocale(pref, supported)).toBe('en');
  });

  it('only returns locales whose catalog is loaded', () => {
    const supportedLanguages = ['pt-br', 'de'];
    const catalogs = supportedLanguages.map(toReactIntlLang);
    const matcher = getSupportedLocales(supportedLanguages);
    for (const lang of allLanguages) {
      expect(catalogs).toContain(negotiateLocale(lang, matcher));
    }
  });
});

describe('resolveContentLocale', () => {
  const supported = getSupportedLocales(['en', 'de', 'pt-br']);

  it('returns null when every request locale matches the content', () => {
    expect(resolveContentLocale('de', ['de', 'de'], supported)).toBeNull();
    expect(resolveContentLocale('pt-br', ['pt_BR'], supported)).toBeNull();
  });

  it('switches when any request locale differs or is missing', () => {
    expect(resolveContentLocale('de', ['de', 'en'], supported)).toBe('de');
    expect(resolveContentLocale('de', ['de', null], supported)).toBe('de');
  });

  it('maps an unsupported content language to the fallback', () => {
    expect(resolveContentLocale('fr', ['de'], supported)).toBe('en');
    expect(resolveContentLocale('fr', ['en'], supported)).toBeNull();
  });
});

describe('server-side rendering locale', () => {
  // Mirrors the server.jsx customization.
  const render = ({
    supportedLanguages,
    siteDefault,
    contentLang,
    header,
    cookie,
  }) => {
    const supported = getSupportedLocales(supportedLanguages);
    const lang = negotiateLocale(cookie || header, supported);
    const initialLang = cookie || siteDefault || header;
    const newLang = resolveContentLocale(
      contentLang,
      [lang, negotiateLocale(initialLang, supported)],
      supported,
    );
    return newLang
      ? { locale: newLang, cookie: newLang }
      : { locale: lang, cookie };
  };

  it('renders English content in English for a German browser on an English-only site', () => {
    // The browser language is not in supportedLanguages, so it must never
    // become the render locale (there is no catalog loaded for it).
    expect(
      render({
        supportedLanguages: ['en'],
        siteDefault: 'en',
        contentLang: 'en',
        header: 'de-DE,de;q=0.9',
      }).locale,
    ).toBe('en');
  });

  it('switches to the content language for a browser in another supported language', () => {
    expect(
      render({
        supportedLanguages: ['en', 'de'],
        siteDefault: 'en',
        contentLang: 'en',
        header: 'de-DE',
      }),
    ).toEqual({ locale: 'en', cookie: 'en' });
  });

  it('updates a stale cookie to the content language', () => {
    expect(
      render({
        supportedLanguages: ['en', 'de', 'pt-br'],
        siteDefault: 'en',
        contentLang: 'pt-br',
        cookie: 'de',
      }),
    ).toEqual({ locale: 'pt-BR', cookie: 'pt-BR' });
  });

  it('does not switch when the request already matches the content', () => {
    expect(
      render({
        supportedLanguages: ['en', 'de'],
        siteDefault: 'en',
        contentLang: 'en',
        header: 'en-US',
      }),
    ).toEqual({ locale: 'en', cookie: undefined });
  });
});
