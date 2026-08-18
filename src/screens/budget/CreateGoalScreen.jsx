import React, { useCallback, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../config/ThemeContext';
import useSavings from '../../hooks/useSavings';
import useUIStore from '../../store/useUIStore';
import { formatDate, formatDateForDB } from '../../utils/formatDate';
import { validateSavingsGoal } from '../../utils/validateForms';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import AppHeader from '../../components/common/AppHeader';

/** Dedicated Screen for Creating a New Savings Goal. */
const CreateGoalScreen = React.memo(({ navigation }) => {
  const { theme } = useTheme();
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
    <ScreenWrapper>
      <KeyboardAvoidingView style={styles.flexOne} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <AppHeader title="Create Goal" showBack onBack={() => navigation.goBack()} />
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

          <Text style={[styles.fieldLabel, { color: theme.colors.textPrimary }]}>Starting amount (optional)</Text>
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
          <Button label="Save goal" onPress={handleSave} loading={isLoading} fullWidth style={styles.saveBtn} />
        </ScrollView>
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
});

export default CreateGoalScreen;
