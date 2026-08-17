import React, { useCallback, useState } from 'react';
import {
  KeyboardAvoidingView, Platform, ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { borderRadius, colors, fontSizes, spacing } from '../../config/theme';
import useBudget from '../../hooks/useBudget';
import useUIStore from '../../store/useUIStore';
import { INCOME_SOURCES } from '../../utils/constants';
import { formatDate, formatDateForDB } from '../../utils/formatDate';
import { validateIncome } from '../../utils/validateForms';
import Button from '../../components/common/Button';
import ConfirmModal from '../../components/common/ConfirmModal';
import Input from '../../components/common/Input';

const SOURCE_ICONS = { Allowance: '💸', 'Part-time': '💼', Scholarship: '🎓', Other: '📦' };

/**
 * Dedicated Screen for Editing and Deleting Income.
 */
const EditIncomeScreen = React.memo(({ navigation, route }) => {
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
    const validation = validateIncome({ amount: Number(amount), source, date: dateStr });
    if (!validation.isValid) {
      setErrorMessage(Object.values(validation.errors)[0]);
      return;
    }

    try {
      setIsLoading(true);
      await updateIncome(income.id, {
        amount: Number(amount),
        source,
        note: note.trim(),
        date: dateStr,
      });
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

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.amountContainer}>
          <Text style={styles.currencyPrefix}>৳</Text>
          <TextInput
            style={styles.amountInput}
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            placeholderTextColor={colors.textTertiary}
            keyboardType="decimal-pad"
          />
        </View>

        <Text style={styles.sectionLabel}>Source</Text>
        <View style={styles.sourceGrid}>
          {INCOME_SOURCES.map((src) => {
            const isSelected = source === src;
            return (
              <TouchableOpacity
                key={src}
                style={[styles.sourcePill, isSelected ? styles.sourcePillActive : styles.sourcePillInactive]}
                onPress={() => setSource(src)}
                activeOpacity={0.8}
              >
                <Text style={styles.sourceIcon}>{SOURCE_ICONS[src] || '📦'}</Text>
                <Text style={[styles.sourceText, isSelected && styles.sourceTextActive]}>{src}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Input label="Note (optional)" value={note} onChangeText={setNote} placeholder="Add a note..." />

        <Text style={styles.sectionLabel}>Date</Text>
        <View style={styles.dateRow}>
          <Text style={styles.dateValue}>{formatDate(date)}</Text>
          <View style={styles.dateQuickButtons}>
            <TouchableOpacity onPress={() => setDate(new Date())} style={styles.dateBtn}><Text style={styles.dateBtnText}>Today</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => { const d = new Date(); d.setDate(d.getDate() - 1); setDate(d); }} style={styles.dateBtn}><Text style={styles.dateBtnText}>Yesterday</Text></TouchableOpacity>
          </View>
        </View>

        {errorMessage ? <Text style={styles.errorBanner}>{errorMessage}</Text> : null}

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
  );
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: spacing.md, paddingBottom: spacing.xxl },
  amountContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: spacing.lg },
  currencyPrefix: { fontSize: fontSizes.xxxl, fontWeight: '800', color: colors.success, marginRight: spacing.xs },
  amountInput: { fontSize: fontSizes.xxxl + 4, fontWeight: '900', color: colors.textPrimary, minWidth: 120, textAlign: 'center' },
  sectionLabel: { fontSize: fontSizes.sm, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.xs, marginTop: spacing.xs },
  sourceGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: spacing.md },
  sourcePill: { width: '48%', flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm + 2, paddingHorizontal: spacing.md, borderRadius: borderRadius.md, marginBottom: spacing.xs + 2 },
  sourcePillActive: { backgroundColor: colors.success },
  sourcePillInactive: { backgroundColor: colors.surface, borderWidth: 1, borderColor: `${colors.textTertiary}40` },
  sourceIcon: { fontSize: 18, marginRight: spacing.xs },
  sourceText: { fontSize: fontSizes.sm, fontWeight: '600', color: colors.textPrimary },
  sourceTextActive: { color: colors.surface, fontWeight: '800' },
  dateRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.surface, padding: spacing.md, borderRadius: borderRadius.md, borderWidth: 1, borderColor: `${colors.textTertiary}30`, marginBottom: spacing.md },
  dateValue: { fontSize: fontSizes.sm, fontWeight: '600', color: colors.textPrimary },
  dateQuickButtons: { flexDirection: 'row', gap: spacing.xs },
  dateBtn: { backgroundColor: `${colors.primary}15`, paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: borderRadius.sm },
  dateBtnText: { fontSize: fontSizes.xs, fontWeight: '700', color: colors.primary },
  errorBanner: { fontSize: fontSizes.xs, color: colors.error, fontWeight: '600', textAlign: 'center', marginVertical: spacing.xs },
  saveButton: { marginTop: spacing.sm },
  deleteButton: { marginTop: spacing.sm },
});

export default EditIncomeScreen;
