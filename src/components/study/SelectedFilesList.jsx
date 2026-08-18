import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../config/ThemeContext';

/**
 * List of selected PDF files for multi-paper past question analysis.
 */
const SelectedFilesList = React.memo(({ files = [], onRemove, onAddMore }) => {
  const { theme } = useTheme();
  if (!files.length) return null;

  return (
    <View style={styles.container}>
      {files.map((file, idx) => (
        <View
          key={idx}
          style={[
            styles.fileCard,
            {
              backgroundColor: theme.colors.surface,
              borderRadius: theme.borderRadius.md,
              borderColor: `${theme.colors.textTertiary}20`,
            },
          ]}
        >
          <Text style={styles.fileIcon}>📄</Text>
          <View style={styles.fileInfo}>
            <Text style={[styles.fileName, { color: theme.colors.textPrimary }]} numberOfLines={1}>
              {file.name || file.file_name || 'ExamPaper.pdf'}
            </Text>
            <Text style={[styles.fileSize, { color: theme.colors.textTertiary }]}>
              {file.size ? `${Math.round(file.size / 1024)} KB` : 'Ready'}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => onRemove?.(idx)}
            style={styles.removeBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={[styles.removeText, { color: theme.colors.error }]}>✕</Text>
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity
        style={[
          styles.addMoreBtn,
          {
            borderRadius: theme.borderRadius.md,
            borderColor: `${theme.colors.primary}30`,
          },
        ]}
        onPress={onAddMore}
        activeOpacity={0.8}
      >
        <Text style={[styles.addMoreText, { color: theme.colors.primary }]}>+ Add another paper</Text>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  fileCard: { flexDirection: 'row', alignItems: 'center', padding: 10, borderWidth: 1, marginBottom: 4 },
  fileIcon: { fontSize: 22, marginRight: 8 },
  fileInfo: { flex: 1 },
  fileName: { fontSize: 12, fontWeight: '700' },
  fileSize: { fontSize: 9, marginTop: 1 },
  removeBtn: { padding: 4 },
  removeText: { fontSize: 12, fontWeight: '800' },
  addMoreBtn: { paddingVertical: 8, alignItems: 'center', borderWidth: 1, borderStyle: 'dashed', marginTop: 4 },
  addMoreText: { fontSize: 11, fontWeight: '700' },
});

export default SelectedFilesList;
