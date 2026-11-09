import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../../theme/colors';

export type SavedTab = 'matches' | 'teams' | 'competitions';

interface SavedHeaderProps {
  activeTab: SavedTab;
  onTabChange: (tab: SavedTab) => void;
  matchesCount: number;
  teamsCount: number;
  competitionsCount: number;
}

export const SavedHeader: React.FC<SavedHeaderProps> = ({
  activeTab,
  onTabChange,
  matchesCount,
  teamsCount,
  competitionsCount,
}) => {
  const insets = useSafeAreaInsets();

  const tabs: Array<{ key: SavedTab; label: string; count: number }> = [
    { key: 'matches', label: 'Matches', count: matchesCount },
    { key: 'teams', label: 'Teams', count: teamsCount },
    { key: 'competitions', label: 'Competitions', count: competitionsCount },
  ];

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) + 8 }]}>
      {/* ── SCREEN TITLE & SUBTITLE ── */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Saved</Text>
        <Text style={styles.subtitle}>Your football favorites</Text>
      </View>

      {/* ── SEGMENTED CATEGORY TABS ── */}
      <View style={styles.segmentedContainer}>
        {tabs.map(tab => {
          const isActive = activeTab === tab.key;

          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.segmentBtn, isActive && styles.segmentBtnActive]}
              activeOpacity={0.8}
              onPress={() => onTabChange(tab.key)}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={`${tab.label}, ${tab.count} items`}
            >
              <Text style={[styles.segmentText, isActive && styles.segmentTextActive]}>
                {tab.label}
              </Text>
              <View style={[styles.countBadge, isActive && styles.countBadgeActive]}>
                <Text style={[styles.countText, isActive && styles.countTextActive]}>
                  {tab.count}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.headerPurple,
    paddingHorizontal: 20,
    paddingBottom: 18,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  titleContainer: {
    marginBottom: 18,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ECE9FA',
    letterSpacing: -0.5,
    fontFamily: Platform.select({ ios: 'System', android: 'sans-serif-medium' }),
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
    fontWeight: '400',
  },
  segmentedContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: 16,
    padding: 4,
    gap: 4,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  segmentBtnActive: {
    backgroundColor: '#7952FC',
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  segmentTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  countBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  countBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  countTextActive: {
    color: '#FFFFFF',
  },
});
