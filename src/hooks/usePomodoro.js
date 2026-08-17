import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { POMODORO_BREAK_MINUTES, POMODORO_WORK_MINUTES } from '../utils/constants';
import { formatCountdown } from '../utils/formatTime';

const WORK_SECONDS = POMODORO_WORK_MINUTES * 60;
const BREAK_SECONDS = POMODORO_BREAK_MINUTES * 60;

/**
 * Pomodoro timer hook with auto-switching work and break phases.
 */
export const usePomodoro = () => {
  const [isBreak, setIsBreak] = useState(false);
  const [seconds, setSeconds] = useState(WORK_SECONDS);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);

  const timerRef = useRef(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handlePhaseComplete = useCallback(() => {
    clearTimer();
    setIsRunning(false);
    if (!isBreak) {
      setCompletedSessions((prev) => prev + 1);
      setIsBreak(true);
      setSeconds(BREAK_SECONDS);
    } else {
      setIsBreak(false);
      setSeconds(WORK_SECONDS);
    }
  }, [clearTimer, isBreak]);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setSeconds((prev) => {
          if (prev <= 1) {
            handlePhaseComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearTimer();
    }

    return () => clearTimer();
  }, [clearTimer, handlePhaseComplete, isRunning]);

  const start = useCallback(() => {
    setIsRunning(true);
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
    clearTimer();
  }, [clearTimer]);

  const resume = useCallback(() => {
    setIsRunning(true);
  }, []);

  const reset = useCallback(() => {
    clearTimer();
    setIsRunning(false);
    setIsBreak(false);
    setSeconds(WORK_SECONDS);
  }, [clearTimer]);

  const skip = useCallback(() => {
    clearTimer();
    setIsRunning(false);
    if (!isBreak) {
      setIsBreak(true);
      setSeconds(BREAK_SECONDS);
    } else {
      setIsBreak(false);
      setSeconds(WORK_SECONDS);
    }
  }, [clearTimer, isBreak]);

  const formattedTime = useMemo(() => formatCountdown(seconds), [seconds]);

  return {
    seconds,
    isRunning,
    isBreak,
    completedSessions,
    formattedTime,
    start,
    pause,
    resume,
    reset,
    skip,
  };
};

export default usePomodoro;
