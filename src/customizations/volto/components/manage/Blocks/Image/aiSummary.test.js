/**
 * aiSummary helpers — unit tests (issue #305021).
 */

import { hasAiMarkers, pickAlt, stripAiMarkers } from './aiSummary';

describe('stripAiMarkers', () => {
  it('returns the inner text of marker-wrapped summaries', () => {
    expect(
      stripAiMarkers(
        '[AI Generated description] A red house. [End of AI Generated description]',
      ),
    ).toBe('A red house.');
  });

  it('trims whitespace around the inner text', () => {
    expect(
      stripAiMarkers(
        '[AI Generated description]   \n  A red house.  \n  [End of AI Generated description]',
      ),
    ).toBe('A red house.');
  });

  it('returns trimmed raw text when markers are absent (human-edited)', () => {
    expect(stripAiMarkers('  A human alt text. ')).toBe('A human alt text.');
  });

  it('returns empty string for empty input', () => {
    expect(stripAiMarkers('')).toBe('');
    expect(stripAiMarkers(null)).toBe('');
    expect(stripAiMarkers(undefined)).toBe('');
  });

  it('removes a stray start marker (malformed text)', () => {
    expect(stripAiMarkers('[AI Generated description] A red house.')).toBe(
      'A red house.',
    );
  });

  it('removes a stray end marker (malformed text)', () => {
    expect(
      stripAiMarkers('A red house. [End of AI Generated description]'),
    ).toBe('A red house.');
  });

  it('keeps only the inner text of a well-formed pair with trailing junk', () => {
    expect(
      stripAiMarkers(
        '[AI Generated description] A red house. [End of AI Generated description] extra',
      ),
    ).toBe('A red house.');
  });

  it('collapses internal whitespace runs into single spaces', () => {
    expect(
      stripAiMarkers(
        '[AI Generated description] A red   house.\n\nWith a newline. [End of AI Generated description]',
      ),
    ).toBe('A red house. With a newline.');
  });

  it('handles multi-line inner text', () => {
    expect(
      stripAiMarkers(
        '[AI Generated description] Line one.\nLine two. [End of AI Generated description]',
      ),
    ).toBe('Line one. Line two.');
  });
});

describe('hasAiMarkers', () => {
  it('detects a complete marker pair', () => {
    expect(
      hasAiMarkers(
        '[AI Generated description] x [End of AI Generated description]',
      ),
    ).toBe(true);
  });

  it('detects a single stray marker', () => {
    expect(hasAiMarkers('[AI Generated description] x')).toBe(true);
  });

  it('returns false for marker-less or empty text', () => {
    expect(hasAiMarkers('plain text')).toBe(false);
    expect(hasAiMarkers('')).toBe(false);
    expect(hasAiMarkers(null)).toBe(false);
  });
});

describe('pickAlt', () => {
  it('prefers the existing block alt', () => {
    expect(pickAlt('mine', 'ai', 'title')).toBe('mine');
  });

  it('falls back to the AI suggestion', () => {
    expect(pickAlt('', 'ai', 'title')).toBe('ai');
    expect(pickAlt(undefined, 'ai', 'title')).toBe('ai');
  });

  it('falls back to the title last', () => {
    expect(pickAlt('', '', 'title')).toBe('title');
    expect(pickAlt(undefined, undefined, 'title')).toBe('title');
  });

  it('returns empty string when nothing is available', () => {
    expect(pickAlt('', '', '')).toBe('');
    expect(pickAlt(undefined, undefined, undefined)).toBe('');
  });
});
