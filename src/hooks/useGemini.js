import { useCallback, useState } from 'react';
import {
  analysePYQ as geminiAnalysePYQ,
  analyseSyllabus as geminiAnalyseSyllabus,
} from '../api/gemini';
import { addBatchTopics } from '../supabase/topics';
import useAuthStore from '../store/useAuthStore';

/**
 * AI academic syllabus parser and past question analysis hook.
 */
export const useGemini = () => {
  const user = useAuthStore((state) => state.user);
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const analyseSyllabus = useCallback(async (syllabusText, subjectId) => {
    if (!syllabusText || !syllabusText.trim()) return [];
    try {
      setIsAnalysing(true);
      setError(null);
      const parsedTopics = await geminiAnalyseSyllabus(syllabusText);
      setResults(parsedTopics);

      if (subjectId && user?.id && parsedTopics.length) {
        const topicsPayload = parsedTopics.map((t) => ({
          name: t.title,
          is_hot_topic: false,
          frequency_count: 0,
          completed: false,
        }));
        await addBatchTopics(subjectId, user.id, topicsPayload);
      }

      return parsedTopics;
    } catch (err) {
      setError(err.message);
      throw new Error(`Syllabus analysis failed: ${err.message}`);
    } finally {
      setIsAnalysing(false);
    }
  }, [user?.id]);

  const analysePYQ = useCallback(async (pyqText, subjectId) => {
    if (!pyqText || !pyqText.trim()) return [];
    try {
      setIsAnalysing(true);
      setError(null);
      const pyqResults = await geminiAnalysePYQ(pyqText);
      setResults(pyqResults);

      if (subjectId && user?.id && pyqResults.length) {
        const hotTopicsPayload = pyqResults.map((t) => ({
          name: t.topic,
          is_hot_topic: true,
          frequency_count: Number(t.frequency_count) || 1,
          completed: false,
        }));
        await addBatchTopics(subjectId, user.id, hotTopicsPayload);
      }

      return pyqResults;
    } catch (err) {
      setError(err.message);
      throw new Error(`PYQ analysis failed: ${err.message}`);
    } finally {
      setIsAnalysing(false);
    }
  }, [user?.id]);

  return {
    analyseSyllabus,
    analysePYQ,
    isAnalysing,
    results,
    error,
  };
};

export default useGemini;
