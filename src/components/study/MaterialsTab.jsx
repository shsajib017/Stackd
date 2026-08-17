import React, { useCallback } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { borderRadius, colors, fontSizes, shadows, spacing } from '../../config/theme';
import useUIStore from '../../store/useUIStore';
import { formatDateShort } from '../../utils/formatDate';
import Button from '../common/Button';
import EmptyState from '../common/EmptyState';
import SkeletonCard from '../common/SkeletonCard';

/**
 * Subject PDF Materials and Document Management Tab with native PDF viewing via expo-sharing.
 */
const MaterialsTab = React.memo(({ materials = [], subjectId, onUpload, navigation, isLoading, isUploading }) => {
  const showToast = useUIStore((state) => state.showToast);

  const viewPDF = useCallback(async (fileUrl, fileName = 'document.pdf') => {
    try {
      if (!fileUrl) {
        showToast('File URL not found', 'error');
        return;
      }
      const safeName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
      const localUri = `${FileSystem.documentDirectory}${safeName}`;

      let targetUri = fileUrl;
      if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
        const downloadRes = await FileSystem.downloadAsync(fileUrl, localUri);
        targetUri = downloadRes.uri;
      }

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(targetUri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Open PDF with...',
          UTI: 'com.adobe.pdf',
        });
      } else {
        showToast('No PDF viewer available on this device', 'error');
      }
    } catch {
      showToast('Could not open PDF', 'error');
    }
  }, [showToast]);

  const renderMaterialCard = useCallback(({ item }) => {
    const fileName = item.file_name || item.title || 'Document.pdf';
    return (
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.cardHeader}
          onPress={() => viewPDF(item.file_url, fileName)}
          activeOpacity={0.75}
        >
          <Text style={styles.pdfIcon}>📄</Text>
          <View style={styles.fileInfo}>
            <Text style={styles.fileName} numberOfLines={1}>{fileName}</Text>
            <Text style={styles.fileDate}>Uploaded {formatDateShort(item.created_at)}</Text>
          </View>
        </TouchableOpacity>
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionChip} onPress={() => navigation.navigate('SyllabusUploadScreen', { material: item, subjectId })}>
            <Text style={styles.actionText}>📑 Analyse syllabus</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionChip, styles.actionChipPYQ]} onPress={() => navigation.navigate('PYQUploadScreen', { material: item, subjectId })}>
            <Text style={[styles.actionText, styles.actionTextPYQ]}>🎯 Analyse PYQ</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }, [navigation, subjectId, viewPDF]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <SkeletonCard height={90} style={styles.mb} /><SkeletonCard height={90} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.sectionTitle}>Course Materials</Text>
        <Button label={isUploading ? 'Uploading...' : '+ Upload PDF'} size="sm" onPress={onUpload} loading={isUploading} disabled={isUploading} />
      </View>
      <FlatList
        data={materials}
        keyExtractor={(item) => item.id}
        renderItem={renderMaterialCard}
        ListEmptyComponent={<EmptyState icon="📂" title="No materials uploaded" subtitle="Upload syllabus or past exam papers for AI analysis" actionLabel="Upload document" onAction={onUpload} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { padding: spacing.md },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.md, paddingTop: spacing.sm },
  sectionTitle: { fontSize: fontSizes.sm + 1, fontWeight: '700', color: colors.textPrimary },
  listContent: { padding: spacing.md, paddingBottom: 100 },
  mb: { marginBottom: spacing.sm },
  card: { backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: `${colors.textTertiary}20`, ...shadows.sm },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  pdfIcon: { fontSize: 28, marginRight: spacing.sm },
  fileInfo: { flex: 1 },
  fileName: { fontSize: fontSizes.sm + 1, fontWeight: '700', color: colors.textPrimary, marginBottom: 2 },
  fileDate: { fontSize: fontSizes.xs - 1, color: colors.textTertiary },
  actionRow: { flexDirection: 'row', gap: spacing.xs },
  actionChip: { backgroundColor: `${colors.primary}12`, paddingHorizontal: spacing.sm, paddingVertical: 6, borderRadius: borderRadius.sm },
  actionChipPYQ: { backgroundColor: `${colors.accent}15` },
  actionText: { fontSize: fontSizes.xs, fontWeight: '700', color: colors.primary },
  actionTextPYQ: { color: colors.accent },
});

export default MaterialsTab;
