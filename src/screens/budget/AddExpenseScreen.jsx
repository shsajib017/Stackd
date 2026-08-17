import React, { useCallback, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { borderRadius, colors, fontSizes, spacing } from '../../config/theme';
import useBudget from '../../hooks/useBudget';
import useUIStore from '../../store/useUIStore';
import { EXPENSE_CATEGORIES } from '../../utils/constants';
import { formatDate, formatDateForDB } from '../../utils/formatDate';
import { validateExpense } from '../../utils/validateForms';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import CategorySelector from '../../components/budget/CategorySelector';
import RecurringSelector from '../../components/budget/RecurringSelector';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Dedicated Create Screen for Adding an Expense with Header. */
const AddExpenseScreen = React.memo(({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { addExpense } = useBudget();
  const showToast = useUIStore((state) => state.showToast);

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [note, setNote] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringInterval, setRecurringInterval] = useState('monthly');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const resetForm = useCallback(() => {
    setAmount(''); setCategory('Food'); setNote(''); setSelectedDate(new Date());
    setIsRecurring(false); setRecurringInterval('monthly'); setErrorMessage(null);
  }, []);

  useFocusEffect(useCallback(() => { resetForm(); }, [resetForm]));

  const onDateChange = (event, date) => {
    if (event?.type === 'dismissed') { setShowDatePicker(false); return; }
    if (date) { setSelectedDate(date); setShowDatePicker(false); }
  };

  const handleSave = useCallback(async () => {
    setErrorMessage(null);
    const dateStr = formatDateForDB(selectedDate);
    const validation = validateExpense({ amount: parseFloat(amount), category, date: dateStr });
    if (!validation.isValid) { setErrorMessage(Object.values(validation.errors)[0]); return; }

    try {
      setIsSaving(true);
      await addExpense({
        amount: parseFloat(amount),
        category,
        note: note.trim(),
        date: dateStr,
      });
      showToast('Expense saved', 'success');
      navigation.goBack();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to save expense');
      showToast(err.message || 'Failed to save expense', 'error');
    } finally {
      setIsSaving(false);
    }
  }, [addExpense, amount, category, navigation, note, selectedDate, showToast]);

  const daysInMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, spacing.md) }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><Text style={styles.backArrow}>←</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Add Expense</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.amountContainer}>
          <Text style={styles.currencyPrefix}>৳</Text>
          <TextInput style={styles.amountInput} value={amount} onChangeText={setAmount} placeholder="0.00" placeholderTextColor={colors.textTertiary} keyboardType="decimal-pad" autoFocus />
        </View>

        <Text style={styles.sectionLabel}>Category</Text>
        <CategorySelector categories={EXPENSE_CATEGORIES} selected={category} onSelect={setCategory} />

        <Input label="Note (optional)" value={note} onChangeText={setNote} placeholder="Add a note..." />

        <Text style={styles.sectionLabel}>Date</Text>
        <View style={styles.dateRow}>
          <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateValueBtn}>
            <Text style={styles.dateValue}>📅 {formatDate(selectedDate)}</Text>
          </TouchableOpacity>
          <View style={styles.dateQuickButtons}>
            <TouchableOpacity onPress={() => setSelectedDate(new Date())} style={styles.dateBtn}><Text style={styles.dateBtnText}>Today</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => { const d = new Date(); d.setDate(d.getDate() - 1); setSelectedDate(d); }} style={styles.dateBtn}><Text style={styles.dateBtnText}>Yesterday</Text></TouchableOpacity>
          </View>
        </View>

        <RecurringSelector isRecurring={isRecurring} onToggle={setIsRecurring} interval={recurringInterval} onIntervalChange={setRecurringInterval} />

        {errorMessage ? <Text style={styles.errorBanner}>{errorMessage}</Text> : null}
        <Button label="Save expense" loading={isSaving} disabled={isSaving} onPress={handleSave} fullWidth style={styles.saveButton} />
      </ScrollView>

      {/* Date Picker Modal */}
      <Modal visible={showDatePicker} transparent animationType="fade" onRequestClose={() => setShowDatePicker(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Select Date</Text>
            <View style={styles.pickerMonthRow}>
              <TouchableOpacity onPress={() => { const d = new Date(selectedDate); d.setMonth(d.getMonth() - 1); setSelectedDate(d); }} style={styles.pickerArrowBtn}><Text style={styles.pickerArrow}>‹</Text></TouchableOpacity>
              <Text style={styles.pickerMonthText}>{MONTH_NAMES[selectedDate.getMonth()]} {selectedDate.getFullYear()}</Text>
              <TouchableOpacity onPress={() => { const d = new Date(selectedDate); d.setMonth(d.getMonth() + 1); setSelectedDate(d); }} style={styles.pickerArrowBtn}><Text style={styles.pickerArrow}>›</Text></TouchableOpacity>
            </View>
            <View style={styles.dayGrid}>
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                const isSelected = selectedDate.getDate() === day;
                return (
                  <TouchableOpacity key={day} style={[styles.dayCell, isSelected && styles.dayCellActive]} onPress={() => { const d = new Date(selectedDate); d.setDate(day); onDateChange({ type: 'set' }, d); }}>
                    <Text style={[styles.dayText, isSelected && styles.dayTextActive]}>{day}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Button label="Done" onPress={() => setShowDatePicker(false)} fullWidth style={styles.modalDoneBtn} />
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingBottom: spacing.sm, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: `${colors.textTertiary}20` },
  backBtn: { padding: spacing.xs },
  backArrow: { fontSize: fontSizes.xl, color: colors.textPrimary, fontWeight: '700' },
  headerTitle: { fontSize: fontSizes.lg, fontWeight: '800', color: colors.textPrimary },
  headerSpacer: { width: 32 },
  scrollContent: { padding: spacing.md, paddingBottom: 130 },
  amountContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: spacing.lg },
  currencyPrefix: { fontSize: fontSizes.xxxl, fontWeight: '800', color: colors.accent, marginRight: spacing.xs },
  amountInput: { fontSize: fontSizes.xxxl + 4, fontWeight: '900', color: colors.textPrimary, minWidth: 120, textAlign: 'center' },
  sectionLabel: { fontSize: fontSizes.sm, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.xs, marginTop: spacing.xs },
  dateRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.surface, padding: spacing.md, borderRadius: borderRadius.md, borderWidth: 1, borderColor: `${colors.textTertiary}30`, marginBottom: spacing.md },
  dateValueBtn: { flex: 1 },
  dateValue: { fontSize: fontSizes.sm, fontWeight: '600', color: colors.primary },
  dateQuickButtons: { flexDirection: 'row', gap: spacing.xs },
  dateBtn: { backgroundColor: `${colors.primary}15`, paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: borderRadius.sm },
  dateBtnText: { fontSize: fontSizes.xs, fontWeight: '700', color: colors.primary },
  errorBanner: { fontSize: fontSizes.xs, color: colors.error, fontWeight: '600', textAlign: 'center', marginVertical: spacing.xs },
  saveButton: { marginTop: spacing.md },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
  modalCard: { width: '100%', backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.lg },
  modalTitle: { fontSize: fontSizes.md, fontWeight: '800', color: colors.textPrimary, textAlign: 'center', marginBottom: spacing.md },
  pickerMonthRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  pickerArrowBtn: { padding: spacing.sm },
  pickerArrow: { fontSize: fontSizes.xl, fontWeight: '800', color: colors.primary },
  pickerMonthText: { fontSize: fontSizes.sm, fontWeight: '700', color: colors.textPrimary },
  dayGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'flex-start', marginBottom: spacing.md },
  dayCell: { width: 38, height: 38, borderRadius: borderRadius.sm, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  dayCellActive: { backgroundColor: colors.primary },
  dayText: { fontSize: fontSizes.xs, fontWeight: '600', color: colors.textPrimary },
  dayTextActive: { color: colors.surface, fontWeight: '800' },
  modalDoneBtn: { marginTop: spacing.xs },
});

export default AddExpenseScreen;
