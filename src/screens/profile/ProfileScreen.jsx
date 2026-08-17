import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fontSizes } from '../../config/theme';
import SideDrawer from '../../components/common/SideDrawer';
import AppHeader from '../../components/common/AppHeader';

/** Profile and Settings Screen */
const ProfileScreen = React.memo(({ navigation }) => {
  const [drawerVisible, setDrawerVisible] = useState(false);

  return (
    <View style={styles.container}>
      <AppHeader title="Profile & Settings" onMenuPress={() => setDrawerVisible(true)} />
      <View style={styles.content}>
        <Text style={styles.title}>ProfileScreen</Text>
      </View>
      <SideDrawer visible={drawerVisible} onClose={() => setDrawerVisible(false)} navigation={navigation} />
    </View>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: fontSizes.xl, color: colors.primary, fontWeight: 'bold' },
});

export default ProfileScreen;
