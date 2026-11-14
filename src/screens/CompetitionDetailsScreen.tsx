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
import { UniversalMatchCard } from '../components/common/UniversalMatchCard';
import { MMAFightCard } from '../components/common/MMAFightCard';
import {
  DiscoverCompetition,
  PopularLeague,
  DiscoverMatchup,
  UPCOMING_HIGHLIGHTS,
} from '../constants/discoverData';
import { getCompetitionStandings, StandingsRow } from '../constants/standingsData';
import { getTeamCrest } from '../utils/teamCrestResolver';
import { useProfile } from '../hooks/useProfile';
import { useAppNavigation } from '../navigation/NavigationContext';

import {
  sportsApiService,
  NbaStandingsRow,
  NbaStandingsResult,
  UfcDivisionRankings,
  UfcRankItem,
} from '../services/sportsApiService';

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

  // Derive sport type
  const compSport = ('sport' in competition ? competition.sport : undefined) || (
    competition.id.includes('nba') || competition.name.toLowerCase().includes('nba') ? 'basketball' :
    competition.id.includes('nhl') || competition.name.toLowerCase().includes('nhl') ? 'hockey' :
    competition.id.includes('ufc') || competition.name.toLowerCase().includes('ufc') || competition.name.toLowerCase().includes('mma') || competition.name.toLowerCase().includes('wwe') || competition.name.toLowerCase().includes('boxing') ? 'mma' :
    competition.id.includes('nfl') || competition.name.toLowerCase().includes('nfl') ? 'american_football' :
    competition.id.includes('f1') || competition.id.includes('motorsport') || competition.name.toLowerCase().includes('formula') ? 'motorsport' :
    competition.id.includes('tennis') || competition.name.toLowerCase().includes('tennis') ? 'tennis' :
    competition.id.includes('cricket') || competition.name.toLowerCase().includes('cricket') ? 'cricket' :
    'soccer'
  );

  const isCombat = compSport === 'mma';
  const isBasketball = compSport === 'basketball';
  const isHockey = compSport === 'hockey';
  const isAmericanFootball = compSport === 'american_football';
  const isMotorsport = compSport === 'motorsport';
  const isTennis = compSport === 'tennis';

  // Combat Pound-for-Pound Rankings
  const combatRankings = [
    { rank: 'C', name: 'Islam Makhachev', division: 'Lightweight Champion', record: '27-1-0', country: 'Dagestan', p4p: '#1 P4P', avatar: 'https://a.espncdn.com/combiner/i?img=/i/headshots/mma/players/full/3929452.png&w=120&h=120' },
    { rank: 'C', name: 'Jon Jones', division: 'Heavyweight Champion', record: '28-1-0', country: 'United States', p4p: '#2 P4P', avatar: 'https://a.espncdn.com/combiner/i?img=/i/headshots/mma/players/full/2335639.png&w=120&h=120' },
    { rank: 'C', name: 'Alex Pereira', division: 'Light Heavyweight Champion', record: '12-2-0', country: 'Brazil', p4p: '#3 P4P', avatar: 'https://a.espncdn.com/combiner/i?img=/i/headshots/mma/players/full/4898132.png&w=120&h=120' },
    { rank: 'C', name: 'Ilia Topuria', division: 'Featherweight Champion', record: '16-0-0', country: 'Georgia / Spain', p4p: '#4 P4P', avatar: 'https://a.espncdn.com/combiner/i?img=/i/headshots/mma/players/full/4687352.png&w=120&h=120' },
    { rank: 'C', name: 'Dricus du Plessis', division: 'Middleweight Champion', record: '22-2-0', country: 'South Africa', p4p: '#5 P4P', avatar: 'https://a.espncdn.com/combiner/i?img=/i/headshots/mma/players/full/4285640.png&w=120&h=120' },
    { rank: 'C', name: 'Belal Muhammad', division: 'Welterweight Champion', record: '24-3-0', country: 'United States', p4p: '#6 P4P', avatar: 'https://a.espncdn.com/combiner/i?img=/i/headshots/mma/players/full/3153832.png&w=120&h=120' },
    { rank: 'C', name: 'Merab Dvalishvili', division: 'Bantamweight Champion', record: '18-4-0', country: 'Georgia', p4p: '#7 P4P', avatar: 'https://a.espncdn.com/combiner/i?img=/i/headshots/mma/players/full/4271427.png&w=120&h=120' },
    { rank: 'C', name: 'Alexandre Pantoja', division: 'Flyweight Champion', record: '28-5-0', country: 'Brazil', p4p: '#8 P4P', avatar: 'https://a.espncdn.com/combiner/i?img=/i/headshots/mma/players/full/3028213.png&w=120&h=120' },
    { rank: 'C', name: 'Tom Aspinall', division: 'Interim Heavyweight Champion', record: '15-3-0', country: 'United Kingdom', p4p: '#9 P4P', avatar: 'https://a.espncdn.com/combiner/i?img=/i/headshots/mma/players/full/4684752.png&w=120&h=120' },
    { rank: 'C', name: 'Max Holloway', division: 'BMF Champion', record: '26-8-0', country: 'United States', p4p: '#10 P4P', avatar: 'https://a.espncdn.com/combiner/i?img=/i/headshots/mma/players/full/2614933.png&w=120&h=120' },
  ];

  // F1 Drivers Championship
  const f1Drivers = [
    { pos: 1, driver: 'Max Verstappen', team: 'Red Bull Racing', points: 437, wins: 9, avatar: 'https://a.espncdn.com/combiner/i?img=/i/headshots/rpm/players/full/4665.png&w=120&h=120' },
    { pos: 2, driver: 'Lando Norris', team: 'McLaren', points: 374, wins: 4, avatar: 'https://a.espncdn.com/combiner/i?img=/i/headshots/rpm/players/full/5548.png&w=120&h=120' },
    { pos: 3, driver: 'Charles Leclerc', team: 'Ferrari', points: 356, wins: 3, avatar: 'https://a.espncdn.com/combiner/i?img=/i/headshots/rpm/players/full/4699.png&w=120&h=120' },
    { pos: 4, driver: 'Oscar Piastri', team: 'McLaren', points: 292, wins: 2, avatar: 'https://a.espncdn.com/combiner/i?img=/i/headshots/rpm/players/full/5745.png&w=120&h=120' },
    { pos: 5, driver: 'Carlos Sainz', team: 'Ferrari', points: 290, wins: 2, avatar: 'https://a.espncdn.com/combiner/i?img=/i/headshots/rpm/players/full/4698.png&w=120&h=120' },
    { pos: 6, driver: 'George Russell', team: 'Mercedes', points: 245, wins: 2, avatar: 'https://a.espncdn.com/combiner/i?img=/i/headshots/rpm/players/full/5547.png&w=120&h=120' },
    { pos: 7, driver: 'Lewis Hamilton', team: 'Ferrari', points: 223, wins: 2, avatar: 'https://a.espncdn.com/combiner/i?img=/i/headshots/rpm/players/full/868.png&w=120&h=120' },
    { pos: 8, driver: 'Sergio Perez', team: 'Red Bull Racing', points: 152, wins: 0, avatar: 'https://a.espncdn.com/combiner/i?img=/i/headshots/rpm/players/full/4472.png&w=120&h=120' },
  ];

  // F1 Constructors Championship
  const f1Constructors = [
    { pos: 1, team: 'McLaren', engine: 'Mercedes', points: 666, wins: 6, logo: 'https://a.espncdn.com/i/teamlogos/rpm/500/scoreboard/mclaren.png' },
    { pos: 2, team: 'Ferrari', engine: 'Ferrari', points: 652, wins: 5, logo: 'https://a.espncdn.com/i/teamlogos/rpm/500/scoreboard/ferrari.png' },
    { pos: 3, team: 'Red Bull Racing', engine: 'Honda RBPT', points: 589, wins: 9, logo: 'https://a.espncdn.com/i/teamlogos/rpm/500/scoreboard/red_bull.png' },
    { pos: 4, team: 'Mercedes-AMG', engine: 'Mercedes', points: 468, wins: 4, logo: 'https://a.espncdn.com/i/teamlogos/rpm/500/scoreboard/mercedes.png' },
    { pos: 5, team: 'Aston Martin', engine: 'Mercedes', points: 94, wins: 0, logo: 'https://a.espncdn.com/i/teamlogos/rpm/500/scoreboard/aston_martin.png' },
    { pos: 6, team: 'Alpine', engine: 'Renault', points: 65, wins: 0, logo: 'https://a.espncdn.com/i/teamlogos/rpm/500/scoreboard/alpine.png' },
  ];

  // Tennis Rankings
  const tennisRankings = [
    { pos: 1, player: 'Jannik Sinner', country: 'Italy', points: '11,830 pts', titles: 8, avatar: 'https://a.espncdn.com/combiner/i?img=/i/headshots/tennis/players/full/5123.png&w=120&h=120' },
    { pos: 2, player: 'Alexander Zverev', country: 'Germany', points: '7,915 pts', titles: 2, avatar: 'https://a.espncdn.com/combiner/i?img=/i/headshots/tennis/players/full/4143.png&w=120&h=120' },
    { pos: 3, player: 'Carlos Alcaraz', country: 'Spain', points: '7,010 pts', titles: 4, avatar: 'https://a.espncdn.com/combiner/i?img=/i/headshots/tennis/players/full/5258.png&w=120&h=120' },
    { pos: 4, player: 'Taylor Fritz', country: 'USA', points: '5,100 pts', titles: 2, avatar: 'https://a.espncdn.com/combiner/i?img=/i/headshots/tennis/players/full/4541.png&w=120&h=120' },
    { pos: 5, player: 'Daniil Medvedev', country: 'Global', points: '5,030 pts', titles: 0, avatar: 'https://a.espncdn.com/combiner/i?img=/i/headshots/tennis/players/full/4351.png&w=120&h=120' },
    { pos: 6, player: 'Novak Djokovic', country: 'Serbia', points: '3,910 pts', titles: 1, avatar: 'https://a.espncdn.com/combiner/i?img=/i/headshots/tennis/players/full/299.png&w=120&h=120' },
  ];

  // Region / Season fields
  const region = 'region' in competition ? competition.region : competition.country;
  const season = 'season' in competition ? competition.season : '2024/25 Season';
  const teamsCount = 'teamsCount' in competition ? competition.teamsCount : 20;

  // Filter fallback fixtures
  const compFixtures = useMemo((): DiscoverMatchup[] => {
    if (isMotorsport) {
      return [
        {
          id: 'f1-bahrain',
          competition: 'Formula 1',
          competitionLogo: 'https://a.espncdn.com/i/teamlogos/leagues/500/f1.png',
          status: 'UPCOMING',
          kickoffDate: 'Sun, 2 Mar',
          kickoffTime: '15:00 GMT',
          homeTeam: { id: 'team-f1-verstappen', name: 'Max Verstappen (Red Bull)', crestUrl: 'https://a.espncdn.com/i/teamlogos/rpm/500/scoreboard/red_bull.png', score: 0 },
          awayTeam: { id: 'team-f1-norris', name: 'Lando Norris (McLaren)', crestUrl: 'https://a.espncdn.com/i/teamlogos/rpm/500/scoreboard/mclaren.png', score: 0 },
          venue: 'Bahrain International Circuit, Sakhir',
          hasLiveBroadcast: true,
          sport: 'motorsport',
        },
        {
          id: 'f1-saudi',
          competition: 'Formula 1',
          competitionLogo: 'https://a.espncdn.com/i/teamlogos/leagues/500/f1.png',
          status: 'UPCOMING',
          kickoffDate: 'Sun, 9 Mar',
          kickoffTime: '17:00 GMT',
          homeTeam: { id: 'team-f1-leclerc', name: 'Charles Leclerc (Ferrari)', crestUrl: 'https://a.espncdn.com/i/teamlogos/rpm/500/scoreboard/ferrari.png', score: 0 },
          awayTeam: { id: 'team-f1-hamilton', name: 'Lewis Hamilton (Ferrari)', crestUrl: 'https://a.espncdn.com/i/teamlogos/rpm/500/scoreboard/ferrari.png', score: 0 },
          venue: 'Jeddah Corniche Circuit, Saudi Arabia',
          hasLiveBroadcast: true,
          sport: 'motorsport',
        },
      ];
    }
    if (isCombat) {
      return [
        {
          id: 'ufc-main-event',
          competition: 'UFC 312',
          competitionLogo: 'https://a.espncdn.com/i/teamlogos/leagues/500/ufc.png',
          status: 'UPCOMING',
          kickoffDate: 'Sat, 15 Mar',
          kickoffTime: '22:00 EST',
          homeTeam: { id: 'team-makhachev', name: 'Islam Makhachev (C)', crestUrl: 'https://a.espncdn.com/combiner/i?img=/i/headshots/mma/players/full/3929452.png&w=120&h=120', score: 0 },
          awayTeam: { id: 'team-tsarukyan', name: 'Arman Tsarukyan (#1)', crestUrl: 'https://a.espncdn.com/combiner/i?img=/i/headshots/mma/players/full/4414441.png&w=120&h=120', score: 0 },
          venue: 'T-Mobile Arena, Las Vegas',
          hasLiveBroadcast: true,
          sport: 'mma',
        },
        {
          id: 'ufc-co-main',
          competition: 'UFC 312',
          competitionLogo: 'https://a.espncdn.com/i/teamlogos/leagues/500/ufc.png',
          status: 'UPCOMING',
          kickoffDate: 'Sat, 15 Mar',
          kickoffTime: '21:30 EST',
          homeTeam: { id: 'team-pereira', name: 'Alex Pereira (C)', crestUrl: 'https://a.espncdn.com/combiner/i?img=/i/headshots/mma/players/full/4898132.png&w=120&h=120', score: 0 },
          awayTeam: { id: 'team-ankalaev', name: 'Magomed Ankalaev (#1)', crestUrl: 'https://a.espncdn.com/combiner/i?img=/i/headshots/mma/players/full/4285641.png&w=120&h=120', score: 0 },
          venue: 'T-Mobile Arena, Las Vegas',
          hasLiveBroadcast: true,
          sport: 'mma',
        },
      ];
    }
    if (isTennis) {
      return [
        {
          id: 'tennis-final-1',
          competition: 'ATP Masters 1000',
          competitionLogo: 'https://a.espncdn.com/i/teamlogos/leagues/500/tennis.png',
          status: 'UPCOMING',
          kickoffDate: 'Sun, 23 Mar',
          kickoffTime: '19:00 GMT',
          homeTeam: { id: 'team-sinner', name: 'Jannik Sinner (#1)', crestUrl: 'https://a.espncdn.com/combiner/i?img=/i/headshots/tennis/players/full/5123.png&w=120&h=120', score: 0 },
          awayTeam: { id: 'team-alcaraz', name: 'Carlos Alcaraz (#3)', crestUrl: 'https://a.espncdn.com/combiner/i?img=/i/headshots/tennis/players/full/5258.png&w=120&h=120', score: 0 },
          venue: 'Indian Wells Tennis Garden',
          hasLiveBroadcast: true,
          sport: 'tennis',
        },
      ];
    }
    return UPCOMING_HIGHLIGHTS.filter(
      m =>
        (m.competition.toLowerCase().includes(competition.name.toLowerCase()) ||
        competition.name.toLowerCase().includes(m.competition.toLowerCase())) &&
        (m.sport === compSport || (!m.sport && compSport === 'soccer'))
    );
  }, [isMotorsport, isCombat, isTennis, compSport, competition.name]);

  // Dynamic Real Competition Fixtures via sportsApiService
  const [fixtures, setFixtures] = useState<DiscoverMatchup[]>([]);
  const [isLoadingFixtures, setIsLoadingFixtures] = useState(false);

  React.useEffect(() => {
    let isMounted = true;
    setIsLoadingFixtures(true);
    sportsApiService.getCompetitionFixtures(competition.id).then(rows => {
      if (isMounted && rows && rows.length > 0) {
        setFixtures(rows);
      }
    }).catch(() => {}).finally(() => {
      if (isMounted) setIsLoadingFixtures(false);
    });
    return () => { isMounted = false; };
  }, [competition.id]);

  const displayFixtures = fixtures.length > 0 ? fixtures : compFixtures;

  // Dynamic League Standings with crests, W, D, L, GD, PTS
  const [standings, setStandings] = useState<StandingsRow[]>(() => getCompetitionStandings(competition.id));

  React.useEffect(() => {
    let isMounted = true;
    sportsApiService.getStandings(competition.id).then(liveRows => {
      if (isMounted && liveRows && liveRows.length > 0) {
        setStandings(liveRows);
      }
    }).catch(() => {});
    return () => { isMounted = false; };
  }, [competition.id]);

  // Dynamic NBA Conference Standings
  const [nbaStandings, setNbaStandings] = useState<NbaStandingsResult>({ eastern: [], western: [] });
  const [selectedConference, setSelectedConference] = useState<'Eastern' | 'Western'>('Eastern');
  const [isLoadingNba, setIsLoadingNba] = useState(false);

  React.useEffect(() => {
    if (!isBasketball) return;
    let isMounted = true;
    setIsLoadingNba(true);
    sportsApiService.getNbaStandings().then(res => {
      if (isMounted && (res.eastern.length > 0 || res.western.length > 0)) {
        setNbaStandings(res);
      }
    }).catch(() => {}).finally(() => {
      if (isMounted) setIsLoadingNba(false);
    });
    return () => { isMounted = false; };
  }, [isBasketball]);

  // Dynamic UFC Division Rankings
  const [ufcRankings, setUfcRankings] = useState<UfcDivisionRankings[]>([]);
  const [selectedUfcDivision, setSelectedUfcDivision] = useState<string>('p4p');
  const [isLoadingUfc, setIsLoadingUfc] = useState(false);

  React.useEffect(() => {
    if (!isCombat) return;
    let isMounted = true;
    setIsLoadingUfc(true);
    sportsApiService.getUfcRankings().then(res => {
      if (isMounted && res.length > 0) {
        setUfcRankings(res);
        if (!selectedUfcDivision || !res.find(d => d.id === selectedUfcDivision)) {
          setSelectedUfcDivision(res[0].id);
        }
      }
    }).catch(() => {}).finally(() => {
      if (isMounted) setIsLoadingUfc(false);
    });
    return () => { isMounted = false; };
  }, [isCombat]);

  const activeUfcDivision = useMemo(() => {
    if (ufcRankings.length > 0) {
      return ufcRankings.find(d => d.id === selectedUfcDivision) || ufcRankings[0];
    }
    return null;
  }, [ufcRankings, selectedUfcDivision]);

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
              <Text style={styles.metaText}>
                {isCombat ? `${teamsCount} Contenders` : isBasketball || isHockey ? `${teamsCount} Franchises` : `${teamsCount} Clubs`}
              </Text>
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
              {isCombat ? `Fight Card (${displayFixtures.length})` : isMotorsport ? `Grand Prix (${displayFixtures.length})` : isTennis ? `Draws (${displayFixtures.length})` : `Matches (${displayFixtures.length})`}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'standings' && styles.tabButtonActive]}
            onPress={() => setActiveTab('standings')}
          >
            <Text style={[styles.tabText, activeTab === 'standings' && styles.tabTextActive]}>
              {isCombat ? 'Rankings' : isMotorsport ? 'Championship' : isTennis ? 'Rankings' : isBasketball ? 'Conference' : isHockey ? 'Divisions' : isAmericanFootball ? 'Divisions' : 'Standings'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── TAB 1: OVERVIEW ── */}
        {activeTab === 'overview' && (
          <View style={styles.tabSection}>
            {/* Upcoming Marquee Fixture */}
            <View style={styles.sectionCard}>
              <Text style={styles.cardHeaderTitle}>{isCombat ? 'Main Event' : 'Featured Match'}</Text>
              {displayFixtures[0] && (
                isCombat ? (
                  <MMAFightCard
                    match={displayFixtures[0]}
                    onPress={() => {
                      const isLive =
                        displayFixtures[0].status === 'LIVE' ||
                        (displayFixtures[0].minute !== undefined && displayFixtures[0].minute > 0) ||
                        Boolean(displayFixtures[0].isLive) ||
                        Boolean(displayFixtures[0].hasLiveBroadcast || displayFixtures[0].streamUrl);

                      if (isLive) {
                        navigate({
                          name: 'LiveStreamDetails',
                          params: { match: displayFixtures[0] },
                        });
                      } else {
                        navigate({
                          name: 'MatchDetails',
                          params: { matchup: displayFixtures[0] },
                        });
                      }
                    }}
                  />
                ) : (
                  <UniversalMatchCard
                    match={displayFixtures[0]}
                    layout="featured"
                    onPress={() => {
                      const isLive =
                        displayFixtures[0].status === 'LIVE' ||
                        (displayFixtures[0].minute !== undefined && displayFixtures[0].minute > 0) ||
                        Boolean(displayFixtures[0].isLive) ||
                        Boolean(displayFixtures[0].hasLiveBroadcast || displayFixtures[0].streamUrl);

                      if (isLive) {
                        navigate({
                          name: 'LiveStreamDetails',
                          params: { match: displayFixtures[0] },
                        });
                      } else {
                        navigate({
                          name: 'MatchDetails',
                          params: { matchup: displayFixtures[0] },
                        });
                      }
                    }}
                  />
                )
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
              <Text style={styles.cardHeaderTitle}>
                {isCombat ? 'Fight Card & Scheduled Bouts' : isMotorsport ? 'Grand Prix Schedule' : isTennis ? 'Tournament Draws' : 'Fixtures & Matchdays'}
              </Text>
              <View style={styles.fixturesList}>
                {displayFixtures.length === 0 ? (
                  <View style={{ paddingVertical: 24, alignItems: 'center' }}>
                    <Text style={{ color: '#A098B5', fontSize: 13, fontWeight: '600' }}>
                      {isLoadingFixtures ? 'Loading upcoming fixtures...' : 'No upcoming fixtures scheduled right now'}
                    </Text>
                  </View>
                ) : (
                  displayFixtures.map(fixture => (
                    <View key={fixture.id} style={{ marginBottom: 12 }}>
                      {isCombat ? (
                        <MMAFightCard
                          match={fixture}
                          onPress={() => {
                            const isLive =
                              fixture.status === 'LIVE' ||
                              (fixture.minute !== undefined && fixture.minute > 0) ||
                              Boolean(fixture.isLive) ||
                              Boolean(fixture.hasLiveBroadcast || fixture.streamUrl);

                            if (isLive) {
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
                      ) : (
                        <UniversalMatchCard
                          match={fixture}
                          layout="full"
                          onPress={() => {
                            const isLive =
                              fixture.status === 'LIVE' ||
                              (fixture.minute !== undefined && fixture.minute > 0) ||
                              Boolean(fixture.isLive) ||
                              Boolean(fixture.hasLiveBroadcast || fixture.streamUrl);

                            if (isLive) {
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
                      )}
                    </View>
                  ))
                )}
              </View>
            </View>
          </View>
        )}

        {/* ── TAB 3: STANDINGS / RANKINGS ── */}
        {activeTab === 'standings' && (
          <View style={styles.tabSection}>
            <View style={styles.sectionCard}>
              {isCombat ? (
                <>
                  <View style={styles.tableHeaderSection}>
                    <Text style={styles.cardHeaderTitle}>Official UFC Division Rankings</Text>
                    <Text style={styles.seasonBadgeLabel}>ESPN Open API</Text>
                  </View>

                  {/* Horizontal Division Selector */}
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.divisionPillList}
                    style={styles.divisionScroll}
                  >
                    {(ufcRankings.length > 0 ? ufcRankings : [
                      { id: 'p4p', division: "Men's P4P", fighters: [] },
                      { id: 'heavyweight', division: 'Heavyweight', fighters: [] },
                      { id: 'lightheavyweight', division: 'Light Heavyweight', fighters: [] },
                      { id: 'middleweight', division: 'Middleweight', fighters: [] },
                      { id: 'welterweight', division: 'Welterweight', fighters: [] },
                      { id: 'lightweight', division: 'Lightweight', fighters: [] },
                      { id: 'featherweight', division: 'Featherweight', fighters: [] },
                      { id: 'bantamweight', division: 'Bantamweight', fighters: [] },
                      { id: 'flyweight', division: 'Flyweight', fighters: [] },
                      { id: 'women_p4p', division: "Women's P4P", fighters: [] },
                    ]).map(div => {
                      const isActive = selectedUfcDivision === div.id;
                      return (
                        <TouchableOpacity
                          key={div.id}
                          activeOpacity={0.8}
                          style={[styles.divisionPill, isActive && styles.divisionPillActive]}
                          onPress={() => setSelectedUfcDivision(div.id)}
                        >
                          <Text style={[styles.divisionPillText, isActive && styles.divisionPillTextActive]}>
                            {div.division}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>

                  {isLoadingUfc ? (
                    <View style={{ paddingVertical: 24, alignItems: 'center' }}>
                      <Text style={{ color: '#A098B5', fontSize: 13, fontWeight: '600' }}>
                        Loading official UFC rankings...
                      </Text>
                    </View>
                  ) : (
                    <View style={{ gap: 4, marginTop: 10 }}>
                      {/* Active division fighters or fallback combatRankings (NO ROW NAVIGATION - informational only) */}
                      {(activeUfcDivision && activeUfcDivision.fighters.length > 0
                        ? activeUfcDivision.fighters
                        : combatRankings.map(c => ({
                            rank: c.rank,
                            name: c.name,
                            avatar: c.avatar,
                            record: c.record,
                            country: c.country,
                            isChampion: c.rank === 'C',
                            trend: c.p4p,
                          }))
                      ).map((fighter, idx) => (
                        <View key={`${fighter.name}-${idx}`} style={styles.fighterRankRow}>
                          <View style={fighter.isChampion || fighter.rank === 'C' ? styles.champRankBadge : styles.contenderRankBadge}>
                            <Text style={fighter.isChampion || fighter.rank === 'C' ? styles.champRankText : styles.contenderRankText}>
                              {fighter.rank}
                            </Text>
                          </View>
                          <Image
                            source={{ uri: fighter.avatar || 'https://a.espncdn.com/combiner/i?img=/i/headshots/mma/players/full/default.png&w=120&h=120' }}
                            style={styles.fighterAvatar}
                          />
                          <View style={styles.fighterMeta}>
                            <Text style={styles.fighterName} numberOfLines={1}>{fighter.name}</Text>
                            <Text style={styles.fighterDivision} numberOfLines={1}>
                              {fighter.country ? `${fighter.country} • ` : ''}{fighter.isChampion ? 'Undisputed Champion' : 'Official Contender'}
                            </Text>
                          </View>
                          <View style={styles.fighterRecordPill}>
                            <Text style={styles.fighterRecordText}>{fighter.record || 'Pro'}</Text>
                            {fighter.trend ? (
                              <Text style={{ fontSize: 9, color: '#A098B5', textAlign: 'right', marginTop: 1 }}>{fighter.trend}</Text>
                            ) : null}
                          </View>
                        </View>
                      ))}
                    </View>
                  )}
                </>
              ) : isBasketball ? (
                <>
                  <View style={styles.tableHeaderSection}>
                    <Text style={styles.cardHeaderTitle}>NBA Conference Standings</Text>
                    <Text style={styles.seasonBadgeLabel}>2024/25 Regular Season</Text>
                  </View>

                  {/* Conference Selector */}
                  <View style={styles.nbaConfToggleBar}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={[styles.nbaConfButton, selectedConference === 'Eastern' && styles.nbaConfButtonActive]}
                      onPress={() => setSelectedConference('Eastern')}
                    >
                      <Text style={[styles.nbaConfButtonText, selectedConference === 'Eastern' && styles.nbaConfButtonTextActive]}>
                        Eastern Conference
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={[styles.nbaConfButton, selectedConference === 'Western' && styles.nbaConfButtonActive]}
                      onPress={() => setSelectedConference('Western')}
                    >
                      <Text style={[styles.nbaConfButtonText, selectedConference === 'Western' && styles.nbaConfButtonTextActive]}>
                        Western Conference
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {isLoadingNba ? (
                    <View style={{ paddingVertical: 24, alignItems: 'center' }}>
                      <Text style={{ color: '#A098B5', fontSize: 13, fontWeight: '600' }}>
                        Loading official NBA standings...
                      </Text>
                    </View>
                  ) : (
                    <>
                      {/* NBA Table Header */}
                      <View style={styles.nbaTableHeaderRow}>
                        <Text style={[styles.tableColHeader, styles.nbaColSeed]}>#</Text>
                        <Text style={[styles.tableColHeader, styles.nbaColTeam]}>Team</Text>
                        <Text style={[styles.tableColHeader, styles.nbaColStat]}>W</Text>
                        <Text style={[styles.tableColHeader, styles.nbaColStat]}>L</Text>
                        <Text style={[styles.tableColHeader, styles.nbaColPct]}>PCT</Text>
                        <Text style={[styles.tableColHeader, styles.nbaColGb]}>GB</Text>
                        <Text style={[styles.tableColHeader, styles.nbaColDiff]}>DIFF</Text>
                        <Text style={[styles.tableColHeader, styles.nbaColStrk]}>STRK</Text>
                      </View>

                      {/* NBA Table Rows (NO ROW NAVIGATION - informational only) */}
                      {(selectedConference === 'Eastern' ? nbaStandings.eastern : nbaStandings.western).length > 0 ? (
                        (selectedConference === 'Eastern' ? nbaStandings.eastern : nbaStandings.western).map(row => {
                          const isTop6 = row.pos <= 6;
                          const isPlayIn = row.pos > 6 && row.pos <= 10;
                          const diffNum = parseFloat(row.diff);
                          const isPositiveDiff = !isNaN(diffNum) && diffNum > 0;

                          return (
                            <View key={row.teamId || `${row.team}-${row.pos}`} style={styles.nbaDataRow}>
                              {/* Seed with Playoff/Play-In indicator dot */}
                              <View style={styles.nbaSeedCell}>
                                <View
                                  style={[
                                    styles.nbaZoneDot,
                                    isTop6 && styles.nbaZonePlayoff,
                                    isPlayIn && styles.nbaZonePlayIn,
                                  ]}
                                />
                                <Text
                                  style={[
                                    styles.nbaSeedText,
                                    isTop6 && styles.nbaSeedTop6,
                                  ]}
                                >
                                  {row.pos}
                                </Text>
                              </View>

                              {/* Team Crest + Name */}
                              <View style={styles.nbaTeamCell}>
                                <Image
                                  source={{ uri: row.crestUrl }}
                                  style={styles.nbaTeamCrest}
                                />
                                <Text style={styles.nbaTeamName} numberOfLines={1}>
                                  {row.team}
                                </Text>
                              </View>

                              {/* Non-wrapping Stats */}
                              <Text style={[styles.nbaStatText, styles.nbaColStat, { fontWeight: '700', color: '#FFFFFF' }]} numberOfLines={1}>
                                {row.w}
                              </Text>
                              <Text style={[styles.nbaStatText, styles.nbaColStat, { color: '#A098B5' }]} numberOfLines={1}>
                                {row.l}
                              </Text>
                              <Text style={[styles.nbaStatText, styles.nbaColPct, { fontWeight: '600', color: '#ECE9FA' }]} numberOfLines={1}>
                                {row.pct}
                              </Text>
                              <Text style={[styles.nbaStatText, styles.nbaColGb, { color: '#A098B5' }]} numberOfLines={1}>
                                {row.gb}
                              </Text>
                              <Text
                                style={[
                                  styles.nbaStatText,
                                  styles.nbaColDiff,
                                  {
                                    color: isPositiveDiff ? '#10B981' : (diffNum < 0 ? '#EF4444' : '#A098B5'),
                                    fontWeight: '700',
                                  },
                                ]}
                                numberOfLines={1}
                              >
                                {row.diff}
                              </Text>
                              <Text style={[styles.nbaStatText, styles.nbaColStrk, { color: '#C4B5FD', fontSize: 10 }]} numberOfLines={1}>
                                {row.streak || '-'}
                              </Text>
                            </View>
                          );
                        })
                      ) : (
                        <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                          <Text style={{ color: '#A098B5', fontSize: 12 }}>
                            Standings data updating...
                          </Text>
                        </View>
                      )}

                      {/* NBA Qualification Legend */}
                      <View style={styles.tableFooterLegend}>
                        <View style={styles.legendItem}>
                          <View style={[styles.legendDot, styles.nbaZonePlayoff]} />
                          <Text style={styles.legendText}>Playoff Berth (1-6)</Text>
                        </View>
                        <View style={styles.legendItem}>
                          <View style={[styles.legendDot, styles.nbaZonePlayIn]} />
                          <Text style={styles.legendText}>Play-In Tournament (7-10)</Text>
                        </View>
                      </View>
                    </>
                  )}
                </>
              ) : isMotorsport ? (
                <>
                  <View style={styles.tableHeaderSection}>
                    <Text style={styles.cardHeaderTitle}>Driver Championship</Text>
                    <Text style={styles.seasonBadgeLabel}>2025 Season</Text>
                  </View>

                  <View style={{ gap: 6, marginTop: 8 }}>
                    {f1Drivers.map(d => (
                      <View key={d.pos} style={styles.tableDataRow}>
                        <Text style={[styles.tableCellText, styles.colPos, d.pos === 1 && { color: '#F59E0B', fontWeight: '800' }]}>{d.pos}</Text>
                        <Image source={{ uri: d.avatar }} style={styles.standingsCrest} />
                        <View style={{ flex: 1, paddingLeft: 4 }}>
                          <Text style={styles.tableCellTeam} numberOfLines={1}>{d.driver}</Text>
                          <Text style={{ color: '#A098B5', fontSize: 10 }} numberOfLines={1}>{d.team}</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end', minWidth: 64 }}>
                          <Text style={[styles.tableCellPts, { color: '#00E5FF' }]}>{d.points} PTS</Text>
                          <Text style={{ color: '#A098B5', fontSize: 9 }}>{d.wins} wins</Text>
                        </View>
                      </View>
                    ))}
                  </View>

                  <View style={[styles.tableHeaderSection, { marginTop: 20 }]}>
                    <Text style={styles.cardHeaderTitle}>Constructors Championship</Text>
                    <Text style={styles.seasonBadgeLabel}>Official Standings</Text>
                  </View>

                  <View style={{ gap: 6, marginTop: 8 }}>
                    {f1Constructors.map(c => (
                      <View key={c.pos} style={styles.tableDataRow}>
                        <Text style={[styles.tableCellText, styles.colPos, c.pos === 1 && { color: '#F59E0B', fontWeight: '800' }]}>{c.pos}</Text>
                        <Image source={{ uri: c.logo }} style={[styles.standingsCrest, { resizeMode: 'contain' }]} />
                        <View style={{ flex: 1, paddingLeft: 4 }}>
                          <Text style={styles.tableCellTeam} numberOfLines={1}>{c.team}</Text>
                          <Text style={{ color: '#A098B5', fontSize: 10 }} numberOfLines={1}>{c.engine}</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end', minWidth: 64 }}>
                          <Text style={[styles.tableCellPts, { color: '#00E5FF' }]}>{c.points} PTS</Text>
                          <Text style={{ color: '#A098B5', fontSize: 9 }}>{c.wins} wins</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </>
              ) : isTennis ? (
                <>
                  <View style={styles.tableHeaderSection}>
                    <Text style={styles.cardHeaderTitle}>ATP & WTA World Rankings</Text>
                    <Text style={styles.seasonBadgeLabel}>Tour Leaderboard</Text>
                  </View>

                  <View style={{ gap: 6, marginTop: 8 }}>
                    {tennisRankings.map(t => (
                      <View key={t.pos} style={styles.tableDataRow}>
                        <Text style={[styles.tableCellText, styles.colPos, t.pos === 1 && { color: '#10B981', fontWeight: '800' }]}>{t.pos}</Text>
                        <Image source={{ uri: t.avatar }} style={styles.standingsCrest} />
                        <View style={{ flex: 1, paddingLeft: 4 }}>
                          <Text style={styles.tableCellTeam} numberOfLines={1}>{t.player}</Text>
                          <Text style={{ color: '#A098B5', fontSize: 10 }}>{t.country}</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end', minWidth: 70 }}>
                          <Text style={[styles.tableCellPts, { color: '#10B981' }]}>{t.points}</Text>
                          <Text style={{ color: '#A098B5', fontSize: 9 }}>{t.titles} titles</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </>
              ) : standings.length === 0 ? (
                <View style={{ paddingVertical: 28, alignItems: 'center' }}>
                  <Text style={{ color: '#A098B5', fontSize: 13, fontWeight: '600' }}>
                    Loading official {competition.name} standings...
                  </Text>
                </View>
              ) : (
                <>
                  <View style={styles.tableHeaderSection}>
                    <Text style={styles.cardHeaderTitle}>
                      {isHockey ? 'Division Standings' : isAmericanFootball ? 'NFL Standings' : 'League Table'}
                    </Text>
                    <Text style={styles.seasonBadgeLabel}>{season}</Text>
                  </View>

                  {/* Table Header */}
                  <View style={styles.tableHeaderRow}>
                    <Text style={[styles.tableColHeader, styles.colPos]}>#</Text>
                    <Text style={[styles.tableColHeader, styles.colTeam]}>
                      {isHockey ? 'Team' : 'Club'}
                    </Text>
                    <Text style={[styles.tableColHeader, styles.colStat]}>
                      {isHockey ? 'GP' : 'P'}
                    </Text>
                    <Text style={[styles.tableColHeader, styles.colStat]}>W</Text>
                    {isHockey ? (
                      <Text style={[styles.tableColHeader, styles.colStat]}>L</Text>
                    ) : (
                      <Text style={[styles.tableColHeader, styles.colStat]}>D</Text>
                    )}
                    {isHockey ? (
                      <Text style={[styles.tableColHeader, styles.colStat]}>OTL</Text>
                    ) : (
                      <Text style={[styles.tableColHeader, styles.colStat]}>L</Text>
                    )}
                    <Text style={[styles.tableColHeader, styles.colGd]}>
                      {isHockey ? 'DIFF' : 'GD'}
                    </Text>
                    <Text style={[styles.tableColHeader, styles.colPts]}>PTS</Text>
                  </View>

                  {/* Rows (NO ROW NAVIGATION - informational only) */}
                  {standings.map(row => {
                    const diffStr = (parseInt(row.gd, 10) || 0) > 0 && !row.gd.startsWith('+') ? `+${row.gd}` : `${row.gd}`;

                    return (
                      <View
                        key={row.pos}
                        style={styles.tableDataRow}
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
                        {isHockey ? (
                          <Text style={[styles.tableCellText, styles.colStat]}>{row.l}</Text>
                        ) : (
                          <Text style={[styles.tableCellText, styles.colStat]}>{row.d}</Text>
                        )}
                        {isHockey ? (
                          <Text style={[styles.tableCellText, styles.colStat]}>{row.d}</Text>
                        ) : (
                          <Text style={[styles.tableCellText, styles.colStat]}>{row.l}</Text>
                        )}
                        <Text style={[styles.tableCellText, styles.colGd]}>{diffStr}</Text>
                        <Text style={[styles.tableCellPts, styles.colPts]}>{row.pts}</Text>
                      </View>
                    );
                  })}

                  {/* Table Footer Qualification Legend */}
                  <View style={styles.tableFooterLegend}>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendDot, styles.spotUcl]} />
                      <Text style={styles.legendText}>
                        {isHockey ? 'Playoff Berth (1-8)' : 'Champions League'}
                      </Text>
                    </View>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendDot, styles.spotUel]} />
                      <Text style={styles.legendText}>
                        {isHockey ? 'Wildcard Hunt' : 'Europa League'}
                      </Text>
                    </View>
                  </View>
                </>
              )}
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
  fixturesList: {
    gap: 12,
    marginTop: 6,
  },
  fixtureCard: {
    backgroundColor: '#181226',
    borderRadius: 16,
    padding: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fixtureHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  fixtureDatePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  fixtureDateText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#A098B5',
  },
  fixtureTimePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(121, 82, 252, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  fixtureTimePillText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#7952FC',
  },
  fixtureTeamsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  fixtureTeamCol: {
    flex: 1,
    alignItems: 'center',
  },
  fixtureCrestCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#261C3D',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  fixtureCrestImg: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  fixtureTeamName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  fixtureVsBox: {
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fixtureVsPill: {
    backgroundColor: '#2A2045',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 4,
  },
  fixtureVsLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#7952FC',
    letterSpacing: 0.5,
  },
  fixtureVenueText: {
    fontSize: 9.5,
    color: '#8A81A5',
    textAlign: 'center',
  },
  fixtureFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  fixtureWatchStreamLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#10B981',
  },
  fixtureArrowPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#7952FC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  fixtureArrowPillText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#FFFFFF',
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
  // ── Combat Rankings Styles ──
  fighterRankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#181524',
    gap: 10,
  },
  champRankBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#F8BE38',
    alignItems: 'center',
    justifyContent: 'center',
  },
  champRankText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#0E0D14',
  },
  contenderRankBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#2A2045',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contenderRankText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#A098B5',
  },
  fighterAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#2A2045',
  },
  fighterMeta: {
    flex: 1,
  },
  fighterName: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  fighterDivision: {
    fontSize: 11,
    color: '#A098B5',
    marginTop: 1,
  },
  fighterRecordPill: {
    backgroundColor: '#2A2045',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignItems: 'flex-end',
  },
  fighterRecordText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F8BE38',
  },
  // ── UFC Division Selector Styles ──
  divisionScroll: {
    marginBottom: 8,
  },
  divisionPillList: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  divisionPill: {
    backgroundColor: '#181524',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  divisionPillActive: {
    backgroundColor: '#7952FC',
    borderColor: '#7952FC',
  },
  divisionPillText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#A098B5',
  },
  divisionPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  // ── NBA Conference Standings Styles ──
  nbaConfToggleBar: {
    flexDirection: 'row',
    backgroundColor: '#181524',
    borderRadius: 12,
    padding: 4,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  nbaConfButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 9,
  },
  nbaConfButtonActive: {
    backgroundColor: '#7952FC',
  },
  nbaConfButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#A098B5',
  },
  nbaConfButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  nbaTableHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2045',
    marginBottom: 4,
  },
  nbaColSeed: {
    width: 24,
    textAlign: 'center',
  },
  nbaColTeam: {
    flex: 1,
    textAlign: 'left',
    paddingLeft: 6,
  },
  nbaColStat: {
    width: 28,
    textAlign: 'center',
  },
  nbaColPct: {
    width: 38,
    textAlign: 'right',
  },
  nbaColGb: {
    width: 28,
    textAlign: 'right',
  },
  nbaColDiff: {
    width: 36,
    textAlign: 'right',
  },
  nbaColStrk: {
    width: 28,
    textAlign: 'right',
  },
  nbaDataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#181524',
  },
  nbaSeedCell: {
    width: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nbaZoneDot: {
    width: 3,
    height: 12,
    borderRadius: 1.5,
    backgroundColor: 'transparent',
    marginRight: 2,
  },
  nbaZonePlayoff: {
    backgroundColor: '#10B981',
  },
  nbaZonePlayIn: {
    backgroundColor: '#A855F7',
  },
  nbaSeedText: {
    fontSize: 11,
    color: '#A098B5',
    textAlign: 'center',
  },
  nbaSeedTop6: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  nbaTeamCell: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 4,
    paddingRight: 4,
  },
  nbaTeamCrest: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    marginRight: 6,
  },
  nbaTeamName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  nbaStatText: {
    fontSize: 11,
    textAlign: 'center',
  },
});
