import React, { useCallback } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../config/ThemeContext';
import { formatDateShort } from '../../utils/formatDate';
import EmptyState from '../common/EmptyState';
import SkeletonCard from '../common/SkeletonCard';

const stripMarkdown = (text = '') => text.replace(/#+\s/g, '').replace(/[*_`~[\]]/g, '').trim().slice(0, 100);

/**
 * Subject Markdown Notes Tab with content preview, header action, and safe-inset FAB.
 */
const NotesTab = React.memo(({ notes = [], subjectId, navigation, isLoading }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const fabBottom = insets.bottom + 80 + 16;

  const renderNoteCard = useCallback(({ item }) => {
    const preview = stripMarkdown(item.content) || 'No additional content...';
    const dateStr = formatDateShort(item.updated_at || item.created_at);

    return (
      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.surface,
            borderRadius: theme.borderRadius.md,
            borderColor: `${theme.colors.textTertiary}20`,
          },
        ]}
        onPress={() => navigation.navigate('NotesEditorScreen', { note: item, subjectId })}
        activeOpacity={0.75}
      >
        <View style={styles.cardTop}>
          <Text style={[styles.noteTitle, { color: theme.colors.textPrimary }]} numberOfLines={1}>{item.title || 'Untitled Note'}</Text>
          <Text style={[styles.noteDate, { color: theme.colors.textTertiary }]}>{dateStr}</Text>
        </View>
        <Text style={[styles.notePreview, { color: theme.colors.textSecondary }]} numberOfLines={2}>{preview}</Text>
      </TouchableOpacity>
    );
  }, [navigation, subjectId, theme]);

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
          <Text style={[styles.countText, { color: theme.colors.textSecondary }]}>{notes.length} {notes.length === 1 ? 'Note' : 'Notes'}</Text>
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: `${theme.colors.primary}15`, borderRadius: theme.borderRadius.full }]}
            onPress={() => navigation.navigate('NotesEditorScreen', { subjectId })}
            activeOpacity={0.8}
          >
            <Text style={[styles.addBtnText, { color: theme.colors.primary }]}>+ New note</Text>
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
        style={[styles.fab, { bottom: fabBottom, backgroundColor: theme.colors.accent }]}
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
  loadingContainer: { padding: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 4, paddingBottom: 4 },
  countText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  addBtn: { paddingHorizontal: 12, paddingVertical: 5 },
  addBtnText: { fontSize: 10, fontWeight: '700' },
  listContent: { padding: 16 },
  mb: { marginBottom: 8 },
  card: { padding: 16, marginBottom: 8, borderWidth: 1 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  noteTitle: { fontSize: 13, fontWeight: '800', flex: 1, marginRight: 4 },
  noteDate: { fontSize: 9, fontWeight: '600' },
  notePreview: { fontSize: 10, lineHeight: 18 },
  fab: { position: 'absolute', right: 16, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', zIndex: 10 },
  fabIcon: { fontSize: 28, color: '#FFFFFF', lineHeight: 30, fontWeight: '700' },
});

export default NotesTab;
