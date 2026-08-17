import { create } from 'zustand';

/**
 * Study timetable, subjects, and sessions state store.
 */
export const useStudyStore = create((set) => ({
  subjects: [],
  sessions: [],
  todaySessions: [],
  streak: 0,
  isLoading: false,

  setSubjects: (subjects) => set({ subjects }),
  addSubjectLocal: (subject) =>
    set((state) => ({ subjects: [subject, ...state.subjects] })),
  removeSubjectLocal: (id) =>
    set((state) => ({ subjects: state.subjects.filter((s) => s.id !== id) })),

  setSessions: (sessions) => set({ sessions }),
  setTodaySessions: (todaySessions) => set({ todaySessions }),
  markSessionLocal: (id) =>
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === id ? { ...s, completed: true } : s
      ),
      todaySessions: state.todaySessions.map((s) =>
        s.id === id ? { ...s, completed: true } : s
      ),
    })),

  setStreak: (streak) => set({ streak }),
  setLoading: (isLoading) => set({ isLoading }),
}));

export default useStudyStore;
