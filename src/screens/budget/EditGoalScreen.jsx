import React, { useCallback, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../config/ThemeContext';
import useSavings from '../../hooks/useSavings';
import useUIStore from '../../store/useUIStore';
import { formatDate, formatDateForDB } from '../../utils/formatDate';
import { validateSavingsGoal } from '../../utils/validateForms';
import Button from '../../components/common/Button';
import ConfirmModal from '../../components/common/ConfirmModal';
import Input from '../../components/common/Input';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import AppHeader from '../../components/common/AppHeader';

/** Dedicated Screen for Editing and Deleting a Savings Goal. */
const EditGoalScreen = React.memo(({ navigation, route }) => {
  const { theme } = useTheme();
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
    <ScreenWrapper>
      <KeyboardAvoidingView style={styles.flexOne} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <AppHeader title="Edit Goal" showBack onBack={() => navigation.goBack()} />
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Input label="Goal name" value={title} onChangeText={setTitle} placeholder="e.g. New laptop, Emergency fund" autoCapitalize="words" />

          <Text style={[styles.fieldLabel, { color: theme.colors.textPrimary }]}>Target amount</Text>
          <View style={[styles.amountInputRow, { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md, borderColor: `${theme.colors.textTertiary}30` }]}>
            <Text style={[styles.currencyPrefix, { color: theme.colors.primary }]}>৳</Text>
            <TextInput
              style={[styles.amountInput, { color: theme.colors.textPrimary }]}
              value={targetAmount}
              onChangeText={setTargetAmount}
              placeholder="10000"
              placeholderTextColor={theme.colors.textTertiary}
              keyboardType="decimal-pad"
            />
          </View>

          <Text style={[styles.fieldLabel, { color: theme.colors.textPrimary }]}>Current saved amount</Text>
          <View style={[styles.amountInputRow, { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md, borderColor: `${theme.colors.textTertiary}30` }]}>
            <Text style={[styles.currencyPrefix, { color: theme.colors.primary }]}>৳</Text>
            <TextInput
              style={[styles.amountInput, { color: theme.colors.textPrimary }]}
              value={currentAmount}
              onChangeText={setCurrentAmount}
              placeholder="0"
              placeholderTextColor={theme.colors.textTertiary}
              keyboardType="decimal-pad"
            />
          </View>

          <View style={[styles.switchRow, { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md, borderColor: `${theme.colors.textTertiary}30` }]}>
            <Text style={[styles.switchLabel, { color: theme.colors.textPrimary }]}>Set target deadline</Text>
            <Switch value={hasDeadline} onValueChange={setHasDeadline} trackColor={{ false: theme.colors.textTertiary, true: theme.colors.primary }} />
          </View>

          {hasDeadline && (
            <View style={[styles.datePickerCard, { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md, borderColor: `${theme.colors.textTertiary}30` }]}>
              <Text style={[styles.dateDisplay, { color: theme.colors.textPrimary }]}>📅 {formatDate(deadlineDate)}</Text>
              <View style={styles.quickDateRow}>
                {[ { l: '1 mo', m: 1 }, { l: '3 mo', m: 3 }, { l: '6 mo', m: 6 }, { l: '1 yr', m: 12 } ].map((opt) => (
                  <TouchableOpacity key={opt.l} onPress={() => adjustDeadline(opt.m)} style={[styles.quickDateBtn, { backgroundColor: `${theme.colors.primary}15`, borderRadius: theme.borderRadius.sm }]}>
                    <Text style={[styles.quickDateText, { color: theme.colors.primary }]}>+{opt.l}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {errorMessage ? <Text style={[styles.errorBanner, { color: theme.colors.error }]}>{errorMessage}</Text> : null}

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
    </ScreenWrapper>
  );
});

const styles = StyleSheet.create({
  flexOne: { flex: 1 },
  scrollContent: { paddingVertical: 8, paddingBottom: 130 },
  fieldLabel: { fontSize: 12, fontWeight: '700', marginBottom: 4, marginTop: 8 },
  amountInputRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, paddingHorizontal: 16, marginBottom: 8 },
  currencyPrefix: { fontSize: 16, fontWeight: '800', marginRight: 4 },
  amountInput: { flex: 1, paddingVertical: 10, fontSize: 14, fontWeight: '600' },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderWidth: 1, marginVertical: 8 },
  switchLabel: { fontSize: 12, fontWeight: '600' },
  datePickerCard: { padding: 16, borderWidth: 1, marginBottom: 16 },
  dateDisplay: { fontSize: 12, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
  quickDateRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 4 },
  quickDateBtn: { flex: 1, paddingVertical: 6, alignItems: 'center' },
  quickDateText: { fontSize: 10, fontWeight: '700' },
  errorBanner: { fontSize: 11, fontWeight: '600', textAlign: 'center', marginVertical: 4 },
  saveBtn: { marginTop: 16 },
  deleteBtn: { marginTop: 8 },
});

export default EditGoalScreen;
