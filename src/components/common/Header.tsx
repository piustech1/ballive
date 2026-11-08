import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  LayoutGrid,
  Bell,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react-native';
import Colors from '../../theme/colors';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (text: string) => void;
  onFilterPress?: () => void;
  onMenuPress?: () => void;
  onNotificationsPress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  onFilterPress,
  onMenuPress,
  onNotificationsPress,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) + 8 }]}>
      {/* ── TOP UTILITY ROW (Screenshot Blueprint: 4-dot Grid + Bell) ── */}
      <View style={styles.utilityRow}>
        <TouchableOpacity
          onPress={onMenuPress}
          style={styles.iconButton}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel="Menu"
        >
          <LayoutGrid size={24} color={Colors.textPrimary} strokeWidth={2.2} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onNotificationsPress}
          style={styles.iconButton}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel="Notifications"
        >
          <Bell size={24} color={Colors.textPrimary} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {/* ── BRANDING (BALLIVE replacing Stream X) ── */}
      <View style={styles.brandingRow}>
        <Text style={styles.brandingText}>BALLIVE</Text>
      </View>

      {/* ── SEARCH & FILTER ROW (Rounded Bar + Circular Filter) ── */}
      <View style={styles.searchRow}>
        {/* Search Input Bar */}
        <View style={styles.searchBar}>
          <Search size={20} color={Colors.textPlaceholder} strokeWidth={2} style={styles.searchIcon} />
          <TextInput
            value={searchQuery}
            onChangeText={onSearchChange}
            placeholder="Search matches, leagues..."
            placeholderTextColor={Colors.textPlaceholder}
            style={styles.searchInput}
            returnKeyType="search"
            autoCorrect={false}
            clearButtonMode="never"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => onSearchChange('')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.clearBtn}
            >
              <X size={16} color={Colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Circular Filter / Settings Control */}
        <TouchableOpacity
          onPress={onFilterPress}
          style={styles.filterButton}
          activeOpacity={0.75}
          accessibilityLabel="Filter matches"
        >
          <SlidersHorizontal size={19} color={Colors.textSecondary} strokeWidth={2.2} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.headerPurple,
    paddingHorizontal: 20,
    paddingBottom: 22,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  utilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  iconButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandingRow: {
    marginBottom: 20,
  },
  brandingText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ECE9FA',
    letterSpacing: -0.6,
    fontFamily: Platform.select({ ios: 'System', android: 'sans-serif-medium' }),
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchBar: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.surfaceSearch,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: '500',
    paddingVertical: 0,
  },
  clearBtn: {
    padding: 4,
  },
  filterButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.surfaceFilterBtn,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Header;
