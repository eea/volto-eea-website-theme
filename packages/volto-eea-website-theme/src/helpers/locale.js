/**
 * Locale negotiation helpers for server-side rendering.
 *
 * Volto 19 provides these in `@plone/volto/helpers/Locale/Locale`. Keep a
 * local copy until Volto 18 is no longer supported, so the same add-on build
 * works on both (see the server.jsx customization).
 */
import locale from 'locale';
import {
  toBackendLang,
  toReactIntlLang,
} from '@plone/volto/helpers/Utils/Utils';

/**
 * Language the UI strings are written in. It is the preferred fallback,
 * because it renders correctly even without a loaded catalog.
 */
const SOURCE_LANGUAGE = 'en';

/**
 * Build the matcher of the locales the server can render.
 *
 * Only the languages in `supportedLanguages` have a catalog loaded on the
 * server, so the matcher must never return any other language. When nothing
 * matches, it falls back to English if it is supported, otherwise to the
 * first supported language.
 *
 * @param {string[]} supportedLanguages `config.settings.supportedLanguages`.
 * @returns {locale.Locales} Matcher to pass to `negotiateLocale`.
 */
export function getSupportedLocales(supportedLanguages = []) {
  const languages = (supportedLanguages || []).filter(Boolean);
  const fallback =
    languages.find((lang) => toBackendLang(lang) === SOURCE_LANGUAGE) ||
    languages[0] ||
    SOURCE_LANGUAGE;
  // An empty array is truthy, and `Locales` would parse it as one blank locale.
  return new locale.Locales(languages.length ? languages : undefined, fallback);
}

/**
 * Pick the best supported locale for a language preference.
 *
 * @param {?string} preference An `Accept-Language` header value, an
 *   `I18N_LANGUAGE` cookie value or a content language token. Empty means no
 *   preference.
 * @param {locale.Locales} supported Matcher built by `getSupportedLocales`.
 * @returns {string} The locale in `react-intl` format, for example `pt-BR`.
 */
export function negotiateLocale(preference, supported) {
  const best = new locale.Locales(preference || undefined).best(supported);
  return toReactIntlLang(String(best));
}

/**
 * Decide whether the response must switch to the content language.
 *
 * The switch is needed when the content locale differs from any locale the
 * request came with: the locale negotiated from the request (which the page
 * starts rendering in) and the one of the `I18N_LANGUAGE` cookie or site
 * default (which the cookie must follow).
 *
 * @param {?string} contentLang Language token of the content being rendered.
 * @param {Array<?string>} requestLocales Locales the request came with. An
 *   empty entry always requires the switch.
 * @param {locale.Locales} supported Matcher built by `getSupportedLocales`.
 * @returns {?string} The locale to switch to, or `null` when every request
 *   locale already matches the content.
 */
export function resolveContentLocale(contentLang, requestLocales, supported) {
  const contentLocale = negotiateLocale(contentLang, supported);
  const matches = (requestLocale) =>
    !!requestLocale &&
    toBackendLang(requestLocale) === toBackendLang(contentLocale);
  return requestLocales.every(matches) ? null : contentLocale;
}
