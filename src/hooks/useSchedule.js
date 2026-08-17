import { useCallback, useState } from 'react';
import { generateSchedule as buildSchedule } from '../utils/scheduleGenerator';
import { addBatchSessions, getSessions } from '../supabase/sessions';
import useAuthStore from '../store/useAuthStore';
import useStudyStore from '../store/useStudyStore';

/**
 * Study schedule auto-generation and application hook.
 */
export const useSchedule = () => {
  const user = useAuthStore((state) => state.user);
  const setSessions = useStudyStore((state) => state.setSessions);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSessions, setGeneratedSessions] = useState([]);
  const [error, setError] = useState(null);

  const generateSchedule = useCallback((subjects, availableHours, sessionLength, startDate) => {
    try {
      setIsGenerating(true);
      setError(null);
      const schedule = buildSchedule(subjects, availableHours, sessionLength, startDate);
      setGeneratedSessions(schedule);
      return schedule;
    } catch (err) {
      setError(err.message);
      throw new Error(`Schedule generation failed: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const applySchedule = useCallback(async (sessionsToApply) => {
    if (!user?.id) return [];
    const list = sessionsToApply || generatedSessions;
    if (!list.length) return [];

    try {
      setIsGenerating(true);
      setError(null);

      const formatted = list.map((s) => ({
        subject_id: s.subjectId || s.subject_id,
        date: s.date,
        duration_minutes: s.durationMinutes || s.duration_minutes || 45,
        notes: s.topic || s.notes || 'Core Concepts',
        completed: false,
      }));

      const rows = await addBatchSessions(user.id, formatted);
      const allUpdated = await getSessions(user.id);
      setSessions(allUpdated || rows);
      setGeneratedSessions([]);
      return rows;
    } catch (err) {
      setError(err.message);
      throw new Error(`Applying schedule failed: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  }, [generatedSessions, setSessions, user?.id]);

  return {
    generateSchedule,
    applySchedule,
    isGenerating,
    generatedSessions,
    error,
  };
};

export default useSchedule;
