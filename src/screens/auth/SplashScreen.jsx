import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../config/ThemeContext';
import { getCurrentSession } from '../../supabase/auth';
import { getProfile } from '../../supabase/profiles';
import useAuthStore from '../../store/useAuthStore';
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

        if (session?.user) {
          // Set user + profile in store so the app has auth data
          useAuthStore.getState().setUser(session.user);
          try {
            const profile = await getProfile(session.user.id);
            if (profile) useAuthStore.getState().setProfile(profile);
          } catch {}
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
    <ScreenWrapper>
      <View style={styles.container}>
        <Text style={[styles.logo, { color: theme.colors.primary }]}>Stackd</Text>
        <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
        <Text style={[styles.tagline, { color: theme.colors.textSecondary }]}>
          Your student life, organised.
        </Text>
      </View>
    </ScreenWrapper>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: -1,
  },
  loader: {
    marginTop: 24,
    marginBottom: 12,
  },
  tagline: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default SplashScreen;
