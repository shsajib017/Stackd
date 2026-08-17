import React, { useLayoutEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, fontSizes } from '../../config/theme';
import SideDrawer from '../../components/common/SideDrawer';

/** Profile and Settings Screen */
const ProfileScreen = React.memo(({ navigation }) => {
  const [drawerVisible, setDrawerVisible] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => setDrawerVisible(true)}
          style={styles.headerMenuBtn}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          activeOpacity={0.6}
        >
          <Text style={styles.headerMenuIcon}>☰</Text>
        </TouchableOpacity>
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
  headerMenuBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  headerMenuIcon: { fontSize: 24, color: colors.textPrimary, fontWeight: '700' },
  title: { fontSize: fontSizes.xl, color: colors.primary, fontWeight: 'bold' },
});

export default ProfileScreen;
