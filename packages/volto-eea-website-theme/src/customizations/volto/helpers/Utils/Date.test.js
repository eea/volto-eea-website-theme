import config from '@plone/volto/registry';
import { formatDate, formatRelativeDate } from './Date';

const cardFormat = { year: 'numeric', month: 'short', day: '2-digit' };

describe('formatDate', () => {
  let dateTimeZone;

  beforeEach(() => {
    dateTimeZone = config.settings.dateTimeZone;
    config.settings.dateTimeZone = 'Europe/Copenhagen';
  });

  afterEach(() => {
    config.settings.dateTimeZone = dateTimeZone;
  });

  it('writes September as "Sep", the same as Safari', () => {
    expect(
      formatDate({
        date: '2026-09-14T10:00:00+02:00',
        format: cardFormat,
        locale: 'en-gb',
      }),
    ).toBe('14 Sep 2026');
  });

  it('normalizes the month in formatToParts too', () => {
    const parts = formatDate({
      date: '2026-09-14T10:00:00+02:00',
      format: cardFormat,
      locale: 'en-gb',
      formatToParts: true,
    });
    expect(parts.find((p) => p.type === 'month').value).toBe('Sep');
  });

  it('leaves the other months and locales alone', () => {
    expect(
      formatDate({
        date: '2026-10-27T15:10:00+01:00',
        format: cardFormat,
        locale: 'en-gb',
      }),
    ).toBe('27 Oct 2026');
    expect(
      formatDate({
        date: '2026-09-14T10:00:00+02:00',
        format: { year: 'numeric', month: 'long', day: 'numeric' },
        locale: 'en-gb',
      }),
    ).toBe('14 September 2026');
  });

  it('formats in the configured time zone, not the runtime one', () => {
    // 23:30 UTC is already the next day in Copenhagen
    expect(
      formatDate({
        date: '2026-10-27T23:30:00Z',
        format: cardFormat,
        locale: 'en-gb',
      }),
    ).toBe('28 Oct 2026');
  });

  it('lets the caller pick another time zone', () => {
    expect(
      formatDate({
        date: '2026-10-27T23:30:00Z',
        format: { ...cardFormat, timeZone: 'UTC' },
        locale: 'en-gb',
      }),
    ).toBe('27 Oct 2026');
  });

  it('falls back to the runtime time zone without dateTimeZone', () => {
    config.settings.dateTimeZone = undefined;
    const date = new Date('2026-10-27T23:30:00Z');
    const text = formatDate({ date, format: cardFormat, locale: 'en-gb' });
    const runtime = new Intl.DateTimeFormat('en-gb', cardFormat).format(date);
    expect(text).toBe(runtime);
  });

  it('keeps the default short format', () => {
    expect(
      formatDate({ date: '2026-09-14T10:00:00+02:00', locale: 'en' }),
    ).toBe('9/14/2026');
  });

  it('replaces the narrow no-break space in times, like Volto', () => {
    const text = formatDate({
      date: '2026-09-14T10:00:00+02:00',
      includeTime: true,
      locale: 'en',
    });
    expect(text).not.toContain(' ');
    expect(text).toBe('9/14/26, 10:00 AM');
  });

  it('resolves the moment-style tokens added in Volto 19', () => {
    const date = '2026-01-03T19:26:08.999Z';
    expect(formatDate({ date, format: 'll', locale: 'en-gb' })).toBe(
      '3 Jan 2026',
    );
    expect(formatDate({ date, format: 'L', locale: 'en-gb' })).toBe(
      '03/01/2026',
    );
    // 19:26 UTC is 20:26 in Copenhagen
    expect(formatDate({ date, format: 'LT', locale: 'en-gb' })).toBe('20:26');
    // the layout of dateStyle: 'full' is up to the ICU data, so no exact match
    const full = formatDate({ date, format: 'LLLL', locale: 'en-gb' });
    expect(full).toContain('Saturday');
    expect(full).toContain('3 January 2026');
    expect(full).toContain('20:26');
  });

  it('formats a token in the configured time zone too', () => {
    expect(
      formatDate({
        date: '2026-10-27T23:30:00Z',
        format: 'L',
        locale: 'en-gb',
      }),
    ).toBe('28/10/2026');
  });

  it('falls back to the short format on an unknown token', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    expect(
      formatDate({
        date: '2026-09-14T10:00:00+02:00',
        format: 'unknown',
        locale: 'en-gb',
      }),
    ).toBe('14/09/2026');
    expect(warn).toHaveBeenCalledTimes(1);
    warn.mockRestore();
  });
});

describe('formatRelativeDate', () => {
  it('is unchanged', () => {
    expect(
      formatRelativeDate({
        date: '2026-09-13T10:00:00Z',
        relativeTo: '2026-09-14T10:00:00Z',
        locale: 'en',
      }),
    ).toBe('yesterday');
  });
});
