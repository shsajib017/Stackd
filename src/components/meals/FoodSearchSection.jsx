import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../config/ThemeContext';
import { FOOD_CATEGORIES } from '../../utils/constants';
import Button from '../common/Button';
import FoodSearchItem from './FoodSearchItem';

const ALL_CATEGORIES = ['All', ...FOOD_CATEGORIES];

/** Food search, category filter chips, and selection preview section. */
const FoodSearchSection = React.memo(({ onSelectFood, onManualAdd, onSearch, customFoods = [], isLogging = false }) => {
  const { theme } = useTheme();
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
      <View style={[styles.searchBar, { backgroundColor: theme.colors.background, borderRadius: theme.borderRadius.md, borderColor: `${theme.colors.textTertiary}30` }]}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={[styles.searchInput, { color: theme.colors.textPrimary }]}
          value={query}
          onChangeText={handleQueryChange}
          placeholder="Search Bangladeshi foods..."
          placeholderTextColor={theme.colors.textTertiary}
        />
        {isSearching && <ActivityIndicator size="small" color={theme.colors.primary} />}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
        {ALL_CATEGORIES.map((cat) => {
          const active = selectedCategory === cat;
          return (
            <TouchableOpacity
              key={cat}
              style={[
                styles.catChip,
                { backgroundColor: active ? theme.colors.primary : theme.colors.surface, borderRadius: theme.borderRadius.full, borderColor: active ? theme.colors.primary : `${theme.colors.textTertiary}30` },
              ]}
              onPress={() => setSelectedCategory(cat)}
              activeOpacity={0.8}
            >
              <Text style={[styles.catText, { color: active ? '#FFFFFF' : theme.colors.textSecondary }, active && styles.catTextActive]}>{cat}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      {selectedItem && (
        <View style={[styles.previewCard, { backgroundColor: `${theme.colors.primary}08`, borderRadius: theme.borderRadius.md, borderColor: `${theme.colors.primary}40` }]}>
          <View style={styles.previewTop}><Text style={[styles.previewName, { color: theme.colors.textPrimary }]} numberOfLines={1}>{selectedItem.name}</Text><Text style={[styles.previewPrice, { color: theme.colors.accent }]}>৳{selectedItem.avg_price_bdt ?? selectedItem.price ?? 0}</Text></View>
          <Button label="Confirm Log" size="sm" onPress={() => onSelectFood(selectedItem)} loading={isLogging} fullWidth />
        </View>
      )}
      <View style={styles.resultsContainer}>
        {displayedList.length === 0 && !isSearching ? (
          <View style={styles.emptyBox}><Text style={[styles.emptyText, { color: theme.colors.textTertiary }]}>No matching food found</Text></View>
        ) : (
          displayedList.map((item, index) => (
            <FoodSearchItem key={item.id || `f-${index}`} item={item} onSelect={setSelectedItem} isSelected={selectedItem?.id === item.id} />
          ))
        )}
      </View>
      <TouchableOpacity style={styles.manualBtn} onPress={onManualAdd} activeOpacity={0.75}>
        <Text style={[styles.manualBtnText, { color: theme.colors.primary }]}>+ Food not found? Add manually</Text>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  container: { marginTop: 8 },
  searchBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 6, borderWidth: 1, marginBottom: 4 },
  searchIcon: { fontSize: 12, marginRight: 4 },
  searchInput: { flex: 1, fontSize: 12, padding: 0, backgroundColor: 'transparent' },
  catScroll: { flexDirection: 'row', gap: 6, paddingVertical: 4, marginBottom: 4 },
  catChip: { paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1 },
  catText: { fontSize: 9, fontWeight: '700' },
  catTextActive: { fontWeight: '800' },
  previewCard: { padding: 16, marginBottom: 8, borderWidth: 1.5 },
  previewTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  previewName: { fontSize: 14, fontWeight: '800', flex: 1, marginRight: 4 },
  previewPrice: { fontSize: 14, fontWeight: '800' },
  resultsContainer: { marginVertical: 4 },
  emptyBox: { padding: 16, alignItems: 'center' },
  emptyText: { fontSize: 10, fontWeight: '600' },
  manualBtn: { alignItems: 'center', paddingVertical: 8 },
  manualBtnText: { fontSize: 11, fontWeight: '700' },
});

export default FoodSearchSection;
