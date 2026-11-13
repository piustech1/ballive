import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import {
  ArrowLeft,
  Check,
  Plus,
  MapPin,
  Trophy,
  Calendar,
  Users,
  ChevronRight,
  Shield,
} from 'lucide-react-native';
import Colors from '../theme/colors';
import { SecondaryScreenHeader } from '../components/common/SecondaryScreenHeader';
import { PopularTeam, UPCOMING_HIGHLIGHTS } from '../constants/discoverData';
import { useProfile } from '../hooks/useProfile';
import { useAppNavigation } from '../navigation/NavigationContext';
import { UniversalMatchCard } from '../components/common/UniversalMatchCard';

interface TeamDetailsScreenProps {
  team: PopularTeam;
}

export const TeamDetailsScreen: React.FC<TeamDetailsScreenProps> = ({ team }) => {
  const { navigate } = useAppNavigation();
  const { profile, toggleFollowTeam } = useProfile();
  const [activeTab, setActiveTab] = useState<'overview' | 'fixtures' | 'squad'>('overview');

  const isFollowed = profile.followedTeamIds.includes(team.id);

  // Filter fixtures involving this team
  const teamFixtures = UPCOMING_HIGHLIGHTS.filter(
    m =>
      m.homeTeam.id === team.id ||
      m.awayTeam.id === team.id ||
      m.homeTeam.name.toLowerCase().includes(team.name.toLowerCase()) ||
      m.awayTeam.name.toLowerCase().includes(team.name.toLowerCase())
  );

  const fallbackFixtures = teamFixtures.length > 0 ? teamFixtures : UPCOMING_HIGHLIGHTS.slice(0, 3);

  // Sample squad
  const squadPlayers = [
    { num: 1, name: 'First Choice GK', pos: 'Goalkeeper', nat: team.country },
    { num: 4, name: 'Star Centre Back (C)', pos: 'Defender', nat: 'Netherlands' },
    { num: 6, name: 'Defensive Anchor', pos: 'Defender', nat: 'Brazil' },
    { num: 8, name: 'Playmaker Maestro', pos: 'Midfielder', nat: 'Norway' },
    { num: 10, name: 'Creative Number 10', pos: 'Midfielder', nat: 'Argentina' },
    { num: 7, name: 'Lightning Winger', pos: 'Forward', nat: 'England' },
    { num: 9, name: 'Lethal Striker', pos: 'Forward', nat: 'France' },
    { num: 11, name: 'Inverted Forward', pos: 'Forward', nat: 'Egypt' },
  ];

  return (
    <View style={styles.root}>
      {/* Top App Bar */}
      <SecondaryScreenHeader
        title={team.name}
        subtitle={`${team.stadium} • ${team.country}`}
        rightAction={{
          icon: isFollowed ? Check : Plus,
          onPress: () => toggleFollowTeam(team.id),
          active: isFollowed,
          activeColor: '#7952FC',
          accessibilityLabel: isFollowed ? 'Unfollow' : 'Follow',
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Team Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.crestContainer}>
            <Image source={{ uri: team.crestUrl }} style={styles.crestImage} />
          </View>
          <Text style={styles.teamHeroName}>{team.name}</Text>
          <Text style={styles.teamHeroSubtitle}>{team.domesticTitle}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <MapPin size={13} color="#A098B5" strokeWidth={2} />
              <Text style={styles.metaText}>{team.stadium}</Text>
            </View>
            <View style={styles.metaDot} />
            <View style={styles.metaItem}>
              <Shield size={13} color="#A098B5" strokeWidth={2} />
              <Text style={styles.metaText}>{team.country}</Text>
            </View>
          </View>
        </View>

        {/* Tab Controls */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'overview' && styles.tabButtonActive]}
            onPress={() => setActiveTab('overview')}
          >
            <Text style={[styles.tabText, activeTab === 'overview' && styles.tabTextActive]}>
              Overview
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'fixtures' && styles.tabButtonActive]}
            onPress={() => setActiveTab('fixtures')}
          >
            <Text style={[styles.tabText, activeTab === 'fixtures' && styles.tabTextActive]}>
              Fixtures
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'squad' && styles.tabButtonActive]}
            onPress={() => setActiveTab('squad')}
          >
            <Text style={[styles.tabText, activeTab === 'squad' && styles.tabTextActive]}>
              Squad
            </Text>
          </TouchableOpacity>
        </View>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <View style={styles.tabSection}>
            {/* Form Guide */}
            <View style={styles.sectionCard}>
              <Text style={styles.cardHeaderTitle}>Recent Form</Text>
              <View style={styles.formGuideRow}>
                {['W', 'W', 'D', 'W', 'L'].map((result, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.formBadge,
                      result === 'W' && styles.formBadgeWin,
                      result === 'D' && styles.formBadgeDraw,
                      result === 'L' && styles.formBadgeLoss,
                    ]}
                  >
                    <Text style={styles.formBadgeText}>{result}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Club Facts */}
            <View style={styles.sectionCard}>
              <Text style={styles.cardHeaderTitle}>Club Information</Text>
              <View style={styles.infoLine}>
                <Text style={styles.infoKey}>Home Stadium</Text>
                <Text style={styles.infoVal}>{team.stadium}</Text>
              </View>
              <View style={styles.infoLine}>
                <Text style={styles.infoKey}>Country / Federation</Text>
                <Text style={styles.infoVal}>{team.country}</Text>
              </View>
              <View style={styles.infoLine}>
                <Text style={styles.infoKey}>Short Abbreviation</Text>
                <Text style={styles.infoVal}>{team.shortName}</Text>
              </View>
              <View style={styles.infoLine}>
                <Text style={styles.infoKey}>Status</Text>
                <Text style={styles.infoVal}>Active European Contender</Text>
              </View>
            </View>
          </View>
        )}

        {/* Fixtures Tab */}
        {activeTab === 'fixtures' && (
          <View style={styles.tabSection}>
            <View style={styles.sectionCard}>
              <Text style={styles.cardHeaderTitle}>Upcoming & Live Fixtures</Text>
              {fallbackFixtures.map(fixture => (
                <View key={fixture.id} style={{ marginBottom: 12 }}>
                  <UniversalMatchCard
                    match={fixture}
                    layout="full"
                    onPress={() => {
                      if (fixture.status === 'LIVE' || fixture.hasLiveBroadcast) {
                        navigate({
                          name: 'LiveStreamDetails',
                          params: { match: fixture },
                        });
                      } else {
                        navigate({
                          name: 'MatchDetails',
                          params: { matchup: fixture },
                        });
                      }
                    }}
                  />
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Squad Tab */}
        {activeTab === 'squad' && (
          <View style={styles.tabSection}>
            <View style={styles.sectionCard}>
              <Text style={styles.cardHeaderTitle}>First Team Roster</Text>
              {squadPlayers.map(player => (
                <View key={player.num} style={styles.squadRow}>
                  <View style={styles.squadNumPill}>
                    <Text style={styles.squadNumText}>{player.num}</Text>
                  </View>
                  <View style={styles.squadInfo}>
                    <Text style={styles.squadPlayerName}>{player.name}</Text>
                    <Text style={styles.squadPlayerNat}>{player.nat}</Text>
                  </View>
                  <Text style={styles.squadPosPill}>{player.pos}</Text>
                </View>
              ))}
            </View>
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
  followBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#7952FC',
  },
  followBtnActive: {
    backgroundColor: '#382565',
  },
  followBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  heroCard: {
    margin: 16,
    padding: 20,
    borderRadius: 18,
    backgroundColor: '#1E1730',
    alignItems: 'center',
  },
  crestContainer: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#181524',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  crestImage: {
    width: 56,
    height: 56,
    resizeMode: 'contain',
  },
  teamHeroName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'center',
  },
  teamHeroSubtitle: {
    fontSize: 12.5,
    fontWeight: '500',
    color: '#A098B5',
    marginBottom: 12,
    textAlign: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#A098B5',
    fontWeight: '500',
  },
  metaDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#7952FC',
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 14,
    backgroundColor: '#181524',
    borderRadius: 12,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 9,
  },
  tabButtonActive: {
    backgroundColor: '#2A2045',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#A098B5',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  tabSection: {
    paddingHorizontal: 16,
    gap: 12,
  },
  sectionCard: {
    backgroundColor: '#1E1730',
    borderRadius: 16,
    padding: 16,
  },
  cardHeaderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  formGuideRow: {
    flexDirection: 'row',
    gap: 10,
  },
  formBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formBadgeWin: {
    backgroundColor: '#22C55E',
  },
  formBadgeDraw: {
    backgroundColor: '#F8BE38',
  },
  formBadgeLoss: {
    backgroundColor: '#EF4444',
  },
  formBadgeText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  infoLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#181524',
  },
  infoKey: {
    fontSize: 12.5,
    color: '#A098B5',
  },
  infoVal: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  fixtureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#181524',
  },
  fixtureMetaLeft: {
    flex: 1,
  },
  fixtureCompName: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#7952FC',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  fixtureVersusText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  fixtureDateText: {
    fontSize: 11,
    color: '#A098B5',
  },
  fixtureRightArrow: {
    paddingLeft: 8,
  },
  squadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#181524',
  },
  squadNumPill: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: '#2A2045',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  squadNumText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7952FC',
  },
  squadInfo: {
    flex: 1,
  },
  squadPlayerName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  squadPlayerNat: {
    fontSize: 11,
    color: '#A098B5',
  },
  squadPosPill: {
    fontSize: 11,
    color: '#A098B5',
    fontWeight: '600',
  },
});
