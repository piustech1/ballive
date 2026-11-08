import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  StatusBar,
} from 'react-native';
import {
  Shield,
  Trophy,
  Calendar,
  Bell,
  Languages,
  Globe,
  Clock,
  ShieldCheck,
  HelpCircle,
  Info,
} from 'lucide-react-native';
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
  TimeZoneModal,
  LanguageModal,
} from '../features/profile/modals/PreferencesModals';
import {
  AboutModal,
  PrivacySecurityModal,
  HelpSupportModal,
} from '../features/profile/modals/AppInfoModals';

export const ProfileScreen: React.FC = () => {
  const {
    profile,
    updateProfile,
    toggleFollowTeam,
    toggleFollowLeague,
    toggleMatchReminder,
  } = useProfile();

  // ── MODAL VISIBILITY STATES ──
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [teamsModalVisible, setTeamsModalVisible] = useState(false);
  const [leaguesModalVisible, setLeaguesModalVisible] = useState(false);
  const [remindersModalVisible, setRemindersModalVisible] = useState(false);
  const [notificationsModalVisible, setNotificationsModalVisible] = useState(false);
  const [timeFormatModalVisible, setTimeFormatModalVisible] = useState(false);
  const [timeZoneModalVisible, setTimeZoneModalVisible] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);
  const [helpModalVisible, setHelpModalVisible] = useState(false);
  const [aboutModalVisible, setAboutModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.headerPurple} translucent={false} />

      {/* ── 1. HEADER ── */}
      <ProfileHeader onSettingsPress={() => setNotificationsModalVisible(true)} />

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
              icon={Bell}
              iconColor={Colors.textPrimary}
              label="Notifications"
              subtitle="Match alerts and reminders"
              isFirst
              onPress={() => setNotificationsModalVisible(true)}
            />
            <ProfileSectionRow
              icon={Languages}
              iconColor={Colors.textPrimary}
              label="Language"
              badgeValue={profile.language}
              onPress={() => setLanguageModalVisible(true)}
            />
            <ProfileSectionRow
              icon={Globe}
              iconColor={Colors.textPrimary}
              label="Time Zone"
              badgeValue={profile.timeZone}
              onPress={() => setTimeZoneModalVisible(true)}
            />
            <ProfileSectionRow
              icon={Clock}
              iconColor={Colors.textPrimary}
              label="Time Format"
              badgeValue={profile.timeFormat === '12h' ? '12-hour' : '24-hour'}
              isLast
              onPress={() => setTimeFormatModalVisible(true)}
            />
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
              onPress={() => setPrivacyModalVisible(true)}
            />
            <ProfileSectionRow
              icon={HelpCircle}
              iconColor={Colors.textSecondary}
              label="Help & Support"
              onPress={() => setHelpModalVisible(true)}
            />
            <ProfileSectionRow
              icon={Info}
              iconColor="#A58BFC"
              label="About BALLIVE"
              badgeValue="v1.1.0"
              isLast
              onPress={() => setAboutModalVisible(true)}
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
        visible={notificationsModalVisible}
        notifications={profile.notifications}
        onUpdate={(key, val) =>
          updateProfile({ notifications: { ...profile.notifications, [key]: val } })
        }
        onClose={() => setNotificationsModalVisible(false)}
      />

      <TimeFormatModal
        visible={timeFormatModalVisible}
        currentFormat={profile.timeFormat}
        onSelect={timeFormat => updateProfile({ timeFormat })}
        onClose={() => setTimeFormatModalVisible(false)}
      />

      <TimeZoneModal
        visible={timeZoneModalVisible}
        currentTimeZone={profile.timeZone}
        onSelect={timeZone => updateProfile({ timeZone })}
        onClose={() => setTimeZoneModalVisible(false)}
      />

      <LanguageModal
        visible={languageModalVisible}
        currentLanguage={profile.language}
        onSelect={language => updateProfile({ language })}
        onClose={() => setLanguageModalVisible(false)}
      />

      <PrivacySecurityModal
        visible={privacyModalVisible}
        onClose={() => setPrivacyModalVisible(false)}
      />

      <HelpSupportModal
        visible={helpModalVisible}
        onClose={() => setHelpModalVisible(false)}
      />

      <AboutModal
        visible={aboutModalVisible}
        onClose={() => setAboutModalVisible(false)}
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
    paddingTop: 20,
    paddingBottom: 32,
    gap: 24,
  },
  section: {
    gap: 10,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.9,
    paddingLeft: 4,
  },
  cardGroup: {
    borderRadius: 18,
    overflow: 'hidden',
  },
});
