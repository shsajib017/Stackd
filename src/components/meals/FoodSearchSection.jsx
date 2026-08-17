import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { borderRadius, colors, fontSizes, spacing } from '../../config/theme';
import { FOOD_CATEGORIES } from '../../utils/constants';
import Button from '../common/Button';
import FoodSearchItem from './FoodSearchItem';

const ALL_CATEGORIES = ['All', ...FOOD_CATEGORIES];

/** Food search, category filter chips, and selection preview section. */
const FoodSearchSection = React.memo(({ onSelectFood, onManualAdd, onSearch, customFoods = [], isLogging = false }) => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const timerRef = useRef(null);

  const performSearch = useCallback(async (q, cat) => {
    setIsSearching(true);
    try { const data = await onSearch?.(q, cat === 'All' ? '' : cat); setResults(data || []); } catch { setResults([]); } finally { setIsSearching(false); }
  }, [onSearch]);

  useEffect(() => { performSearch('', selectedCategory); }, [performSearch, selectedCategory]);

  const handleQueryChange = (text) => {
    setQuery(text);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => { performSearch(text, selectedCategory); }, 400);
  };

  const displayedList = useMemo(() => {
    const seen = new Set();
    return [...customFoods, ...results].filter((item) => {
      const id = item.id || item.name;
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  }, [customFoods, results]);

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput style={styles.searchInput} value={query} onChangeText={handleQueryChange} placeholder="Search Bangladeshi foods..." placeholderTextColor={colors.textTertiary} />
        {isSearching && <ActivityIndicator size="small" color={colors.primary} />}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
        {ALL_CATEGORIES.map((cat) => {
          const active = selectedCategory === cat;
          return (
            <TouchableOpacity key={cat} style={[styles.catChip, active && styles.catActive]} onPress={() => setSelectedCategory(cat)} activeOpacity={0.8}>
              <Text style={[styles.catText, active && styles.catTextActive]}>{cat}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      {selectedItem && (
        <View style={styles.previewCard}>
          <View style={styles.previewTop}><Text style={styles.previewName} numberOfLines={1}>{selectedItem.name}</Text><Text style={styles.previewPrice}>৳{selectedItem.avg_price_bdt ?? selectedItem.price ?? 0}</Text></View>
          <Button label="Confirm Log" size="sm" onPress={() => onSelectFood(selectedItem)} loading={isLogging} fullWidth />
        </View>
      )}
      <View style={styles.resultsContainer}>
        {displayedList.length === 0 && !isSearching ? (
          <View style={styles.emptyBox}><Text style={styles.emptyText}>No matching food found</Text></View>
        ) : (
          displayedList.map((item, index) => (
            <FoodSearchItem key={item.id || `f-${index}`} item={item} onSelect={setSelectedItem} isSelected={selectedItem?.id === item.id} />
          ))
        )}
      </View>
      <TouchableOpacity style={styles.manualBtn} onPress={onManualAdd} activeOpacity={0.75}>
        <Text style={styles.manualBtnText}>+ Food not found? Add manually</Text>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  container: { marginTop: spacing.sm },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.04)', borderRadius: borderRadius.md, paddingHorizontal: spacing.md, paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(0, 0, 0, 0.08)', marginBottom: spacing.xs },
  searchIcon: { fontSize: fontSizes.sm, marginRight: spacing.xs },
  searchInput: { flex: 1, fontSize: fontSizes.sm, color: colors.textPrimary, padding: 0, backgroundColor: 'transparent' },
  catScroll: { flexDirection: 'row', gap: 6, paddingVertical: spacing.xs, marginBottom: spacing.xs },
  catChip: { paddingHorizontal: spacing.sm + 2, paddingVertical: 4, borderRadius: borderRadius.full, backgroundColor: 'rgba(0, 0, 0, 0.04)', borderWidth: 1, borderColor: 'transparent' },
  catActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  catText: { fontSize: fontSizes.xs - 1, fontWeight: '700', color: colors.textSecondary },
  catTextActive: { color: colors.surface },
  previewCard: { backgroundColor: `${colors.primary}08`, borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1.5, borderColor: `${colors.primary}40` },
  previewTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  previewName: { fontSize: fontSizes.md, fontWeight: '800', color: colors.textPrimary, flex: 1, marginRight: spacing.xs },
  previewPrice: { fontSize: fontSizes.md, fontWeight: '800', color: colors.accent },
  resultsContainer: { marginVertical: spacing.xs },
  emptyBox: { padding: spacing.md, alignItems: 'center' },
  emptyText: { fontSize: fontSizes.xs, color: colors.textTertiary, fontWeight: '600' },
  manualBtn: { alignItems: 'center', paddingVertical: spacing.sm },
  manualBtnText: { fontSize: fontSizes.xs + 1, fontWeight: '700', color: colors.primary },
});

export default FoodSearchSection;
