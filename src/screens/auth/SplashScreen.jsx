import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, fontSizes, spacing } from '../../config/theme';
import { getCurrentSession } from '../../supabase/auth';

/**
 * Splash Screen initializing session check and initial routing.
 */
const SplashScreen = React.memo(({ navigation }) => {
  useEffect(() => {
    let isMounted = true;

    const checkSessionAndRoute = async () => {
      console.log('Session check started');
      try {
        const sessionData = await getCurrentSession();
        const session = sessionData?.session || null;
        console.log('Session result: ' + JSON.stringify(session));

        const hasOnboarded = await AsyncStorage.getItem('hasOnboarded');
        console.log('HasOnboarded: ' + hasOnboarded);

        if (!isMounted) return;

        if (session) {
          console.log('Navigating to: AppNavigator');
          // Navigate to main application
          navigation.replace('AppNavigator');
        } else if (!hasOnboarded) {
          console.log('Navigating to: OnboardingScreen');
          navigation.replace('OnboardingScreen');
        } else {
          console.log('Navigating to: LoginScreen');
          navigation.replace('LoginScreen');
        }
      } catch (err) {
        console.log('Session check error: ' + err.message);
        if (isMounted) {
          const hasOnboarded = await AsyncStorage.getItem('hasOnboarded');
          if (!hasOnboarded) {
            console.log('Navigating to: OnboardingScreen');
            navigation.replace('OnboardingScreen');
          } else {
            console.log('Navigating to: LoginScreen');
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
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.appName}>Stackd</Text>
        <Text style={styles.tagline}>Study • Budget • Fuel</Text>
      </View>
      <ActivityIndicator size="large" color={colors.surface} style={styles.loader} />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  appName: {
    fontSize: fontSizes.xxxl + 8,
    color: colors.surface,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  tagline: {
    fontSize: fontSizes.md,
    color: colors.surface,
    opacity: 0.85,
    marginTop: spacing.xs,
    letterSpacing: 0.5,
  },
  loader: {
    marginTop: spacing.xl,
  },
});

export default SplashScreen;
