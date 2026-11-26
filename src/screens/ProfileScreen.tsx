import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Shield,
  Trophy,
  Calendar,
  Clock,
} from 'lucide-react-native';

import { useAppNavigation } from '../navigation/NavigationContext';
import { WhatsAppOfficialIcon, TikTokOfficialIcon } from '../components/common/BrandIcons';
import Colors from '../theme/colors';
import { useProfile } from '../hooks/useProfile';
import { ProfileHeader } from '../features/profile/ProfileHeader';
import { ProfileIdentityCard } from '../features/profile/ProfileIdentityCard';
import { CurvedHeaderPlayerBackground } from '../components/common/CurvedHeaderPlayerBackground';
import { ProfileSectionRow } from '../features/profile/ProfileSectionRow';
import { EditProfileModal } from '../features/profile/modals/EditProfileModal';
import { FollowedTeamsModal } from '../features/profile/modals/FollowedTeamsModal';
import { FollowedLeaguesModal } from '../features/profile/modals/FollowedLeaguesModal';
import { MatchRemindersModal } from '../features/profile/modals/MatchRemindersModal';
import { TimeFormatModal } from '../features/profile/modals/PreferencesModals';

export const ProfileScreen: React.FC = () => {
  const {
    profile,
    updateProfile,
    toggleFollowTeam,
    toggleFollowLeague,
    toggleMatchReminder,
  } = useProfile();
  const { navigate } = useAppNavigation();
  const insets = useSafeAreaInsets();

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [teamsModalVisible, setTeamsModalVisible] = useState(false);
  const [leaguesModalVisible, setLeaguesModalVisible] = useState(false);
  const [remindersModalVisible, setRemindersModalVisible] = useState(false);
  const [timeFormatModalVisible, setTimeFormatModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />

      {/* ── COMPACT TOP CURVED IDENTITY CAVITY ── */}
      <View style={[styles.headerCavity, { paddingTop: Math.max(insets.top, 12) + 2 }]}>
        <CurvedHeaderPlayerBackground sport="soccer" screen="profile" />
        <ProfileHeader />
        <ProfileIdentityCard
          displayName={profile.displayName}
          membership={profile.membership}
          avatarId={profile.avatarId}
          avatarBg={profile.avatarBg}
          onEditPress={() => setEditModalVisible(true)}
          onAvatarPress={() => setEditModalVisible(true)}
        />
      </View>

      {/* ── NON-SCROLLING COMPACT BODY (FITS CLEANLY ABOVE BOTTOM NAV) ── */}
      <View style={styles.bodyContainer}>
        {/* ── MY ACTIVITY SECTION ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeader}>MY SPORTS</Text>
            <TouchableOpacity
              style={styles.timePill}
              activeOpacity={0.78}
              onPress={() => setTimeFormatModalVisible(true)}
              accessibilityRole="button"
              accessibilityLabel={`Change time format, currently ${profile.timeFormat}`}
            >
              <Clock size={11} color="#A58BFC" strokeWidth={2.2} />
              <Text style={styles.timePillText}>
                {profile.timeFormat === '12h' ? '12h' : '24h'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.cardGroup}>
            <ProfileSectionRow
              icon={Shield}
              iconColor="#A58BFC"
              label="Followed Teams"
              badgeValue={profile.followedTeamIds.length}
              isFirst
              onPress={() => setTeamsModalVisible(true)}
            />
            <ProfileSectionRow
              icon={Trophy}
              iconColor={Colors.categoryChampionsLeague}
              label="Followed Competitions"
              badgeValue={profile.followedLeagueIds.length}
              onPress={() => setLeaguesModalVisible(true)}
            />
            <ProfileSectionRow
              icon={Calendar}
              iconColor={Colors.liveRed}
              label="Match Reminders"
              badgeValue={profile.matchReminderIds.length}
              isLast
              onPress={() => setRemindersModalVisible(true)}
            />
          </View>
        </View>

        {/* ── JOIN OUR COMMUNITY SECTION ── */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>JOIN OUR COMMUNITY</Text>
          <View style={styles.communityGroup}>
            <TouchableOpacity
              style={[styles.communityRow, styles.communityRowBorder]}
              activeOpacity={0.78}
              onPress={() => Linking.openURL('https://whatsapp.com').catch(() => {})}
              accessibilityRole="button"
              accessibilityLabel="Join WhatsApp Channel"
            >
              <View style={[styles.communityIconContainer, { backgroundColor: '#1A2F22' }]}>
                <WhatsAppOfficialIcon size={20} color="#25D366" />
              </View>
              <View style={styles.communityTextContainer}>
                <Text style={styles.communityPrimaryText}>WhatsApp Channel</Text>
                <Text style={styles.communitySecondaryText} numberOfLines={1}>
                  Streams, lineups & match alerts
                </Text>
              </View>
              <View style={styles.communityActionPill}>
                <Text style={styles.communityActionText}>Join</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.communityRow}
              activeOpacity={0.78}
              onPress={() => Linking.openURL('https://tiktok.com').catch(() => {})}
              accessibilityRole="button"
              accessibilityLabel="Follow TikTok Community"
            >
              <View style={[styles.communityIconContainer, { backgroundColor: '#21172A' }]}>
                <TikTokOfficialIcon size={18} color="#FE2C55" />
              </View>
              <View style={styles.communityTextContainer}>
                <Text style={styles.communityPrimaryText}>TikTok Community</Text>
                <Text style={styles.communitySecondaryText} numberOfLines={1}>
                  Football clips & viral moments
                </Text>
              </View>
              <View style={styles.communityActionPill}>
                <Text style={styles.communityActionText}>Follow</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* ── MODALS ── */}
      <EditProfileModal
        visible={editModalVisible}
        currentName={profile.displayName}
        currentAvatarId={profile.avatarId}
        currentAvatarBg={profile.avatarBg}
        onClose={() => setEditModalVisible(false)}
        onSave={(displayName, avatarId, avatarBg) =>
          updateProfile({ displayName, avatarId, avatarBg })
        }
      />

      <FollowedTeamsModal
        visible={teamsModalVisible}
        followedTeamIds={profile.followedTeamIds}
        followedTeamsMeta={profile.followedTeamsMeta}
        onToggleTeam={toggleFollowTeam}
        onSelectTeam={team => navigate({ name: 'TeamDetails', params: { team } })}
        onClose={() => setTeamsModalVisible(false)}
      />

      <FollowedLeaguesModal
        visible={leaguesModalVisible}
        followedLeagueIds={profile.followedLeagueIds}
        followedLeaguesMeta={profile.followedLeaguesMeta}
        onToggleLeague={toggleFollowLeague}
        onSelectLeague={competition =>
          navigate({ name: 'CompetitionDetails', params: { competition } })
        }
        onClose={() => setLeaguesModalVisible(false)}
      />

      <MatchRemindersModal
        visible={remindersModalVisible}
        matchReminderIds={profile.matchReminderIds}
        onToggleReminder={toggleMatchReminder}
        onClose={() => setRemindersModalVisible(false)}
      />

      <TimeFormatModal
        visible={timeFormatModalVisible}
        currentFormat={profile.timeFormat}
        onSelect={timeFormat => updateProfile({ timeFormat })}
        onClose={() => setTimeFormatModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerCavity: {
    backgroundColor: Colors.headerPurple,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
    overflow: 'hidden',
  },
  bodyContainer: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 14,
    justifyContent: 'space-evenly',
  },
  section: {
    gap: 8,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 2,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.9,
    paddingLeft: 4,
  },
  timePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#1E1730',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
  },
  timePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D5CFE6',
  },
  cardGroup: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  communityGroup: {
    backgroundColor: '#1E1730',
    borderRadius: 16,
    overflow: 'hidden',
  },
  communityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 14,
  },
  communityRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  communityIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  communityTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  communityPrimaryText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  communitySecondaryText: {
    fontSize: 11.5,
    color: '#9A97B8',
    marginTop: 1,
  },
  communityActionPill: {
    backgroundColor: '#7650F6',
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: 9,
  },
  communityActionText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
