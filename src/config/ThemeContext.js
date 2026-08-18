import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { defaultTheme, themes } from './themes';

const THEME_STORAGE_KEY = '@stackd_selected_theme';

const ThemeContext = createContext({
  theme: defaultTheme,
  themeName: 'forest',
  setThemeName: () => {},
  isDark: false,
  toggleDarkMode: () => {},
  colors: defaultTheme.colors,
  spacing: defaultTheme.spacing,
  fontSizes: defaultTheme.fontSizes,
  borderRadius: defaultTheme.borderRadius,
  shadows: defaultTheme.shadows,
});

/** Theme Provider managing active theme and gradient tokens. */
export const ThemeProvider = ({ children }) => {
  const [themeName, setThemeNameState] = useState('forest');

  useEffect(() => {
    const loadStoredTheme = async () => {
      try {
        const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (stored && themes[stored]) {
          setThemeNameState(stored);
        }
      } catch {
        // Fallback to default theme
      }
    };
    loadStoredTheme();
  }, []);

  const setThemeName = useCallback(async (name) => {
    if (themes[name]) {
      setThemeNameState(name);
      try {
        await AsyncStorage.setItem(THEME_STORAGE_KEY, name);
      } catch {
        // Storage failure fallback
      }
    }
  }, []);

  const theme = useMemo(() => themes[themeName] || defaultTheme, [themeName]);

  const toggleDarkMode = useCallback(() => {
    if (theme.isDark) {
      const lightName = themeName.replace('Dark', '');
      setThemeName(themes[lightName] ? lightName : 'forest');
    } else {
      const darkName = `${themeName}Dark`;
      setThemeName(themes[darkName] ? darkName : 'forestDark');
    }
  }, [setThemeName, theme.isDark, themeName]);

  const value = useMemo(() => ({
    theme,
    themeName,
    setThemeName,
    isDark: theme.isDark,
    toggleDarkMode,
    colors: theme.colors,
    spacing: theme.spacing,
    fontSizes: theme.fontSizes,
    borderRadius: theme.borderRadius,
    shadows: theme.shadows,
  }), [setThemeName, theme, themeName, toggleDarkMode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);

export default ThemeContext;
