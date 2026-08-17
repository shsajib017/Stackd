import React, { useLayoutEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fontSizes, spacing } from '../../config/theme';
import SideDrawer from '../../components/common/SideDrawer';

/** Profile and Settings Screen */
const ProfileScreen = React.memo(({ navigation }) => {
  const [drawerVisible, setDrawerVisible] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <Pressable
          onPress={() => setDrawerVisible(true)}
          style={({ pressed }) => [styles.headerMenuBtn, { opacity: pressed ? 0.5 : 1 }]}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 25 }}
        >
          <Text pointerEvents="none" style={styles.headerMenuIcon}>☰</Text>
        </Pressable>
      ),
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ProfileScreen</Text>
      <SideDrawer visible={drawerVisible} onClose={() => setDrawerVisible(false)} navigation={navigation} />
    </View>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' },
  headerMenuBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center', marginLeft: -8 },
  headerMenuIcon: { width: '100%', height: '100%', textAlign: 'center', textAlignVertical: 'center', lineHeight: 44, fontSize: 24, color: colors.textPrimary, fontWeight: '700', includeFontPadding: false },
  title: { fontSize: fontSizes.xl, color: colors.primary, fontWeight: 'bold' },
});

export default ProfileScreen;
