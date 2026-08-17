import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { borderRadius, colors, fontSizes, shadows, spacing } from '../../config/theme';
import ExamCountdown from './ExamCountdown';
import ProgressRing from './ProgressRing';

/**
 * Subject Overview Card for horizontal scroll carousel.
 */
const SubjectCard = React.memo(({ subject, progress = 0, onPress }) => {
  const cardColor = subject.color || colors.primary;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: cardColor }]}
      onPress={() => onPress?.(subject)}
      activeOpacity={0.85}
    >
      <View style={styles.topRow}>
        <Text style={styles.name} numberOfLines={1}>
          {subject.name}
        </Text>
        <ProgressRing progress={progress} size={38} color={colors.surface} />
      </View>

      <View style={styles.footerRow}>
        <ExamCountdown examDate={subject.exam_date} />
        {subject.target_hours ? (
          <Text style={styles.targetText}>🎯 {subject.target_hours}h target</Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    width: 200,
    height: 110,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginRight: spacing.sm,
    justifyContent: 'space-between',
    ...shadows.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  name: {
    fontSize: fontSizes.md,
    fontWeight: '800',
    color: colors.surface,
    flex: 1,
    marginRight: spacing.xs,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  targetText: {
    fontSize: fontSizes.xs - 1,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.9)',
  },
});

export default SubjectCard;
