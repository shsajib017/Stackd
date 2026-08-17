import { useCallback, useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Push and local notification scheduler hook.
 */
export const useNotifications = () => {
  const [hasPermission, setHasPermission] = useState(false);

  const requestPermissions = useCallback(async () => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      const granted = finalStatus === 'granted';
      setHasPermission(granted);
      return granted;
    } catch {
      setHasPermission(false);
      return false;
    }
  }, []);

  useEffect(() => {
    requestPermissions();
  }, [requestPermissions]);

  const scheduleStudyReminder = useCallback(
    async (sessionId, dateStr, subjectName) => {
      try {
        const hasPerm = hasPermission || (await requestPermissions());
        if (!hasPerm) return null;

        const sessionDate = new Date(dateStr);
        // Schedule 15 minutes before
        const triggerTime = new Date(sessionDate.getTime() - 15 * 60 * 1000);
        if (triggerTime <= new Date()) return null;

        const id = await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Study Session Reminder',
            body: `Your study session for ${subjectName || 'your course'} starts in 15 minutes!`,
            data: { sessionId, type: 'study_reminder' },
          },
          trigger: triggerTime,
        });
        return id;
      } catch (err) {
        throw new Error(`Failed to schedule study reminder: ${err.message}`);
      }
    },
    [hasPermission, requestPermissions]
  );

  const scheduleBudgetAlert = useCallback(
    async (message) => {
      try {
        const hasPerm = hasPermission || (await requestPermissions());
        if (!hasPerm) return null;

        const id = await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Budget Alert ⚠️',
            body: message || 'You have reached 80% of your monthly budget limit.',
            data: { type: 'budget_alert' },
          },
          trigger: null, // immediate trigger
        });
        return id;
      } catch (err) {
        throw new Error(`Failed to send budget alert: ${err.message}`);
      }
    },
    [hasPermission, requestPermissions]
  );

  const cancelNotification = useCallback(async (notificationId) => {
    try {
      if (notificationId) {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
      }
    } catch (err) {
      throw new Error(`Failed to cancel notification: ${err.message}`);
    }
  }, []);

  return {
    scheduleStudyReminder,
    scheduleBudgetAlert,
    cancelNotification,
    requestPermissions,
    hasPermission,
  };
};

export default useNotifications;
