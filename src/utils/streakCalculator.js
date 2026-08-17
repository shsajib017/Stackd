/**
 * Calculates active consecutive day streak across student habits and modules.
 * @param {Array<string>} activityDates - Array of ISO date strings.
 * @returns {number} Active streak in consecutive days.
 */
export const calculateStreak = (activityDates = []) => {
  if (!activityDates || !activityDates.length) return 0;

  const uniqueDays = Array.from(
    new Set(
      activityDates
        .filter(Boolean)
        .map((d) => {
          const date = new Date(d);
          date.setHours(0, 0, 0, 0);
          return date.getTime();
        })
    )
  ).sort((a, b) => b - a);

  if (!uniqueDays.length) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTime = today.getTime();
  const oneDayMs = 86400000;

  const latestDay = uniqueDays[0];
  const diffDaysFromToday = Math.round((todayTime - latestDay) / oneDayMs);

  if (diffDaysFromToday > 1) {
    return 0;
  }

  let streak = 1;
  for (let i = 0; i < uniqueDays.length - 1; i += 1) {
    const diff = Math.round((uniqueDays[i] - uniqueDays[i + 1]) / oneDayMs);
    if (diff === 1) {
      streak += 1;
    } else {
      break;
    }
  }

  return streak;
};

export default { calculateStreak };
