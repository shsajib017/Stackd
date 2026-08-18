import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../config/ThemeContext';
import useSavings from '../../hooks/useSavings';
import useUIStore from '../../store/useUIStore';
import { formatBDT } from '../../utils/formatCurrency';
import { formatDateShort, getDaysRemaining } from '../../utils/formatDate';

import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import ProgressBar from '../../components/common/ProgressBar';
import SkeletonCard from '../../components/common/SkeletonCard';
import StatCard from '../../components/common/StatCard';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import AppHeader from '../../components/common/AppHeader';

const GoalCard = React.memo(({ goal, onCardPress, onAddFundsPress, theme }) => {
  const current = Number(goal.current_amount || 0);
  const target = Number(goal.target_amount || 1);
  const progress = target > 0 ? Math.min(current / target, 1) : 0;
  const daysLeft = getDaysRemaining(goal.deadline);

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, borderColor: `${theme.colors.textTertiary}20` }]}
      onPress={() => onCardPress(goal)}
      activeOpacity={0.8}
    >
      <View style={styles.cardTop}>
        <View style={styles.cardHeaderLeft}>
          <Text style={styles.cardEmoji}>{goal.emoji || '🎯'}</Text>
          <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]} numberOfLines={1}>{goal.title}</Text>
        </View>
        <TouchableOpacity style={[styles.addFundsBtn, { backgroundColor: `${theme.colors.accent}20` }]} onPress={() => onAddFundsPress(goal)}>
          <Text style={[styles.addFundsText, { color: theme.colors.accent }]}>+ Add funds</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.amountProgressText, { color: theme.colors.textPrimary }]}>
        {formatBDT(current)} <Text style={[styles.targetLabel, { color: theme.colors.textSecondary }]}>of {formatBDT(target)}</Text>
      </Text>
      <ProgressBar progress={progress} color={theme.colors.accent} height={8} showLabel={false} />

      <View style={styles.cardFooter}>
        <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>📅 {goal.deadline ? formatDateShort(goal.deadline) : 'No deadline'}</Text>
        <Text style={[styles.footerText, { color: theme.colors.textSecondary }, daysLeft <= 7 && { color: theme.colors.error, fontWeight: '700' }]}>
          ⏳ {daysLeft} {daysLeft === 1 ? 'day' : 'days'} left
        </Text>
      </View>
    </TouchableOpacity>
  );
});

/** Savings Goals Overview & Management Screen. */
const SavingsGoalsScreen = React.memo(({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
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
        <View style={styles.statWrapper}><StatCard icon="💰" label="Total Saved" value={formatBDT(totalSaved)} color={theme.colors.success} /></View>
        <View style={styles.statWrapper}><StatCard icon="🎯" label="Active Goals" value={String(goals?.length || 0)} color={theme.colors.primary} /></View>
      </View>
      {isLoading && <View style={styles.skeletonBox}><SkeletonCard height={140} /><SkeletonCard height={140} /></View>}
    </View>
  ), [goals?.length, isLoading, theme.colors.primary, theme.colors.success, totalSaved]);

  return (
    <ScreenWrapper>
      <AppHeader title="Savings Goals" showBack onBack={() => navigation.goBack()} />

      <FlatList
        data={isLoading ? [] : (goals || [])}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        renderItem={({ item }) => (
          <GoalCard goal={item} theme={theme} onCardPress={(g) => navigation.navigate('EditGoalScreen', { goal: g })} onAddFundsPress={(g) => { setFundingGoal(g); setFundingAmount(''); }} />
        )}
        ListEmptyComponent={!isLoading ? (
          <EmptyState icon="🎯" title="No savings goals yet" subtitle="Set a goal and start saving" actionLabel="Create goal" onAction={() => navigation.navigate('CreateGoalScreen')} />
        ) : null}
        contentContainerStyle={[styles.content, { paddingBottom: fabBottom + 60 }]}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity style={[styles.fab, { bottom: fabBottom, backgroundColor: theme.colors.accent }]} onPress={() => navigation.navigate('CreateGoalScreen')} activeOpacity={0.85}>
        <Text style={[styles.fabIcon, { color: theme.colors.surface }]}>+</Text>
      </TouchableOpacity>

      {Boolean(fundingGoal) && (
        <Modal visible={Boolean(fundingGoal)} transparent animationType="fade" onRequestClose={() => setFundingGoal(null)}>
          <TouchableWithoutFeedback onPress={() => setFundingGoal(null)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <View style={[styles.modalCard, { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg }]}>
                  <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>Add Funds</Text>
                  <Text style={[styles.modalSubtitle, { color: theme.colors.textSecondary }]}>{fundingGoal.title}</Text>
                  <View style={styles.amountInputRow}>
                    <Text style={[styles.inputPrefix, { color: theme.colors.accent }]}>৳</Text>
                    <TextInput
                      style={[styles.amountInput, { color: theme.colors.textPrimary }]}
                      value={fundingAmount}
                      onChangeText={setFundingAmount}
                      placeholder="0.00"
                      placeholderTextColor={theme.colors.textTertiary}
                      keyboardType="decimal-pad"
                      autoFocus
                    />
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
    </ScreenWrapper>
  );
});

const styles = StyleSheet.create({
  content: { paddingVertical: 8 },
  summaryRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  statWrapper: { flex: 1 },
  skeletonBox: { gap: 8 },
  card: { padding: 16, marginBottom: 8, borderWidth: 1, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  cardHeaderLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 },
  cardEmoji: { fontSize: 22, marginRight: 4 },
  cardTitle: { fontSize: 14, fontWeight: '700', flex: 1 },
  addFundsBtn: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  addFundsText: { fontSize: 10, fontWeight: '700' },
  amountProgressText: { fontSize: 12, fontWeight: '800', marginVertical: 4 },
  targetLabel: { fontSize: 10, fontWeight: '500' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  footerText: { fontSize: 10, fontWeight: '500' },
  fab: { position: 'absolute', right: 16, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', elevation: 4 },
  fabIcon: { fontSize: 28, lineHeight: 30, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalCard: { width: '100%', padding: 24 },
  modalTitle: { fontSize: 16, fontWeight: '800', textAlign: 'center' },
  modalSubtitle: { fontSize: 12, textAlign: 'center', marginBottom: 16 },
  amountInputRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 16 },
  inputPrefix: { fontSize: 24, fontWeight: '800', marginRight: 4 },
  amountInput: { fontSize: 24, fontWeight: '800', minWidth: 100, textAlign: 'center' },
  modalButtonRow: { flexDirection: 'row', gap: 8, marginTop: 16 },
  modalBtn: { flex: 1 },
});

export default SavingsGoalsScreen;
