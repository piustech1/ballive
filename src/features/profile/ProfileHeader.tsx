import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

export const ProfileHeader: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.contentRow}>
        <Text style={styles.title}>Profile</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
    paddingBottom: 2,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 36,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ECE9FA',
    letterSpacing: -0.4,
    fontFamily: Platform.select({ ios: 'System', android: 'sans-serif-medium' }),
  },
});

export default ProfileHeader;
