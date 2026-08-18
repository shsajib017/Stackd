import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../config/ThemeContext';
import { analyseSyllabus as geminiAnalyseSyllabus } from '../../api/gemini';
import useAuthStore from '../../store/useAuthStore';
import useMaterials from '../../hooks/useMaterials';
import useStudySessions from '../../hooks/useStudySessions';
import useStudyStore from '../../store/useStudyStore';
import useUIStore from '../../store/useUIStore';
import { addBatchTopics } from '../../supabase/topics';

import Button from '../../components/common/Button';
import TopicResultsList from '../../components/study/TopicResultsList';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import AppHeader from '../../components/common/AppHeader';

const LOADING_MESSAGES = ['Reading your syllabus...', 'Identifying topics...', 'Estimating study time...'];

/** AI-Driven Syllabus Document & Text Parser Screen. */
const SyllabusUploadScreen = React.memo(({ navigation, route }) => {
  const { theme } = useTheme();
  const user = useAuthStore((state) => state.user);
  const subjects = useStudyStore((state) => state.subjects);
  const showToast = useUIStore((state) => state.showToast);
  const { extractTextFromPDF } = useMaterials();
  const { fetchSessions } = useStudySessions();

  useFocusEffect(useCallback(() => { fetchSessions(); }, [fetchSessions]));

  const subjectId = route.params?.subjectId;
  const preSelectedFile = route.params?.material || route.params?.file;
  const activeSubject = useMemo(() => (subjects || []).find((s) => s.id === subjectId) || subjects[0] || {}, [subjectId, subjects]);

  const [activeTab, setActiveTab] = useState('Upload PDF');
  const [selectedFile, setSelectedFile] = useState(preSelectedFile || null);
  const [pastedText, setPastedText] = useState('');
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [topics, setTopics] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isAnalysing) return;
    const interval = setInterval(() => { setLoadingMsgIdx((p) => (p + 1) % LOADING_MESSAGES.length); }, 2000);
    return () => clearInterval(interval);
  }, [isAnalysing]);

  const handlePickDocument = useCallback(async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: ['application/pdf'], copyToCacheDirectory: true });
      if (!res.canceled && res.assets?.length) { setSelectedFile(res.assets[0]); setErrorMessage(null); }
    } catch {}
  }, []);

  const handleAnalyse = useCallback(async () => {
    setErrorMessage(null);
    try {
      setIsAnalysing(true);
      let content = pastedText.trim();
      if (activeTab === 'Upload PDF' && selectedFile?.uri) { content = await extractTextFromPDF(selectedFile.uri); }
      if (!content || content.length < 50) throw new Error('Insufficient syllabus content to analyse.');
      const parsed = await geminiAnalyseSyllabus(content);
      if (!parsed?.length) throw new Error('Could not identify topics in this syllabus.');
      setTopics(parsed);
    } catch (err) {
      setErrorMessage(err.message || 'Syllabus analysis failed.');
    } finally {
      setIsAnalysing(false);
    }
  }, [activeTab, extractTextFromPDF, pastedText, selectedFile?.uri]);

  const handleSaveTopics = useCallback(async () => {
    const sId = activeSubject?.id || subjectId;
    if (!user?.id || !sId || !topics?.length) return;
    try {
      setIsSaving(true);
      const payload = topics.map((t) => ({ name: t.title, is_hot_topic: false, frequency_count: 0, completed: false }));
      await addBatchTopics(sId, user.id, payload);
      showToast(`${topics.length} topics saved successfully! 🎓`, 'success');
      navigation.goBack();
    } catch (err) {
      showToast(err.message || 'Failed to save topics', 'error');
    } finally {
      setIsSaving(false);
    }
  }, [activeSubject?.id, navigation, showToast, subjectId, topics, user?.id]);

  const canAnalyse = activeTab === 'Upload PDF' ? Boolean(selectedFile) : pastedText.trim().length >= 100;

  return (
    <ScreenWrapper>
      <AppHeader title="Analyse Syllabus" showBack onBack={() => navigation.goBack()} />
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.subjectBadge, { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.full, borderColor: `${theme.colors.textTertiary}20` }]}>
          <View style={[styles.subDot, { backgroundColor: activeSubject.color || theme.colors.primary }]} />
          <Text style={[styles.subName, { color: theme.colors.textPrimary }]} numberOfLines={1}>{activeSubject.name || 'Subject'}</Text>
        </View>

        {!topics ? (
          <View>
            <View style={[styles.modeTabs, { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md, borderColor: `${theme.colors.textTertiary}20` }]}>
              {['Upload PDF', 'Paste text'].map((tab) => {
                const isActive = activeTab === tab;
                return (
                  <TouchableOpacity
                    key={tab}
                    style={[
                      styles.modeTab,
                      { borderRadius: theme.borderRadius.sm },
                      isActive && { backgroundColor: theme.colors.primary },
                    ]}
                    onPress={() => setActiveTab(tab)}
                  >
                    <Text style={[styles.modeTabText, { color: isActive ? theme.colors.surface : theme.colors.textSecondary }]}>{tab}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {activeTab === 'Upload PDF' ? (
              selectedFile ? (
                <View style={[styles.fileCard, { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md, borderColor: `${theme.colors.textTertiary}20` }]}>
                  <Text style={styles.fileIcon}>📄</Text>
                  <View style={styles.fileInfo}>
                    <Text style={[styles.fileName, { color: theme.colors.textPrimary }]} numberOfLines={1}>{selectedFile.name || selectedFile.title || 'Syllabus.pdf'}</Text>
                    <Text style={[styles.fileSize, { color: theme.colors.textTertiary }]}>{selectedFile.size ? `${Math.round(selectedFile.size / 1024)} KB` : 'Ready'}</Text>
                  </View>
                  <TouchableOpacity onPress={() => setSelectedFile(null)} style={styles.removeBtn}>
                    <Text style={[styles.removeText, { color: theme.colors.error }]}>✕</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.dropZone, { backgroundColor: theme.colors.surface, borderColor: `${theme.colors.primary}40`, borderRadius: theme.borderRadius.lg }]}
                  onPress={handlePickDocument}
                  activeOpacity={0.75}
                >
                  <Text style={styles.dropIcon}>📄</Text>
                  <Text style={[styles.dropTitle, { color: theme.colors.textPrimary }]}>Tap to upload syllabus PDF</Text>
                  <Text style={[styles.dropSub, { color: theme.colors.textTertiary }]}>Supports PDF documents</Text>
                </TouchableOpacity>
              )
            ) : (
              <View>
                <TextInput
                  style={[styles.pasteInput, { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md, borderColor: `${theme.colors.textTertiary}20`, color: theme.colors.textPrimary }]}
                  value={pastedText}
                  onChangeText={setPastedText}
                  placeholder="Paste your syllabus content here (course overview, module units, topics)..."
                  placeholderTextColor={theme.colors.textTertiary}
                  multiline
                  textAlignVertical="top"
                />
                <Text style={[styles.charCount, { color: theme.colors.textTertiary }]}>{pastedText.length}/100 minimum characters</Text>
              </View>
            )}

            {errorMessage ? <Text style={[styles.errorBanner, { color: theme.colors.error }]}>{errorMessage}</Text> : null}

            {isAnalysing ? (
              <View style={[styles.loadingBox, { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md }]}>
                <ActivityIndicator color={theme.colors.primary} size="small" />
                <Text style={[styles.loadingText, { color: theme.colors.primary }]}>{LOADING_MESSAGES[loadingMsgIdx]}</Text>
              </View>
            ) : (
              <Button label="Analyse syllabus" onPress={handleAnalyse} disabled={!canAnalyse} fullWidth style={styles.actionBtn} />
            )}
          </View>
        ) : (
          <View>
            <TopicResultsList topics={topics} onUpdateTitle={(idx, txt) => setTopics((prev) => prev.map((t, i) => i === idx ? { ...t, title: txt } : t))} onDeleteTopic={(idx) => setTopics((prev) => prev.filter((_, i) => i !== idx))} onAddTopic={() => setTopics((prev) => [...prev, { title: 'New Unit Topic', estimated_hours: 2, complexity: 3 }])} />
            <Button label="Save topics" onPress={handleSaveTopics} loading={isSaving} fullWidth style={styles.actionBtn} />
            <Button label="Discard" variant="secondary" onPress={() => setTopics(null)} fullWidth style={styles.discardBtn} />
          </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
});

const styles = StyleSheet.create({
  scrollContainer: { flex: 1 },
  content: { paddingVertical: 8, paddingBottom: 80 },
  subjectBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, marginBottom: 16, borderWidth: 1 },
  subDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  subName: { fontSize: 11, fontWeight: '700' },
  modeTabs: { flexDirection: 'row', padding: 3, marginBottom: 16, borderWidth: 1 },
  modeTab: { flex: 1, paddingVertical: 6, alignItems: 'center' },
  modeTabText: { fontSize: 11, fontWeight: '700' },
  dropZone: { borderWidth: 2, borderStyle: 'dashed', padding: 24, alignItems: 'center', marginBottom: 16 },
  dropIcon: { fontSize: 36, marginBottom: 4 },
  dropTitle: { fontSize: 13, fontWeight: '800', marginBottom: 2 },
  dropSub: { fontSize: 10 },
  fileCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderWidth: 1, marginBottom: 16 },
  fileIcon: { fontSize: 24, marginRight: 8 },
  fileInfo: { flex: 1 },
  fileName: { fontSize: 12, fontWeight: '700' },
  fileSize: { fontSize: 9, marginTop: 2 },
  removeBtn: { padding: 4 },
  removeText: { fontSize: 12, fontWeight: '800' },
  pasteInput: { padding: 16, minHeight: 140, fontSize: 12, borderWidth: 1 },
  charCount: { fontSize: 9, textAlign: 'right', marginTop: 4, marginBottom: 16 },
  errorBanner: { fontSize: 10, fontWeight: '600', textAlign: 'center', marginBottom: 8 },
  loadingBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16, marginTop: 4 },
  loadingText: { fontSize: 12, fontWeight: '700' },
  actionBtn: { marginTop: 4 },
  discardBtn: { marginTop: 4 },
});

export default SyllabusUploadScreen;
