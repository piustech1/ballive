import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '../theme/colors';

interface PlaceholderScreenProps {
  title: string;
  description: string;
}

export const PlaceholderScreen: React.FC<PlaceholderScreenProps> = ({ title, description }) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export const DiscoverScreen: React.FC = () => (
  <PlaceholderScreen
    title="Discover Leagues & Matches"
    description="Explore upcoming football fixtures, league tables, and team rosters across global tournaments."
  />
);

export const SavedScreen: React.FC = () => (
  <PlaceholderScreen
    title="Saved Matches"
    description="Your bookmarked live streams and favorited club matches will appear here."
  />
);

export const ProfileScreen: React.FC = () => (
  <PlaceholderScreen
    title="My Profile"
    description="Manage your BALLIVE streaming preferences, notification alerts, and video quality."
  />
);
