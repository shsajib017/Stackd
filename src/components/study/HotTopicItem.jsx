import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { borderRadius, colors, fontSizes, shadows, spacing } from '../../config/theme';
import StatusChip from '../common/StatusChip';

/**
 * Single hot topic item displaying title, occurrence frequency, and importance level.
 */
const HotTopicItem = React.memo(({ title, frequencyCount = 1, importance = 'medium', style }) => {
  const chipType = importance === 'high' ? 'danger' : importance === 'low' ? 'info' : 'warning';

  return (
    <View style={[styles.card, style]}>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        <Text style={styles.freqText}>🔥 Appeared {frequencyCount} {frequencyCount === 1 ? 'time' : 'times'} in PYQs</Text>
      </View>
      <StatusChip label={importance.toUpperCase()} type={chipType} size="sm" />
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: `${colors.textTertiary}25`,
    ...shadows.sm,
  },
  content: {
    flex: 1,
    marginRight: spacing.sm,
  },
  title: {
    fontSize: fontSizes.sm + 1,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  freqText: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});

export default HotTopicItem;
