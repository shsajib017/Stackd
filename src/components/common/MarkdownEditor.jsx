import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { borderRadius, colors, fontSizes, spacing } from '../../config/theme';
import { stripMarkdown } from '../../utils/markdownHelpers';

/**
 * Markdown Editor component with live text editing, rendered preview mode, and metadata counters.
 *
 * @param {object} props
 * @param {string} props.value - Markdown string content.
 * @param {(text: string) => void} props.onChange - Text change callback.
 * @param {string} [props.placeholder='Write your notes in Markdown...'] - Input placeholder.
 * @param {object|array} [props.style] - Style overrides.
 */
const MarkdownEditor = React.memo(({
  value = '',
  onChange,
  placeholder = 'Write your notes in Markdown...',
  style,
}) => {
  const [isPreview, setIsPreview] = useState(false);

  const { wordCount, readingTime } = useMemo(() => {
    const clean = stripMarkdown(value);
    const words = clean ? clean.split(/\s+/).filter(Boolean).length : 0;
    const minutes = Math.max(1, Math.ceil(words / 200));
    return { wordCount: words, readingTime: `${minutes} min read` };
  }, [value]);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <View style={styles.stats}>
          <Text style={styles.statsText}>{wordCount} words</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.statsText}>{readingTime}</Text>
        </View>
        <TouchableOpacity style={styles.toggleButton} onPress={() => setIsPreview(!isPreview)} activeOpacity={0.8}>
          <Text style={styles.toggleText}>{isPreview ? '✏️ Edit' : '👁️ Preview'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        {isPreview ? (
          <ScrollView style={styles.previewScroll} showsVerticalScrollIndicator={false}>
            {value ? <Markdown style={markdownStyles}>{value}</Markdown> : <Text style={styles.emptyPreviewText}>Nothing to preview yet.</Text>}
          </ScrollView>
        ) : (
          <TextInput
            style={styles.textInput}
            value={value}
            onChangeText={onChange}
            placeholder={placeholder}
            placeholderTextColor={colors.textTertiary}
            multiline
            textAlignVertical="top"
            autoCapitalize="none"
            autoCorrect={false}
          />
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    borderWidth: 1, borderColor: colors.textTertiary, borderRadius: borderRadius.md,
    backgroundColor: colors.surface, overflow: 'hidden',
  },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm, backgroundColor: colors.background,
    borderBottomWidth: 1, borderBottomColor: colors.textTertiary,
  },
  stats: { flexDirection: 'row', alignItems: 'center' },
  statsText: { fontSize: fontSizes.xs, color: colors.textSecondary, fontWeight: '500' },
  dot: { marginHorizontal: spacing.xs, color: colors.textSecondary, fontSize: fontSizes.xs },
  toggleButton: {
    backgroundColor: colors.surface, paddingHorizontal: spacing.sm + 2, paddingVertical: 4,
    borderRadius: borderRadius.sm, borderWidth: 1, borderColor: colors.textTertiary,
  },
  toggleText: { fontSize: fontSizes.xs, fontWeight: '700', color: colors.primary },
  body: { minHeight: 200 },
  textInput: { padding: spacing.md, fontSize: fontSizes.md, color: colors.textPrimary, minHeight: 200, lineHeight: 22 },
  previewScroll: { padding: spacing.md, minHeight: 200 },
  emptyPreviewText: { fontSize: fontSizes.sm, color: colors.textTertiary, fontStyle: 'italic', marginTop: spacing.md, textAlign: 'center' },
});

const markdownStyles = {
  body: { color: colors.textPrimary, fontSize: fontSizes.md },
  heading1: { color: colors.primary, fontSize: fontSizes.xxl, fontWeight: 'bold' },
  heading2: { color: colors.primary, fontSize: fontSizes.xl, fontWeight: 'bold' },
  heading3: { color: colors.primary, fontSize: fontSizes.lg, fontWeight: '600' },
  link: { color: colors.primary, textDecorationLine: 'underline' },
  code_inline: { backgroundColor: colors.background, color: colors.primary, borderRadius: borderRadius.sm },
};

export default MarkdownEditor;
