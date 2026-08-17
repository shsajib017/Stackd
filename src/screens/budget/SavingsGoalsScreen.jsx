import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { borderRadius, colors, fontSizes, shadows, spacing } from '../../config/theme';
import useSavings from '../../hooks/useSavings';
import useUIStore from '../../store/useUIStore';
import { formatBDT } from '../../utils/formatCurrency';
import { formatDateShort, getDaysRemaining } from '../../utils/formatDate';

import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import ProgressBar from '../../components/common/ProgressBar';
import SkeletonCard from '../../components/common/SkeletonCard';
import StatCard from '../../components/common/StatCard';
import AppHeader from '../../components/common/AppHeader';

const GoalCard = React.memo(({ goal, onCardPress, onAddFundsPress }) => {
  const current = Number(goal.current_amount || 0);
  const target = Number(goal.target_amount || 1);
  const progress = target > 0 ? Math.min(current / target, 1) : 0;
  const daysLeft = getDaysRemaining(goal.deadline);

  return (
    <TouchableOpacity style={styles.card} onPress={() => onCardPress(goal)} activeOpacity={0.8}>
      <View style={styles.cardTop}>
        <View style={styles.cardHeaderLeft}>
          <Text style={styles.cardEmoji}>{goal.emoji || '🎯'}</Text>
          <Text style={styles.cardTitle} numberOfLines={1}>{goal.title}</Text>
        </View>
        <TouchableOpacity style={styles.addFundsBtn} onPress={() => onAddFundsPress(goal)}>
          <Text style={styles.addFundsText}>+ Add funds</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.amountProgressText}>{formatBDT(current)} <Text style={styles.targetLabel}>of {formatBDT(target)}</Text></Text>
      <ProgressBar progress={progress} color={colors.accent} height={8} showLabel={false} />

      <View style={styles.cardFooter}>
        <Text style={styles.footerText}>📅 {goal.deadline ? formatDateShort(goal.deadline) : 'No deadline'}</Text>
        <Text style={[styles.footerText, daysLeft <= 7 && styles.daysUrgent]}>⏳ {daysLeft} {daysLeft === 1 ? 'day' : 'days'} left</Text>
      </View>
    </TouchableOpacity>
  );
});

