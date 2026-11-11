import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { User, Pencil, CheckCircle2 } from 'lucide-react-native';
import Colors from '../../theme/colors';

interface ProfileIdentityCardProps {
  displayName: string;
  membership: string;
  avatarBg: string;
  onEditPress: () => void;
}

export const ProfileIdentityCard: React.FC<ProfileIdentityCardProps> = ({
  displayName,
  membership,
  avatarBg,
  onEditPress,
}) => {
  return (
    <View style={styles.container}>
      {/* ── LEFT: COMPACT CIRCULAR AVATAR ── */}
      <View style={[styles.avatarCircle, { backgroundColor: avatarBg }]}>
        <User size={28} color="#FFFFFF" strokeWidth={2.2} />
      </View>

      {/* ── RIGHT: USER INFO & EDIT ACTION (LEFT-ALIGNED) ── */}
      <View style={styles.infoColumn}>
        <Text style={styles.displayName} numberOfLines={1}>
          {displayName}
        </Text>

        <View style={styles.membershipRow}>
          <CheckCircle2 size={12} color={Colors.verifiedBlue} strokeWidth={2.4} />
          <Text style={styles.membershipText}>{membership}</Text>
        </View>

        <TouchableOpacity
          style={styles.editButton}
          activeOpacity={0.75}
          onPress={onEditPress}
          accessibilityRole="button"
          accessibilityLabel="Edit Profile"
        >
          <Pencil size={11} color="#ECE9FA" strokeWidth={2.2} />
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.headerPurple,
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 16,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  infoColumn: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  displayName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  membershipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  membershipText: {
    fontSize: 11.5,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 6,
    alignSelf: 'flex-start',
    gap: 5,
  },
  editButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ECE9FA',
  },
});
