import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { borderRadius, colors, fontSizes, spacing } from '../../config/theme';
import useAuthStore from '../../store/useAuthStore';
import useUIStore from '../../store/useUIStore';
import { deleteCustomFood, getUserCustomFoods, updateCustomFood } from '../../supabase/foods';
import AppHeader from '../../components/common/AppHeader';
import ConfirmModal from '../../components/common/ConfirmModal';
import EmptyState from '../../components/common/EmptyState';
import SkeletonCard from '../../components/common/SkeletonCard';
import EditFoodSheet from '../../components/meals/EditFoodSheet';

/** Screen displaying and managing user-saved custom food items. */
const MyFoodsScreen = React.memo(({ navigation }) => {
  const user = useAuthStore((state) => state.user);
  const showToast = useUIStore((state) => state.showToast);

  const [foods, setFoods] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [editingFood, setEditingFood] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingFood, setDeletingFood] = useState(null);

  const fetchFoods = useCallback(async () => {
    if (!user?.id) return;
    try {
      setIsLoading(true);
      const data = await getUserCustomFoods(user.id);
      setFoods(data || []);
    } catch {
      showToast('Failed to load custom foods', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast, user?.id]);

  useFocusEffect(useCallback(() => { fetchFoods(); }, [fetchFoods]));

  const filteredFoods = useMemo(() => {
    if (!searchQuery.trim()) return foods;
    const q = searchQuery.toLowerCase().trim();
    return foods.filter((f) => f.name?.toLowerCase().includes(q));
  }, [foods, searchQuery]);

  const handleUpdate = useCallback(async (foodId, payload) => {
    try {
      setIsSaving(true);
      await updateCustomFood(foodId, payload);
      showToast('Food updated ✓', 'success');
      setEditingFood(null);
      await fetchFoods();
    } catch (err) {
      showToast(err.message || 'Failed to update food', 'error');
    } finally {
      setIsSaving(false);
    }
  }, [fetchFoods, showToast]);

  const handleDelete = useCallback(async () => {
    if (!deletingFood?.id) return;
    try {
      await deleteCustomFood(deletingFood.id);
      showToast('Food removed', 'info');
      setDeletingFood(null);
      await fetchFoods();
    } catch (err) {
      showToast(err.message || 'Failed to delete food', 'error');
    }
  }, [deletingFood?.id, fetchFoods, showToast]);

  const renderItem = useCallback(({ item }) => {
    const hasMacros = item.protein != null || item.carbs != null || item.fat != null;
    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <Text style={styles.foodName} numberOfLines={1}>{item.name}</Text>
          <View style={styles.actionIcons}>
            <TouchableOpacity onPress={() => setEditingFood(item)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={styles.iconBtn}>
              <Text style={styles.iconText}>✏️</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setDeletingFood(item)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={styles.iconBtn}>
              <Text style={styles.iconText}>🗑️</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.price}>৳ {item.avg_price_bdt || 0}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.calText}>{item.calories != null ? `${item.calories} kcal` : 'No nutrition data'}</Text>
          {hasMacros && (
            <Text style={styles.macroText}>{item.protein || 0}g P • {item.carbs || 0}g C • {item.fat || 0}g F</Text>
          )}
        </View>
      </View>
    );
  }, []);

  return (
    <View style={styles.container}>
      <AppHeader title="My Foods" showBack onBack={() => navigation.goBack()} />
      <View style={styles.body}>
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>Your saved foods appear here and at the top of food search</Text>
        </View>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput style={styles.searchInput} value={searchQuery} onChangeText={setSearchQuery} placeholder="Search my foods..." placeholderTextColor={colors.textTertiary} />
          {searchQuery ? <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}><Text style={styles.clearBtn}>✕</Text></TouchableOpacity> : null}
        </View>

        {isLoading ? (
          <View style={styles.skeletonWrap}>
            <SkeletonCard height={90} style={styles.mb} />
            <SkeletonCard height={90} style={styles.mb} />
            <SkeletonCard height={90} />
          </View>
        ) : (
          <FlatList
            data={filteredFoods}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={<EmptyState icon="🍽️" title="No saved foods yet" subtitle="Foods you add manually with 'Save for future use' will appear here" />}
          />
        )}
      </View>

      <EditFoodSheet visible={Boolean(editingFood)} food={editingFood} onClose={() => setEditingFood(null)} onSave={handleUpdate} isSaving={isSaving} />
      <ConfirmModal visible={Boolean(deletingFood)} title="Remove this food?" message="It will no longer appear in search" confirmLabel="Remove" cancelLabel="Cancel" isDanger onConfirm={handleDelete} onCancel={() => setDeletingFood(null)} />
    </View>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  body: { flex: 1, paddingHorizontal: spacing.md, paddingTop: spacing.sm },
  infoCard: { backgroundColor: colors.surface, padding: spacing.md, borderRadius: borderRadius.md, marginBottom: spacing.md, borderWidth: 1, borderColor: `${colors.textTertiary}20` },
  infoText: { fontSize: fontSizes.xs + 1, color: colors.textSecondary, lineHeight: 18 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: borderRadius.md, paddingHorizontal: spacing.md, borderWidth: 1, borderColor: `${colors.textTertiary}30`, marginBottom: spacing.md },
  searchIcon: { fontSize: fontSizes.sm, marginRight: spacing.xs },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: fontSizes.sm, color: colors.textPrimary },
  clearBtn: { fontSize: fontSizes.xs, color: colors.textTertiary, paddingHorizontal: 4 },
  skeletonWrap: { gap: spacing.sm },
  mb: { marginBottom: spacing.sm },
  listContent: { paddingBottom: spacing.xxl },
  card: { backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: `${colors.textTertiary}20` },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  foodName: { fontSize: fontSizes.sm + 1, fontWeight: '700', color: colors.textPrimary, flex: 1, marginRight: spacing.sm },
  actionIcons: { flexDirection: 'row', gap: spacing.xs + 4 },
  iconBtn: { padding: 2 },
  iconText: { fontSize: fontSizes.sm },
  price: { fontSize: fontSizes.sm, fontWeight: '700', color: colors.accent, marginBottom: 4 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 },
  calText: { fontSize: fontSizes.xs, color: colors.textSecondary },
  macroText: { fontSize: fontSizes.xs - 1, color: colors.textTertiary, fontWeight: '600' },
});

export default MyFoodsScreen;
