import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Markdown from 'react-native-markdown-display';
import { useTheme } from '../../config/ThemeContext';
import useNotes from '../../hooks/useNotes';
import useUIStore from '../../store/useUIStore';
import { getReadingTime, getSavedAgoText, getWordCount, markdownStyles } from '../../utils/markdownHelpers';

import ConfirmModal from '../../components/common/ConfirmModal';
import EditorToolbar from '../../components/study/EditorToolbar';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import AppHeader from '../../components/common/AppHeader';

/** Markdown Note Editor with top action buttons beside title. */
const NotesEditorScreen = React.memo(({ navigation, route }) => {
  const { theme } = useTheme();
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
    <ScreenWrapper noPadding>
      <KeyboardAvoidingView style={styles.flexOne} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <AppHeader title={isEditMode ? 'Edit Note' : 'New Note'} showBack onBack={async () => { await handleSave(true); navigation.goBack(); }} />
        <View style={[styles.titleSection, { backgroundColor: theme.colors.surface, borderBottomColor: `${theme.colors.textTertiary}15` }]}>
          <View style={styles.titleRow}>
            <TextInput
              style={[styles.titleInput, { color: theme.colors.textPrimary }]}
              value={title}
              onChangeText={setTitle}
              placeholder="Untitled note"
              placeholderTextColor={theme.colors.textTertiary}
              maxLength={100}
              autoFocus={!isEditMode}
            />
            <View style={styles.titleActionsRow}>
              {isEditMode && (
                <TouchableOpacity onPress={() => setShowDeleteModal(true)} style={[styles.deleteIconBtn, { backgroundColor: `${theme.colors.error}15`, borderRadius: theme.borderRadius.sm }]} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Text style={styles.deleteIconText}>🗑</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={() => handleSave(false)}
                style={[
                  styles.savePillBtn,
                  { borderRadius: theme.borderRadius.full, backgroundColor: theme.colors.primary },
                  isSaving && { backgroundColor: `${theme.colors.textTertiary}60` },
                  isSaved && { backgroundColor: theme.colors.success },
                ]}
                disabled={isSaving || isSaved}
                activeOpacity={0.8}
              >
                <Text style={[styles.savePillText, { color: theme.colors.surface }]}>{isSaving ? 'Saving...' : isSaved ? 'Saved ✓' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </View>
          <Text style={[styles.metaText, { color: theme.colors.textTertiary }]}>{savedAgoText ? `${savedAgoText} • ` : ''}{wordCount} words • {readingTime}m read</Text>
        </View>

        <EditorToolbar onInsertShortcut={handleInsertShortcut} isPreview={isPreview} onTogglePreview={() => setIsPreview((p) => !p)} />

        {isPreview ? (
          <ScrollView style={[styles.previewScroll, { backgroundColor: theme.colors.surface }]} contentContainerStyle={styles.previewContent}>
            <Markdown style={markdownStyles}>{content || '*No content to preview...*'}</Markdown>
          </ScrollView>
        ) : (
          <TextInput
            style={[styles.editorInput, { backgroundColor: theme.colors.surface, color: theme.colors.textPrimary }]}
            value={content}
            onChangeText={setContent}
            placeholder="Start writing lecture notes, summaries, formulas..."
            placeholderTextColor={theme.colors.textTertiary}
            multiline
            textAlignVertical="top"
          />
        )}

        <ConfirmModal visible={showDeleteModal} title="Delete this note?" message="This action cannot be undone." confirmLabel="Delete" isDanger onConfirm={handleDelete} onCancel={() => setShowDeleteModal(false)} />
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
});

const styles = StyleSheet.create({
  flexOne: { flex: 1 },
  titleSection: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8, borderBottomWidth: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  titleInput: { flex: 1, fontSize: 18, fontWeight: '600', padding: 0 },
  titleActionsRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  deleteIconBtn: { padding: 6 },
  deleteIconText: { fontSize: 16 },
  savePillBtn: { paddingHorizontal: 16, paddingVertical: 6, minWidth: 62, alignItems: 'center' },
  savePillText: { fontSize: 10, fontWeight: '700' },
  metaText: { fontSize: 9, fontWeight: '600', marginTop: 6 },
  editorInput: { flex: 1, padding: 16, fontSize: 13, lineHeight: 22 },
  previewScroll: { flex: 1 },
  previewContent: { padding: 16, paddingBottom: 60 },
});

export default NotesEditorScreen;
