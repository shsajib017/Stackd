import React, { useMemo } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../config/theme';

/**
 * Circular user avatar displaying a profile image or uppercase initials.
 *
 * @param {object} props
 * @param {string} props.name - User's full name for initials fallback.
 * @param {number} [props.size=48] - Avatar diameter in pixels.
 * @param {string} [props.imageUrl] - Profile picture URL.
 * @param {object|array} [props.style] - Style overrides.
 */
const Avatar = React.memo(({
  name,
  size = 48,
  imageUrl,
  style,
}) => {
  const initials = useMemo(() => {
    if (!name || typeof name !== 'string') return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }, [name]);

  const containerStyle = useMemo(() => ({
    width: size,
    height: size,
    borderRadius: size / 2,
  }), [size]);

  const fontSize = useMemo(() => Math.round(size * 0.38), [size]);

  if (imageUrl) {
    return (
      <Image
        source={{ uri: imageUrl }}
        style={[styles.image, containerStyle, style]}
        resizeMode="cover"
      />
    );
  }

  return (
    <View style={[styles.fallbackContainer, containerStyle, style]}>
      <Text style={[styles.initialsText, { fontSize }]}>{initials}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  image: {
    backgroundColor: colors.textTertiary,
  },
  fallbackContainer: {
    backgroundColor: '#059669', // Emerald/Forest green
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    color: colors.surface,
    fontWeight: '700',
    textAlign: 'center',
  },
});

export default Avatar;
