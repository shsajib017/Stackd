import React, { useCallback } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { borderRadius, colors, fontSizes, shadows, spacing } from '../../config/theme';
import { formatDateShort } from '../../utils/formatDate';
import EmptyState from '../common/EmptyState';
import SkeletonCard from '../common/SkeletonCard';

const stripMarkdown = (text = '') => text.replace(/#+\s/g, '').replace(/[*_`~[\]]/g, '').trim().slice(0, 100);

/**
 * Subject Markdown Notes Tab with content preview, header action, and safe-inset FAB.
 */
const NotesTab = React.memo(({ notes = [], subjectId, navigation, isLoading }) => {
  const insets = useSafeAreaInsets();
  const fabBottom = insets.bottom + 80 + 16;

  const renderNoteCard = useCallback(({ item }) => {
    const preview = stripMarkdown(item.content) || 'No additional content...';
    const dateStr = formatDateShort(item.updated_at || item.created_at);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('NotesEditorScreen', { note: item, subjectId })}
        activeOpacity={0.75}
      >
        <View style={styles.cardTop}>
          <Text style={styles.noteTitle} numberOfLines={1}>{item.title || 'Untitled Note'}</Text>
          <Text style={styles.noteDate}>{dateStr}</Text>
        </View>
        <Text style={styles.notePreview} numberOfLines={2}>{preview}</Text>
      </TouchableOpacity>
    );
  }, [navigation, subjectId]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <SkeletonCard height={80} style={styles.mb} />
        <SkeletonCard height={80} style={styles.mb} />
        <SkeletonCard height={80} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {notes.length > 0 && (
        <View style={styles.headerRow}>
          <Text style={styles.countText}>{notes.length} {notes.length === 1 ? 'Note' : 'Notes'}</Text>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => navigation.navigate('NotesEditorScreen', { subjectId })}
            activeOpacity={0.8}
          >
            <Text style={styles.addBtnText}>+ New note</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={notes}
        keyExtractor={(item) => item.id}
        renderItem={renderNoteCard}
        ListEmptyComponent={
          <EmptyState
            icon="📝"
            title="No notes yet"
            subtitle="Capture lecture summaries and study formulas"
            actionLabel="Create note"
            onAction={() => navigation.navigate('NotesEditorScreen', { subjectId })}
          />
        }
        contentContainerStyle={[styles.listContent, { paddingBottom: fabBottom + 60 }]}
        showsVerticalScrollIndicator={false}
      />
      <TouchableOpacity
        style={[styles.fab, { bottom: fabBottom }]}
        onPress={() => navigation.navigate('NotesEditorScreen', { subjectId })}
        activeOpacity={0.85}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { padding: spacing.md },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.md, paddingTop: spacing.xs, paddingBottom: spacing.xs },
  countText: { fontSize: fontSizes.xs, fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase' },
  addBtn: { backgroundColor: `${colors.primary}15`, paddingHorizontal: spacing.sm + 4, paddingVertical: 5, borderRadius: borderRadius.full },
  addBtnText: { fontSize: fontSizes.xs, fontWeight: '700', color: colors.primary },
  listContent: { padding: spacing.md },
  mb: { marginBottom: spacing.sm },
  card: { backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: `${colors.textTertiary}20`, ...shadows.sm },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  noteTitle: { fontSize: fontSizes.sm + 1, fontWeight: '800', color: colors.textPrimary, flex: 1, marginRight: spacing.xs },
  noteDate: { fontSize: fontSizes.xs - 1, color: colors.textTertiary, fontWeight: '600' },
  notePreview: { fontSize: fontSizes.xs, color: colors.textSecondary, lineHeight: 18 },
  fab: { position: 'absolute', right: 16, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', ...shadows.md, zIndex: 10 },
  fabIcon: { fontSize: 28, color: colors.surface, lineHeight: 30, fontWeight: '700' },
});

export default NotesTab;