/** Savings Goals Overview & Management Screen. */
const SavingsGoalsScreen = React.memo(({ navigation }) => {
  const insets = useSafeAreaInsets();
  const fabBottom = insets.bottom + 80 + 16;
  const { goals, isLoading, fetchGoals, addFunds } = useSavings();
  const showToast = useUIStore((state) => state.showToast);

  const [fundingGoal, setFundingGoal] = useState(null);
  const [fundingAmount, setFundingAmount] = useState('');
  const [isSubmittingFunds, setIsSubmittingFunds] = useState(false);

  useFocusEffect(useCallback(() => { fetchGoals(); }, [fetchGoals]));
  const totalSaved = useMemo(() => (goals || []).reduce((sum, g) => sum + Number(g.current_amount || 0), 0), [goals]);

  const handleAddFundsSubmit = useCallback(async () => {
    const num = parseFloat(fundingAmount);
    if (isNaN(num) || num <= 0) { showToast('Enter a valid amount', 'error'); return; }
    try {
      setIsSubmittingFunds(true);
      await addFunds(fundingGoal.id, num);
      showToast('Funds added successfully', 'success');
      setFundingGoal(null);
      setFundingAmount('');
    } catch (err) {
      showToast(err.message || 'Failed to add funds', 'error');
    } finally {
      setIsSubmittingFunds(false);
    }
  }, [addFunds, fundingAmount, fundingGoal, showToast]);

  const renderHeader = useCallback(() => (
    <View>
      <View style={styles.summaryRow}>
        <View style={styles.statWrapper}><StatCard icon="💰" label="Total Saved" value={formatBDT(totalSaved)} color={colors.success} /></View>
        <View style={styles.statWrapper}><StatCard icon="🎯" label="Active Goals" value={String(goals?.length || 0)} color={colors.primary} /></View>
      </View>
      {isLoading && <View style={styles.skeletonBox}><SkeletonCard height={140} /><SkeletonCard height={140} /></View>}
    </View>
  ), [goals?.length, isLoading, totalSaved]);

  return (
    <View style={styles.screen}>
      <AppHeader title="Savings Goals" showBack onBack={() => navigation.goBack()} />

      <FlatList
        data={isLoading ? [] : (goals || [])}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        renderItem={({ item }) => (
          <GoalCard goal={item} onCardPress={(g) => navigation.navigate('EditGoalScreen', { goal: g })} onAddFundsPress={(g) => { setFundingGoal(g); setFundingAmount(''); }} />
        )}
        ListEmptyComponent={!isLoading ? (
          <EmptyState icon="🎯" title="No savings goals yet" subtitle="Set a goal and start saving" actionLabel="Create goal" onAction={() => navigation.navigate('CreateGoalScreen')} />
        ) : null}
        contentContainerStyle={[styles.content, { paddingBottom: fabBottom + 60 }]}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity style={[styles.fab, { bottom: fabBottom }]} onPress={() => navigation.navigate('CreateGoalScreen')} activeOpacity={0.85}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      {Boolean(fundingGoal) && (
        <Modal visible={Boolean(fundingGoal)} transparent animationType="fade" onRequestClose={() => setFundingGoal(null)}>
          <TouchableWithoutFeedback onPress={() => setFundingGoal(null)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <View style={styles.modalCard}>
                  <Text style={styles.modalTitle}>Add Funds</Text>
                  <Text style={styles.modalSubtitle}>{fundingGoal.title}</Text>
                  <View style={styles.amountInputRow}>
                    <Text style={styles.inputPrefix}>৳</Text>
                    <TextInput style={styles.amountInput} value={fundingAmount} onChangeText={setFundingAmount} placeholder="0.00" placeholderTextColor={colors.textTertiary} keyboardType="decimal-pad" autoFocus />
                  </View>
                  <View style={styles.modalButtonRow}>
                    <Button label="Cancel" variant="secondary" onPress={() => setFundingGoal(null)} style={styles.modalBtn} />
                    <Button label="Add" onPress={handleAddFundsSubmit} loading={isSubmittingFunds} style={styles.modalBtn} />
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingBottom: spacing.sm, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: `${colors.textTertiary}20` },
  backBtn: { padding: spacing.xs },
  backArrow: { fontSize: fontSizes.xl, color: colors.textPrimary, fontWeight: '700' },
  headerTitle: { fontSize: fontSizes.lg, fontWeight: '800', color: colors.textPrimary },
  headerSpacer: { width: 32 },
  content: { padding: spacing.md },
  summaryRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  statWrapper: { flex: 1 },
  skeletonBox: { gap: spacing.sm },
  card: { backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.sm, ...shadows.sm, borderWidth: 1, borderColor: `${colors.textTertiary}20` },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xs },
  cardHeaderLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: spacing.sm },
  cardEmoji: { fontSize: 22, marginRight: spacing.xs },
  cardTitle: { fontSize: fontSizes.md, fontWeight: '700', color: colors.textPrimary, flex: 1 },
  addFundsBtn: { backgroundColor: `${colors.accent}20`, paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: borderRadius.full },
  addFundsText: { fontSize: fontSizes.xs, fontWeight: '700', color: colors.accent },
  amountProgressText: { fontSize: fontSizes.sm, fontWeight: '800', color: colors.textPrimary, marginVertical: spacing.xs },
  targetLabel: { fontSize: fontSizes.xs, fontWeight: '500', color: colors.textSecondary },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs + 2 },
  footerText: { fontSize: fontSizes.xs, color: colors.textSecondary, fontWeight: '500' },
  daysUrgent: { color: colors.error, fontWeight: '700' },
  fab: { position: 'absolute', right: 16, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', ...shadows.md },
  fabIcon: { fontSize: 28, color: colors.surface, lineHeight: 30, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  modalCard: { width: '100%', backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.xl, ...shadows.lg },
  modalTitle: { fontSize: fontSizes.lg, fontWeight: '800', color: colors.textPrimary, textAlign: 'center' },
  modalSubtitle: { fontSize: fontSizes.sm, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.md },
  amountInputRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: spacing.md },
  inputPrefix: { fontSize: fontSizes.xxl, fontWeight: '800', color: colors.accent, marginRight: spacing.xs },
  amountInput: { fontSize: fontSizes.xxl, fontWeight: '800', color: colors.textPrimary, minWidth: 100, textAlign: 'center' },
  modalButtonRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  modalBtn: { flex: 1 },
});

export default SavingsGoalsScreen;
