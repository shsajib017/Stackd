import React, { useCallback, useState } from 'react';
import {
  KeyboardAvoidingView, Platform, ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../config/ThemeContext';
import useBudget from '../../hooks/useBudget';
import useUIStore from '../../store/useUIStore';
import { INCOME_SOURCES } from '../../utils/constants';
import { formatDate, formatDateForDB } from '../../utils/formatDate';
import { validateIncome } from '../../utils/validateForms';
import Button from '../../components/common/Button';
import ConfirmModal from '../../components/common/ConfirmModal';
import Input from '../../components/common/Input';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import AppHeader from '../../components/common/AppHeader';

const SOURCE_ICONS = { Allowance: '💸', 'Part-time': '💼', Scholarship: '🎓', Other: '📦' };

/** Dedicated Screen for Editing and Deleting Income. */
const EditIncomeScreen = React.memo(({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const income = route.params?.income || {};
  const { updateIncome, deleteIncome } = useBudget();
  const showToast = useUIStore((state) => state.showToast);

  const [amount, setAmount] = useState(String(income.amount || ''));
  const [source, setSource] = useState(income.source || 'Allowance');
  const [note, setNote] = useState(income.note || '');
  const [date, setDate] = useState(income.date ? new Date(income.date) : new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const initForm = useCallback(() => {
    if (route.params?.income) {
      const inc = route.params.income;
      setAmount(String(inc.amount || ''));
      setSource(inc.source || 'Allowance');
      setNote(inc.note || '');
      setDate(inc.date ? new Date(inc.date) : new Date());
    }
  }, [route.params?.income]);

  useFocusEffect(useCallback(() => { initForm(); }, [initForm]));

  const handleUpdate = useCallback(async () => {
    setErrorMessage(null);
    const dateStr = formatDateForDB(date);
    const validation = validateIncome({ amount: parseFloat(amount), source, date: dateStr });
    if (!validation.isValid) { setErrorMessage(Object.values(validation.errors)[0]); return; }

    try {
      setIsLoading(true);
      await updateIncome(income.id, { amount: parseFloat(amount), source, note: note.trim(), date: dateStr });
      showToast('Income updated successfully', 'success');
      navigation.goBack();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update income');
    } finally {
      setIsLoading(false);
    }
  }, [amount, date, income.id, navigation, note, showToast, source, updateIncome]);

  const handleDelete = useCallback(async () => {
    try {
      setIsLoading(true);
      setShowDeleteModal(false);
      await deleteIncome(income.id);
      showToast('Income deleted', 'info');
      navigation.goBack();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to delete income');
    } finally {
      setIsLoading(false);
    }
  }, [deleteIncome, income.id, navigation, showToast]);

  const scrollBottomPadding = Math.max(insets.bottom, 16) + 220;

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView style={styles.flexOne} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <AppHeader title="Edit Income" showBack onBack={() => navigation.goBack()} />
        <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: scrollBottomPadding }]} showsVerticalScrollIndicator={false}>
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

          {errorMessage ? <Text style={[styles.errorBanner, { color: theme.colors.error }]}>{errorMessage}</Text> : null}

          <Button label="Update income" onPress={handleUpdate} loading={isLoading} fullWidth style={styles.saveButton} />
          <Button label="Delete income" variant="danger" onPress={() => setShowDeleteModal(true)} disabled={isLoading} fullWidth style={styles.deleteButton} />
        </ScrollView>

        <ConfirmModal
          visible={showDeleteModal}
          title="Delete this income?"
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
  sourceGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 16 },
  sourcePill: { width: '48%', flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 16, marginBottom: 6 },
  sourceIcon: { fontSize: 18, marginRight: 4 },
  sourceText: { fontSize: 12, fontWeight: '600' },
  sourceTextActive: { fontWeight: '800' },
  dateRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderWidth: 1, marginBottom: 16 },
  dateValue: { fontSize: 12, fontWeight: '600' },
  dateQuickButtons: { flexDirection: 'row', gap: 4 },
  dateBtn: { paddingHorizontal: 8, paddingVertical: 4 },
  dateBtnText: { fontSize: 10, fontWeight: '700' },
  errorBanner: { fontSize: 10, fontWeight: '600', textAlign: 'center', marginVertical: 4 },
  saveButton: { marginTop: 8 },
  deleteButton: { marginTop: 8 },
});

export default EditIncomeScreen;
