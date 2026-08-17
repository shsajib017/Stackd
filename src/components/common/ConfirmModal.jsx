import React from 'react';
import { Modal, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import { borderRadius, colors, fontSizes, shadows, spacing } from '../../config/theme';
import Button from './Button';

/**
 * Confirmation dialog modal for approving or canceling critical actions.
 *
 * @param {object} props
 * @param {boolean} props.visible - Modal visibility state.
 * @param {string} props.title - Modal header title.
 * @param {string} props.message - Descriptive confirmation message.
 * @param {string} [props.confirmLabel='Confirm'] - Confirm action button text.
 * @param {string} [props.cancelLabel='Cancel'] - Cancel action button text.
 * @param {() => void} props.onConfirm - Confirm button callback.
 * @param {() => void} props.onCancel - Cancel button callback.
 * @param {boolean} [props.isDanger=false] - Destructive danger style toggle.
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
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
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
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  card: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    ...shadows.lg,
  },
  title: {
    fontSize: fontSizes.xl,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  message: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.xl,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  buttonWrapper: {
    flex: 1,
  },
});

export default ConfirmModal;
