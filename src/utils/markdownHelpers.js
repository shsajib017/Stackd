import { colors, fontSizes, spacing } from '../config/theme';

/**
 * Strips markdown syntax from a string, returning plain text.
 * @param {string} text - Raw markdown string.
 * @returns {string} Plain text without markdown formatting.
 */
export const stripMarkdown = (text = '') => {
  if (!text) return '';
  return text
    .replace(/#{1,6}\s?/g, '')
    .replace(/\*{1,3}(.*?)\*{1,3}/g, '$1')
    .replace(/_{1,3}(.*?)_{1,3}/g, '$1')
    .replace(/`{1,3}(.*?)`{1,3}/gs, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^\s*[-*+]\s/gm, '')
    .replace(/^\s*\d+\.\s/gm, '')
    .replace(/^\s*>\s?/gm, '')
    .replace(/---+/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

/**
 * Truncates a markdown string to a max length and appends ellipsis.
 * @param {string} text - Input text.
 * @param {number} maxLength - Maximum character count.
 * @returns {string} Truncated text.
 */
export const truncateText = (text = '', maxLength = 120) => {
  const clean = stripMarkdown(text);
  if (clean.length <= maxLength) return clean;
  return `${clean.slice(0, maxLength).trimEnd()}…`;
};

/**
 * Counts words in a markdown string.
 */
export const getWordCount = (text = '') => {
  const clean = stripMarkdown(text);
  if (!clean) return 0;
  return clean.split(/\s+/).filter(Boolean).length;
};

/**
 * Calculates estimated reading time in minutes (based on 200 wpm).
 */
export const getReadingTime = (wordCount) => {
  return Math.max(1, Math.ceil(wordCount / 200));
};

/**
 * Formats relative timestamp for saved notes.
 */
export const getSavedAgoText = (timestamp) => {
  if (!timestamp) return null;
  const diffSec = Math.floor((Date.now() - timestamp) / 1000);
  if (diffSec < 30) return 'Saved just now';
  const mins = Math.floor(diffSec / 60);
  if (mins <= 1) return 'Saved 1 min ago';
  if (mins < 60) return `Saved ${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  return hrs === 1 ? 'Saved 1 hr ago' : `Saved ${hrs} hrs ago`;
};

export const markdownStyles = {
  body: { color: colors.textPrimary, fontSize: fontSizes.sm + 1, lineHeight: 22 },
  heading1: { fontSize: fontSizes.xl, fontWeight: '800', color: colors.primary, marginBottom: spacing.xs },
  heading2: { fontSize: fontSizes.lg, fontWeight: '700', color: colors.primary, marginBottom: spacing.xs },
  hr: { backgroundColor: `${colors.textTertiary}30`, height: 1, marginVertical: spacing.sm },
};

export default {
  stripMarkdown,
  truncateText,
  getWordCount,
  getReadingTime,
  getSavedAgoText,
  markdownStyles,
};
