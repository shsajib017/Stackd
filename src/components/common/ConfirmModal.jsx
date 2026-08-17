import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { borderRadius, colors, fontSizes, shadows, spacing } from '../../config/theme';
import Button from './Button';

/**
 * Absolute overlay confirmation dialog perfectly centered across any screen or modal.
 */
const ConfirmModal = React.memo(({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  isDanger = false,
}) => {
  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <TouchableOpacity style={styles.backdropPress} activeOpacity={1} onPress={onCancel} />
      <View style={styles.card}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
        <View style={styles.buttonRow}>
          <View style={styles.buttonWrapper}>
            <Button
              label={cancelLabel}
              onPress={onCancel}
              variant="secondary"
              size="md"
              fullWidth
            />
          </View>
          <View style={styles.buttonWrapper}>
            <Button
              label={confirmLabel}
              onPress={onConfirm}
              variant={isDanger ? 'danger' : 'primary'}
              size="md"
              fullWidth
            />
          </View>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    zIndex: 9999,
    elevation: 999,
  },
  backdropPress: {
    ...StyleSheet.absoluteFillObject,
  },
  card: {
    width: '88%',
    maxWidth: 340,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    alignItems: 'center',
    ...shadows.lg,
    elevation: 1000,
    zIndex: 10000,
  },
  title: {
    fontSize: fontSizes.lg + 1,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  message: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.xs,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    width: '100%',
  },
  buttonWrapper: {
    flex: 1,
  },
});

export default ConfirmModal;
