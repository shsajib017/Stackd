import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../config/ThemeContext';

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
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface, borderBottomColor: `${theme.colors.textTertiary}20` }]}>
      <View style={styles.shortcutsRow}>
        {SHORTCUTS.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.toolBtn, { backgroundColor: theme.colors.background, borderRadius: theme.borderRadius.sm }]}
            onPress={() => onInsertShortcut?.(item.id)}
            disabled={isPreview}
            hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
          >
            <Text
              style={[
                styles.toolText,
                { color: theme.colors.textPrimary },
                item.bold && styles.boldText,
                item.italic && styles.italicText,
                isPreview && { color: theme.colors.textTertiary, opacity: 0.4 },
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity
        style={[
          styles.previewToggle,
          { backgroundColor: `${theme.colors.primary}12`, borderRadius: theme.borderRadius.full },
          isPreview && { backgroundColor: theme.colors.primary },
        ]}
        onPress={onTogglePreview}
      >
        <Text style={[styles.previewText, { color: isPreview ? '#FFFFFF' : theme.colors.primary }, isPreview && styles.previewTextActive]}>
          {isPreview ? '✏️ Edit' : '👁 Preview'}
        </Text>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 4, borderBottomWidth: 1 },
  shortcutsRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  toolBtn: { minWidth: 32, height: 32, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  toolText: { fontSize: 12, fontWeight: '600' },
  boldText: { fontWeight: '900' },
  italicText: { fontStyle: 'italic', fontWeight: '800' },
  previewToggle: { paddingHorizontal: 10, paddingVertical: 6 },
  previewText: { fontSize: 10, fontWeight: '700' },
  previewTextActive: { fontWeight: '800' },
});

export default EditorToolbar;
