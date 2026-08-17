import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { borderRadius, colors, fontSizes, spacing } from '../../config/theme';

/**
 * List of selected PDF files for multi-paper past question analysis.
 */
const SelectedFilesList = React.memo(({ files = [], onRemove, onAddMore }) => {
  if (!files.length) return null;

  return (
    <View style={styles.container}>
      {files.map((file, idx) => (
        <View key={idx} style={styles.fileCard}>
          <Text style={styles.fileIcon}>📄</Text>
          <View style={styles.fileInfo}>
            <Text style={styles.fileName} numberOfLines={1}>
              {file.name || file.file_name || 'ExamPaper.pdf'}
            </Text>
            <Text style={styles.fileSize}>
              {file.size ? `${Math.round(file.size / 1024)} KB` : 'Ready'}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => onRemove?.(idx)}
            style={styles.removeBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.removeText}>✕</Text>
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity style={styles.addMoreBtn} onPress={onAddMore} activeOpacity={0.8}>
        <Text style={styles.addMoreText}>+ Add another paper</Text>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  container: { marginBottom: spacing.md },
  fileCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.sm + 2, borderWidth: 1, borderColor: `${colors.textTertiary}20`, marginBottom: spacing.xs },
  fileIcon: { fontSize: 22, marginRight: spacing.sm },
  fileInfo: { flex: 1 },
  fileName: { fontSize: fontSizes.sm, fontWeight: '700', color: colors.textPrimary },
  fileSize: { fontSize: fontSizes.xs - 1, color: colors.textTertiary, marginTop: 1 },
  removeBtn: { padding: 4 },
  removeText: { fontSize: fontSizes.sm, fontWeight: '800', color: colors.error },
  addMoreBtn: { paddingVertical: spacing.sm, alignItems: 'center', borderRadius: borderRadius.md, borderWidth: 1, borderColor: `${colors.primary}30`, borderStyle: 'dashed', marginTop: 4 },
  addMoreText: { fontSize: fontSizes.xs + 1, fontWeight: '700', color: colors.primary },
});

export default SelectedFilesList;
