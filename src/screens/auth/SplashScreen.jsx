import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../config/ThemeContext';
import { getCurrentSession } from '../../supabase/auth';
import ScreenWrapper from '../../components/common/ScreenWrapper';

/**
 * Splash Screen initializing session check and initial routing.
 */
const SplashScreen = React.memo(({ navigation }) => {
  const { theme } = useTheme();

  useEffect(() => {
    let isMounted = true;

    const checkSessionAndRoute = async () => {
      try {
        const sessionData = await getCurrentSession();
        const session = sessionData?.session || null;
        const hasOnboarded = await AsyncStorage.getItem('hasOnboarded');

        if (!isMounted) return;

        if (session) {
          navigation.replace('AppNavigator');
        } else if (!hasOnboarded) {
          navigation.replace('OnboardingScreen');
        } else {
          navigation.replace('LoginScreen');
        }
      } catch {
        if (isMounted) {
          const hasOnboarded = await AsyncStorage.getItem('hasOnboarded');
          if (!hasOnboarded) {
            navigation.replace('OnboardingScreen');
          } else {
            navigation.replace('LoginScreen');
          }
        }
      }
    };

    checkSessionAndRoute();

    return () => {
      isMounted = false;
    };
  }, [navigation]);

  return (
    <ScreenWrapper noPadding edges={['top', 'bottom']} style={styles.centerContainer}>
      <View style={styles.logoContainer}>
        <Text style={[styles.appName, { color: theme.colors.primary }]}>Stackd</Text>
        <Text style={[styles.tagline, { color: theme.colors.textSecondary }]}>Study • Budget • Fuel</Text>
      </View>
      <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
    </ScreenWrapper>
  );
});

const styles = StyleSheet.create({
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  appName: {
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  tagline: {
    fontSize: 14,
    marginTop: 4,
    letterSpacing: 0.5,
  },
  loader: {
    marginTop: 32,
  },
});

export default SplashScreen;
