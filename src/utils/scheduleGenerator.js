import { formatDateForDB } from './formatDate';

/**
 * Rule-based study schedule generator with support for custom session length and start dates.
 */
export const generateSchedule = (subjectsOrConfig = [], maybeAvailableHours = {}, maybeLength = 45, maybeStartDate = null) => {
  let subjects = subjectsOrConfig;
  let availableHours = maybeAvailableHours;
  let sessionLength = maybeLength;
  let startDate = maybeStartDate;

  if (subjectsOrConfig && !Array.isArray(subjectsOrConfig) && typeof subjectsOrConfig === 'object') {
    subjects = subjectsOrConfig.subjects || [];
    availableHours = subjectsOrConfig.availableHours || {};
    sessionLength = subjectsOrConfig.sessionLength || 45;
    startDate = subjectsOrConfig.startDate || null;
  }

  if (!subjects.length || !availableHours) return [];

  const baseStart = startDate ? new Date(startDate) : new Date();
  baseStart.setHours(0, 0, 0, 0);

  const sortedSubjects = [...subjects].sort((a, b) => {
    const examA = a.exam_date || a.examDate;
    const examB = b.exam_date || b.examDate;
    const daysA = examA ? Math.max(1, (new Date(examA) - baseStart) / 86400000) : 30;
    const daysB = examB ? Math.max(1, (new Date(examB) - baseStart) / 86400000) : 30;
    const weightA = (a.difficulty || 3) / daysA;
    const weightB = (b.difficulty || 3) / daysB;
    return weightB - weightA;
  });

  const dayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const sessions = [];
  const topicIndices = {};
  sortedSubjects.forEach((s) => { topicIndices[s.id] = 0; });

  dayKeys.forEach((day, dayIndex) => {
    const hours = availableHours[day] || availableHours[day.toLowerCase()] || 0;
    if (hours <= 0) return;

    const totalMinutes = Math.floor(hours * 60);
    const length = Number(sessionLength) || 45;
    const sessionCount = Math.max(1, Math.floor(totalMinutes / length));

    for (let i = 0; i < sessionCount; i += 1) {
      const subjectIndex = (dayIndex + i + Math.floor(Math.random() * 2)) % sortedSubjects.length;
      const sub = sortedSubjects[subjectIndex];
      const topicsList = sub.topics || [];
      const currentTopicIdx = topicIndices[sub.id] || 0;
      const topic = topicsList.length ? topicsList[currentTopicIdx % topicsList.length] : 'Core Concepts';
      topicIndices[sub.id] = currentTopicIdx + 1;

      const sessionDate = new Date(baseStart);
      sessionDate.setDate(sessionDate.getDate() + dayIndex);

      sessions.push({
        subjectId: sub.id,
        subjectName: sub.name,
        date: formatDateForDB(sessionDate),
        durationMinutes: length,
        topic,
      });
    }
  });

  return sessions;
};

export default { generateSchedule };
