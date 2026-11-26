import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Pencil, CheckCircle2, Camera } from 'lucide-react-native';
import Colors from '../../theme/colors';
import { resolveProfileAvatar } from '../../constants/avatars';

interface ProfileIdentityCardProps {
  displayName: string;
  membership: string;
  avatarId: string;
  avatarBg: string;
  onEditPress: () => void;
  onAvatarPress?: () => void;
}

export const ProfileIdentityCard: React.FC<ProfileIdentityCardProps> = ({
  displayName,
  membership,
  avatarId,
  avatarBg,
  onEditPress,
  onAvatarPress,
}) => {
  const avatarOption = resolveProfileAvatar(avatarId);
  const AvatarIcon = avatarOption.icon;
  const circleBg = avatarBg || avatarOption.defaultBg;

  return (
    <View style={styles.container}>
      {/* ── LEFT: TAPPABLE AVATAR WITH QUICK CUSTOMIZE INDICATOR ── */}
      <TouchableOpacity
        activeOpacity={0.82}
        onPress={onAvatarPress || onEditPress}
        accessibilityRole="button"
        accessibilityLabel="Change profile avatar"
        style={styles.avatarTouch}
      >
        <View style={[styles.avatarCircle, { backgroundColor: circleBg }]}>
          {avatarOption.source ? (
            <Image
              source={avatarOption.source}
              style={styles.avatarImage}
              resizeMode="cover"
            />
          ) : (
            <AvatarIcon size={26} color="#FFFFFF" strokeWidth={2.2} />
          )}
        </View>
        <View style={styles.cameraBadge}>
          <Camera size={10} color="#FFFFFF" strokeWidth={2.4} />
        </View>
      </TouchableOpacity>

      {/* ── RIGHT: DISPLAY NAME, ROLE & EDIT ACTION ── */}
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
          activeOpacity={0.78}
          onPress={onEditPress}
          accessibilityRole="button"
          accessibilityLabel="Edit profile name and avatar"
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
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
    paddingTop: 2,
    paddingBottom: 14,
  },
  avatarTouch: {
    position: 'relative',
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  cameraBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#7650F6',
    alignItems: 'center',
    justifyContent: 'center',
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
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
