import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import {
  Bell,
  BellRing,
  Trash2,
  Calendar,
  Sparkles,
  ChevronRight,
} from 'lucide-react-native';
import Colors from '../theme/colors';
import { SecondaryScreenHeader } from '../components/common/SecondaryScreenHeader';
import { useProfile } from '../hooks/useProfile';
import { UPCOMING_HIGHLIGHTS, DiscoverMatchup } from '../constants/discoverData';
import { useAppNavigation } from '../navigation/NavigationContext';

export const NotificationsScreen: React.FC = () => {
  const { goBack, navigate, switchTab } = useAppNavigation();
  const { profile, toggleMatchReminder } = useProfile();

  // Find reminder matchups
  const reminderMatches: DiscoverMatchup[] = UPCOMING_HIGHLIGHTS.filter(m =>
    profile.matchReminderIds.includes(m.id)
  );

  return (
    <View style={styles.root}>
      {/* Top App Bar */}
      <SecondaryScreenHeader
        title="Notifications"
        subtitle={`${reminderMatches.length} Active Kickoff ${reminderMatches.length === 1 ? 'Alert' : 'Alerts'}`}
        rightAction={{
          icon: BellRing,
          onPress: () => {},
          active: reminderMatches.length > 0,
          activeColor: '#7952FC',
          badge: reminderMatches.length,
          accessibilityLabel: 'Kickoff alerts',
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionHeaderTitle}>Active Kickoff Alerts</Text>

        {reminderMatches.length > 0 ? (
          reminderMatches.map(match => (
            <TouchableOpacity
              key={match.id}
              activeOpacity={0.8}
              style={styles.reminderCard}
              onPress={() => {
                navigate({
                  name: 'MatchDetails',
                  params: { matchup: match },
                });
              }}
            >
              <View style={styles.bellIconBox}>
                <BellRing size={20} color="#7952FC" strokeWidth={2.4} />
              </View>

              <View style={styles.metaBox}>
                <Text style={styles.compLabel}>{match.competition}</Text>
                <Text style={styles.fixtureLabel} numberOfLines={1}>
                  {match.homeTeam.name} vs {match.awayTeam.name}
                </Text>
                <Text style={styles.timeLabel}>
                  {match.kickoffDate} • {match.kickoffTime}
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.removeBtn}
                onPress={e => {
                  e.stopPropagation();
                  toggleMatchReminder(match.id);
                }}
              >
                <Trash2 size={16} color="#A098B5" strokeWidth={2} />
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyStateContainer}>
            <View style={styles.emptyIconCircle}>
              <Bell size={36} color="#7952FC" strokeWidth={2} />
            </View>
            <Text style={styles.emptyTitle}>No Active Match Alerts</Text>
            <Text style={styles.emptySubtitle}>
              You haven't set kickoff reminders for any matches yet. Tap the bell on any upcoming match to get notified before kickoff!
            </Text>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.discoverBtn}
              onPress={() => {
                goBack();
                switchTab('Discover');
              }}
            >
              <Sparkles size={16} color="#FFFFFF" strokeWidth={2.2} />
              <Text style={styles.discoverBtnText}>Explore Upcoming Matches</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0E0D14',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#1E1730',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2A2045',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTitleBox: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  badgeCount: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: '#7952FC',
  },
  badgeCountText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  sectionHeaderTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#A098B5',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 12,
  },
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1730',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  bellIconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#2A2045',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  metaBox: {
    flex: 1,
    marginRight: 8,
  },
  compLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#7952FC',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  fixtureLabel: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  timeLabel: {
    fontSize: 11,
    color: '#A098B5',
  },
  removeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#2A2045',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateContainer: {
    marginTop: 40,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyIconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#1E1730',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#A098B5',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  discoverBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#7952FC',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
  },
  discoverBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
