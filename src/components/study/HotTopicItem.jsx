import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../config/ThemeContext';
import StatusChip from '../common/StatusChip';

/**
 * Single hot topic item displaying title, occurrence frequency, and importance level.
 */
const HotTopicItem = React.memo(({ title, frequencyCount = 1, importance = 'medium', style }) => {
  const { theme } = useTheme();
  const chipType = importance === 'high' ? 'danger' : importance === 'low' ? 'info' : 'warning';

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.md,
          borderColor: `${theme.colors.textTertiary}20`,
        },
        style,
      ]}
    >
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]} numberOfLines={2}>
          {title}
        </Text>
        <Text style={[styles.freqText, { color: theme.colors.textSecondary }]}>🔥 Appeared {frequencyCount} {frequencyCount === 1 ? 'time' : 'times'} in PYQs</Text>
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
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
  },
  content: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  freqText: {
    fontSize: 10,
    fontWeight: '500',
  },
});

export default HotTopicItem;
