import React, { useMemo } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../config/ThemeContext';

/**
 * Circular user avatar displaying a profile image or uppercase initials.
 */
const Avatar = React.memo(({
  name,
  size = 48,
  imageUrl,
  style,
}) => {
  const { theme } = useTheme();

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
        style={[styles.image, { backgroundColor: theme.colors.surface }, containerStyle, style]}
        resizeMode="cover"
      />
    );
  }

  return (
    <View style={[styles.fallbackContainer, { backgroundColor: theme.colors.primary }, containerStyle, style]}>
      <Text style={[styles.initialsText, { fontSize }]}>{initials}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  image: {
    overflow: 'hidden',
  },
  fallbackContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    color: '#FFFFFF',
    fontWeight: '800',
    textAlign: 'center',
  },
});

export default Avatar;
