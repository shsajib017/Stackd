import React, { useCallback, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../config/ThemeContext';
import useBudget from '../../hooks/useBudget';
import useUIStore from '../../store/useUIStore';
import { INCOME_SOURCES } from '../../utils/constants';
import { formatDate, formatDateForDB } from '../../utils/formatDate';
import { validateIncome } from '../../utils/validateForms';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import AppHeader from '../../components/common/AppHeader';

const SOURCE_ICONS = { Allowance: '💸', 'Part-time': '💼', Scholarship: '🎓', Other: '📦' };
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Dedicated Create Screen for Adding Income with Header. */
const AddIncomeScreen = React.memo(({ navigation }) => {
  const { theme } = useTheme();
  const { addIncome } = useBudget();
  const showToast = useUIStore((state) => state.showToast);

  const [amount, setAmount] = useState('');
  const [source, setSource] = useState('Allowance');
  const [note, setNote] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const resetForm = useCallback(() => {
    setAmount(''); setSource('Allowance'); setNote(''); setSelectedDate(new Date()); setErrorMessage(null);
  }, []);

  useFocusEffect(useCallback(() => { resetForm(); }, [resetForm]));

  const onDateChange = (event, date) => {
    if (event?.type === 'dismissed') { setShowDatePicker(false); return; }
    if (date) { setSelectedDate(date); setShowDatePicker(false); }
  };

  const handleSave = useCallback(async () => {
    setErrorMessage(null);
    const dateStr = formatDateForDB(selectedDate);
    const validation = validateIncome({ amount: parseFloat(amount), source, date: dateStr });
    if (!validation.isValid) { setErrorMessage(Object.values(validation.errors)[0]); return; }

    try {
      setIsLoading(true);
      await addIncome({ amount: parseFloat(amount), source, note: note.trim(), date: dateStr });
      showToast('Income added successfully', 'success');
      navigation.goBack();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to save income');
    } finally {
      setIsLoading(false);
    }
  }, [addIncome, amount, navigation, note, selectedDate, showToast, source]);

  const daysInMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView style={styles.flexOne} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <AppHeader title="Add Income" showBack onBack={() => navigation.goBack()} />

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.amountContainer}>
            <Text style={[styles.currencyPrefix, { color: theme.colors.success }]}>৳</Text>
            <TextInput
              style={[styles.amountInput, { color: theme.colors.textPrimary }]}
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              placeholderTextColor={theme.colors.textTertiary}
              keyboardType="decimal-pad"
              autoFocus
            />
          </View>

          <Text style={[styles.sectionLabel, { color: theme.colors.textPrimary }]}>Source</Text>
          <View style={styles.sourceGrid}>
            {INCOME_SOURCES.map((src) => {
              const isSelected = source === src;
              return (
                <TouchableOpacity
                  key={src}
                  style={[
                    styles.sourcePill,
                    { borderRadius: theme.borderRadius.md },
                    isSelected
                      ? { backgroundColor: theme.colors.success }
                      : { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: `${theme.colors.textTertiary}40` },
                  ]}
                  onPress={() => setSource(src)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.sourceIcon}>{SOURCE_ICONS[src] || '📦'}</Text>
                  <Text style={[styles.sourceText, { color: isSelected ? '#FFFFFF' : theme.colors.textPrimary }, isSelected && styles.sourceTextActive]}>{src}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Input label="Note (optional)" value={note} onChangeText={setNote} placeholder="Add a note..." />

          <Text style={[styles.sectionLabel, { color: theme.colors.textPrimary }]}>Date</Text>
          <View style={[styles.dateRow, { backgroundColor: theme.colors.surface, borderColor: `${theme.colors.textTertiary}30`, borderRadius: theme.borderRadius.md }]}>
            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateValueBtn}>
              <Text style={[styles.dateValue, { color: theme.colors.primary }]}>📅 {formatDate(selectedDate)}</Text>
            </TouchableOpacity>
            <View style={styles.dateQuickButtons}>
              <TouchableOpacity onPress={() => setSelectedDate(new Date())} style={[styles.dateBtn, { backgroundColor: `${theme.colors.primary}15`, borderRadius: theme.borderRadius.sm }]}>
                <Text style={[styles.dateBtnText, { color: theme.colors.primary }]}>Today</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { const d = new Date(); d.setDate(d.getDate() - 1); setSelectedDate(d); }} style={[styles.dateBtn, { backgroundColor: `${theme.colors.primary}15`, borderRadius: theme.borderRadius.sm }]}>
                <Text style={[styles.dateBtnText, { color: theme.colors.primary }]}>Yesterday</Text>
              </TouchableOpacity>
            </View>
          </View>

          {errorMessage ? <Text style={[styles.errorBanner, { color: theme.colors.error }]}>{errorMessage}</Text> : null}
          <Button label="Save income" onPress={handleSave} loading={isLoading} fullWidth style={styles.saveButton} />
        </ScrollView>

        {/* Date Picker Modal */}
        <Modal visible={showDatePicker} transparent animationType="fade" onRequestClose={() => setShowDatePicker(false)}>
          <View style={styles.modalBackdrop}>
            <View style={[styles.modalCard, { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg }]}>
              <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>Select Date</Text>
              <View style={styles.pickerMonthRow}>
                <TouchableOpacity onPress={() => { const d = new Date(selectedDate); d.setMonth(d.getMonth() - 1); setSelectedDate(d); }} style={styles.pickerArrowBtn}>
                  <Text style={[styles.pickerArrow, { color: theme.colors.primary }]}>‹</Text>
                </TouchableOpacity>
                <Text style={[styles.pickerMonthText, { color: theme.colors.textPrimary }]}>{MONTH_NAMES[selectedDate.getMonth()]} {selectedDate.getFullYear()}</Text>
                <TouchableOpacity onPress={() => { const d = new Date(selectedDate); d.setMonth(d.getMonth() + 1); setSelectedDate(d); }} style={styles.pickerArrowBtn}>
                  <Text style={[styles.pickerArrow, { color: theme.colors.primary }]}>›</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.dayGrid}>
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                  const isSelected = selectedDate.getDate() === day;
                  return (
                    <TouchableOpacity
                      key={day}
                      style={[
                        styles.dayCell,
                        { borderRadius: theme.borderRadius.sm, backgroundColor: isSelected ? theme.colors.primary : `${theme.colors.textTertiary}15` },
                      ]}
                      onPress={() => { const d = new Date(selectedDate); d.setDate(day); onDateChange({ type: 'set' }, d); }}
                    >
                      <Text style={[styles.dayText, { color: isSelected ? '#FFFFFF' : theme.colors.textPrimary }]}>{day}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <Button label="Done" onPress={() => setShowDatePicker(false)} fullWidth style={styles.modalDoneBtn} />
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
});

const styles = StyleSheet.create({
  flexOne: { flex: 1 },
  scrollContent: { paddingVertical: 8, paddingBottom: 130 },
  amountContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 16 },
  currencyPrefix: { fontSize: 32, fontWeight: '800', marginRight: 4 },
  amountInput: { fontSize: 36, fontWeight: '900', minWidth: 120, textAlign: 'center' },
  sectionLabel: { fontSize: 12, fontWeight: '700', marginBottom: 4, marginTop: 4 },
  sourceGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 16 },
  sourcePill: { width: '48%', flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 16, marginBottom: 8 },
  sourceIcon: { fontSize: 18, marginRight: 4 },
  sourceText: { fontSize: 12, fontWeight: '600' },
  sourceTextActive: { fontWeight: '800' },
  dateRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderWidth: 1, marginBottom: 14 },
  dateValueBtn: { flex: 1 },
  dateValue: { fontSize: 14, fontWeight: '600' },
  dateQuickButtons: { flexDirection: 'row', gap: 6 },
  dateBtn: { paddingHorizontal: 10, paddingVertical: 4 },
  dateBtnText: { fontSize: 10, fontWeight: '700' },
  errorBanner: { fontSize: 11, fontWeight: '600', textAlign: 'center', marginVertical: 4 },
  saveButton: { marginTop: 8 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalCard: { width: '100%', padding: 20 },
  modalTitle: { fontSize: 14, fontWeight: '800', textAlign: 'center', marginBottom: 14 },
  pickerMonthRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  pickerArrowBtn: { padding: 8 },
  pickerArrow: { fontSize: 20, fontWeight: '800' },
  pickerMonthText: { fontSize: 12, fontWeight: '700' },
  dayGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'flex-start', marginBottom: 14 },
  dayCell: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  dayText: { fontSize: 11, fontWeight: '600' },
  modalDoneBtn: { marginTop: 4 },
});

export default AddIncomeScreen;
