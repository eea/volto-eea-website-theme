/**
 * Date helpers.
 *
 * Customized from @plone/volto (helpers/Utils/Date.js, same in Volto 17 and
 * 18) so that `formatDate` gives the same text on the server and in every
 * browser. Dates are rendered on the server and hydrated on the client, and
 * any difference makes React 18 throw the hydration away and re-render the
 * whole page on the client (refs #310410).
 *
 * Two things made the output depend on where the code runs:
 *
 * - Time zone: without `timeZone`, Intl uses the time zone of the Node
 *   server on SSR and the visitor's time zone in the browser, so a date close
 *   to midnight can be a different day. Dates are now formatted in
 *   `config.settings.dateTimeZone` (set by this theme), unless the caller
 *   passes its own `format.timeZone`.
 * - Locale data: for `en-gb` Node and Chrome write the short month of
 *   September as "Sept", Safari writes "Sep". The month is normalized to
 *   "Sep", like the other short English months.
 *
 * Volto 19 also added moment-style format tokens (`ll`, `lll`, `LLLL`, `L`,
 * `LT`) to `formatDate`. They are kept here so that customizing the helper
 * does not drop them when the project upgrades to Volto 19.
 */
import config from '@plone/volto/registry';

const SECOND = 1000;
const MINUTE = SECOND * 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;
const MONTH = DAY * 30;
const YEAR = DAY * 365; // ? is this safe or should it be more accurate

// moment-style format tokens → Intl.DateTimeFormat options (for backward compat)
const MOMENT_FORMAT_MAP = {
  ll: { year: 'numeric', month: 'short', day: 'numeric' },
  lll: {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  },
  LLLL: { dateStyle: 'full', timeStyle: 'short' },
  L: { year: 'numeric', month: '2-digit', day: '2-digit' },
  LT: { timeStyle: 'short' },
};

export const short_date_format = {
  // 12/9/2021
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
};

export const short_date_and_time_format = {
  // 12/9/21, 10:39 AM
  dateStyle: 'short',
  timeStyle: 'short',
};

export const long_date_format = {
  // Thursday, December 9, 2021 at 10:39 AM
  dateStyle: 'full',
  timeStyle: 'short',
};

export const toDate = (d) =>
  ['string', 'number'].includes(typeof d) ? new Date(d) : d;

/**
 * Month names that differ between JavaScript engines for the same locale,
 * mapped to the value every engine should render.
 */
const MONTH_NAME_FIXES = {
  Sept: 'Sep',
};

const normalizeParts = (parts) =>
  parts.map((part) =>
    part.type === 'month' && MONTH_NAME_FIXES[part.value]
      ? { ...part, value: MONTH_NAME_FIXES[part.value] }
      : part,
  );

/**
 * Friendly formatting for dates
 */
export function formatDate({
  date, // Date() or  '2022-01-03T19:26:08.999Z'
  format, // format object (Intl.DateTimeFormat options) or moment-style token string (e.g. 'll', 'lll', 'LLLL', 'L', 'LT')
  locale = 'en',
  long, // true if format should be in long readable form.
  includeTime, // true if short date format should include time
  formatToParts = false,
}) {
  date = toDate(date);
  // Resolve moment-style token strings to Intl format options
  if (typeof format === 'string') {
    if (process.env.NODE_ENV !== 'production' && !MOMENT_FORMAT_MAP[format]) {
      // eslint-disable-next-line no-console
      console.warn(
        `[formatDate] Unknown format token "${format}". Supported tokens: ${Object.keys(MOMENT_FORMAT_MAP).join(', ')}. Falling back to short_date_format.`,
      );
    }
    format = MOMENT_FORMAT_MAP[format] || short_date_format;
  }
  format = format
    ? format
    : long && !includeTime
      ? long_date_format
      : includeTime
        ? short_date_and_time_format
        : short_date_format;

  const timeZone = config.settings?.dateTimeZone;
  const formatter = new Intl.DateTimeFormat(
    locale,
    timeZone && !format.timeZone ? { ...format, timeZone } : format,
  );
  const parts = normalizeParts(formatter.formatToParts(date));
  return formatToParts
    ? parts
    : parts
        .map((part) => part.value)
        .join('')
        .replace(' ', ' ');
}

export function formatRelativeDate({
  date,
  locale = 'en',
  relativeTo,
  style = 'long', // long|short|narrow
  formatToParts = false,
}) {
  date = toDate(date);
  relativeTo = toDate(relativeTo || new Date());

  const deltaMiliTime = date.getTime() - relativeTo.getTime();
  const absDeltaMiliTime = Math.abs(deltaMiliTime);

  const deltaSeconds = absDeltaMiliTime / SECOND;
  const deltaMinutes = absDeltaMiliTime / MINUTE;
  const deltaHours = absDeltaMiliTime / HOUR;
  const deltaDays = absDeltaMiliTime / DAY;
  const deltaMonths = absDeltaMiliTime / MONTH;
  const deltaYears = absDeltaMiliTime / YEAR;
  const deltas = [
    deltaYears,
    deltaMonths,
    deltaDays,
    deltaHours,
    deltaMinutes,
    deltaSeconds,
  ];
  const pos = deltas.map(Math.round).findIndex((d) => d > 0);
  const tag = ['years', 'months', 'days', 'hours', 'minutes', 'seconds'][pos];

  const formatter = new Intl.RelativeTimeFormat(locale, {
    numeric: 'auto',
    style,
  });

  const v = Math.round(deltaMiliTime < 0 ? -1 * deltas[pos] : deltas[pos]);
  // console.log({ date, relativeTo, v });

  return isNaN(v)
    ? ''
    : formatToParts
      ? formatter.formatToParts(v, tag)
      : formatter.format(v, tag).replace(' ', ' '); // use "now" ?
}
