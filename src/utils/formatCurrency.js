/**
 * Formats a numeric amount to standard Bangladeshi Taka format (e.g. ৳ 1,200).
 * @param {number|string} amount - Monetary amount.
 * @returns {string} Formatted currency string.
 */
export const formatBDT = (amount) => {
  const numeric = Math.round(Number(amount) || 0);
  return `৳ ${numeric.toLocaleString('en-IN')}`;
};

/**
 * Formats a monetary amount into a compact representation for amounts over 1000 (e.g. ৳ 1.2k).
 * @param {number|string} amount - Monetary amount.
 * @returns {string} Formatted compact currency string.
 */
export const formatBDTCompact = (amount) => {
  const numeric = Number(amount) || 0;
  if (numeric >= 1000) {
    const inK = numeric / 1000;
    const formatted = inK % 1 === 0 ? inK.toFixed(0) : inK.toFixed(1);
    return `৳ ${formatted}k`;
  }
  return formatBDT(numeric);
};

export default {
  formatBDT,
  formatBDTCompact,
};
