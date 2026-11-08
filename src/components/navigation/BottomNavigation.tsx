import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Home,
  Compass,
  Heart,
  User,
} from 'lucide-react-native';
import Colors from '../../theme/colors';

export type TabDestination = 'Home' | 'Discover' | 'Saved' | 'Profile';

interface BottomNavigationProps {
  activeTab: TabDestination;
  onTabChange: (tab: TabDestination) => void;
}

interface NavItemConfig {
  key: TabDestination;
  label: string;
  icon: typeof Home;
}

const NAV_ITEMS: NavItemConfig[] = [
  { key: 'Home', label: 'Home', icon: Home },
  { key: 'Discover', label: 'Discover', icon: Compass },
  { key: 'Saved', label: 'Saved', icon: Heart },
  { key: 'Profile', label: 'Profile', icon: User },
];

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onTabChange,
}) => {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, Platform.OS === 'android' ? 12 : 8);

  return (
    <View style={[styles.navContainer, { paddingBottom: bottomPadding }]}>
      <View style={styles.navRow}>
        {NAV_ITEMS.map(item => {
          const isActive = activeTab === item.key;
          const IconComponent = item.icon;
          const iconColor = isActive ? Colors.navActive : Colors.navInactive;

          return (
            <TouchableOpacity
              key={item.key}
              style={styles.navItem}
              onPress={() => onTabChange(item.key)}
              activeOpacity={0.7}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={item.label}
            >
              {/* Active Pill Accent Indicator on Top (matching screenshot) */}
              {isActive && <View style={styles.activePillIndicator} />}

              {/* Outline Icon */}
              <View style={styles.iconContainer}>
                <IconComponent
                  size={23}
                  color={iconColor}
                  strokeWidth={isActive ? 2.4 : 1.8}
                />
              </View>

              {/* Label */}
              <Text
                style={[
                  styles.navLabel,
                  { color: iconColor, fontWeight: isActive ? '700' : '500' },
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  navContainer: {
    backgroundColor: Colors.navBackground,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.04)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 12,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 10,
    paddingHorizontal: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    minHeight: 48,
    position: 'relative',
  },
  activePillIndicator: {
    position: 'absolute',
    top: -10,
    width: 28,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
  },
  iconContainer: {
    marginBottom: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navLabel: {
    fontSize: 11,
    letterSpacing: -0.2,
  },
});

export default BottomNavigation;
