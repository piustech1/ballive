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
        <User size={34} color="#FFFFFF" strokeWidth={2.2} />
      </View>

      {/* ── RIGHT: USER INFO & EDIT ACTION (LEFT-ALIGNED) ── */}
      <View style={styles.infoColumn}>
        <Text style={styles.displayName} numberOfLines={1}>
          {displayName}
        </Text>

        <View style={styles.membershipRow}>
          <CheckCircle2 size={13} color={Colors.verifiedBlue} strokeWidth={2.4} />
          <Text style={styles.membershipText}>{membership}</Text>
        </View>

        <TouchableOpacity
          style={styles.editButton}
          activeOpacity={0.75}
          onPress={onEditPress}
          accessibilityRole="button"
          accessibilityLabel="Edit Profile"
        >
          <Pencil size={12} color="#ECE9FA" strokeWidth={2.2} />
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
    paddingTop: 8,
    paddingBottom: 22,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  avatarCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  infoColumn: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  displayName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  membershipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 3,
  },
  membershipText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    marginTop: 8,
    alignSelf: 'flex-start',
    gap: 6,
  },
  editButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ECE9FA',
  },
});
