/**
 * Formats duration in minutes to readable text (e.g. "25 min" or "1 hr 10 min").
 * @param {number|string} minutes - Total minutes.
 * @returns {string} Formatted duration.
 */
export const formatMinutes = (minutes) => {
  const mins = Math.max(0, Math.floor(Number(minutes) || 0));
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  const remaining = mins % 60;
  return remaining === 0 ? `${hrs} hr` : `${hrs} hr ${remaining} min`;
};

/**
 * Formats duration in minutes to readable text (alias of formatMinutes).
 */
export const formatDuration = formatMinutes;

/**
 * Formats seconds into MM:SS digital countdown clock format.
 * @param {number|string} seconds - Total seconds.
 * @returns {string} Formatted clock "MM:SS".
 */
export const formatCountdown = (seconds) => {
  const totalSecs = Math.max(0, Math.floor(Number(seconds) || 0));
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Formats study minutes into compact notation (e.g. "2h 30m").
 * @param {number|string} minutes - Total minutes.
 * @returns {string} Formatted study hours.
 */
export const formatStudyHours = (minutes) => {
  const mins = Math.max(0, Math.floor(Number(minutes) || 0));
  const hrs = Math.floor(mins / 60);
  const remaining = mins % 60;
  if (hrs === 0) return `${remaining}m`;
  return remaining === 0 ? `${hrs}h` : `${hrs}h ${remaining}m`;
};

export default {
  formatMinutes,
  formatDuration,
  formatCountdown,
  formatStudyHours,
};
