import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { ChevronRight, LucideIcon } from 'lucide-react-native';
import Colors from '../../theme/colors';

interface ProfileSectionRowProps {
  icon: LucideIcon;
  iconColor?: string;
  label: string;
  subtitle?: string;
  badgeValue?: string | number;
  badgeColor?: string;
  isFirst?: boolean;
  isLast?: boolean;
  onPress: () => void;
}

export const ProfileSectionRow: React.FC<ProfileSectionRowProps> = ({
  icon: IconComponent,
  iconColor = Colors.textPrimary,
  label,
  subtitle,
  badgeValue,
  badgeColor,
  isFirst,
  isLast,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.rowContainer,
        isFirst && styles.rowFirst,
        isLast && styles.rowLast,
        !isLast && styles.rowBorder,
      ]}
      activeOpacity={0.75}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label}${subtitle ? `, ${subtitle}` : ''}`}
    >
      {/* Icon */}
      <View style={styles.iconContainer}>
        <IconComponent size={20} color={iconColor} strokeWidth={2} />
      </View>

      {/* Label & Subtitle */}
      <View style={styles.textContainer}>
        <Text style={styles.label}>{label}</Text>
        {subtitle ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
      </View>

      {/* Optional Badge Value */}
      {badgeValue !== undefined && (
        <View style={[styles.badge, badgeColor ? { backgroundColor: badgeColor } : null]}>
          <Text style={styles.badgeText}>{badgeValue}</Text>
        </View>
      )}

      {/* Right Chevron */}
      <ChevronRight size={18} color={Colors.textMuted} strokeWidth={2.2} style={styles.chevron} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceCard,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowFirst: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  rowLast: {
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: 'rgba(121, 82, 252, 0.16)',
    marginRight: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#A58BFC',
  },
  chevron: {
    marginLeft: 4,
  },
});
