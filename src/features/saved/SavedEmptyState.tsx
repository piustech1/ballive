import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Bookmark, Shield, Trophy, Compass } from 'lucide-react-native';
import Colors from '../../theme/colors';
import { SavedTab } from './SavedHeader';

interface SavedEmptyStateProps {
  tab: SavedTab;
  onNavigateToDiscover: () => void;
}

export const SavedEmptyState: React.FC<SavedEmptyStateProps> = ({
  tab,
  onNavigateToDiscover,
}) => {
  let icon = <Bookmark size={40} color={Colors.textMuted} strokeWidth={1.8} />;
  let title = 'No saved matches yet';
  let subtitle = 'Save matches you don’t want to miss.';
  let buttonLabel = 'Discover matches';

  if (tab === 'teams') {
    icon = <Shield size={40} color={Colors.textMuted} strokeWidth={1.8} />;
    title = 'No followed teams';
    subtitle = 'Follow your favorite clubs to keep them close.';
    buttonLabel = 'Explore teams';
  } else if (tab === 'competitions') {
    icon = <Trophy size={40} color={Colors.textMuted} strokeWidth={1.8} />;
    title = 'No followed competitions';
    subtitle = 'Follow competitions to keep track of your football.';
    buttonLabel = 'Explore competitions';
  }

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>{icon}</View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      <TouchableOpacity
        style={styles.actionBtn}
        activeOpacity={0.8}
        onPress={onNavigateToDiscover}
        accessibilityRole="button"
        accessibilityLabel={buttonLabel}
      >
        <Compass size={16} color="#FFFFFF" strokeWidth={2.4} />
        <Text style={styles.actionBtnText}>{buttonLabel}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 60,
    paddingBottom: 40,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7952FC',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
