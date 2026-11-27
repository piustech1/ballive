import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

interface ProfileHeaderProps {
  compact?: boolean;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ compact = false }) => {
  return (
    <View style={styles.container}>
      <View style={[styles.contentRow, compact && styles.contentRowCompact]}>
        <Text style={[styles.title, compact && styles.titleCompact]}>Profile</Text>
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
    height: 42,
  },
  contentRowCompact: {
    height: 36,
  },
  title: {
    fontSize: 30,
    lineHeight: 35,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.6,
    fontFamily: Platform.select({ ios: 'System', android: 'sans-serif-medium' }),
  },
  titleCompact: {
    fontSize: 26,
    lineHeight: 31,
  },
});

export default ProfileHeader;
