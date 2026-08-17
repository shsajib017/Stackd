/**
 * Design system tokens for Stackd application.
 * Defines standard colors, typography, spacing, border radiuses, and shadow presets.
 */

export const colors = {
  primary: '#1B4D6A',
  accent: '#F5A623',
  background: '#F8F9FA',
  surface: '#FFFFFF',
  error: '#E53935',
  success: '#43A047',
  textPrimary: '#1A1A2E',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
};

export const fontSizes = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 6,
  md: 12,
  lg: 20,
  full: 999,
};

export const shadows = {
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
};

export const theme = {
  colors,
  fontSizes,
  spacing,
  borderRadius,
  shadows,
};

export default theme;
