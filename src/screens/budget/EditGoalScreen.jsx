import React, { useCallback, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { borderRadius, colors, fontSizes, spacing } from '../../config/theme';
import useSavings from '../../hooks/useSavings';
import useUIStore from '../../store/useUIStore';
import { formatDate, formatDateForDB } from '../../utils/formatDate';
import { validateSavingsGoal } from '../../utils/validateForms';
import Button from '../../components/common/Button';
import ConfirmModal from '../../components/common/ConfirmModal';
import Input from '../../components/common/Input';
import AppHeader from '../../components/common/AppHeader';

/** Dedicated Screen for Editing and Deleting a Savings Goal. */
const EditGoalScreen = React.memo(({ navigation, route }) => {
  const goal = route.params?.goal || {};
  const { updateGoal, deleteGoal } = useSavings();
  const showToast = useUIStore((state) => state.showToast);

  const [title, setTitle] = useState(goal.title || '');
  const [targetAmount, setTargetAmount] = useState(goal.target_amount ? String(goal.target_amount) : '');
  const [currentAmount, setCurrentAmount] = useState(goal.current_amount !== undefined ? String(goal.current_amount) : '');
  const [hasDeadline, setHasDeadline] = useState(Boolean(goal.deadline));
  const [deadlineDate, setDeadlineDate] = useState(goal.deadline ? new Date(goal.deadline) : new Date(Date.now() + 30 * 86400000));
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const initForm = useCallback(() => {
    if (route.params?.goal) {
      const g = route.params.goal;
      setTitle(g.title || '');
      setTargetAmount(g.target_amount ? String(g.target_amount) : '');
      setCurrentAmount(g.current_amount !== undefined ? String(g.current_amount) : '');
      setHasDeadline(Boolean(g.deadline));
      setDeadlineDate(g.deadline ? new Date(g.deadline) : new Date(Date.now() + 30 * 86400000));
    }
  }, [route.params?.goal]);

  useFocusEffect(useCallback(() => { initForm(); }, [initForm]));

  const handleUpdate = useCallback(async () => {
    setErrorMessage(null);
    const targetNum = Number(targetAmount);
    const validation = validateSavingsGoal({ title: title.trim(), targetAmount: targetNum });
    if (!validation.isValid) { setErrorMessage(Object.values(validation.errors)[0]); return; }

    const startingNum = currentAmount.trim() ? Number(currentAmount) : 0;
    const deadlineStr = hasDeadline ? formatDateForDB(deadlineDate) : null;

    try {
      setIsLoading(true);
      await updateGoal(goal.id, {
        title: title.trim(),
        target_amount: targetNum,
        current_amount: startingNum,
        deadline: deadlineStr,
      });
      showToast('Goal updated successfully', 'success');
      navigation.goBack();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update goal');
    } finally {
      setIsLoading(false);
    }
  }, [currentAmount, deadlineDate, goal.id, hasDeadline, navigation, showToast, targetAmount, title, updateGoal]);

  const handleDelete = useCallback(async () => {
    try {
      setIsLoading(true);
      setShowDeleteModal(false);
      await deleteGoal(goal.id);
      showToast('Goal deleted', 'info');
      navigation.goBack();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to delete goal');
    } finally {
      setIsLoading(false);
    }
  }, [deleteGoal, goal.id, navigation, showToast]);

  const adjustDeadline = useCallback((months) => {
    const d = new Date(); d.setMonth(d.getMonth() + months); setDeadlineDate(d);
  }, []);

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <AppHeader title="Edit Goal" showBack onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Input label="Goal name" value={title} onChangeText={setTitle} placeholder="e.g. New laptop, Emergency fund" autoCapitalize="words" />

        <Text style={styles.fieldLabel}>Target amount</Text>
        <View style={styles.amountInputRow}>
          <Text style={styles.currencyPrefix}>৳</Text>
          <TextInput style={styles.amountInput} value={targetAmount} onChangeText={setTargetAmount} placeholder="10000" placeholderTextColor={colors.textTertiary} keyboardType="decimal-pad" />
        </View>

        <Text style={styles.fieldLabel}>Current saved amount</Text>
        <View style={styles.amountInputRow}>
          <Text style={styles.currencyPrefix}>৳</Text>
          <TextInput style={styles.amountInput} value={currentAmount} onChangeText={setCurrentAmount} placeholder="0" placeholderTextColor={colors.textTertiary} keyboardType="decimal-pad" />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Set target deadline</Text>
          <Switch value={hasDeadline} onValueChange={setHasDeadline} trackColor={{ false: colors.textTertiary, true: colors.primary }} />
        </View>

        {hasDeadline && (
          <View style={styles.datePickerCard}>
            <Text style={styles.dateDisplay}>📅 {formatDate(deadlineDate)}</Text>
            <View style={styles.quickDateRow}>
              {[ { l: '1 mo', m: 1 }, { l: '3 mo', m: 3 }, { l: '6 mo', m: 6 }, { l: '1 yr', m: 12 } ].map((opt) => (
                <TouchableOpacity key={opt.l} onPress={() => adjustDeadline(opt.m)} style={styles.quickDateBtn}>
                  <Text style={styles.quickDateText}>+{opt.l}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {errorMessage ? <Text style={styles.errorBanner}>{errorMessage}</Text> : null}

        <Button label="Update goal" onPress={handleUpdate} loading={isLoading} fullWidth style={styles.saveBtn} />
        <Button label="Delete goal" variant="danger" onPress={() => setShowDeleteModal(true)} disabled={isLoading} fullWidth style={styles.deleteBtn} />
      </ScrollView>

      <ConfirmModal
        visible={showDeleteModal}
        title="Delete this goal?"
        message="Your saved amount will be lost"
        confirmLabel="Delete"
        isDanger
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </KeyboardAvoidingView>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: spacing.md, paddingBottom: 130 },
  fieldLabel: { fontSize: fontSizes.sm, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.xs, marginTop: spacing.sm },
  amountInputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: borderRadius.md, borderWidth: 1, borderColor: `${colors.textTertiary}30`, paddingHorizontal: spacing.md, marginBottom: spacing.sm },
  currencyPrefix: { fontSize: fontSizes.lg, fontWeight: '800', color: colors.primary, marginRight: spacing.xs },
  amountInput: { flex: 1, paddingVertical: spacing.sm + 2, fontSize: fontSizes.md, color: colors.textPrimary, fontWeight: '600' },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.surface, padding: spacing.md, borderRadius: borderRadius.md, borderWidth: 1, borderColor: `${colors.textTertiary}30`, marginVertical: spacing.sm },
  switchLabel: { fontSize: fontSizes.sm, fontWeight: '600', color: colors.textPrimary },
  datePickerCard: { backgroundColor: colors.surface, padding: spacing.md, borderRadius: borderRadius.md, borderWidth: 1, borderColor: `${colors.textTertiary}30`, marginBottom: spacing.md },
  dateDisplay: { fontSize: fontSizes.sm, fontWeight: '700', color: colors.textPrimary, textAlign: 'center', marginBottom: spacing.sm },
  quickDateRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.xs },
  quickDateBtn: { flex: 1, backgroundColor: `${colors.primary}15`, paddingVertical: spacing.xs + 2, alignItems: 'center', borderRadius: borderRadius.sm },
  quickDateText: { fontSize: fontSizes.xs, fontWeight: '700', color: colors.primary },
  errorBanner: { fontSize: fontSizes.xs, color: colors.error, fontWeight: '600', textAlign: 'center', marginVertical: spacing.xs },
  saveBtn: { marginTop: spacing.md },
  deleteBtn: { marginTop: spacing.sm },
});

export default EditGoalScreen;
