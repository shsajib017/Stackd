import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../config/ThemeContext';
import { analysePYQ as geminiAnalysePYQ } from '../../api/gemini';
import useAuthStore from '../../store/useAuthStore';
import useMaterials from '../../hooks/useMaterials';
import useStudySessions from '../../hooks/useStudySessions';
import useStudyStore from '../../store/useStudyStore';
import useUIStore from '../../store/useUIStore';
import { addBatchTopics } from '../../supabase/topics';

import Button from '../../components/common/Button';
import HotTopicResultsList from '../../components/study/HotTopicResultsList';
import SelectedFilesList from '../../components/study/SelectedFilesList';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import AppHeader from '../../components/common/AppHeader';

const LOADING_MESSAGES = ['Reading exam papers...', 'Finding patterns...', 'Ranking topics by frequency...'];

/** AI-Driven Past Question Paper (PYQ) Topic Extractor Screen. */
const PYQUploadScreen = React.memo(({ navigation, route }) => {
  const { theme } = useTheme();
  const user = useAuthStore((state) => state.user);
  const subjects = useStudyStore((state) => state.subjects);
  const showToast = useUIStore((state) => state.showToast);
  const { extractTextFromPDF } = useMaterials();
  const { fetchSessions } = useStudySessions();

  const subjectId = route.params?.subjectId;
  const initialFile = route.params?.material || route.params?.file;
  const activeSubject = useMemo(() => (subjects || []).find((s) => s.id === subjectId) || subjects[0] || {}, [subjectId, subjects]);

  const [activeTab, setActiveTab] = useState('Upload PDF');
  const [selectedFiles, setSelectedFiles] = useState(initialFile ? [initialFile] : []);
  const [pastedText, setPastedText] = useState('');
  const [showInfoCard, setShowInfoCard] = useState(false);
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [results, setResults] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useFocusEffect(useCallback(() => { fetchSessions(); }, [fetchSessions]));

  useEffect(() => {
    if (!isAnalysing) return;
    const interval = setInterval(() => { setLoadingMsgIdx((p) => (p + 1) % LOADING_MESSAGES.length); }, 2000);
    return () => clearInterval(interval);
  }, [isAnalysing]);

  const handlePickDocument = useCallback(async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: ['application/pdf'], multiple: true, copyToCacheDirectory: true });
      if (!res.canceled && res.assets?.length) { setSelectedFiles((prev) => [...prev, ...res.assets]); setErrorMessage(null); }
    } catch {}
  }, []);

  const handleAnalyse = useCallback(async () => {
    setErrorMessage(null);
    try {
      setIsAnalysing(true);
      let combinedText = pastedText.trim();
      if (activeTab === 'Upload PDF' && selectedFiles.length) {
        const textSnippets = await Promise.all(selectedFiles.map((f) => extractTextFromPDF(f.uri || f.file_url)));
        combinedText = textSnippets.join('\n\n--- NEXT PAPER ---\n\n');
      }
      if (!combinedText || combinedText.length < 50) throw new Error('Insufficient exam question content to analyse.');
      const parsed = await geminiAnalysePYQ(combinedText);
      if (!parsed?.length) throw new Error('No repeating topics found in provided papers.');
      setResults(parsed);
    } catch (err) {
      setErrorMessage(err.message || 'PYQ analysis failed.');
    } finally {
      setIsAnalysing(false);
    }
  }, [activeTab, extractTextFromPDF, pastedText, selectedFiles]);

  const handleSaveHotTopics = useCallback(async () => {
    const sId = activeSubject?.id || subjectId;
    if (!user?.id || !sId || !results?.length) return;
    try {
      setIsSaving(true);
      const payload = results.map((t) => ({ name: t.topic || t.name, is_hot_topic: true, frequency_count: Number(t.frequency_count) || 1, completed: false }));
      await addBatchTopics(sId, user.id, payload);
      showToast(`${results.length} Hot Topics saved successfully! 🔥`, 'success');
      navigation.goBack();
    } catch (err) {
      showToast(err.message || 'Failed to save hot topics', 'error');
    } finally {
      setIsSaving(false);
    }
  }, [activeSubject?.id, navigation, results, showToast, subjectId, user?.id]);

  const canAnalyse = activeTab === 'Upload PDF' ? selectedFiles.length > 0 : pastedText.trim().length >= 100;

  return (
    <ScreenWrapper>
      <AppHeader title="Analyse Past Papers" showBack onBack={() => navigation.goBack()} />
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.subjectBadge, { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.full, borderColor: `${theme.colors.textTertiary}20` }]}>
          <View style={[styles.subDot, { backgroundColor: activeSubject.color || theme.colors.primary }]} />
          <Text style={[styles.subName, { color: theme.colors.textPrimary }]} numberOfLines={1}>{activeSubject.name || 'Subject'}</Text>
        </View>

        <TouchableOpacity style={[styles.infoCard, { backgroundColor: `${theme.colors.accent}12`, borderColor: `${theme.colors.accent}30`, borderRadius: theme.borderRadius.md }]} onPress={() => setShowInfoCard((p) => !p)} activeOpacity={0.8}>
          <Text style={[styles.infoTitle, { color: theme.colors.accent }]}>ℹ️ What is PYQ analysis? {showInfoCard ? '▲' : '▼'}</Text>
          {showInfoCard && <Text style={[styles.infoBody, { color: theme.colors.textPrimary }]}>Upload past exam papers and Stackd will identify which topics appear most frequently so you can prioritize your study.</Text>}
        </TouchableOpacity>

        {!results ? (
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
              selectedFiles.length > 0 ? (
                <SelectedFilesList files={selectedFiles} onRemove={(idx) => setSelectedFiles((prev) => prev.filter((_, i) => i !== idx))} onAddMore={handlePickDocument} />
              ) : (
                <TouchableOpacity
                  style={[styles.dropZone, { backgroundColor: theme.colors.surface, borderColor: `${theme.colors.accent}40`, borderRadius: theme.borderRadius.lg }]}
                  onPress={handlePickDocument}
                  activeOpacity={0.75}
                >
                  <Text style={styles.dropIcon}>📄</Text>
                  <Text style={[styles.dropTitle, { color: theme.colors.textPrimary }]}>Tap to upload past exam paper</Text>
                  <Text style={[styles.dropSub, { color: theme.colors.textTertiary }]}>You can upload multiple papers for better accuracy</Text>
                </TouchableOpacity>
              )
            ) : (
              <View>
                <TextInput
                  style={[styles.pasteInput, { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md, borderColor: `${theme.colors.textTertiary}20`, color: theme.colors.textPrimary }]}
                  value={pastedText}
                  onChangeText={setPastedText}
                  placeholder="Paste exam questions or paper content here..."
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
                <ActivityIndicator color={theme.colors.accent} size="small" />
                <Text style={[styles.loadingText, { color: theme.colors.accent }]}>{LOADING_MESSAGES[loadingMsgIdx]}</Text>
              </View>
            ) : (
              <Button label="Analyse questions" onPress={handleAnalyse} disabled={!canAnalyse} fullWidth style={styles.actionBtn} />
            )}
          </View>
        ) : (
          <View>
            <HotTopicResultsList topics={results} onUpdateTopic={(idx, txt) => setResults((prev) => prev.map((t, i) => i === idx ? { ...t, topic: txt } : t))} onDeleteTopic={(idx) => setResults((prev) => prev.filter((_, i) => i !== idx))} onAddTopic={() => setResults((prev) => [...prev, { topic: 'New Tested Concept', frequency_count: 2, importance: 'medium' }])} />
            <Button label="Save as Hot Topics" onPress={handleSaveHotTopics} loading={isSaving} fullWidth style={styles.actionBtn} />
            <Button label="Discard" variant="secondary" onPress={() => setResults(null)} fullWidth style={styles.discardBtn} />
          </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
});

