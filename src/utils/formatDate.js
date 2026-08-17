const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAYS_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Returns date in YYYY-MM-DD format using local time to avoid UTC timezone shifts.
 */
export const getLocalDateString = (date) => {
  const d = date ? new Date(date) : new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDateForDB = getLocalDateString;

export const formatDate = (date) => {
  const d = new Date(date || Date.now());
  return `${DAYS_SHORT[d.getDay()]}, ${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
};

export const formatDateShort = (date) => {
  const d = new Date(date || Date.now());
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
};

export const formatDateFull = (date) => {
  const d = new Date(date || Date.now());
  return `${DAYS_FULL[d.getDay()]}, ${d.getDate()} ${MONTHS_FULL[d.getMonth()]} ${d.getFullYear()}`;
};

export const getDaysRemaining = (date) => {
  if (!date) return 0;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return Math.max(0, Math.ceil((target - now) / 86400000));
};

export const getWeekDates = () => {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  const week = [];
  for (let i = 0; i < 7; i += 1) {
    const nextDay = new Date(monday);
    nextDay.setDate(monday.getDate() + i);
    week.push(getLocalDateString(nextDay));
  }
  return week;
};

export const isSameDay = (date1, date2) => {
  if (!date1 || !date2) return false;
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
};

export const getMonthStart = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
};

export const getMonthEnd = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0);
};

export default {
  getLocalDateString,
  formatDateForDB,
  formatDate,
  formatDateShort,
  formatDateFull,
  getDaysRemaining,
  getWeekDates,
  isSameDay,
  getMonthStart,
  getMonthEnd,
};
