import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, fontSizes, spacing } from '../../config/theme';

/**
 * Reusable section header with title heading and optional action link.
 *
 * @param {object} props
 * @param {string} props.title - Section title text.
 * @param {string} [props.actionLabel] - Action text (e.g. "See all").
 * @param {() => void} [props.onAction] - Action link press callback.
 * @param {object|array} [props.style] - Style overrides.
 */
const SectionHeader = React.memo(({
  title,
  actionLabel,
  onAction,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      {actionLabel && onAction ? (
        <TouchableOpacity
          onPress={onAction}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          activeOpacity={0.7}
        >
          <Text style={styles.actionText}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  title: {
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1,
  },
  actionText: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: spacing.sm,
  },
});

export default SectionHeader;
