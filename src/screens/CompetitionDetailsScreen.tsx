import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import {
  Check,
  Plus,
  Trophy,
  Globe,
  Calendar,
  ChevronRight,
  Shield,
  Clock,
  Sparkles,
} from 'lucide-react-native';
import Colors from '../theme/colors';
import { SecondaryScreenHeader } from '../components/common/SecondaryScreenHeader';
import { CompetitionLogo } from '../components/common/CompetitionLogo';
import {
  DiscoverCompetition,
  PopularLeague,
  UPCOMING_HIGHLIGHTS,
} from '../constants/discoverData';
import { getCompetitionStandings, StandingsRow } from '../constants/standingsData';
import { getTeamCrest } from '../utils/teamCrestResolver';
import { useProfile } from '../hooks/useProfile';
import { useAppNavigation } from '../navigation/NavigationContext';

interface CompetitionDetailsScreenProps {
  competition: DiscoverCompetition | PopularLeague;
}

type CompTab = 'overview' | 'matches' | 'standings';

export const CompetitionDetailsScreen: React.FC<CompetitionDetailsScreenProps> = ({
  competition,
}) => {
  const { navigate } = useAppNavigation();
  const { profile, toggleFollowLeague } = useProfile();
  const [activeTab, setActiveTab] = useState<CompTab>('overview');

  const isFollowed = profile.followedLeagueIds.includes(competition.id);

  // Region / Season fields
  const region = 'region' in competition ? competition.region : competition.country;
  const season = 'season' in competition ? competition.season : '2024/25 Season';
  const teamsCount = 'teamsCount' in competition ? competition.teamsCount : 20;

  // Filter relevant fixtures
  const compFixtures = UPCOMING_HIGHLIGHTS.filter(
    m =>
      m.competition.toLowerCase().includes(competition.name.toLowerCase()) ||
      competition.name.toLowerCase().includes(m.competition.toLowerCase())
  );
  const displayFixtures = compFixtures.length > 0 ? compFixtures : UPCOMING_HIGHLIGHTS.slice(0, 4);

  // Dynamic League Standings with crests, W, D, L, GD, PTS
  const standings = useMemo(() => getCompetitionStandings(competition.id), [competition.id]);

  return (
    <View style={styles.root}>
      {/* ── TOP APP BAR ── */}
      <SecondaryScreenHeader
        title={competition.name}
        subtitle={`${region} • ${season}`}
        rightAction={{
          icon: isFollowed ? Check : Plus,
          onPress: () => toggleFollowLeague(competition.id),
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
        {/* ── TOURNAMENT IDENTITY HERO CARD ── */}
        <View style={styles.heroCard}>
          <CompetitionLogo
            uri={competition.logoUrl}
            competitionId={competition.id}
            size={72}
            containerStyle={{ marginBottom: 14 }}
          />

          <Text style={styles.heroTitle}>{competition.name}</Text>
          <Text style={styles.heroSubtitle}>{season}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Globe size={13} color="#A098B5" strokeWidth={2} />
              <Text style={styles.metaText}>{region}</Text>
            </View>
            <View style={styles.metaDot} />
            <View style={styles.metaItem}>
              <Trophy size={13} color="#A098B5" strokeWidth={2} />
              <Text style={styles.metaText}>{teamsCount} Clubs</Text>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.followBtn, isFollowed && styles.followBtnActive]}
            onPress={() => toggleFollowLeague(competition.id)}
          >
            {isFollowed ? (
              <>
                <Check size={14} color="#FFFFFF" strokeWidth={2.5} />
                <Text style={styles.followBtnText}>Following Competition</Text>
              </>
            ) : (
              <>
                <Plus size={14} color="#FFFFFF" strokeWidth={2.5} />
                <Text style={styles.followBtnText}>Follow Competition</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* ── TABS BAR ── */}
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
            style={[styles.tabButton, activeTab === 'matches' && styles.tabButtonActive]}
            onPress={() => setActiveTab('matches')}
          >
            <Text style={[styles.tabText, activeTab === 'matches' && styles.tabTextActive]}>
              Matches ({displayFixtures.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'standings' && styles.tabButtonActive]}
            onPress={() => setActiveTab('standings')}
          >
            <Text style={[styles.tabText, activeTab === 'standings' && styles.tabTextActive]}>
              Standings
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── TAB 1: OVERVIEW ── */}
        {activeTab === 'overview' && (
          <View style={styles.tabSection}>
            {/* Upcoming Marquee Fixture */}
            <View style={styles.sectionCard}>
              <Text style={styles.cardHeaderTitle}>Featured Match</Text>
              {displayFixtures[0] && (
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.featuredMatchItem}
                  onPress={() => {
                    navigate({
                      name: 'MatchDetails',
                      params: { matchup: displayFixtures[0] },
                    });
                  }}
                >
                  <View style={styles.featuredMatchTeamsRow}>
                    <Text style={styles.featuredMatchTeamName}>{displayFixtures[0].homeTeam.name}</Text>
                    <View style={styles.vsBadge}>
                      <Text style={styles.vsBadgeText}>VS</Text>
                    </View>
                    <Text style={styles.featuredMatchTeamName}>{displayFixtures[0].awayTeam.name}</Text>
                  </View>
                  <Text style={styles.featuredMatchSub}>
                    {displayFixtures[0].kickoffDate} • {displayFixtures[0].kickoffTime} • {displayFixtures[0].venue}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Tournament Specs */}
            <View style={styles.sectionCard}>
              <Text style={styles.cardHeaderTitle}>Tournament Information</Text>
              <View style={styles.infoLine}>
                <Text style={styles.infoKey}>Official Tournament</Text>
                <Text style={styles.infoVal}>{competition.name}</Text>
              </View>
              <View style={styles.infoLine}>
                <Text style={styles.infoKey}>Territory / Country</Text>
                <Text style={styles.infoVal}>{competition.country}</Text>
              </View>
              <View style={styles.infoLine}>
                <Text style={styles.infoKey}>Current Season</Text>
                <Text style={styles.infoVal}>{season}</Text>
              </View>
              <View style={styles.infoLine}>
                <Text style={styles.infoKey}>Active Clubs</Text>
                <Text style={styles.infoVal}>{teamsCount} Participating Clubs</Text>
              </View>
              <View style={styles.infoLine}>
                <Text style={styles.infoKey}>Authorized Broadcast</Text>
                <Text style={styles.infoVal}>BALLIVE Full HD Satellite</Text>
              </View>
            </View>
          </View>
        )}

        {/* ── TAB 2: MATCHES ── */}
        {activeTab === 'matches' && (
          <View style={styles.tabSection}>
            <View style={styles.sectionCard}>
              <Text style={styles.cardHeaderTitle}>Fixtures & Matchdays</Text>
              {displayFixtures.map(fixture => (
                <TouchableOpacity
                  key={fixture.id}
                  activeOpacity={0.8}
                  style={styles.fixtureItem}
                  onPress={() => {
                    navigate({
                      name: 'MatchDetails',
                      params: { matchup: fixture },
                    });
                  }}
                >
                  <View style={styles.fixtureMetaLeft}>
                    <Text style={styles.fixtureVersusText} numberOfLines={1}>
                      {fixture.homeTeam.name} vs {fixture.awayTeam.name}
                    </Text>
                    <Text style={styles.fixtureDateText}>
                      {fixture.kickoffDate} • {fixture.kickoffTime} • {fixture.venue}
                    </Text>
                  </View>

                  <View style={styles.fixtureRightArrow}>
                    <ChevronRight size={18} color="#7952FC" strokeWidth={2.4} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* ── TAB 3: STANDINGS ── */}
        {activeTab === 'standings' && (
          <View style={styles.tabSection}>
            <View style={styles.sectionCard}>
              <View style={styles.tableHeaderSection}>
                <Text style={styles.cardHeaderTitle}>League Table</Text>
                <Text style={styles.seasonBadgeLabel}>{season}</Text>
              </View>

              {/* Table Header */}
              <View style={styles.tableHeaderRow}>
                <Text style={[styles.tableColHeader, styles.colPos]}>#</Text>
                <Text style={[styles.tableColHeader, styles.colTeam]}>Club</Text>
                <Text style={[styles.tableColHeader, styles.colStat]}>P</Text>
                <Text style={[styles.tableColHeader, styles.colStat]}>W</Text>
                <Text style={[styles.tableColHeader, styles.colStat]}>D</Text>
                <Text style={[styles.tableColHeader, styles.colStat]}>L</Text>
                <Text style={[styles.tableColHeader, styles.colGd]}>GD</Text>
                <Text style={[styles.tableColHeader, styles.colPts]}>PTS</Text>
              </View>

              {/* Rows */}
              {standings.map(row => (
                <TouchableOpacity
                  key={row.pos}
                  activeOpacity={0.8}
                  style={styles.tableDataRow}
                  onPress={() => {
                    navigate({
                      name: 'TeamDetails',
                      params: {
                        team: {
                          id: row.teamId,
                          name: row.team,
                          shortName: row.team.substring(0, 3).toUpperCase(),
                          country: competition.country,
                          crestUrl: row.crestUrl,
                          stadium: 'Home Ground',
                          domesticTitle: 'Top Tier Football Club',
                        },
                      },
                    });
                  }}
                >
                  {/* Position with UCL / UEL spot bar indicator */}
                  <View style={styles.posCellBox}>
                    <View
                      style={[
                        styles.spotIndicatorDot,
                        row.zone === 'ucl' && styles.spotUcl,
                        row.zone === 'uel' && styles.spotUel,
                      ]}
                    />
                    <Text
                      style={[
                        styles.tableCellText,
                        styles.colPos,
                        row.pos <= 4 && styles.uclSpot,
                      ]}
                    >
                      {row.pos}
                    </Text>
                  </View>

                  {/* Club info: Crest + Name */}
                  <View style={styles.teamCellBox}>
                    <Image
                      source={{ uri: row.crestUrl }}
                      style={styles.standingsCrest}
                    />
                    <Text style={styles.tableCellTeam} numberOfLines={1}>
                      {row.team}
                    </Text>
                  </View>

                  {/* Stats */}
                  <Text style={[styles.tableCellText, styles.colStat]}>{row.p}</Text>
                  <Text style={[styles.tableCellText, styles.colStat]}>{row.w}</Text>
                  <Text style={[styles.tableCellText, styles.colStat]}>{row.d}</Text>
                  <Text style={[styles.tableCellText, styles.colStat]}>{row.l}</Text>
                  <Text style={[styles.tableCellText, styles.colGd]}>{row.gd}</Text>
                  <Text style={[styles.tableCellPts, styles.colPts]}>{row.pts}</Text>
                </TouchableOpacity>
              ))}

              {/* Table Footer Qualification Legend */}
              <View style={styles.tableFooterLegend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, styles.spotUcl]} />
                  <Text style={styles.legendText}>Champions League</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, styles.spotUel]} />
                  <Text style={styles.legendText}>Europa League</Text>
                </View>
              </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 28,
  },
  heroCard: {
    margin: 16,
    padding: 20,
    borderRadius: 18,
    backgroundColor: '#1E1730',
    alignItems: 'center',
  },
  emblemContainer: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#181524',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emblemImage: {
    width: 52,
    height: 52,
    resizeMode: 'contain',
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#A098B5',
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
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
  followBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: '#7952FC',
  },
  followBtnActive: {
    backgroundColor: '#352558',
  },
  followBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#FFFFFF',
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
  featuredMatchItem: {
    backgroundColor: '#2A2045',
    padding: 14,
    borderRadius: 14,
  },
  featuredMatchTeamsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  featuredMatchTeamName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  vsBadge: {
    backgroundColor: '#181524',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  vsBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#7952FC',
  },
  featuredMatchSub: {
    fontSize: 11,
    color: '#A098B5',
    textAlign: 'center',
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
  tableHeaderSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  seasonBadgeLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7952FC',
    backgroundColor: '#2A2045',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2045',
    marginBottom: 4,
  },
  tableColHeader: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#A098B5',
    textAlign: 'center',
  },
  tableDataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#181524',
  },
  posCellBox: {
    width: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spotIndicatorDot: {
    width: 3,
    height: 12,
    borderRadius: 1.5,
    backgroundColor: 'transparent',
    marginRight: 2,
  },
  spotUcl: {
    backgroundColor: '#38BDF8',
  },
  spotUel: {
    backgroundColor: '#F8BE38',
  },
  colPos: {
    fontSize: 11,
    textAlign: 'center',
  },
  uclSpot: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  colTeam: {
    flex: 1,
    paddingLeft: 8,
  },
  teamCellBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 6,
    paddingLeft: 4,
  },
  standingsCrest: {
    width: 18,
    height: 18,
    resizeMode: 'contain',
    marginRight: 7,
  },
  tableCellTeam: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  colStat: {
    width: 20,
    textAlign: 'center',
  },
  colGd: {
    width: 26,
    textAlign: 'center',
  },
  colPts: {
    width: 30,
    textAlign: 'center',
  },
  tableCellText: {
    fontSize: 11,
    color: '#A098B5',
    textAlign: 'center',
  },
  tableCellPts: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  tableFooterLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#261C3D',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  legendText: {
    fontSize: 10.5,
    color: '#A098B5',
    fontWeight: '500',
  },
});
