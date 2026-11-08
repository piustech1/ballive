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
import { Bell, Search, X } from 'lucide-react-native';
import Colors from '../../theme/colors';

interface DiscoverHeaderProps {
  searchQuery: string;
  onSearchChange: (text: string) => void;
  onNotificationsPress?: () => void;
}

export const DiscoverHeader: React.FC<DiscoverHeaderProps> = ({
  searchQuery,
  onSearchChange,
  onNotificationsPress,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) + 8 }]}>
      {/* ── TOP UTILITY & TITLE ROW ── */}
      <View style={styles.topRow}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Discover</Text>
          <Text style={styles.subtitle}>Explore the world of football</Text>
        </View>

        <TouchableOpacity
          onPress={onNotificationsPress}
          style={styles.notificationButton}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel="Notifications"
        >
          <Bell size={24} color={Colors.textPrimary} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {/* ── SEARCH INPUT ── */}
      <View style={styles.searchContainer}>
        <Search size={20} color={Colors.textPlaceholder} strokeWidth={2} style={styles.searchIcon} />
        <TextInput
          value={searchQuery}
          onChangeText={onSearchChange}
          placeholder="Search teams, leagues, matches..."
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
            accessibilityLabel="Clear search"
          >
            <X size={16} color={Colors.textSecondary} />
          </TouchableOpacity>
        )}
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
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ECE9FA',
    letterSpacing: -0.6,
    fontFamily: Platform.select({ ios: 'System', android: 'sans-serif-medium' }),
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
    fontWeight: '400',
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSearch,
    borderRadius: 26,
    height: 50,
    paddingHorizontal: 16,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: '400',
    paddingVertical: 0,
  },
  clearBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});
