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
  standalone?: boolean;
  paddingVertical?: number;
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
  standalone = true,
  paddingVertical,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.rowContainer,
        paddingVertical !== undefined ? { paddingVertical } : null,
        standalone ? styles.rowStandalone : null,
        !standalone && isFirst ? styles.rowFirst : null,
        !standalone && isLast ? styles.rowLast : null,
        !standalone && !isLast ? styles.rowBorder : null,
      ]}
      activeOpacity={0.78}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label}${subtitle ? `, ${subtitle}` : ''}`}
    >
      <View style={styles.iconContainer}>
        <IconComponent size={19} color={iconColor} strokeWidth={2} />
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.label}>{label}</Text>
        {subtitle ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
      </View>

      {badgeValue !== undefined && (
        <View style={[styles.badge, badgeColor ? { backgroundColor: badgeColor } : null]}>
          <Text style={styles.badgeText}>{badgeValue}</Text>
        </View>
      )}

      <ChevronRight size={17} color={Colors.textMuted} strokeWidth={2.2} style={styles.chevron} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceCard,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  rowStandalone: {
    borderRadius: 16,
  },
  rowFirst: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  rowLast: {
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  label: {
    fontSize: 14.5,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 11.5,
    color: Colors.textMuted,
    marginTop: 1,
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

export default ProfileSectionRow;
