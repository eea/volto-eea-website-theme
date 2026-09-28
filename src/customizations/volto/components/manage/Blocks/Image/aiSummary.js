/**
 * Helpers for AI-generated image alt suggestions (issue #305021).
 *
 * The Image content type's `llm_summary` field wraps AI-generated text in
 * literal markers so editors can tell AI text from human text:
 *
 *   [AI Generated description] <text> [End of AI Generated description]
 *
 * After human edits the markers may be removed (adopted text) — the
 * functions below must handle both shapes. The markers must NEVER reach a
 * published `alt` attribute, including malformed/partial marker tokens.
 */

const MARKER_START = '[AI Generated description]';
const MARKER_END = '[End of AI Generated description]';
const WRAPPED_RE =
  /\[AI Generated description\]\s*([\s\S]*?)\s*\[End of AI Generated description\]/;
const ANY_MARKER_RE =
  /\[AI Generated description\]|\[End of AI Generated description\]/;

/**
 * Strip the AI markers from a summary and return the inner alt text.
 *
 * - Marker-wrapped text: returns the trimmed inner text.
 * - Marker-less non-empty text (human-edited / legacy): returned trimmed.
 * - Malformed/partial marker tokens are removed so they can never leak
 *   into a published `alt` attribute.
 * - Empty / null / undefined: returns ''.
 *
 * @param {string} text raw llm_summary value
 * @returns {string} marker-free text, or ''
 */
export function stripAiMarkers(text) {
  if (!text) return '';
  let s = String(text);
  const match = s.match(WRAPPED_RE);
  if (match) s = match[1];
  // Defensive: drop any leftover (malformed/partial) marker tokens.
  s = s.split(MARKER_START).join(' ').split(MARKER_END).join(' ');
  return s.replace(/\s+/g, ' ').trim();
}

/**
 * Whether the summary still carries AI markers (i.e. is not yet adopted).
 *
 * @param {string} text raw llm_summary value
 * @returns {boolean}
 */
export function hasAiMarkers(text) {
  return Boolean(text) && ANY_MARKER_RE.test(String(text));
}

/**
 * Alt fallback chain (issue #305021): the block's existing alt wins, then
 * the AI suggestion, then the Image object's title (often a raw filename),
 * then empty.
 *
 * @param {string} existingAlt current block alt
 * @param {string} aiAlt marker-stripped AI summary suggestion
 * @param {string} title Image object title
 * @returns {string}
 */
export function pickAlt(existingAlt, aiAlt, title) {
  return existingAlt || aiAlt || title || '';
}
