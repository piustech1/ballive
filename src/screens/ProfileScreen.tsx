import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Linking,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import {
  Shield,
  Trophy,
  Calendar,
  Settings,
  Clock,
  ShieldCheck,
  HelpCircle,
  Info,
  MessageCircle,
  Check,
  Video,
} from 'lucide-react-native';

import { useAppNavigation } from '../navigation/NavigationContext';
import { WhatsAppOfficialIcon, TikTokOfficialIcon } from '../components/common/BrandIcons';
import Colors from '../theme/colors';
import { useProfile } from '../hooks/useProfile';
import { ProfileHeader } from '../features/profile/ProfileHeader';
import { ProfileIdentityCard } from '../features/profile/ProfileIdentityCard';
import { ProfileSectionRow } from '../features/profile/ProfileSectionRow';
import { EditProfileModal } from '../features/profile/modals/EditProfileModal';
import { FollowedTeamsModal } from '../features/profile/modals/FollowedTeamsModal';
import { FollowedLeaguesModal } from '../features/profile/modals/FollowedLeaguesModal';
import { MatchRemindersModal } from '../features/profile/modals/MatchRemindersModal';
import {
  NotificationSettingsModal,
  TimeFormatModal,
} from '../features/profile/modals/PreferencesModals';

export const ProfileScreen: React.FC = () => {
  const {
    profile,
    updateProfile,
    toggleFollowTeam,
    toggleFollowLeague,
    toggleMatchReminder,
  } = useProfile();
  const { navigate } = useAppNavigation();

  // ── MODAL VISIBILITY STATES ──
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [teamsModalVisible, setTeamsModalVisible] = useState(false);
  const [leaguesModalVisible, setLeaguesModalVisible] = useState(false);
  const [remindersModalVisible, setRemindersModalVisible] = useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [timeFormatModalVisible, setTimeFormatModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.headerPurple} translucent={false} />

      {/* ── 1. HEADER ── */}
      <ProfileHeader onSettingsPress={() => setSettingsModalVisible(true)} />

      {/* ── 2. IDENTITY AREA (Compact, Left-Aligned) ── */}
      <ProfileIdentityCard
        displayName={profile.displayName}
        membership={profile.membership}
        avatarBg={profile.avatarBg}
        onEditPress={() => setEditModalVisible(true)}
      />

      {/* ── MAIN SCROLLABLE SECTIONS ── */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── SECTION: MY FOOTBALL ── */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>MY FOOTBALL</Text>
          <View style={styles.cardGroup}>
            <ProfileSectionRow
              icon={Shield}
              iconColor="#A58BFC"
              label="Followed Teams"
              subtitle="Manage your favorite clubs"
              badgeValue={profile.followedTeamIds.length}
              isFirst
              onPress={() => setTeamsModalVisible(true)}
            />
            <ProfileSectionRow
              icon={Trophy}
              iconColor={Colors.categoryChampionsLeague}
              label="Followed Leagues"
              subtitle="Your favorite competitions"
              badgeValue={profile.followedLeagueIds.length}
              onPress={() => setLeaguesModalVisible(true)}
            />
            <ProfileSectionRow
              icon={Calendar}
              iconColor={Colors.liveRed}
              label="Match Reminders"
              subtitle="Upcoming matches you don't want to miss"
              badgeValue={profile.matchReminderIds.length}
              isLast
              onPress={() => setRemindersModalVisible(true)}
            />
          </View>
        </View>

        {/* ── SECTION: PREFERENCES ── */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>PREFERENCES</Text>
          <View style={styles.cardGroup}>
            <ProfileSectionRow
              icon={Settings}
              iconColor="#A58BFC"
              label="Settings"
              subtitle="Stream quality, alerts & storage"
              isFirst
              onPress={() => setSettingsModalVisible(true)}
            />
            <ProfileSectionRow
              icon={Clock}
              iconColor={Colors.textPrimary}
              label="Time Format"
              subtitle="Switch between 12-hour and 24-hour"
              badgeValue={profile.timeFormat === '12h' ? '12-hour' : '24-hour'}
              isLast
              onPress={() => setTimeFormatModalVisible(true)}
            />
          </View>
        </View>

        {/* ── SECTION: JOIN OUR FOOTBALL COMMUNITY ── */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>JOIN OUR FOOTBALL COMMUNITY</Text>
          <View style={styles.communityGroup}>
            {/* WhatsApp Channel */}
            <TouchableOpacity
              style={[styles.communityRow, styles.communityRowBorder]}
              activeOpacity={0.75}
              onPress={() => Linking.openURL('https://whatsapp.com').catch(() => {})}
              accessibilityRole="button"
              accessibilityLabel="Join WhatsApp Channel"
            >
              <View style={[styles.communityIconContainer, { backgroundColor: '#1A2F22' }]}>
                <WhatsAppOfficialIcon size={22} color="#25D366" />
              </View>
              <View style={styles.communityTextContainer}>
                <Text style={styles.communityPrimaryText}>WhatsApp Channel</Text>
                <Text style={styles.communitySecondaryText}>Streams, lineups & match alerts</Text>
              </View>
              <View style={styles.communityActionPill}>
                <Text style={styles.communityActionText}>Join</Text>
              </View>
            </TouchableOpacity>

            {/* TikTok Community */}
            <TouchableOpacity
              style={styles.communityRow}
              activeOpacity={0.75}
              onPress={() => Linking.openURL('https://tiktok.com').catch(() => {})}
              accessibilityRole="button"
              accessibilityLabel="Follow TikTok Community"
            >
              <View style={[styles.communityIconContainer, { backgroundColor: '#21172A' }]}>
                <TikTokOfficialIcon size={20} color="#FE2C55" />
              </View>
              <View style={styles.communityTextContainer}>
                <Text style={styles.communityPrimaryText}>TikTok Community</Text>
                <Text style={styles.communitySecondaryText}>Football clips & viral moments</Text>
              </View>
              <View style={styles.communityActionPill}>
                <Text style={styles.communityActionText}>Follow</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── SECTION: APPLICATION ── */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>APPLICATION</Text>
          <View style={styles.cardGroup}>
            <ProfileSectionRow
              icon={ShieldCheck}
              iconColor={Colors.verifiedBlue}
              label="Privacy & Security"
              isFirst
              onPress={() => navigate({ name: 'PrivacySecurity' })}
            />
            <ProfileSectionRow
              icon={HelpCircle}
              iconColor={Colors.textSecondary}
              label="Help & Support"
              onPress={() => navigate({ name: 'HelpSupport' })}
            />
            <ProfileSectionRow
              icon={Info}
              iconColor="#A58BFC"
              label="About BALLIVE"
              badgeValue="v2.5.1"
              isLast
              onPress={() => navigate({ name: 'About' })}
            />
          </View>
        </View>
      </ScrollView>

      {/* ── MODALS ── */}
      <EditProfileModal
        visible={editModalVisible}
        currentName={profile.displayName}
        currentAvatarBg={profile.avatarBg}
        onClose={() => setEditModalVisible(false)}
        onSave={(displayName, avatarBg) => updateProfile({ displayName, avatarBg })}
      />

      <FollowedTeamsModal
        visible={teamsModalVisible}
        followedTeamIds={profile.followedTeamIds}
        onToggleTeam={toggleFollowTeam}
        onClose={() => setTeamsModalVisible(false)}
      />

      <FollowedLeaguesModal
        visible={leaguesModalVisible}
        followedLeagueIds={profile.followedLeagueIds}
        onToggleLeague={toggleFollowLeague}
        onClose={() => setLeaguesModalVisible(false)}
      />

      <MatchRemindersModal
        visible={remindersModalVisible}
        matchReminderIds={profile.matchReminderIds}
        onToggleReminder={toggleMatchReminder}
        onClose={() => setRemindersModalVisible(false)}
      />

      <NotificationSettingsModal
        visible={settingsModalVisible}
        notifications={profile.notifications}
        onUpdate={(key, val) =>
          updateProfile({ notifications: { ...profile.notifications, [key]: val } })
        }
        onClose={() => setSettingsModalVisible(false)}
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 96,
    gap: 20,
  },
  section: {
    gap: 8,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.9,
    paddingLeft: 4,
  },
  cardGroup: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  // Social Community Styles
  communityGroup: {
    backgroundColor: '#1E1730',
    borderRadius: 16,
    overflow: 'hidden',
  },
  communityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  communityRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  communityIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  communityTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  communityPrimaryText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  communitySecondaryText: {
    fontSize: 11.5,
    color: '#9A97B8',
    marginTop: 1,
  },
  communityActionPill: {
    backgroundColor: '#2A2045',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  communityActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ECE9FA',
  },
});
