import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Linking,
  Platform,
  LayoutChangeEvent,
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

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

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
  const { width: windowWidth, height: windowHeight, fontScale } = useWindowDimensions();

  // Synchronously seed viewport height above BottomNavigation, then lock to measured layout
  const estimatedBottomNavHeight =
    Math.max(insets.bottom, Platform.OS === 'android' ? 12 : 8) + 60;
  const [measuredViewportHeight, setMeasuredViewportHeight] = useState<number>(0);

  const handleContainerLayout = useCallback((e: LayoutChangeEvent) => {
    const h = Math.round(e.nativeEvent.layout.height);
    if (h > 240) {
      setMeasuredViewportHeight(prev => (Math.abs(prev - h) > 2 ? h : prev));
    }
  }, []);

  const viewportHeight =
    measuredViewportHeight > 240
      ? measuredViewportHeight
      : Math.max(480, windowHeight - estimatedBottomNavHeight);

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [teamsModalVisible, setTeamsModalVisible] = useState(false);
  const [leaguesModalVisible, setLeaguesModalVisible] = useState(false);
  const [remindersModalVisible, setRemindersModalVisible] = useState(false);
  const [timeFormatModalVisible, setTimeFormatModalVisible] = useState(false);

  const layout = useMemo(() => {
    const topSafeInset = Math.max(insets.top, 12);
    const isCompact = viewportHeight < 700 || fontScale > 1.15;
    const isMediumFit = !isCompact && viewportHeight < 765;

    const curveDip = isCompact
      ? 34
      : isMediumFit
      ? 38
      : Math.round(clamp(viewportHeight * 0.054, 40, 48));

    // Reserve minimum height so enlarged Profile title, avatar block, and deep curve breathe
    const minBannerHeight =
      topSafeInset +
      10 +
      (isCompact ? 36 : 42) +
      (isCompact ? 10 : isMediumFit ? 10 : 14) +
      (isCompact ? 92 : isMediumFit ? 104 : 114) +
      curveDip +
      (isCompact ? 12 : isMediumFit ? 12 : 18);

    const targetBannerHeight = Math.round(
      viewportHeight * (isCompact || isMediumFit ? 0.335 : 0.365)
    );
    const bannerHeight = isCompact
      ? minBannerHeight
      : Math.round(clamp(targetBannerHeight, isMediumFit ? Math.min(minBannerHeight, 240) : minBannerHeight, 330));

    const remainingBody = Math.max(0, viewportHeight - bannerHeight);

    const rowPaddingV = isCompact ? 10.5 : isMediumFit ? 10 : remainingBody >= 515 ? 12 : 10.5;
    const communityPaddingV = isCompact ? 12.5 : isMediumFit ? 12 : remainingBody >= 515 ? 14 : 12.5;

    // Intrinsic heights: MY SPORTS header (25) + 4 rows + JOIN header (17) + 2 community cards
    const singleRowH = rowPaddingV * 2 + 36;
    const singleCommH = communityPaddingV * 2 + 35;
    const estimatedItemsHeight = 42 + singleRowH * 4 + singleCommH * 2;

    const minSectionGap = isCompact ? 18 : isMediumFit ? 18 : remainingBody >= 515 ? 24 : 20;
    const gapBudget = Math.max(66, remainingBody - estimatedItemsHeight - minSectionGap);

    const topBodyPad = Math.round(clamp(gapBudget * 0.11, 7, 14));
    const bottomBodyPad = Math.round(clamp(gapBudget * 0.18, isCompact ? 20 : 13, 24));
    const labelGap = Math.round(clamp(gapBudget * 0.105, 7, 12));
    const rowGap = Math.round(clamp(gapBudget * 0.125, 9, 16));
    const communityCardGap = Math.round(clamp(gapBudget * 0.125, 9, 16));

    return {
      topSafeInset,
      isCompact,
      isMediumFit,
      curveDip,
      bannerHeight,
      rowPaddingV,
      communityPaddingV,
      minSectionGap,
      topBodyPad,
      bottomBodyPad,
      labelGap,
      rowGap,
      communityCardGap,
    };
  }, [insets.top, viewportHeight, fontScale]);

  const curveWidth = Math.max(windowWidth, 320);
  const svgW = curveWidth + 2;
  const svgH = layout.curveDip + 2;
  // Smooth downward-convex U-curve cutting out bottom corners into Colors.background (#0E0D14)
  const curveCutoutPath = `M 0 0 Q ${svgW / 2} ${layout.curveDip * 2} ${svgW} 0 L ${svgW} ${svgH + 2} L 0 ${svgH + 2} Z`;

  return (
    <View style={styles.container} onLayout={handleContainerLayout}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
        bounces={false}
      >
        <View style={styles.pageInner}>
          {/* ── EXTENDED CURVED PROFILE HERO BANNER ── */}
          <View
            style={[
              styles.headerCavity,
              {
                minHeight: layout.bannerHeight,
                paddingTop: layout.topSafeInset + 10,
              },
            ]}
          >
            <CurvedHeaderPlayerBackground
              sport="soccer"
              screen="profile"
              scrimVariant="extendedProfile"
              opacity={0.9}
            />

            <ProfileHeader compact={layout.isCompact} />

            <View
              style={[
                styles.identityWrap,
                {
                  paddingTop: layout.isCompact || layout.isMediumFit ? 10 : 16,
                  paddingBottom: layout.curveDip + (layout.isCompact || layout.isMediumFit ? 12 : 18),
                },
              ]}
            >
              <ProfileIdentityCard
                displayName={profile.displayName}
                membership={profile.membership}
                avatarId={profile.avatarId}
                avatarBg={profile.avatarBg}
                compact={layout.isCompact}
                onEditPress={() => setEditModalVisible(true)}
                onAvatarPress={() => setEditModalVisible(true)}
              />
            </View>

            <Svg
              width={svgW}
              height={svgH}
              viewBox={`0 0 ${svgW} ${svgH}`}
              style={styles.convexCurveSvg}
              pointerEvents="none"
            >
              <Path d={curveCutoutPath} fill={Colors.background} />
            </Svg>
          </View>

          {/* ── DISTRIBUTED PROFILE CONTENT AREA ABOVE BOTTOM NAV ── */}
          <View
            style={[
              styles.bodyContainer,
              {
                paddingTop: layout.topBodyPad,
                paddingBottom: layout.bottomBodyPad,
                gap: layout.minSectionGap,
              },
            ]}
          >
            {/* ── MY SPORTS SECTION ── */}
            <View style={{ gap: layout.labelGap }}>
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

              <View style={{ gap: layout.rowGap }}>
                <ProfileSectionRow
                  icon={Shield}
                  iconColor="#A58BFC"
                  label="Followed Teams"
                  badgeValue={profile.followedTeamIds.length}
                  paddingVertical={layout.rowPaddingV}
                  standalone
                  onPress={() => setTeamsModalVisible(true)}
                />
                <ProfileSectionRow
                  icon={Trophy}
                  iconColor={Colors.categoryChampionsLeague}
                  label="Followed Competitions"
                  badgeValue={profile.followedLeagueIds.length}
                  paddingVertical={layout.rowPaddingV}
                  standalone
                  onPress={() => setLeaguesModalVisible(true)}
                />
                <ProfileSectionRow
                  icon={Calendar}
                  iconColor={Colors.liveRed}
                  label="Match Reminders"
                  badgeValue={profile.matchReminderIds.length}
                  paddingVertical={layout.rowPaddingV}
                  standalone
                  onPress={() => setRemindersModalVisible(true)}
                />
                <ProfileSectionRow
                  icon={Bell}
                  iconColor="#38BDF8"
                  label="Notifications"
                  paddingVertical={layout.rowPaddingV}
                  standalone
                  onPress={() => navigate({ name: 'Notifications' })}
                />
              </View>
            </View>

            {/* ── JOIN OUR COMMUNITY SECTION ── */}
            <View style={{ gap: layout.labelGap }}>
              <Text style={styles.sectionHeader}>JOIN OUR COMMUNITY</Text>
              <View style={{ gap: layout.communityCardGap }}>
                <TouchableOpacity
                  style={[
                    styles.communityCard,
                    styles.whatsappCard,
                    { paddingVertical: layout.communityPaddingV },
                  ]}
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
                  style={[
                    styles.communityCard,
                    styles.tiktokCard,
                    { paddingVertical: layout.communityPaddingV },
                  ]}
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
    flexGrow: 1,
  },
  pageInner: {
    flex: 1,
  },
  headerCavity: {
    backgroundColor: Colors.headerPurple,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'space-between',
  },
  identityWrap: {
    justifyContent: 'center',
  },
  convexCurveSvg: {
    position: 'absolute',
    bottom: -1,
    left: -1,
  },
  bodyContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 18,
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
  communityCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
    color: 'rgba(255, 255, 255, 0.92)',
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
