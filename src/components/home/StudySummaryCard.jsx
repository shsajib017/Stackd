import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { borderRadius, colors, fontSizes, shadows, spacing } from '../../config/theme';
import Badge from '../common/Badge';

/**
 * Study sessions and exam countdown summary card for home screen.
 *
 * @param {object} props
 * @param {number} props.doneCount - Completed sessions today.
 * @param {number} props.totalCount - Planned sessions today.
 * @param {string} [props.nextExamSubject] - Subject name for next upcoming exam.
 * @param {number} [props.daysUntilExam] - Days remaining until next exam.
 * @param {() => void} props.onPress - Navigation callback.
 */
const StudySummaryCard = React.memo(({
  doneCount = 0,
  totalCount = 0,
  nextExamSubject,
  daysUntilExam,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.icon}>📚</Text>
          <Text style={styles.title}>Study</Text>
        </View>
        <Text style={styles.chevron}>→</Text>
      </View>

      <Text style={styles.sessionsText}>
        {doneCount} of {totalCount} sessions done today
      </Text>

      {nextExamSubject ? (
        <View style={styles.examRow}>
          <Text style={styles.examLabel} numberOfLines={1}>
            Next: <Text style={styles.examSubject}>{nextExamSubject}</Text>
          </Text>
          {daysUntilExam !== undefined ? (
            <Badge
              label={daysUntilExam === 0 ? 'Today!' : `${daysUntilExam}d left`}
              color={daysUntilExam <= 3 ? colors.error : colors.primary}
              size="sm"
            />
          ) : null}
        </View>
      ) : (
        <Text style={styles.noExamText}>No upcoming exams scheduled</Text>
      )}
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginVertical: spacing.xs + 2,
    ...shadows.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 18,
    marginRight: spacing.xs,
  },
  title: {
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  chevron: {
    fontSize: fontSizes.md,
    color: colors.textTertiary,
    fontWeight: '600',
  },
  sessionsText: {
    fontSize: fontSizes.lg,
    fontWeight: '800',
    color: colors.textPrimary,
    marginVertical: 4,
  },
  examRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs + 2,
    paddingTop: spacing.xs + 2,
    borderTopWidth: 1,
    borderTopColor: `${colors.textTertiary}30`,
  },
  examLabel: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    flex: 1,
    marginRight: spacing.sm,
  },
  examSubject: {
    fontWeight: '700',
    color: colors.textPrimary,
  },
  noExamText: {
    fontSize: fontSizes.xs,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
});

export default StudySummaryCard;
