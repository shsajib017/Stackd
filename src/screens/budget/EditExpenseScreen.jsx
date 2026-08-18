import React, { useCallback, useState } from 'react';
import {
  KeyboardAvoidingView, Platform, ScrollView, StyleSheet,
  Switch, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../config/ThemeContext';
import useBudget from '../../hooks/useBudget';
import useUIStore from '../../store/useUIStore';
import { EXPENSE_CATEGORIES, RECURRENCE_INTERVALS } from '../../utils/constants';
import { formatDate, formatDateForDB } from '../../utils/formatDate';
import { validateExpense } from '../../utils/validateForms';
import Button from '../../components/common/Button';
import ConfirmModal from '../../components/common/ConfirmModal';
import Input from '../../components/common/Input';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import AppHeader from '../../components/common/AppHeader';

const CATEGORY_ICONS = { Food: '🍔', Transport: '🚌', Books: '📚', Tuition: '🎓', Entertainment: '🎮', Other: '📦' };

/** Dedicated Screen for Editing and Deleting an Expense. */
const EditExpenseScreen = React.memo(({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
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

  const scrollBottomPadding = Math.max(insets.bottom, 16) + 220;

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView style={styles.flexOne} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <AppHeader title="Edit Expense" showBack onBack={() => navigation.goBack()} />
        <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: scrollBottomPadding }]} showsVerticalScrollIndicator={false}>
          <View style={styles.amountContainer}>
            <Text style={[styles.currencyPrefix, { color: theme.colors.primary }]}>৳</Text>
            <TextInput
              style={[styles.amountInput, { color: theme.colors.textPrimary }]}
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              placeholderTextColor={theme.colors.textTertiary}
              keyboardType="decimal-pad"
            />
          </View>

          <Text style={[styles.sectionLabel, { color: theme.colors.textPrimary }]}>Category</Text>
          <View style={styles.categoryGrid}>
            {EXPENSE_CATEGORIES.map((cat) => {
              const isSelected = category === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryPill,
                    { borderRadius: theme.borderRadius.md },
                    isSelected
                      ? { backgroundColor: theme.colors.accent }
                      : { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: `${theme.colors.textTertiary}40` },
                  ]}
                  onPress={() => setCategory(cat)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.categoryIcon}>{CATEGORY_ICONS[cat] || '📦'}</Text>
                  <Text style={[styles.categoryText, { color: isSelected ? '#FFFFFF' : theme.colors.textPrimary }, isSelected && styles.categoryTextActive]}>{cat}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Input label="Note (optional)" value={note} onChangeText={setNote} placeholder="What was this for?" />

          <Text style={[styles.sectionLabel, { color: theme.colors.textPrimary }]}>Date</Text>
          <View style={[styles.dateRow, { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md, borderColor: `${theme.colors.textTertiary}30` }]}>
            <Text style={[styles.dateValue, { color: theme.colors.textPrimary }]}>{formatDate(date)}</Text>
            <View style={styles.dateQuickButtons}>
              <TouchableOpacity onPress={() => setDate(new Date())} style={[styles.dateBtn, { backgroundColor: `${theme.colors.primary}15`, borderRadius: theme.borderRadius.sm }]}>
                <Text style={[styles.dateBtnText, { color: theme.colors.primary }]}>Today</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { const d = new Date(); d.setDate(d.getDate() - 1); setDate(d); }} style={[styles.dateBtn, { backgroundColor: `${theme.colors.primary}15`, borderRadius: theme.borderRadius.sm }]}>
                <Text style={[styles.dateBtnText, { color: theme.colors.primary }]}>Yesterday</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.switchRow, { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md, borderColor: `${theme.colors.textTertiary}30` }]}>
            <Text style={[styles.switchLabel, { color: theme.colors.textPrimary }]}>Recurring expense</Text>
            <Switch value={isRecurring} onValueChange={setIsRecurring} trackColor={{ false: theme.colors.textTertiary, true: theme.colors.primary }} />
          </View>

          {isRecurring && (
            <View style={styles.recurrenceRow}>
              {RECURRENCE_INTERVALS.map((interval) => {
                const active = recurrenceInterval === interval;
                return (
                  <TouchableOpacity
                    key={interval}
                    style={[
                      styles.intervalPill,
                      { borderRadius: theme.borderRadius.md, backgroundColor: active ? theme.colors.primary : theme.colors.surface, borderColor: active ? theme.colors.primary : `${theme.colors.textTertiary}40` },
                    ]}
                    onPress={() => setRecurrenceInterval(interval)}
                  >
                    <Text style={[styles.intervalText, { color: active ? '#FFFFFF' : theme.colors.textSecondary }, active && styles.intervalTextActive]}>{interval}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {errorMessage ? <Text style={[styles.errorBanner, { color: theme.colors.error }]}>{errorMessage}</Text> : null}

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
    </ScreenWrapper>
  );
});

const styles = StyleSheet.create({
  flexOne: { flex: 1 },
  scrollContent: { paddingVertical: 8 },
  amountContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 16 },
  currencyPrefix: { fontSize: 32, fontWeight: '800', marginRight: 4 },
  amountInput: { fontSize: 36, fontWeight: '900', minWidth: 120, textAlign: 'center' },
  sectionLabel: { fontSize: 12, fontWeight: '700', marginBottom: 4, marginTop: 8 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 16 },
  categoryPill: { width: '48%', flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 16, marginBottom: 6 },
  categoryIcon: { fontSize: 18, marginRight: 4 },
  categoryText: { fontSize: 12, fontWeight: '600' },
  categoryTextActive: { fontWeight: '800' },
  dateRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderWidth: 1, marginBottom: 16 },
  dateValue: { fontSize: 12, fontWeight: '600' },
  dateQuickButtons: { flexDirection: 'row', gap: 4 },
  dateBtn: { paddingHorizontal: 8, paddingVertical: 4 },
  dateBtnText: { fontSize: 10, fontWeight: '700' },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderWidth: 1, marginBottom: 16 },
  switchLabel: { fontSize: 12, fontWeight: '600' },
  recurrenceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  intervalPill: { flex: 1, alignItems: 'center', paddingVertical: 8, marginHorizontal: 3, borderWidth: 1 },
  intervalText: { fontSize: 10, fontWeight: '700' },
  intervalTextActive: { fontWeight: 'bold' },
  errorBanner: { fontSize: 10, fontWeight: '600', textAlign: 'center', marginVertical: 4 },
  saveButton: { marginTop: 16 },
  deleteButton: { marginTop: 8 },
});

export default EditExpenseScreen;