const styles = StyleSheet.create({
  scrollContainer: { flex: 1 },
  content: { paddingVertical: 8, paddingBottom: 80 },
  subjectBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, marginBottom: 8, borderWidth: 1 },
  subDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  subName: { fontSize: 11, fontWeight: '700' },
  infoCard: { padding: 10, marginBottom: 16, borderWidth: 1 },
  infoTitle: { fontSize: 11, fontWeight: '700' },
  infoBody: { fontSize: 10, marginTop: 4, lineHeight: 18 },
  modeTabs: { flexDirection: 'row', padding: 3, marginBottom: 16, borderWidth: 1 },
  modeTab: { flex: 1, paddingVertical: 6, alignItems: 'center' },
  modeTabText: { fontSize: 11, fontWeight: '700' },
  dropZone: { borderWidth: 2, borderStyle: 'dashed', padding: 24, alignItems: 'center', marginBottom: 16 },
  dropIcon: { fontSize: 36, marginBottom: 4 },
  dropTitle: { fontSize: 13, fontWeight: '800', marginBottom: 2 },
  dropSub: { fontSize: 10, textAlign: 'center' },
  pasteInput: { padding: 16, minHeight: 140, fontSize: 12, borderWidth: 1 },
  charCount: { fontSize: 9, textAlign: 'right', marginTop: 4, marginBottom: 16 },
  errorBanner: { fontSize: 10, fontWeight: '600', textAlign: 'center', marginBottom: 8 },
  loadingBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16, marginTop: 4 },
  loadingText: { fontSize: 12, fontWeight: '700' },
  actionBtn: { marginTop: 4 },
  discardBtn: { marginTop: 4 },
});

export default PYQUploadScreen;
