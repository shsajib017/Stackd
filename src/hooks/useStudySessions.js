import { useCallback, useState } from 'react';
import {
  addBatchSessions as createBatchSessions,
  addSession as createSession,
  deleteSession as removeSession,
  getSessions,
  getTodaySessions,
  getWeeklyStudyMinutes,
  markSessionComplete,
} from '../supabase/sessions';
import useAuthStore from '../store/useAuthStore';
import useStudyStore from '../store/useStudyStore';

/**
 * Study sessions management and tracking hook.
 */
export const useStudySessions = () => {
  const user = useAuthStore((state) => state.user);
  const {
    sessions,
    todaySessions,
    isLoading,
    setSessions,
    setTodaySessions,
    markSessionLocal,
    setLoading,
  } = useStudyStore();

  const [error, setError] = useState(null);
  const [weeklyStudyMinutes, setWeeklyStudyMinutes] = useState(0);

  const fetchSessions = useCallback(async (filters = {}) => {
    if (!user?.id) return;
    try {
      setLoading(true);
      setError(null);
      const [allSessions, todayList, weeklyMins] = await Promise.all([
        getSessions(user.id, filters),
        getTodaySessions(user.id),
        getWeeklyStudyMinutes(user.id),
      ]);
      setSessions(allSessions);
      setTodaySessions(todayList);
      setWeeklyStudyMinutes(weeklyMins);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [setLoading, setSessions, setTodaySessions, user?.id]);

  const addSession = useCallback(async (data) => {
    if (!user?.id) return null;
    try {
      const row = await createSession(user.id, data);
      await fetchSessions();
      return row;
    } catch (err) {
      setError(err.message);
      throw new Error(err.message);
    }
  }, [fetchSessions, user?.id]);

  const addBatchSessions = useCallback(async (sessionsArray) => {
    if (!user?.id) return [];
    try {
      const rows = await createBatchSessions(user.id, sessionsArray);
      await fetchSessions();
      return rows;
    } catch (err) {
      setError(err.message);
      throw new Error(err.message);
    }
  }, [fetchSessions, user?.id]);

  const markComplete = useCallback(async (sessionId, focusRating = 5, notes = '') => {
    try {
      markSessionLocal(sessionId);
      const row = await markSessionComplete(sessionId, focusRating, notes);
      if (user?.id) {
        const mins = await getWeeklyStudyMinutes(user.id);
        setWeeklyStudyMinutes(mins);
      }
      return row;
    } catch (err) {
      setError(err.message);
      throw new Error(err.message);
    }
  }, [markSessionLocal, user?.id]);

  const deleteSession = useCallback(async (sessionId) => {
    try {
      await removeSession(sessionId);
      await fetchSessions();
    } catch (err) {
      setError(err.message);
      throw new Error(err.message);
    }
  }, [fetchSessions]);

  return {
    sessions,
    todaySessions,
    isLoading,
    error,
    addSession,
    addBatchSessions,
    markComplete,
    deleteSession,
    fetchSessions,
    weeklyStudyMinutes,
  };
};

export default useStudySessions;
