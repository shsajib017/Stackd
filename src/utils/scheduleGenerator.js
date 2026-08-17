/**
 * Rule-based study schedule generator.
 * @param {Array<{ id: string, name: string, examDate: string, difficulty: number, topics?: string[] }>} subjects - Course subjects.
 * @param {Record<string, number>} availableHours - Daily hours map (e.g. { monday: 4, tuesday: 3 }).
 * @returns {Array<{ subjectId: string, subjectName: string, date: string, durationMinutes: number, topic: string }>} Generated study sessions.
 */
export const generateSchedule = (subjects = [], availableHours = {}) => {
  if (!subjects.length || !availableHours) return [];

  const now = new Date();
  const sortedSubjects = [...subjects].sort((a, b) => {
    const daysA = a.examDate ? Math.max(1, (new Date(a.examDate) - now) / 86400000) : 30;
    const daysB = b.examDate ? Math.max(1, (new Date(b.examDate) - now) / 86400000) : 30;
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
    const sessionLength = 45;
    const sessionCount = Math.max(1, Math.floor(totalMinutes / sessionLength));

    for (let i = 0; i < sessionCount; i += 1) {
      const subjectIndex = (dayIndex + i) % sortedSubjects.length;
      const sub = sortedSubjects[subjectIndex];
      const topicsList = sub.topics || [];
      const currentTopicIdx = topicIndices[sub.id] || 0;
      const topic = topicsList.length ? topicsList[currentTopicIdx % topicsList.length] : 'Core Concepts';
      topicIndices[sub.id] = currentTopicIdx + 1;

      const sessionDate = new Date();
      sessionDate.setDate(sessionDate.getDate() + dayIndex);

      sessions.push({
        subjectId: sub.id,
        subjectName: sub.name,
        date: sessionDate.toISOString().split('T')[0],
        durationMinutes: sessionLength,
        topic,
      });
    }
  });

  return sessions;
};

export default { generateSchedule };
