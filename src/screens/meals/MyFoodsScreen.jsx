import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../config/ThemeContext';
import useAuthStore from '../../store/useAuthStore';
import useUIStore from '../../store/useUIStore';
import { deleteCustomFood, getUserCustomFoods, updateCustomFood } from '../../supabase/foods';
import AppHeader from '../../components/common/AppHeader';
import ConfirmModal from '../../components/common/ConfirmModal';
import EmptyState from '../../components/common/EmptyState';
import SkeletonCard from '../../components/common/SkeletonCard';
import EditFoodSheet from '../../components/meals/EditFoodSheet';
import ScreenWrapper from '../../components/common/ScreenWrapper';

/** Screen displaying and managing user-saved custom food items. */
const MyFoodsScreen = React.memo(({ navigation }) => {
  const { theme } = useTheme();
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
      <View style={[styles.card, { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md, borderColor: `${theme.colors.textTertiary}20` }]}>
        <View style={styles.cardTop}>
          <Text style={[styles.foodName, { color: theme.colors.textPrimary }]} numberOfLines={1}>{item.name}</Text>
          <View style={styles.actionIcons}>
            <TouchableOpacity onPress={() => setEditingFood(item)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={styles.iconBtn}>
              <Text style={styles.iconText}>✏️</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setDeletingFood(item)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={styles.iconBtn}>
              <Text style={styles.iconText}>🗑️</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={[styles.price, { color: theme.colors.accent }]}>৳ {item.avg_price_bdt || 0}</Text>
        <View style={styles.metaRow}>
          <Text style={[styles.calText, { color: theme.colors.textSecondary }]}>{item.calories != null ? `${item.calories} kcal` : 'No nutrition data'}</Text>
          {hasMacros && (
            <Text style={[styles.macroText, { color: theme.colors.textTertiary }]}>{item.protein || 0}g P • {item.carbs || 0}g C • {item.fat || 0}g F</Text>
          )}
        </View>
      </View>
    );
  }, [theme.borderRadius.md, theme.colors.accent, theme.colors.surface, theme.colors.textPrimary, theme.colors.textSecondary, theme.colors.textTertiary]);

  return (
    <ScreenWrapper>
      <AppHeader title="My Foods" showBack onBack={() => navigation.goBack()} />
      <View style={styles.body}>
        <View style={[styles.infoCard, { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md, borderColor: `${theme.colors.textTertiary}20` }]}>
          <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>Your saved foods appear here and at the top of food search</Text>
        </View>
        <View style={[styles.searchBox, { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md, borderColor: `${theme.colors.textTertiary}30` }]}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={[styles.searchInput, { color: theme.colors.textPrimary }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search my foods..."
            placeholderTextColor={theme.colors.textTertiary}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={[styles.clearBtn, { color: theme.colors.textTertiary }]}>✕</Text>
            </TouchableOpacity>
          ) : null}
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
    </ScreenWrapper>
  );
});

const styles = StyleSheet.create({
  body: { flex: 1, paddingTop: 4 },
  infoCard: { padding: 16, marginBottom: 16, borderWidth: 1 },
  infoText: { fontSize: 11, lineHeight: 18 },
  searchBox: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, borderWidth: 1, marginBottom: 16 },
  searchIcon: { fontSize: 12, marginRight: 6 },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 12 },
  clearBtn: { fontSize: 10, paddingHorizontal: 4 },
  skeletonWrap: { gap: 8 },
  mb: { marginBottom: 8 },
  listContent: { paddingBottom: 32 },
  card: { padding: 16, marginBottom: 8, borderWidth: 1 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  foodName: { fontSize: 13, fontWeight: '700', flex: 1, marginRight: 8 },
  actionIcons: { flexDirection: 'row', gap: 10 },
  iconBtn: { padding: 2 },
  iconText: { fontSize: 12 },
  price: { fontSize: 12, fontWeight: '700', marginBottom: 4 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 },
  calText: { fontSize: 10 },
  macroText: { fontSize: 9, fontWeight: '600' },
});

export default MyFoodsScreen;
