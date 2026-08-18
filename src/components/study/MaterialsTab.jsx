import React, { useCallback } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useTheme } from '../../config/ThemeContext';
import useUIStore from '../../store/useUIStore';
import { formatDateShort } from '../../utils/formatDate';
import Button from '../common/Button';
import EmptyState from '../common/EmptyState';
import SkeletonCard from '../common/SkeletonCard';

/**
 * Subject PDF Materials and Document Management Tab with native PDF viewing via expo-sharing.
 */
const MaterialsTab = React.memo(({ materials = [], subjectId, onUpload, navigation, isLoading, isUploading }) => {
  const { theme } = useTheme();
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
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.surface,
            borderRadius: theme.borderRadius.md,
            borderColor: `${theme.colors.textTertiary}20`,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.cardHeader}
          onPress={() => viewPDF(item.file_url, fileName)}
          activeOpacity={0.75}
        >
          <Text style={styles.pdfIcon}>📄</Text>
          <View style={styles.fileInfo}>
            <Text style={[styles.fileName, { color: theme.colors.textPrimary }]} numberOfLines={1}>{fileName}</Text>
            <Text style={[styles.fileDate, { color: theme.colors.textTertiary }]}>Uploaded {formatDateShort(item.created_at)}</Text>
          </View>
        </TouchableOpacity>
        <View style={styles.actionRow}>
          <TouchableOpacity style={[styles.actionChip, { backgroundColor: `${theme.colors.primary}12`, borderRadius: theme.borderRadius.sm }]} onPress={() => navigation.navigate('SyllabusUploadScreen', { material: item, subjectId })}>
            <Text style={[styles.actionText, { color: theme.colors.primary }]}>📑 Analyse syllabus</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionChip, { backgroundColor: `${theme.colors.accent}15`, borderRadius: theme.borderRadius.sm }]} onPress={() => navigation.navigate('PYQUploadScreen', { material: item, subjectId })}>
            <Text style={[styles.actionText, { color: theme.colors.accent }]}>🎯 Analyse PYQ</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }, [navigation, subjectId, theme, viewPDF]);

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
        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Course Materials</Text>
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
  loadingContainer: { padding: 16 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8 },
  sectionTitle: { fontSize: 13, fontWeight: '700' },
  listContent: { padding: 16, paddingBottom: 100 },
  mb: { marginBottom: 8 },
  card: { padding: 16, marginBottom: 8, borderWidth: 1 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  pdfIcon: { fontSize: 28, marginRight: 8 },
  fileInfo: { flex: 1 },
  fileName: { fontSize: 13, fontWeight: '700', marginBottom: 2 },
  fileDate: { fontSize: 9 },
  actionRow: { flexDirection: 'row', gap: 4 },
  actionChip: { paddingHorizontal: 8, paddingVertical: 6 },
  actionText: { fontSize: 10, fontWeight: '700' },
});

export default MaterialsTab;
