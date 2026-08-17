import React, { useCallback, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { borderRadius, colors, fontSizes, spacing } from '../../config/theme';
import useSavings from '../../hooks/useSavings';
import useUIStore from '../../store/useUIStore';
import { formatDate, formatDateForDB } from '../../utils/formatDate';
import { validateSavingsGoal } from '../../utils/validateForms';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

/** Dedicated Screen for Creating a New Savings Goal. */
const CreateGoalScreen = React.memo(({ navigation }) => {
  const { addGoal } = useSavings();
  const showToast = useUIStore((state) => state.showToast);

  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [hasDeadline, setHasDeadline] = useState(false);
  const [deadlineDate, setDeadlineDate] = useState(new Date(Date.now() + 30 * 86400000));
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const resetForm = useCallback(() => {
    setTitle('');
    setTargetAmount('');
    setCurrentAmount('');
    setHasDeadline(false);
    setDeadlineDate(new Date(Date.now() + 30 * 86400000));
    setErrorMessage(null);
  }, []);

  useFocusEffect(useCallback(() => { resetForm(); }, [resetForm]));

  const handleSave = useCallback(async () => {
    setErrorMessage(null);
    const targetNum = Number(targetAmount);
    const validation = validateSavingsGoal({ title: title.trim(), targetAmount: targetNum });
    if (!validation.isValid) { setErrorMessage(Object.values(validation.errors)[0]); return; }

    const startingNum = currentAmount.trim() ? Number(currentAmount) : 0;
    const deadlineStr = hasDeadline ? formatDateForDB(deadlineDate) : null;

    try {
      setIsLoading(true);
      await addGoal({
        title: title.trim(),
        target_amount: targetNum,
        current_amount: startingNum,
        deadline: deadlineStr,
      });
      showToast('Goal created successfully', 'success');
      navigation.goBack();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to save goal');
    } finally {
      setIsLoading(false);
    }
  }, [addGoal, currentAmount, deadlineDate, hasDeadline, navigation, showToast, targetAmount, title]);

  const adjustDeadline = useCallback((months) => {
    const d = new Date(); d.setMonth(d.getMonth() + months); setDeadlineDate(d);
  }, []);

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Input label="Goal name" value={title} onChangeText={setTitle} placeholder="e.g. New laptop, Emergency fund" autoCapitalize="words" />

        <Text style={styles.fieldLabel}>Target amount</Text>
        <View style={styles.amountInputRow}>
          <Text style={styles.currencyPrefix}>৳</Text>
          <TextInput style={styles.amountInput} value={targetAmount} onChangeText={setTargetAmount} placeholder="10000" placeholderTextColor={colors.textTertiary} keyboardType="decimal-pad" />
        </View>

        <Text style={styles.fieldLabel}>Starting amount (optional)</Text>
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
        <Button label="Save goal" onPress={handleSave} loading={isLoading} fullWidth style={styles.saveBtn} />
      </ScrollView>
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
});

export default CreateGoalScreen;
