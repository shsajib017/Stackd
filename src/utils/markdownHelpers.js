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
 * Extracts the first heading from a markdown string.
 * @param {string} markdown - Raw markdown string.
 * @returns {string} First heading text, or empty string.
 */
export const extractFirstHeading = (markdown = '') => {
  const match = markdown.match(/^#{1,6}\s+(.+)$/m);
  return match ? match[1].trim() : '';
};

/**
 * Counts the number of bullet points (unordered list items) in markdown.
 * @param {string} markdown - Raw markdown string.
 * @returns {number} Count of bullet items.
 */
export const countBulletPoints = (markdown = '') => {
  const matches = markdown.match(/^\s*[-*+]\s/gm);
  return matches ? matches.length : 0;
};

export default {
  stripMarkdown,
  truncateText,
  extractFirstHeading,
  countBulletPoints,
};
