import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { borderRadius, colors, fontSizes, spacing } from '../../config/theme';

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'expense', label: 'Expenses' },
  { key: 'income', label: 'Income' },
];

/** Filter and search controls for Transaction History. */
const TransactionFilters = React.memo(({
  searchQuery, onSearchChange, sortBy, onSortChange, activeTab, onTabChange,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.searchSection}>
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={onSearchChange}
          placeholder="Search transactions..."
          placeholderTextColor={colors.textTertiary}
          autoCorrect={false}
        />
      </View>

      <View style={styles.tabRow}>
        {TABS.map((t) => (
          <Pressable
            key={t.key}
            style={[styles.tab, activeTab === t.key && styles.tabActive]}
            onPress={() => onTabChange(t.key)}
          >
            <Text style={[styles.tabText, activeTab === t.key && styles.tabTextActive]}>
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
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: `${colors.textTertiary}20`,
  },
  searchSection: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  searchInput: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    fontSize: fontSizes.sm,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: `${colors.textTertiary}30`,
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    gap: spacing.xs,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.xs + 2,
    alignItems: 'center',
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background,
  },
  tabActive: { backgroundColor: colors.primary },
  tabText: { fontSize: fontSizes.xs, fontWeight: '700', color: colors.textSecondary },
  tabTextActive: { color: colors.surface },
});

export default TransactionFilters;
