import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../config/ThemeContext';
import Button from '../common/Button';

/** Bottom sheet modal for editing custom food item data. */
const EditFoodSheet = React.memo(({ visible, food, onClose, onSave, isSaving }) => {
  const { theme } = useTheme();
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
        <View style={[styles.sheet, { backgroundColor: theme.colors.surface, borderTopLeftRadius: theme.borderRadius.xl, borderTopRightRadius: theme.borderRadius.xl }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Edit Custom Food</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}><Text style={[styles.close, { color: theme.colors.textSecondary }]}>✕</Text></TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={[styles.label, { color: theme.colors.textPrimary }]}>Food name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.background, borderColor: `${theme.colors.textTertiary}30`, borderRadius: theme.borderRadius.md, color: theme.colors.textPrimary }]}
              value={name}
              onChangeText={setName}
              placeholder="Food name"
              placeholderTextColor={theme.colors.textTertiary}
              autoCapitalize="words"
            />
            <Text style={[styles.label, { color: theme.colors.textPrimary }]}>Price (BDT)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.background, borderColor: `${theme.colors.textTertiary}30`, borderRadius: theme.borderRadius.md, color: theme.colors.textPrimary }]}
              value={price}
              onChangeText={setPrice}
              placeholder="Price"
              placeholderTextColor={theme.colors.textTertiary}
              keyboardType="numeric"
            />
            <Text style={[styles.label, { color: theme.colors.textPrimary }]}>Nutrition (optional)</Text>
            <View style={styles.grid}>
              <View style={styles.col}>
                <Text style={[styles.colLabel, { color: theme.colors.textSecondary }]}>kcal</Text>
                <TextInput style={[styles.smallInput, { backgroundColor: theme.colors.background, borderColor: `${theme.colors.textTertiary}30`, borderRadius: theme.borderRadius.sm, color: theme.colors.textPrimary }]} value={calories} onChangeText={setCalories} placeholder="0" placeholderTextColor={theme.colors.textTertiary} keyboardType="numeric" />
              </View>
              <View style={styles.col}>
                <Text style={[styles.colLabel, { color: theme.colors.textSecondary }]}>Protein (g)</Text>
                <TextInput style={[styles.smallInput, { backgroundColor: theme.colors.background, borderColor: `${theme.colors.textTertiary}30`, borderRadius: theme.borderRadius.sm, color: theme.colors.textPrimary }]} value={protein} onChangeText={setProtein} placeholder="0" placeholderTextColor={theme.colors.textTertiary} keyboardType="numeric" />
              </View>
              <View style={styles.col}>
                <Text style={[styles.colLabel, { color: theme.colors.textSecondary }]}>Carbs (g)</Text>
                <TextInput style={[styles.smallInput, { backgroundColor: theme.colors.background, borderColor: `${theme.colors.textTertiary}30`, borderRadius: theme.borderRadius.sm, color: theme.colors.textPrimary }]} value={carbs} onChangeText={setCarbs} placeholder="0" placeholderTextColor={theme.colors.textTertiary} keyboardType="numeric" />
              </View>
              <View style={styles.col}>
                <Text style={[styles.colLabel, { color: theme.colors.textSecondary }]}>Fat (g)</Text>
                <TextInput style={[styles.smallInput, { backgroundColor: theme.colors.background, borderColor: `${theme.colors.textTertiary}30`, borderRadius: theme.borderRadius.sm, color: theme.colors.textPrimary }]} value={fat} onChangeText={setFat} placeholder="0" placeholderTextColor={theme.colors.textTertiary} keyboardType="numeric" />
              </View>
            </View>
            {error ? <Text style={[styles.err, { color: theme.colors.error }]}>{error}</Text> : null}
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
  sheet: { padding: 24, maxHeight: '85%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 15, fontWeight: '700' },
  close: { fontSize: 14, fontWeight: '700' },
  label: { fontSize: 11, fontWeight: '700', marginBottom: 4, marginTop: 4 },
  input: { borderWidth: 1, paddingHorizontal: 16, paddingVertical: 10, fontSize: 12, marginBottom: 8 },
  grid: { flexDirection: 'row', gap: 4, marginBottom: 8 },
  col: { flex: 1 },
  colLabel: { fontSize: 9, marginBottom: 2, textAlign: 'center' },
  smallInput: { borderWidth: 1, paddingVertical: 6, fontSize: 11, textAlign: 'center' },
  err: { fontSize: 10, textAlign: 'center', marginVertical: 4 },
  btn: { marginTop: 8, marginBottom: 8 },
});

export default EditFoodSheet;
