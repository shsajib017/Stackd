import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useHeaderHeight } from '@react-navigation/elements';
import { useTheme } from '../../config/ThemeContext';

/**
 * ScreenWrapper providing consistent dynamic background gradients and safe area padding across all screens.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children - Child components to render.
 * @param {object|array} [props.style] - Additional style overrides for container.
 * @param {Array<'top'|'right'|'bottom'|'left'>} [props.edges=['bottom']] - SafeAreaView edges.
 * @param {boolean} [props.noPadding=false] - Disable horizontal padding.
 * @param {boolean} [props.disableSafeArea=false] - Use regular View instead of SafeAreaView.
 * @param {boolean} [props.hasHeader=false] - Account for transparent React Navigation header height if present.
 * @param {string[]} [props.gradientColors] - Custom gradient colors override.
 */
const ScreenWrapper = React.memo(({
  children,
  style,
  edges = ['bottom'],
  noPadding = false,
  disableSafeArea = false,
  hasHeader = false,
  gradientColors: customGradient,
}) => {
  const { theme } = useTheme();
  let headerHeight = 0;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    headerHeight = useHeaderHeight() || 0;
  } catch {
    headerHeight = 0;
  }

  const gradientColors = customGradient || theme?.backgroundGradient || ['#1B4D6A14', '#F8F9FA'];
  const ContainerComponent = disableSafeArea ? View : SafeAreaView;

  return (
    <LinearGradient
      colors={gradientColors}
      style={styles.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <ContainerComponent
        style={[
          styles.container,
          !noPadding && styles.padding,
          hasHeader && headerHeight > 0 && { paddingTop: headerHeight },
          style,
        ]}
        edges={edges}
      >
        {children}
      </ContainerComponent>
    </LinearGradient>
  );
});

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  padding: {
    paddingHorizontal: 16,
  },
});

export default ScreenWrapper;
