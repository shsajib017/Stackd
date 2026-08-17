import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { borderRadius, colors, fontSizes, spacing } from '../../config/theme';

const SHORTCUTS = [
  { id: 'bold', label: 'B', bold: true },
  { id: 'italic', label: 'I', italic: true },
  { id: 'heading', label: 'H', bold: true },
  { id: 'bullet', label: '•' },
  { id: 'number', label: '1.' },
  { id: 'divider', label: '—' },
];

/**
 * Rich Markdown Shortcut and Preview Mode Toggle Toolbar.
 */
const EditorToolbar = React.memo(({ onInsertShortcut, isPreview = false, onTogglePreview }) => {
  return (
    <View style={styles.container}>
      <View style={styles.shortcutsRow}>
        {SHORTCUTS.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.toolBtn}
            onPress={() => onInsertShortcut?.(item.id)}
            disabled={isPreview}
            hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
          >
            <Text
              style={[
                styles.toolText,
                item.bold && styles.boldText,
                item.italic && styles.italicText,
                isPreview && styles.disabledText,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity
        style={[styles.previewToggle, isPreview && styles.previewToggleActive]}
        onPress={onTogglePreview}
      >
        <Text style={[styles.previewText, isPreview && styles.previewTextActive]}>
          {isPreview ? '✏️ Edit' : '👁 Preview'}
        </Text>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingVertical: spacing.xs, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: `${colors.textTertiary}20` },
  shortcutsRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs + 2 },
  toolBtn: { minWidth: 32, height: 32, borderRadius: borderRadius.sm, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  toolText: { fontSize: fontSizes.sm, fontWeight: '600', color: colors.textPrimary },
  boldText: { fontWeight: '900' },
  italicText: { fontStyle: 'italic', fontWeight: '800' },
  disabledText: { color: colors.textTertiary, opacity: 0.4 },
  previewToggle: { paddingHorizontal: spacing.sm + 2, paddingVertical: 6, borderRadius: borderRadius.full, backgroundColor: `${colors.primary}12` },
  previewToggleActive: { backgroundColor: colors.primary },
  previewText: { fontSize: fontSizes.xs, fontWeight: '700', color: colors.primary },
  previewTextActive: { color: colors.surface },
});

export default EditorToolbar;
