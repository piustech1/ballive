import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Linking,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import {
  Shield,
  Trophy,
  Calendar,
  Clock,
  Bell,
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

const CONVEX_CURVE_DIP = 26;

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
  const { width: windowWidth } = useWindowDimensions();

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [teamsModalVisible, setTeamsModalVisible] = useState(false);
  const [leaguesModalVisible, setLeaguesModalVisible] = useState(false);
  const [remindersModalVisible, setRemindersModalVisible] = useState(false);
  const [timeFormatModalVisible, setTimeFormatModalVisible] = useState(false);

  const curveWidth = Math.max(windowWidth, 320);
  // Carves bottom corners cleanly away so the hero forms a pronounced downward convex arch
  const curveCutoutPath = `M 0 0 Q ${curveWidth / 2} ${CONVEX_CURVE_DIP * 2} ${curveWidth} 0 L ${curveWidth} ${CONVEX_CURVE_DIP + 2} L 0 ${CONVEX_CURVE_DIP + 2} Z`;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── PRONOUNCED DOWNWARD CONVEX HERO CAVITY ── */}
        <View style={[styles.headerCavity, { paddingTop: Math.max(insets.top, 12) + 8 }]}>
          <CurvedHeaderPlayerBackground sport="soccer" screen="profile" />
          <ProfileHeader />
          <View style={styles.identityWrap}>
            <ProfileIdentityCard
              displayName={profile.displayName}
              membership={profile.membership}
              avatarId={profile.avatarId}
              avatarBg={profile.avatarBg}
              onEditPress={() => setEditModalVisible(true)}
              onAvatarPress={() => setEditModalVisible(true)}
            />
          </View>

          <Svg
            width={curveWidth}
            height={CONVEX_CURVE_DIP}
            viewBox={`0 0 ${curveWidth} ${CONVEX_CURVE_DIP}`}
            style={styles.convexCurveSvg}
            pointerEvents="none"
          >
            <Path d={curveCutoutPath} fill={Colors.background} />
          </Svg>
        </View>

        {/* ── SCROLLABLE PROFILE BODY (EVEN, NATURAL VERTICAL RHYTHM) ── */}
        <View style={styles.bodyContainer}>
          {/* ── MY SPORTS SECTION ── */}
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

            <View style={styles.cardsColumn}>
              <ProfileSectionRow
                icon={Shield}
                iconColor="#A58BFC"
                label="Followed Teams"
                badgeValue={profile.followedTeamIds.length}
                standalone
                onPress={() => setTeamsModalVisible(true)}
              />
              <ProfileSectionRow
                icon={Trophy}
                iconColor={Colors.categoryChampionsLeague}
                label="Followed Competitions"
                badgeValue={profile.followedLeagueIds.length}
                standalone
                onPress={() => setLeaguesModalVisible(true)}
              />
              <ProfileSectionRow
                icon={Calendar}
                iconColor={Colors.liveRed}
                label="Match Reminders"
                badgeValue={profile.matchReminderIds.length}
                standalone
                onPress={() => setRemindersModalVisible(true)}
              />
              <ProfileSectionRow
                icon={Bell}
                iconColor="#38BDF8"
                label="Notifications"
                standalone
                onPress={() => navigate({ name: 'Notifications' })}
              />
            </View>
          </View>

          {/* ── JOIN OUR COMMUNITY SECTION ── */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>JOIN OUR COMMUNITY</Text>
            <View style={styles.cardsColumn}>
              <TouchableOpacity
                style={[styles.communityCard, styles.whatsappCard]}
                activeOpacity={0.82}
                onPress={() => Linking.openURL('https://whatsapp.com').catch(() => {})}
                accessibilityRole="button"
                accessibilityLabel="Join WhatsApp Channel"
              >
                <View style={styles.unboxedIconSlot}>
                  <WhatsAppOfficialIcon size={26} color="#FFFFFF" />
                </View>
                <View style={styles.communityTextContainer}>
                  <Text style={styles.whatsappPrimaryText}>WhatsApp Channel</Text>
                  <Text style={styles.whatsappSecondaryText} numberOfLines={1}>
                    Streams, lineups & match alerts
                  </Text>
                </View>
                <View style={styles.whatsappJoinPill}>
                  <Text style={styles.whatsappJoinText}>Join</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.communityCard, styles.tiktokCard]}
                activeOpacity={0.82}
                onPress={() => Linking.openURL('https://tiktok.com').catch(() => {})}
                accessibilityRole="button"
                accessibilityLabel="Follow TikTok Community"
              >
                <View style={styles.unboxedIconSlot}>
                  <TikTokOfficialIcon size={24} color="#FFFFFF" />
                </View>
                <View style={styles.communityTextContainer}>
                  <Text style={styles.tiktokPrimaryText}>TikTok Community</Text>
                  <Text style={styles.tiktokSecondaryText} numberOfLines={1}>
                    Highlights & match clips
                  </Text>
                </View>
                <View style={styles.tiktokFollowPill}>
                  <Text style={styles.tiktokFollowText}>Follow</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 28,
  },
  headerCavity: {
    backgroundColor: Colors.headerPurple,
    overflow: 'hidden',
    position: 'relative',
  },
  identityWrap: {
    paddingBottom: CONVEX_CURVE_DIP + 4,
  },
  convexCurveSvg: {
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  bodyContainer: {
    paddingHorizontal: 18,
    paddingTop: 12,
    gap: 20,
  },
  section: {
    gap: 10,
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
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  timePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D5CFE6',
  },
  cardsColumn: {
    gap: 10,
  },
  communityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 15,
    borderRadius: 16,
  },
  whatsappCard: {
    backgroundColor: '#1FB155',
  },
  tiktokCard: {
    backgroundColor: '#000000',
  },
  unboxedIconSlot: {
    width: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: 'transparent',
  },
  communityTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  whatsappPrimaryText: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  whatsappSecondaryText: {
    fontSize: 11.5,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 1,
    fontWeight: '500',
  },
  whatsappJoinPill: {
    backgroundColor: '#0B0B0E',
    paddingHorizontal: 15,
    paddingVertical: 7,
    borderRadius: 11,
  },
  whatsappJoinText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  tiktokPrimaryText: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  tiktokSecondaryText: {
    fontSize: 11.5,
    color: '#A1A1AA',
    marginTop: 1,
    fontWeight: '500',
  },
  tiktokFollowPill: {
    backgroundColor: '#FE2C55',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 11,
  },
  tiktokFollowText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

export default ProfileScreen;
