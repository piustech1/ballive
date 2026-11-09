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
  Video,
  Check,
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
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [timeFormatModalVisible, setTimeFormatModalVisible] = useState(false);
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);
  const [helpModalVisible, setHelpModalVisible] = useState(false);
  const [aboutModalVisible, setAboutModalVisible] = useState(false);

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
          <View style={styles.communityCardsColumn}>
            {/* WhatsApp Channel Card */}
            <TouchableOpacity
              style={styles.communityCard}
              activeOpacity={0.85}
              onPress={() => Linking.openURL('https://whatsapp.com').catch(() => {})}
            >
              <View style={[styles.communityIconBox, { backgroundColor: '#25D366' }]}>
                <MessageCircle size={20} color="#FFFFFF" strokeWidth={2.4} />
              </View>
              <View style={styles.communityTextCol}>
                <View style={styles.communityTitleRow}>
                  <Text style={styles.communityTitle} numberOfLines={1}>
                    WhatsApp Channel
                  </Text>
                  <View style={[styles.communityVerified, { backgroundColor: '#25D366' }]}>
                    <Check size={8} color="#FFFFFF" strokeWidth={3.5} />
                  </View>
                </View>
                <Text style={styles.communitySub} numberOfLines={1}>
                  Instant stream links, lineups & alerts
                </Text>
              </View>
              <View style={[styles.communityPill, { backgroundColor: 'rgba(37, 211, 102, 0.15)' }]}>
                <Text style={[styles.communityPillText, { color: '#25D366' }]}>Join</Text>
              </View>
            </TouchableOpacity>

            {/* TikTok Community Card */}
            <TouchableOpacity
              style={styles.communityCard}
              activeOpacity={0.85}
              onPress={() => Linking.openURL('https://tiktok.com').catch(() => {})}
            >
              <View style={[styles.communityIconBox, { backgroundColor: '#010101', borderWidth: 1.5, borderColor: '#FE2C55' }]}>
                <Video size={19} color="#FFFFFF" strokeWidth={2.4} />
              </View>
              <View style={styles.communityTextCol}>
                <View style={styles.communityTitleRow}>
                  <Text style={styles.communityTitle} numberOfLines={1}>
                    TikTok Community
                  </Text>
                  <View style={[styles.communityVerified, { backgroundColor: '#FE2C55' }]}>
                    <Check size={8} color="#FFFFFF" strokeWidth={3.5} />
                  </View>
                </View>
                <Text style={styles.communitySub} numberOfLines={1}>
                  Viral football clips & skill reels
                </Text>
              </View>
              <View style={[styles.communityPill, { backgroundColor: 'rgba(254, 44, 85, 0.15)' }]}>
                <Text style={[styles.communityPillText, { color: '#FE2C55' }]}>Follow</Text>
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
              badgeValue="v1.8.0"
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
    paddingTop: 16,
    paddingBottom: 32,
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
  communityCardsColumn: {
    gap: 8,
  },
  communityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1730',
    borderRadius: 16,
    padding: 12,
    gap: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  communityIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  communityTextCol: {
    flex: 1,
  },
  communityTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  communityTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  communityVerified: {
    width: 12,
    height: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  communitySub: {
    fontSize: 11.5,
    color: '#A098B5',
    marginTop: 1,
  },
  communityPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  communityPillText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});
