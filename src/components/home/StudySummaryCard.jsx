import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../config/ThemeContext';
import Badge from '../common/Badge';

/**
 * Study sessions and exam countdown summary card for home screen.
 */
const StudySummaryCard = React.memo(({
  doneCount = 0,
  totalCount = 0,
  nextExamSubject,
  daysUntilExam,
  onPress,
}) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.lg,
          borderColor: `${theme.colors.textTertiary}20`,
          borderWidth: 1,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.icon}>📚</Text>
          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Study</Text>
        </View>
        <Text style={[styles.chevron, { color: theme.colors.textTertiary }]}>→</Text>
      </View>

      <Text style={[styles.sessionsText, { color: theme.colors.textPrimary }]}>
        {doneCount} of {totalCount} sessions done today
      </Text>

      {nextExamSubject ? (
        <View style={[styles.examRow, { borderTopColor: `${theme.colors.textTertiary}20` }]}>
          <Text style={[styles.examLabel, { color: theme.colors.textSecondary }]} numberOfLines={1}>
            Next: <Text style={[styles.examSubject, { color: theme.colors.textPrimary }]}>{nextExamSubject}</Text>
          </Text>
          {daysUntilExam !== undefined ? (
            <Badge
              label={daysUntilExam === 0 ? 'Today!' : `${daysUntilExam}d left`}
              color={daysUntilExam <= 3 ? theme.colors.error : theme.colors.primary}
              size="sm"
            />
          ) : null}
        </View>
      ) : (
        <Text style={[styles.noExamText, { color: theme.colors.textTertiary }]}>No upcoming exams scheduled</Text>
      )}
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginVertical: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 18,
    marginRight: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
  },
  chevron: {
    fontSize: 14,
    fontWeight: '600',
  },
  sessionsText: {
    fontSize: 16,
    fontWeight: '800',
    marginVertical: 4,
  },
  examRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
  },
  examLabel: {
    fontSize: 12,
    flex: 1,
    marginRight: 8,
  },
  examSubject: {
    fontWeight: '700',
  },
  noExamText: {
    fontSize: 10,
    marginTop: 4,
  },
});

export default StudySummaryCard;
