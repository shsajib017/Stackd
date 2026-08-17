import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Markdown from 'react-native-markdown-display';
import { borderRadius, colors, fontSizes, spacing } from '../../config/theme';
import useNotes from '../../hooks/useNotes';
import useUIStore from '../../store/useUIStore';
import { getReadingTime, getSavedAgoText, getWordCount, markdownStyles } from '../../utils/markdownHelpers';

import ConfirmModal from '../../components/common/ConfirmModal';
import EditorToolbar from '../../components/study/EditorToolbar';
import AppHeader from '../../components/common/AppHeader';

/** Markdown Note Editor with top action buttons beside title. */
const NotesEditorScreen = React.memo(({ navigation, route }) => {
  const initialNote = route.params?.note;
  const subjectId = route.params?.subjectId || initialNote?.subject_id;
  const isEditMode = Boolean(initialNote?.id);

  const showToast = useUIStore((state) => state.showToast);
  const { addNote, saveNote, deleteNote } = useNotes(subjectId);

  const [title, setTitle] = useState(initialNote?.title || '');
  const [content, setContent] = useState(initialNote?.content || '');
  const [isPreview, setIsPreview] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle');
  const [lastSavedAt, setLastSavedAt] = useState(initialNote?.updated_at ? new Date(initialNote.updated_at).getTime() : null);
  const [, setTicker] = useState(0);

  const activeNoteIdRef = useRef(initialNote?.id || null);
  const titleRef = useRef(title);
  titleRef.current = title;
  const contentRef = useRef(content);
  contentRef.current = content;

  useFocusEffect(useCallback(() => {
    if (!route.params?.note) {
      setTitle(''); setContent(''); activeNoteIdRef.current = null; setLastSavedAt(null); setSaveStatus('idle');
    } else {
      setTitle(route.params.note.title || ''); setContent(route.params.note.content || '');
      activeNoteIdRef.current = route.params.note.id;
      setLastSavedAt(new Date(route.params.note.updated_at || route.params.note.created_at).getTime());
    }
  }, [route.params?.note]));

  useEffect(() => {
    const t = setInterval(() => setTicker((p) => p + 1), 15000);
    return () => clearInterval(t);
  }, []);

  const wordCount = useMemo(() => getWordCount(content), [content]);
  const readingTime = useMemo(() => getReadingTime(wordCount), [wordCount]);
  const savedAgoText = useMemo(() => getSavedAgoText(lastSavedAt), [lastSavedAt]);

  const handleSave = useCallback(async (silent = false) => {
    const noteTitle = titleRef.current.trim() || 'Untitled note';
    const noteContent = contentRef.current;
    if (!noteTitle && !noteContent) return;

    try {
      if (!silent) setSaveStatus('saving');
      if (activeNoteIdRef.current) {
        await saveNote(activeNoteIdRef.current, { title: noteTitle, content: noteContent });
      } else {
        const created = await addNote(subjectId, { title: noteTitle, content: noteContent });
        if (created?.id) activeNoteIdRef.current = created.id;
      }
      setLastSavedAt(Date.now());
      if (!silent) {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
        showToast('Note saved', 'success');
      }
    } catch {
      if (!silent) {
        setSaveStatus('idle');
        showToast('Failed to save note', 'error');
      }
    }
  }, [addNote, saveNote, showToast, subjectId]);

  useEffect(() => {
    const timer = setInterval(() => { handleSave(true); }, 30000);
    return () => clearInterval(timer);
  }, [handleSave]);

  const handleInsertShortcut = useCallback((type) => {
    const map = { bold: '**Bold text**', italic: '*Italic text*', heading: '\n## Heading\n', bullet: '\n- List item', number: '\n1. List item', divider: '\n---\n' };
    setContent((prev) => `${prev || ''}${map[type] || ''}`);
  }, []);

  const handleDelete = useCallback(async () => {
    if (!activeNoteIdRef.current) return;
    try {
      await deleteNote(activeNoteIdRef.current, subjectId);
      showToast('Note deleted', 'info');
      navigation.goBack();
    } catch {
      showToast('Failed to delete note', 'error');
    }
  }, [deleteNote, navigation, showToast, subjectId]);

  const isSaving = saveStatus === 'saving';
  const isSaved = saveStatus === 'saved';

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <AppHeader title={isEditMode ? 'Edit Note' : 'New Note'} showBack onBack={async () => { await handleSave(true); navigation.goBack(); }} />
      <View style={styles.titleSection}>
        <View style={styles.titleRow}>
          <TextInput style={styles.titleInput} value={title} onChangeText={setTitle} placeholder="Untitled note" placeholderTextColor={colors.textTertiary} maxLength={100} autoFocus={!isEditMode} />
          <View style={styles.titleActionsRow}>
            {isEditMode && (
              <TouchableOpacity onPress={() => setShowDeleteModal(true)} style={styles.deleteIconBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={styles.deleteIconText}>🗑</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => handleSave(false)} style={[styles.savePillBtn, isSaving && styles.saveBtnSaving, isSaved && styles.saveBtnSaved]} disabled={isSaving || isSaved} activeOpacity={0.8}>
              <Text style={styles.savePillText}>{isSaving ? 'Saving...' : isSaved ? 'Saved ✓' : 'Save'}</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.metaText}>{savedAgoText ? `${savedAgoText} • ` : ''}{wordCount} words • {readingTime}m read</Text>
      </View>

      <EditorToolbar onInsertShortcut={handleInsertShortcut} isPreview={isPreview} onTogglePreview={() => setIsPreview((p) => !p)} />

      {isPreview ? (
        <ScrollView style={styles.previewScroll} contentContainerStyle={styles.previewContent}>
          <Markdown style={markdownStyles}>{content || '*No content to preview...*'}</Markdown>
        </ScrollView>
      ) : (
        <TextInput style={styles.editorInput} value={content} onChangeText={setContent} placeholder="Start writing lecture notes, summaries, formulas..." placeholderTextColor={colors.textTertiary} multiline textAlignVertical="top" />
      )}

      <ConfirmModal visible={showDeleteModal} title="Delete this note?" message="This action cannot be undone." confirmLabel="Delete" isDanger onConfirm={handleDelete} onCancel={() => setShowDeleteModal(false)} />
    </KeyboardAvoidingView>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  titleSection: { backgroundColor: colors.surface, paddingHorizontal: spacing.md, paddingTop: spacing.md, paddingBottom: spacing.xs, borderBottomWidth: 1, borderBottomColor: `${colors.textTertiary}15` },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  titleInput: { flex: 1, fontSize: fontSizes.xl, fontWeight: '600', color: colors.textPrimary, padding: 0 },
  titleActionsRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  deleteIconBtn: { padding: 6, borderRadius: borderRadius.sm, backgroundColor: `${colors.error}15` },
  deleteIconText: { fontSize: 16 },
  savePillBtn: { backgroundColor: colors.primary, paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: borderRadius.full, minWidth: 62, alignItems: 'center' },
  saveBtnSaving: { backgroundColor: `${colors.textTertiary}60` },
  saveBtnSaved: { backgroundColor: colors.success },
  savePillText: { fontSize: fontSizes.xs, fontWeight: '700', color: colors.surface },
  metaText: { fontSize: fontSizes.xs - 1, color: colors.textTertiary, fontWeight: '600', marginTop: 6 },
  headerBtn: { paddingHorizontal: spacing.xs },
  headerIcon: { fontSize: fontSizes.xl, color: colors.textPrimary, fontWeight: '700' },
  editorInput: { flex: 1, backgroundColor: colors.surface, padding: spacing.md, fontSize: fontSizes.sm + 1, color: colors.textPrimary, lineHeight: 22 },
  previewScroll: { flex: 1, backgroundColor: colors.surface },
  previewContent: { padding: spacing.md, paddingBottom: 60 },
});

export default NotesEditorScreen;
