import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { borderRadius, colors, fontSizes, spacing } from '../../config/theme';
import Button from '../common/Button';

/** Bottom sheet modal for editing custom food item data. */
const EditFoodSheet = React.memo(({ visible, food, onClose, onSave, isSaving }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (food) {
      setName(food.name || '');
      setPrice(food.avg_price_bdt ? String(food.avg_price_bdt) : '');
      setCalories(food.calories != null ? String(food.calories) : '');
      setProtein(food.protein != null ? String(food.protein) : '');
      setCarbs(food.carbs != null ? String(food.carbs) : '');
      setFat(food.fat != null ? String(food.fat) : '');
      setError(null);
    }
  }, [food]);

  const handleSave = () => {
    if (!name.trim()) { setError('Food name is required'); return; }
    if (!price || Number(price) <= 0) { setError('Price must be greater than 0'); return; }
    onSave(food.id, {
      name: name.trim(),
      avg_price_bdt: Number(price),
      calories: calories ? Number(calories) : null,
      protein: protein ? Number(protein) : null,
      carbs: carbs ? Number(carbs) : null,
      fat: fat ? Number(fat) : null,
    });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Edit Custom Food</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}><Text style={styles.close}>✕</Text></TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>Food name</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Food name" placeholderTextColor={colors.textTertiary} autoCapitalize="words" />
            <Text style={styles.label}>Price (BDT)</Text>
            <TextInput style={styles.input} value={price} onChangeText={setPrice} placeholder="Price" placeholderTextColor={colors.textTertiary} keyboardType="numeric" />
            <Text style={styles.label}>Nutrition (optional)</Text>
            <View style={styles.grid}>
              <View style={styles.col}><Text style={styles.colLabel}>kcal</Text><TextInput style={styles.smallInput} value={calories} onChangeText={setCalories} placeholder="0" placeholderTextColor={colors.textTertiary} keyboardType="numeric" /></View>
              <View style={styles.col}><Text style={styles.colLabel}>Protein (g)</Text><TextInput style={styles.smallInput} value={protein} onChangeText={setProtein} placeholder="0" placeholderTextColor={colors.textTertiary} keyboardType="numeric" /></View>
              <View style={styles.col}><Text style={styles.colLabel}>Carbs (g)</Text><TextInput style={styles.smallInput} value={carbs} onChangeText={setCarbs} placeholder="0" placeholderTextColor={colors.textTertiary} keyboardType="numeric" /></View>
              <View style={styles.col}><Text style={styles.colLabel}>Fat (g)</Text><TextInput style={styles.smallInput} value={fat} onChangeText={setFat} placeholder="0" placeholderTextColor={colors.textTertiary} keyboardType="numeric" /></View>
            </View>
            {error ? <Text style={styles.err}>{error}</Text> : null}
            <Button label="Save changes" onPress={handleSave} loading={isSaving} fullWidth style={styles.btn} />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
});

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  backdrop: { flex: 1 },
  sheet: { backgroundColor: colors.surface, borderTopLeftRadius: borderRadius.xl, borderTopRightRadius: borderRadius.xl, padding: spacing.lg, maxHeight: '85%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  title: { fontSize: fontSizes.md + 1, fontWeight: '700', color: colors.textPrimary },
  close: { fontSize: fontSizes.md, color: colors.textSecondary, fontWeight: '700' },
  label: { fontSize: fontSizes.xs + 1, fontWeight: '700', color: colors.textPrimary, marginBottom: 4, marginTop: spacing.xs },
  input: { backgroundColor: colors.background, borderWidth: 1, borderColor: `${colors.textTertiary}30`, borderRadius: borderRadius.md, paddingHorizontal: spacing.md, paddingVertical: 10, fontSize: fontSizes.sm, color: colors.textPrimary, marginBottom: spacing.sm },
  grid: { flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.sm },
  col: { flex: 1 },
  colLabel: { fontSize: fontSizes.xs - 1, color: colors.textSecondary, marginBottom: 2, textAlign: 'center' },
  smallInput: { backgroundColor: colors.background, borderWidth: 1, borderColor: `${colors.textTertiary}30`, borderRadius: borderRadius.sm, paddingVertical: 6, fontSize: fontSizes.xs + 1, color: colors.textPrimary, textAlign: 'center' },
  err: { fontSize: fontSizes.xs, color: colors.error, textAlign: 'center', marginVertical: spacing.xs },
  btn: { marginTop: spacing.sm, marginBottom: spacing.sm },
});

export default EditFoodSheet;
