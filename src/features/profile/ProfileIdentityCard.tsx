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
  compact?: boolean;
  onEditPress: () => void;
  onAvatarPress?: () => void;
}

export const ProfileIdentityCard: React.FC<ProfileIdentityCardProps> = ({
  displayName,
  membership,
  avatarId,
  avatarBg,
  compact = false,
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
        <View
          style={[
            styles.avatarCircle,
            compact && styles.avatarCircleCompact,
            { backgroundColor: circleBg },
          ]}
        >
          {avatarOption.source ? (
            <Image
              source={avatarOption.source}
              style={styles.avatarImage}
              resizeMode="cover"
            />
          ) : (
            <AvatarIcon size={compact ? 28 : 32} color="#FFFFFF" strokeWidth={2.2} />
          )}
        </View>
        <View style={[styles.cameraBadge, compact && styles.cameraBadgeCompact]}>
          <Camera size={compact ? 11 : 12} color="#FFFFFF" strokeWidth={2.4} />
        </View>
      </TouchableOpacity>

      {/* ── RIGHT: DISPLAY NAME, ROLE & EDIT ACTION ── */}
      <View style={styles.infoColumn}>
        <Text style={[styles.displayName, compact && styles.displayNameCompact]} numberOfLines={1}>
          {displayName}
        </Text>

        <View style={styles.membershipRow}>
          <CheckCircle2 size={compact ? 13 : 14} color={Colors.verifiedBlue} strokeWidth={2.4} />
          <Text style={[styles.membershipText, compact && styles.membershipTextCompact]}>
            {membership}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.editButton, compact && styles.editButtonCompact]}
          activeOpacity={0.78}
          onPress={onEditPress}
          accessibilityRole="button"
          accessibilityLabel="Edit profile name and avatar"
        >
          <Pencil size={compact ? 12 : 13} color="#FFFFFF" strokeWidth={2.3} />
          <Text style={[styles.editButtonText, compact && styles.editButtonTextCompact]}>
            Edit Profile
          </Text>
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
    paddingTop: 4,
    paddingBottom: 6,
  },
  avatarTouch: {
    position: 'relative',
  },
  avatarCircle: {
    width: 74,
    height: 74,
    borderRadius: 37,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarCircleCompact: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  cameraBadge: {
    position: 'absolute',
    right: -1,
    bottom: -1,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#7650F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraBadgeCompact: {
    width: 21,
    height: 21,
    borderRadius: 10.5,
  },
  infoColumn: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  displayName: {
    fontSize: 22,
    lineHeight: 27,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  displayNameCompact: {
    fontSize: 19,
    lineHeight: 24,
  },
  membershipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
  },
  membershipText: {
    fontSize: 13,
    color: '#D5CFE6',
    fontWeight: '600',
  },
  membershipTextCompact: {
    fontSize: 12,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    paddingHorizontal: 14,
    paddingVertical: 7.5,
    borderRadius: 14,
    marginTop: 10,
    alignSelf: 'flex-start',
    gap: 6,
  },
  editButtonCompact: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 8,
  },
  editButtonText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  editButtonTextCompact: {
    fontSize: 11.5,
  },
});
