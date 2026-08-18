import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTheme } from '../../config/ThemeContext';

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'expense', label: 'Expenses' },
  { key: 'income', label: 'Income' },
];

/** Filter and search controls for Transaction History. */
const TransactionFilters = React.memo(({
  searchQuery, onSearchChange, sortBy, onSortChange, activeTab, onTabChange,
}) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface, borderBottomColor: `${theme.colors.textTertiary}20` }]}>
      <View style={styles.searchSection}>
        <TextInput
          style={[
            styles.searchInput,
            {
              backgroundColor: theme.colors.background,
              borderColor: `${theme.colors.textTertiary}30`,
              borderRadius: theme.borderRadius.md,
              color: theme.colors.textPrimary,
            },
          ]}
          value={searchQuery}
          onChangeText={onSearchChange}
          placeholder="Search transactions..."
          placeholderTextColor={theme.colors.textTertiary}
          autoCorrect={false}
        />
      </View>

      <View style={styles.tabRow}>
        {TABS.map((t) => (
          <Pressable
            key={t.key}
            style={[
              styles.tab,
              {
                backgroundColor: activeTab === t.key ? theme.colors.primary : theme.colors.background,
                borderRadius: theme.borderRadius.sm,
              },
            ]}
            onPress={() => onTabChange(t.key)}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === t.key ? '#FFFFFF' : theme.colors.textSecondary },
                activeTab === t.key && styles.tabTextActive,
              ]}
            >
              {t.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  searchInput: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 12,
    borderWidth: 1,
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 4,
    gap: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
  },
  tabText: { fontSize: 10, fontWeight: '700' },
  tabTextActive: { fontWeight: '800' },
});

export default TransactionFilters;
