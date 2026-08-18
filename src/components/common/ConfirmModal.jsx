import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../config/ThemeContext';
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
  const { theme } = useTheme();

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <TouchableOpacity style={styles.backdropPress} activeOpacity={1} onPress={onCancel} />
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.surface,
            borderRadius: theme.borderRadius.xl,
            borderColor: `${theme.colors.textTertiary}20`,
            borderWidth: 1,
          },
        ]}
      >
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>{title}</Text>
        <Text style={[styles.message, { color: theme.colors.textSecondary }]}>{message}</Text>
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
    paddingHorizontal: 24,
    zIndex: 9999,
    elevation: 999,
  },
  backdropPress: {
    ...StyleSheet.absoluteFillObject,
  },
  card: {
    width: '88%',
    maxWidth: 340,
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: 'center',
    elevation: 1000,
    zIndex: 10000,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4,
    textAlign: 'center',
  },
  message: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
  },
  buttonWrapper: {
    flex: 1,
  },
});

export default ConfirmModal;
