import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useFocusEffect } from '@react-navigation/native';
import { borderRadius, colors, fontSizes, spacing } from '../../config/theme';
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
import AppHeader from '../../components/common/AppHeader';

const LOADING_MESSAGES = ['Reading exam papers...', 'Finding patterns...', 'Ranking topics by frequency...'];

/** AI-Driven Past Question Paper (PYQ) Topic Extractor Screen. */
const PYQUploadScreen = React.memo(({ navigation, route }) => {
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
    <View style={styles.screen}>
      <AppHeader title="Analyse Past Papers" showBack onBack={() => navigation.goBack()} />
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.subjectBadge}>
        <View style={[styles.subDot, { backgroundColor: activeSubject.color || colors.primary }]} />
        <Text style={styles.subName} numberOfLines={1}>{activeSubject.name || 'Subject'}</Text>
      </View>

      <TouchableOpacity style={styles.infoCard} onPress={() => setShowInfoCard((p) => !p)} activeOpacity={0.8}>
        <Text style={styles.infoTitle}>ℹ️ What is PYQ analysis? {showInfoCard ? '▲' : '▼'}</Text>
        {showInfoCard && <Text style={styles.infoBody}>Upload past exam papers and Stackd will identify which topics appear most frequently so you can prioritize your study.</Text>}
      </TouchableOpacity>

      {!results ? (
        <View>
          <View style={styles.modeTabs}>
            {['Upload PDF', 'Paste text'].map((tab) => (
              <TouchableOpacity key={tab} style={[styles.modeTab, activeTab === tab && styles.modeTabActive]} onPress={() => setActiveTab(tab)}>
                <Text style={[styles.modeTabText, activeTab === tab && styles.modeTabTextActive]}>{tab}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {activeTab === 'Upload PDF' ? (
            selectedFiles.length > 0 ? (
              <SelectedFilesList files={selectedFiles} onRemove={(idx) => setSelectedFiles((prev) => prev.filter((_, i) => i !== idx))} onAddMore={handlePickDocument} />
            ) : (
              <TouchableOpacity style={styles.dropZone} onPress={handlePickDocument} activeOpacity={0.75}>
                <Text style={styles.dropIcon}>📄</Text>
                <Text style={styles.dropTitle}>Tap to upload past exam paper</Text>
                <Text style={styles.dropSub}>You can upload multiple papers for better accuracy</Text>
              </TouchableOpacity>
            )
          ) : (
            <View>
              <TextInput style={styles.pasteInput} value={pastedText} onChangeText={setPastedText} placeholder="Paste exam questions or paper content here..." placeholderTextColor={colors.textTertiary} multiline textAlignVertical="top" />
              <Text style={styles.charCount}>{pastedText.length}/100 minimum characters</Text>
            </View>
          )}

          {errorMessage ? <Text style={styles.errorBanner}>{errorMessage}</Text> : null}

          {isAnalysing ? (
            <View style={styles.loadingBox}><ActivityIndicator color={colors.accent} size="small" /><Text style={styles.loadingText}>{LOADING_MESSAGES[loadingMsgIdx]}</Text></View>
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
    </View>
  );
});

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  scrollContainer: { flex: 1 },
  headerBtn: { paddingHorizontal: spacing.sm },
  headerBackIcon: { fontSize: fontSizes.xl, color: colors.textPrimary, fontWeight: '700' },
  content: { padding: spacing.md, paddingBottom: 80 },
  subjectBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', backgroundColor: colors.surface, paddingHorizontal: spacing.sm + 2, paddingVertical: 6, borderRadius: borderRadius.full, marginBottom: spacing.sm, borderWidth: 1, borderColor: `${colors.textTertiary}20` },
  subDot: { width: 8, height: 8, borderRadius: 4, marginRight: spacing.xs + 2 },
  subName: { fontSize: fontSizes.xs + 1, fontWeight: '700', color: colors.textPrimary },
  infoCard: { backgroundColor: `${colors.accent}12`, borderRadius: borderRadius.md, padding: spacing.sm + 2, marginBottom: spacing.md, borderWidth: 1, borderColor: `${colors.accent}30` },
  infoTitle: { fontSize: fontSizes.xs + 1, fontWeight: '700', color: colors.accent },
  infoBody: { fontSize: fontSizes.xs, color: colors.textPrimary, marginTop: 4, lineHeight: 18 },
  modeTabs: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: 3, marginBottom: spacing.md, borderWidth: 1, borderColor: `${colors.textTertiary}20` },
  modeTab: { flex: 1, paddingVertical: spacing.xs + 2, alignItems: 'center', borderRadius: borderRadius.sm },
  modeTabActive: { backgroundColor: colors.primary },
  modeTabText: { fontSize: fontSizes.xs + 1, fontWeight: '700', color: colors.textSecondary },
  modeTabTextActive: { color: colors.surface },
  dropZone: { backgroundColor: colors.surface, borderWidth: 2, borderColor: `${colors.accent}40`, borderStyle: 'dashed', borderRadius: borderRadius.lg, padding: spacing.xl, alignItems: 'center', marginBottom: spacing.md },
  dropIcon: { fontSize: 36, marginBottom: spacing.xs },
  dropTitle: { fontSize: fontSizes.sm + 1, fontWeight: '800', color: colors.textPrimary, marginBottom: 2 },
  dropSub: { fontSize: fontSizes.xs, color: colors.textTertiary, textAlign: 'center' },
  pasteInput: { backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.md, minHeight: 140, fontSize: fontSizes.sm, color: colors.textPrimary, borderWidth: 1, borderColor: `${colors.textTertiary}20` },
  charCount: { fontSize: fontSizes.xs - 1, color: colors.textTertiary, textAlign: 'right', marginTop: 4, marginBottom: spacing.md },
  errorBanner: { fontSize: fontSizes.xs, color: colors.error, fontWeight: '600', textAlign: 'center', marginBottom: spacing.sm },
  loadingBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, padding: spacing.md, backgroundColor: colors.surface, borderRadius: borderRadius.md, marginTop: spacing.xs },
  loadingText: { fontSize: fontSizes.sm, fontWeight: '700', color: colors.accent },
  actionBtn: { marginTop: spacing.xs },
  discardBtn: { marginTop: spacing.xs },
});

export default PYQUploadScreen;
