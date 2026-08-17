import React, { useCallback, useState } from 'react';
import {
  KeyboardAvoidingView, Platform, ScrollView, StyleSheet,
  Switch, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { borderRadius, colors, fontSizes, spacing } from '../../config/theme';
import useBudget from '../../hooks/useBudget';
import useUIStore from '../../store/useUIStore';
import { EXPENSE_CATEGORIES, RECURRENCE_INTERVALS } from '../../utils/constants';
import { formatDate, formatDateForDB } from '../../utils/formatDate';
import { validateExpense } from '../../utils/validateForms';
import Button from '../../components/common/Button';
import ConfirmModal from '../../components/common/ConfirmModal';
import Input from '../../components/common/Input';
import AppHeader from '../../components/common/AppHeader';

const CATEGORY_ICONS = { Food: '🍔', Transport: '🚌', Books: '📚', Tuition: '🎓', Entertainment: '🎮', Other: '📦' };

/** Dedicated Screen for Editing and Deleting an Expense. */
const EditExpenseScreen = React.memo(({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const expense = route.params?.expense || {};
  const { updateExpense, deleteExpense } = useBudget();
  const showToast = useUIStore((state) => state.showToast);

  const [amount, setAmount] = useState(expense.amount ? String(expense.amount) : '');
  const [category, setCategory] = useState(expense.category || 'Food');
  const [note, setNote] = useState(expense.note || '');
  const [date, setDate] = useState(expense.date ? new Date(expense.date) : new Date());
  const [isRecurring, setIsRecurring] = useState(Boolean(expense.is_recurring));
  const [recurrenceInterval, setRecurrenceInterval] = useState(
    expense.recurrence_interval ? expense.recurrence_interval.charAt(0).toUpperCase() + expense.recurrence_interval.slice(1) : 'Monthly'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const initForm = useCallback(() => {
    if (route.params?.expense) {
      const exp = route.params.expense;
      setAmount(String(exp.amount || ''));
      setCategory(exp.category || 'Food');
      setNote(exp.note || '');
      setDate(exp.date ? new Date(exp.date) : new Date());
      setIsRecurring(Boolean(exp.is_recurring));
      setRecurrenceInterval(exp.recurrence_interval ? exp.recurrence_interval.charAt(0).toUpperCase() + exp.recurrence_interval.slice(1) : 'Monthly');
    }
  }, [route.params?.expense]);

  useFocusEffect(useCallback(() => { initForm(); }, [initForm]));

  const handleUpdate = useCallback(async () => {
    setErrorMessage(null);
    const dateStr = formatDateForDB(date);
    const validation = validateExpense({ amount: Number(amount), category, date: dateStr });
    if (!validation.isValid) { setErrorMessage(Object.values(validation.errors)[0]); return; }

    try {
      setIsLoading(true);
      await updateExpense(expense.id, { amount: Number(amount), category, note: note.trim(), date: dateStr });
      showToast('Expense updated successfully', 'success');
      navigation.goBack();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update expense');
    } finally {
      setIsLoading(false);
    }
  }, [amount, category, date, expense.id, navigation, note, showToast, updateExpense]);

  const handleDelete = useCallback(async () => {
    try {
      setIsLoading(true);
      setShowDeleteModal(false);
      await deleteExpense(expense.id);
      showToast('Expense deleted', 'info');
      navigation.goBack();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to delete expense');
    } finally {
      setIsLoading(false);
    }
  }, [deleteExpense, expense.id, navigation, showToast]);

  const scrollBottomPadding = Math.max(insets.bottom, spacing.md) + 220;

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <AppHeader title="Edit Expense" showBack onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: scrollBottomPadding }]} showsVerticalScrollIndicator={false}>
        <View style={styles.amountContainer}>
          <Text style={styles.currencyPrefix}>৳</Text>
          <TextInput style={styles.amountInput} value={amount} onChangeText={setAmount} placeholder="0.00" placeholderTextColor={colors.textTertiary} keyboardType="decimal-pad" />
        </View>

        <Text style={styles.sectionLabel}>Category</Text>
        <View style={styles.categoryGrid}>
          {EXPENSE_CATEGORIES.map((cat) => {
            const isSelected = category === cat;
            return (
              <TouchableOpacity key={cat} style={[styles.categoryPill, isSelected ? styles.categoryPillActive : styles.categoryPillInactive]} onPress={() => setCategory(cat)} activeOpacity={0.8}>
                <Text style={styles.categoryIcon}>{CATEGORY_ICONS[cat] || '📦'}</Text>
                <Text style={[styles.categoryText, isSelected && styles.categoryTextActive]}>{cat}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Input label="Note (optional)" value={note} onChangeText={setNote} placeholder="What was this for?" />

        <Text style={styles.sectionLabel}>Date</Text>
        <View style={styles.dateRow}>
          <Text style={styles.dateValue}>{formatDate(date)}</Text>
          <View style={styles.dateQuickButtons}>
            <TouchableOpacity onPress={() => setDate(new Date())} style={styles.dateBtn}><Text style={styles.dateBtnText}>Today</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => { const d = new Date(); d.setDate(d.getDate() - 1); setDate(d); }} style={styles.dateBtn}><Text style={styles.dateBtnText}>Yesterday</Text></TouchableOpacity>
          </View>
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Recurring expense</Text>
          <Switch value={isRecurring} onValueChange={setIsRecurring} trackColor={{ false: colors.textTertiary, true: colors.primary }} />
        </View>

        {isRecurring && (
          <View style={styles.recurrenceRow}>
            {RECURRENCE_INTERVALS.map((interval) => {
              const active = recurrenceInterval === interval;
              return (
                <TouchableOpacity key={interval} style={[styles.intervalPill, active && styles.intervalPillActive]} onPress={() => setRecurrenceInterval(interval)}>
                  <Text style={[styles.intervalText, active && styles.intervalTextActive]}>{interval}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {errorMessage ? <Text style={styles.errorBanner}>{errorMessage}</Text> : null}

        <Button label="Update expense" onPress={handleUpdate} loading={isLoading} fullWidth style={styles.saveButton} />
        <Button label="Delete expense" variant="danger" onPress={() => setShowDeleteModal(true)} fullWidth style={styles.deleteButton} />
      </ScrollView>

      <ConfirmModal
        visible={showDeleteModal}
        title="Delete this expense?"
        message="This cannot be undone"
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
  scrollContent: { padding: spacing.md },
  amountContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: spacing.lg },
  currencyPrefix: { fontSize: fontSizes.xxxl, fontWeight: '800', color: colors.primary, marginRight: spacing.xs },
  amountInput: { fontSize: fontSizes.xxxl + 4, fontWeight: '900', color: colors.textPrimary, minWidth: 120, textAlign: 'center' },
  sectionLabel: { fontSize: fontSizes.sm, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.xs, marginTop: spacing.sm },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: spacing.md },
  categoryPill: { width: '48%', flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm + 2, paddingHorizontal: spacing.md, borderRadius: borderRadius.md, marginBottom: spacing.xs + 2 },
  categoryPillActive: { backgroundColor: colors.accent },
  categoryPillInactive: { backgroundColor: colors.surface, borderWidth: 1, borderColor: `${colors.textTertiary}40` },
  categoryIcon: { fontSize: 18, marginRight: spacing.xs },
  categoryText: { fontSize: fontSizes.sm, fontWeight: '600', color: colors.textPrimary },
  categoryTextActive: { color: colors.surface, fontWeight: '800' },
  dateRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.surface, padding: spacing.md, borderRadius: borderRadius.md, borderWidth: 1, borderColor: `${colors.textTertiary}30`, marginBottom: spacing.md },
  dateValue: { fontSize: fontSizes.sm, fontWeight: '600', color: colors.textPrimary },
  dateQuickButtons: { flexDirection: 'row', gap: spacing.xs },
  dateBtn: { backgroundColor: `${colors.primary}15`, paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: borderRadius.sm },
  dateBtnText: { fontSize: fontSizes.xs, fontWeight: '700', color: colors.primary },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.surface, padding: spacing.md, borderRadius: borderRadius.md, borderWidth: 1, borderColor: `${colors.textTertiary}30`, marginBottom: spacing.md },
  switchLabel: { fontSize: fontSizes.sm, fontWeight: '600', color: colors.textPrimary },
  recurrenceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md },
  intervalPill: { flex: 1, alignItems: 'center', paddingVertical: spacing.sm, marginHorizontal: 3, borderRadius: borderRadius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: `${colors.textTertiary}40` },
  intervalPillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  intervalText: { fontSize: fontSizes.xs, fontWeight: '700', color: colors.textSecondary },
  intervalTextActive: { color: colors.surface },
  errorBanner: { fontSize: fontSizes.xs, color: colors.error, fontWeight: '600', textAlign: 'center', marginVertical: spacing.xs },
  saveButton: { marginTop: spacing.md },
  deleteButton: { marginTop: spacing.sm },
});

export default EditExpenseScreen;
