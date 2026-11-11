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

// Authentic Official Vector Brand Icons
const WhatsAppOfficialIcon: React.FC<{ size?: number; color?: string }> = ({ size = 22, color = '#25D366' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.89 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.457h.005c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 00-3.48-8.413z"
      fill={color}
    />
  </Svg>
);

const TikTokOfficialIcon: React.FC<{ size?: number; color?: string }> = ({ size = 20, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19.589 6.686a4.793 4.793 0 01-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 01-2.89 2.896 2.896 2.896 0 01-2.896-2.896 2.896 2.896 0 012.896-2.896c.31 0 .607.054.884.148V9.412a6.37 6.37 0 00-.884-.061C5.972 9.351 3.2 12.123 3.2 15.635 3.2 19.146 5.972 22 9.484 22c3.511 0 6.347-2.854 6.347-6.365V8.587a8.214 8.214 0 005.158 1.83V6.972a4.78 4.78 0 01-1.4-.286z"
      fill={color}
    />
  </Svg>
);
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
              badgeValue="v2.0.0"
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
