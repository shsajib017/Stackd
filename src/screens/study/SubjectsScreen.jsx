import React, { useCallback, useMemo, useState } from 'react';
import { ActionSheetIOS, Alert, FlatList, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../config/ThemeContext';
import useStudySessions from '../../hooks/useStudySessions';
import useStudyStore from '../../store/useStudyStore';
import { deleteSubject as removeSubjectFromDB } from '../../supabase/subjects';
import { formatDateShort, getDaysRemaining } from '../../utils/formatDate';

import ConfirmModal from '../../components/common/ConfirmModal';
import EmptyState from '../../components/common/EmptyState';
import SkeletonCard from '../../components/common/SkeletonCard';
import StatCard from '../../components/common/StatCard';
import StatusChip from '../../components/common/StatusChip';
import ProgressRing from '../../components/study/ProgressRing';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import AppHeader from '../../components/common/AppHeader';

/** Subjects Management and Overview Screen. */
const SubjectsScreen = React.memo(({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const fabBottom = insets.bottom + 80 + 16;
  const subjects = useStudyStore((state) => state.subjects);
  const removeSubjectLocal = useStudyStore((state) => state.removeSubjectLocal);
  const { sessions, isLoading, fetchSessions } = useStudySessions();
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useFocusEffect(useCallback(() => { fetchSessions(); }, [fetchSessions]));

  const summary = useMemo(() => {
    const list = subjects || [];
    let nearestDays = null;
    list.forEach((s) => {
      if (s.exam_date) {
        const days = getDaysRemaining(s.exam_date);
        if (days >= 0 && (nearestDays === null || days < nearestDays)) nearestDays = days;
      }
    });
    return {
      total: list.length,
      nearestExam: nearestDays !== null ? `⏳ ${nearestDays}d` : 'None',
      weekSessions: (sessions || []).filter((sess) => !sess.completed).length,
    };
  }, [sessions, subjects]);

  const subjectProgressMap = useMemo(() => {
    const map = {};
    (subjects || []).forEach((sub) => {
      const subSessions = (sessions || []).filter((sess) => sess.subject_id === sub.id);
      const completed = subSessions.filter((sess) => sess.completed).length;
      map[sub.id] = subSessions.length > 0 ? completed / subSessions.length : 0;
    });
    return map;
  }, [sessions, subjects]);

  const handleLongPress = useCallback((sub) => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: ['Cancel', 'Edit Subject', 'Delete Subject'], destructiveButtonIndex: 2, cancelButtonIndex: 0 },
        (idx) => {
          if (idx === 1) navigation.navigate('AddSubjectScreen', { subject: sub, mode: 'edit' });
          if (idx === 2) setDeleteTarget(sub);
        }
      );
    } else {
      Alert.alert(sub.name, 'Choose an action', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Edit', onPress: () => navigation.navigate('AddSubjectScreen', { subject: sub, mode: 'edit' }) },
        { text: 'Delete', style: 'destructive', onPress: () => setDeleteTarget(sub) },
      ]);
    }
  }, [navigation]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget?.id) return;
    try {
      setIsDeleting(true);
      await removeSubjectFromDB(deleteTarget.id);
      removeSubjectLocal(deleteTarget.id);
      setDeleteTarget(null);
    } catch {} finally {
      setIsDeleting(false);
    }
  }, [deleteTarget?.id, removeSubjectLocal]);

  const renderHeader = useCallback(() => (
    <View>
      <View style={styles.summaryRow}>
        <View style={styles.statWrap}><StatCard icon="📚" value={String(summary.total)} label="Subjects" color={theme.colors.primary} /></View>
        <View style={styles.statWrap}><StatCard icon="⏳" value={summary.nearestExam} label="Nearest Exam" color={theme.colors.accent} /></View>
        <View style={styles.statWrap}><StatCard icon="📅" value={String(summary.weekSessions)} label="This Week" color={theme.colors.success} /></View>
      </View>
      {isLoading ? <View style={styles.skeletonList}><SkeletonCard height={95} style={styles.mb} /><SkeletonCard height={95} /></View> : null}
    </View>
  ), [isLoading, summary, theme.colors.accent, theme.colors.primary, theme.colors.success]);

  const renderSubjectCard = useCallback(({ item }) => {
    const daysLeft = item.exam_date ? getDaysRemaining(item.exam_date) : null;
    const chipType = daysLeft === null ? 'neutral' : (daysLeft < 7 ? 'danger' : (daysLeft <= 14 ? 'warning' : 'info'));
    const chipLabel = daysLeft === null ? 'No exam date' : (daysLeft === 0 ? 'Exam today!' : `${daysLeft}d to exam`);

    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, borderLeftColor: item.color || theme.colors.primary }]}
        onPress={() => navigation.navigate('SubjectDetailScreen', { subject: item })}
        onLongPress={() => handleLongPress(item)}
        activeOpacity={0.75}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardInfo}>
            <Text style={[styles.subjectName, { color: theme.colors.textPrimary }]} numberOfLines={1}>{item.name}</Text>
            <View style={styles.badgeRow}>
              {item.credit_hours ? (
                <View style={[styles.creditBadge, { backgroundColor: `${theme.colors.primary}12`, borderRadius: theme.borderRadius.sm }]}>
                  <Text style={[styles.creditText, { color: theme.colors.primary }]}>{item.credit_hours} cr</Text>
                </View>
              ) : null}
              <View style={styles.difficultyDots}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.diffDot,
                      i < (item.difficulty || 1)
                        ? { backgroundColor: theme.colors.accent }
                        : { backgroundColor: `${theme.colors.textTertiary}40` },
                    ]}
                  />
                ))}
              </View>
            </View>
          </View>
          <ProgressRing progress={subjectProgressMap[item.id] || 0} size={42} color={item.color || theme.colors.primary} />
        </View>
        <View style={styles.cardFooter}>
          {item.exam_date ? <Text style={[styles.examDateText, { color: theme.colors.textSecondary }]}>📅 {formatDateShort(item.exam_date)}</Text> : <View />}
          <StatusChip label={chipLabel} type={chipType} size="sm" />
        </View>
      </TouchableOpacity>
    );
  }, [handleLongPress, navigation, subjectProgressMap, theme.borderRadius.lg, theme.borderRadius.sm, theme.colors.accent, theme.colors.primary, theme.colors.surface, theme.colors.textPrimary, theme.colors.textSecondary, theme.colors.textTertiary]);

  return (
    <ScreenWrapper>
      <AppHeader title="My Subjects" showBack onBack={() => navigation.goBack()} />
      <FlatList
        data={isLoading ? [] : (subjects || [])}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        renderItem={renderSubjectCard}
        ListEmptyComponent={!isLoading ? (
          <EmptyState icon="📚" title="No subjects added yet" subtitle="Add your subjects to start planning your study schedule" actionLabel="Add subject" onAction={() => navigation.navigate('AddSubjectScreen')} />
        ) : null}
        contentContainerStyle={[styles.content, { paddingBottom: fabBottom + 60 }]}
        showsVerticalScrollIndicator={false}
      />
      <TouchableOpacity style={[styles.fab, { bottom: fabBottom, backgroundColor: theme.colors.accent }]} onPress={() => navigation.navigate('AddSubjectScreen')} activeOpacity={0.85}>
        <Text style={[styles.fabIcon, { color: theme.colors.surface }]}>+</Text>
      </TouchableOpacity>
      <ConfirmModal visible={Boolean(deleteTarget)} title="Delete Subject?" message={`Are you sure you want to delete "${deleteTarget?.name}"? All associated sessions will also be deleted.`} confirmLabel="Delete" isDanger onConfirm={handleDeleteConfirm} onCancel={() => setDeleteTarget(null)} loading={isDeleting} />
    </ScreenWrapper>
  );
});

const styles = StyleSheet.create({
  content: { paddingVertical: 8 },
  summaryRow: { flexDirection: 'row', gap: 6, marginBottom: 16 },
  statWrap: { flex: 1 },
  skeletonList: { marginBottom: 16 },
  mb: { marginBottom: 8 },
  card: { borderLeftWidth: 4, padding: 16, marginBottom: 8, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  cardInfo: { flex: 1, marginRight: 8 },
  subjectName: { fontSize: 14, fontWeight: '800', marginBottom: 4 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  creditBadge: { paddingHorizontal: 6, paddingVertical: 2 },
  creditText: { fontSize: 9, fontWeight: '700' },
  difficultyDots: { flexDirection: 'row', gap: 3 },
  diffDot: { width: 6, height: 6, borderRadius: 3 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  examDateText: { fontSize: 10, fontWeight: '600' },
  fab: { position: 'absolute', right: 16, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', elevation: 4 },
  fabIcon: { fontSize: 28, lineHeight: 30, fontWeight: '700' },
});

export default SubjectsScreen;
