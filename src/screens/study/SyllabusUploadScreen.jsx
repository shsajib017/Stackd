import React, { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useFocusEffect } from '@react-navigation/native';
import { borderRadius, colors, fontSizes, spacing } from '../../config/theme';
import { analyseSyllabus as geminiAnalyseSyllabus } from '../../api/gemini';
import useAuthStore from '../../store/useAuthStore';
import useMaterials from '../../hooks/useMaterials';
import useStudySessions from '../../hooks/useStudySessions';
import useStudyStore from '../../store/useStudyStore';
import useUIStore from '../../store/useUIStore';
import { addBatchTopics } from '../../supabase/topics';

import Button from '../../components/common/Button';
import TopicResultsList from '../../components/study/TopicResultsList';

const LOADING_MESSAGES = ['Reading your syllabus...', 'Identifying topics...', 'Estimating study time...'];

/** AI-Driven Syllabus Document & Text Parser Screen. */
const SyllabusUploadScreen = React.memo(({ navigation, route }) => {
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

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Analyse Syllabus',
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.headerBackIcon}>←</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

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
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.subjectBadge}>
        <View style={[styles.subDot, { backgroundColor: activeSubject.color || colors.primary }]} />
        <Text style={styles.subName} numberOfLines={1}>{activeSubject.name || 'Subject'}</Text>
      </View>

      {!topics ? (
        <View>
          <View style={styles.modeTabs}>
            {['Upload PDF', 'Paste text'].map((tab) => (
              <TouchableOpacity key={tab} style={[styles.modeTab, activeTab === tab && styles.modeTabActive]} onPress={() => setActiveTab(tab)}>
                <Text style={[styles.modeTabText, activeTab === tab && styles.modeTabTextActive]}>{tab}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {activeTab === 'Upload PDF' ? (
            selectedFile ? (
              <View style={styles.fileCard}>
                <Text style={styles.fileIcon}>📄</Text>
                <View style={styles.fileInfo}><Text style={styles.fileName} numberOfLines={1}>{selectedFile.name || selectedFile.title || 'Syllabus.pdf'}</Text><Text style={styles.fileSize}>{selectedFile.size ? `${Math.round(selectedFile.size / 1024)} KB` : 'Ready'}</Text></View>
                <TouchableOpacity onPress={() => setSelectedFile(null)} style={styles.removeBtn}><Text style={styles.removeText}>✕</Text></TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.dropZone} onPress={handlePickDocument} activeOpacity={0.75}>
                <Text style={styles.dropIcon}>📄</Text>
                <Text style={styles.dropTitle}>Tap to upload syllabus PDF</Text>
                <Text style={styles.dropSub}>Supports PDF documents</Text>
              </TouchableOpacity>
            )
          ) : (
            <View>
              <TextInput style={styles.pasteInput} value={pastedText} onChangeText={setPastedText} placeholder="Paste your syllabus content here (course overview, module units, topics)..." placeholderTextColor={colors.textTertiary} multiline textAlignVertical="top" />
              <Text style={styles.charCount}>{pastedText.length}/100 minimum characters</Text>
            </View>
          )}

          {errorMessage ? <Text style={styles.errorBanner}>{errorMessage}</Text> : null}

          {isAnalysing ? (
            <View style={styles.loadingBox}><ActivityIndicator color={colors.primary} size="small" /><Text style={styles.loadingText}>{LOADING_MESSAGES[loadingMsgIdx]}</Text></View>
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
  );
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerBtn: { paddingHorizontal: spacing.sm },
  headerBackIcon: { fontSize: fontSizes.xl, color: colors.textPrimary, fontWeight: '700' },
  content: { padding: spacing.md, paddingBottom: 80 },
  subjectBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', backgroundColor: colors.surface, paddingHorizontal: spacing.sm + 2, paddingVertical: 6, borderRadius: borderRadius.full, marginBottom: spacing.md, borderWidth: 1, borderColor: `${colors.textTertiary}20` },
  subDot: { width: 8, height: 8, borderRadius: 4, marginRight: spacing.xs + 2 },
  subName: { fontSize: fontSizes.xs + 1, fontWeight: '700', color: colors.textPrimary },
  modeTabs: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: 3, marginBottom: spacing.md, borderWidth: 1, borderColor: `${colors.textTertiary}20` },
  modeTab: { flex: 1, paddingVertical: spacing.xs + 2, alignItems: 'center', borderRadius: borderRadius.sm },
  modeTabActive: { backgroundColor: colors.primary },
  modeTabText: { fontSize: fontSizes.xs + 1, fontWeight: '700', color: colors.textSecondary },
  modeTabTextActive: { color: colors.surface },
  dropZone: { backgroundColor: colors.surface, borderWidth: 2, borderColor: `${colors.primary}40`, borderStyle: 'dashed', borderRadius: borderRadius.lg, padding: spacing.xl, alignItems: 'center', marginBottom: spacing.md },
  dropIcon: { fontSize: 36, marginBottom: spacing.xs },
  dropTitle: { fontSize: fontSizes.sm + 1, fontWeight: '800', color: colors.textPrimary, marginBottom: 2 },
  dropSub: { fontSize: fontSizes.xs, color: colors.textTertiary },
  fileCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.md, borderWidth: 1, borderColor: `${colors.textTertiary}20`, marginBottom: spacing.md },
  fileIcon: { fontSize: 24, marginRight: spacing.sm },
  fileInfo: { flex: 1 },
  fileName: { fontSize: fontSizes.sm, fontWeight: '700', color: colors.textPrimary },
  fileSize: { fontSize: fontSizes.xs - 1, color: colors.textTertiary, marginTop: 2 },
  removeBtn: { padding: 4 },
  removeText: { fontSize: fontSizes.sm, fontWeight: '800', color: colors.error },
  pasteInput: { backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.md, minHeight: 140, fontSize: fontSizes.sm, color: colors.textPrimary, borderWidth: 1, borderColor: `${colors.textTertiary}20` },
  charCount: { fontSize: fontSizes.xs - 1, color: colors.textTertiary, textAlign: 'right', marginTop: 4, marginBottom: spacing.md },
  errorBanner: { fontSize: fontSizes.xs, color: colors.error, fontWeight: '600', textAlign: 'center', marginBottom: spacing.sm },
  loadingBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, padding: spacing.md, backgroundColor: colors.surface, borderRadius: borderRadius.md, marginTop: spacing.xs },
  loadingText: { fontSize: fontSizes.sm, fontWeight: '700', color: colors.primary },
  actionBtn: { marginTop: spacing.xs },
  discardBtn: { marginTop: spacing.xs },
});

export default SyllabusUploadScreen;
