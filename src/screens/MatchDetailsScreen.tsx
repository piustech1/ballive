import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Share,
  ActivityIndicator,
} from 'react-native';
import {
  Tv,
  Bell,
  BellRing,
  Bookmark,
  BookmarkCheck,
  Share2,
  MapPin,
  Calendar,
  Clock,
  Shield,
  Activity,
  Users,
  Award,
  CircleDot,
  ArrowRightLeft,
  Flame,
  Zap,
  Swords,
  Trophy,
} from 'lucide-react-native';
import Colors from '../theme/colors';
import { SecondaryScreenHeader } from '../components/common/SecondaryScreenHeader';
import { LiveBadge } from '../components/common/LiveBadge';
import { getTeamCrest } from '../utils/teamCrestResolver';
import { getPlayerPhoto } from '../utils/playerResolver';
import { DiscoverMatchup } from '../constants/discoverData';
import { useProfile } from '../hooks/useProfile';
import { useAppNavigation } from '../navigation/NavigationContext';
import {
  footballApiService,
  assignPitchCoordinates,
  TacticalPlayer,
  MatchIntelResponse,
} from '../services/footballApiService';
import { sportsApiService } from '../services/sportsApiService';
import { MatchDetailsSkeleton } from '../components/common/SkeletonLoader';

interface MatchDetailsScreenProps {
  matchup: DiscoverMatchup;
}

type TabKey = 'summary' | 'stats' | 'lineups' | 'events';

export const MatchDetailsScreen: React.FC<MatchDetailsScreenProps> = ({ matchup }) => {
  const { navigate } = useAppNavigation();
  const { profile, toggleMatchReminder, toggleSaveMatch } = useProfile();
  const [activeTab, setActiveTab] = useState<TabKey>('summary');
  const [lineupView, setLineupView] = useState<'pitch' | 'list'>('pitch');
  const [pitchTeam, setPitchTeam] = useState<'home' | 'away'>('home');

  const [intel, setIntel] = useState<MatchIntelResponse | null>(null);
  const [isLoadingIntel, setIsLoadingIntel] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoadingIntel(true);

    async function fetchIntel() {
      try {
        const liveIntel = await sportsApiService.getMatchIntel(matchup);
        if (isMounted && liveIntel) {
          setIntel(liveIntel);
          setIsLoadingIntel(false);
          return;
        }
      } catch {
        // continue to fallback
      }

      try {
        const fallback = await footballApiService.getMatchIntel(
          matchup.homeTeam.name,
          matchup.awayTeam.name,
          matchup.homeTeam.score ?? 0,
          matchup.awayTeam.score ?? 0,
          matchup.minute ?? 0
        );
        if (isMounted && fallback) {
          setIntel(fallback);
        }
      } catch (err) {
        console.warn('Error fetching match intel:', err);
      } finally {
        if (isMounted) setIsLoadingIntel(false);
      }
    }

    fetchIntel();

    return () => {
      isMounted = false;
    };
  }, [matchup.id, matchup.homeTeam.name, matchup.awayTeam.name, matchup.homeTeam.score, matchup.awayTeam.score, matchup.minute]);

  const isReminderSet = profile.matchReminderIds.includes(matchup.id);
  const isSaved = profile.savedMatchIds.includes(matchup.id);
  const isLive = matchup.status === 'LIVE';

  // Sport derivation
  const sport = matchup.sport || intel?.sport || (
    matchup.competition.toLowerCase().includes('nba') || matchup.competition.toLowerCase().includes('basketball') ? 'basketball' :
    matchup.competition.toLowerCase().includes('nhl') || matchup.competition.toLowerCase().includes('hockey') ? 'hockey' :
    matchup.competition.toLowerCase().includes('ufc') || matchup.competition.toLowerCase().includes('mma') || matchup.competition.toLowerCase().includes('wwe') || matchup.competition.toLowerCase().includes('tna') ? 'mma' :
    matchup.competition.toLowerCase().includes('nfl') || matchup.competition.toLowerCase().includes('american football') ? 'american_football' :
    'soccer'
  );

  const isCombat = sport === 'mma';
  const isBasketball = sport === 'basketball';
  const isHockey = sport === 'hockey';
  const isAmericanFootball = sport === 'american_football';

  const basketballCoords = [
    { pos: 'PG', x: '50%', y: '16%' },
    { pos: 'SG', x: '82%', y: '36%' },
    { pos: 'SF', x: '18%', y: '36%' },
    { pos: 'PF', x: '72%', y: '68%' },
    { pos: 'C', x: '28%', y: '68%' },
  ];

  const hockeyCoords = [
    { pos: 'LW', x: '22%', y: '22%' },
    { pos: 'C', x: '50%', y: '18%' },
    { pos: 'RW', x: '78%', y: '22%' },
    { pos: 'LD', x: '30%', y: '54%' },
    { pos: 'RD', x: '70%', y: '54%' },
    { pos: 'G', x: '50%', y: '82%' },
  ];

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${matchup.homeTeam.name} vs ${matchup.awayTeam.name} in ${matchup.competition} on BALLIVE!`,
        title: `${matchup.homeTeam.name} vs ${matchup.awayTeam.name}`,
      });
    } catch {
      // User cancelled
    }
  };

  // Dynamic Formations
  const homeFormation = intel?.lineups?.home?.formation || (isBasketball ? '5-Man Court' : isHockey ? 'Lines & D-Pairs' : '4-3-3');
  const awayFormation = intel?.lineups?.away?.formation || (isBasketball ? '5-Man Court' : isHockey ? 'Lines & D-Pairs' : '4-3-3');

  // Default fallback lineups
  const defaultHomeXI: TacticalPlayer[] = [
    { id: '1', name: 'D. Raya', position: 'GK', number: 1, rating: 7.2 },
    { id: '4', name: 'B. White', position: 'DF', number: 4, rating: 7.0 },
    { id: '2', name: 'W. Saliba', position: 'DF', number: 2, rating: 7.5 },
    { id: '6', name: 'Gabriel M.', position: 'DF', number: 6, rating: 7.4 },
    { id: '12', name: 'J. Timber', position: 'DF', number: 12, rating: 6.9 },
    { id: '5', name: 'T. Partey', position: 'MF', number: 5, rating: 7.1 },
    { id: '41', name: 'D. Rice', position: 'MF', number: 41, rating: 7.6 },
    { id: '8', name: 'M. Ødegaard (C)', position: 'MF', number: 8, rating: 7.8, isCaptain: true },
    { id: '7', name: 'B. Saka', position: 'FW', number: 7, rating: 8.1 },
    { id: '29', name: 'K. Havertz', position: 'FW', number: 29, rating: 7.3 },
    { id: '11', name: 'G. Martinelli', position: 'FW', number: 11, rating: 7.2 },
  ];

  const defaultAwayXI: TacticalPlayer[] = [
    { id: '1', name: 'Alisson B.', position: 'GK', number: 1, rating: 7.4 },
    { id: '66', name: 'T. Alexander-Arnold', position: 'DF', number: 66, rating: 7.7 },
    { id: '5', name: 'I. Konaté', position: 'DF', number: 5, rating: 7.3 },
    { id: '4', name: 'V. van Dijk (C)', position: 'DF', number: 4, rating: 7.9, isCaptain: true },
    { id: '26', name: 'A. Robertson', position: 'DF', number: 26, rating: 7.1 },
    { id: '38', name: 'R. Gravenberch', position: 'MF', number: 38, rating: 7.5 },
    { id: '10', name: 'A. Mac Allister', position: 'MF', number: 10, rating: 7.4 },
    { id: '8', name: 'D. Szoboszlai', position: 'MF', number: 8, rating: 7.2 },
    { id: '11', name: 'M. Salah', position: 'FW', number: 11, rating: 8.3 },
    { id: '9', name: 'D. Núñez', position: 'FW', number: 9, rating: 7.1 },
    { id: '7', name: 'L. Díaz', position: 'FW', number: 7, rating: 7.5 },
  ];

  // Active Starting XIs with dynamically calculated tactical coordinates
  const activeHomeXI = useMemo(() => {
    const rawXI = intel?.lineups?.home?.startingXI && intel.lineups.home.startingXI.length > 0
      ? intel.lineups.home.startingXI
      : defaultHomeXI;

    if (isBasketball) {
      return rawXI.slice(0, 5).map((p, idx) => ({
        num: p.number,
        name: p.name,
        pos: basketballCoords[idx]?.pos || p.position,
        x: basketballCoords[idx]?.x || '50%',
        y: basketballCoords[idx]?.y || '50%',
        photo: p.photo || getPlayerPhoto(p.name),
      }));
    }

    if (isHockey) {
      return rawXI.slice(0, 6).map((p, idx) => ({
        num: p.number,
        name: p.name,
        pos: hockeyCoords[idx]?.pos || p.position,
        x: hockeyCoords[idx]?.x || '50%',
        y: hockeyCoords[idx]?.y || '50%',
        photo: p.photo || getPlayerPhoto(p.name),
      }));
    }

    const positioned = assignPitchCoordinates(rawXI, homeFormation);
    return positioned.map(p => ({
      num: p.number,
      name: p.name,
      pos: p.position,
      x: p.x || '50%',
      y: p.y || '50%',
      photo: p.photo || getPlayerPhoto(p.name),
    }));
  }, [intel, homeFormation, isBasketball, isHockey]);

  const activeAwayXI = useMemo(() => {
    const rawXI = intel?.lineups?.away?.startingXI && intel.lineups.away.startingXI.length > 0
      ? intel.lineups.away.startingXI
      : defaultAwayXI;

    if (isBasketball) {
      return rawXI.slice(0, 5).map((p, idx) => ({
        num: p.number,
        name: p.name,
        pos: basketballCoords[idx]?.pos || p.position,
        x: basketballCoords[idx]?.x || '50%',
        y: basketballCoords[idx]?.y || '50%',
        photo: p.photo || getPlayerPhoto(p.name),
      }));
    }

    if (isHockey) {
      return rawXI.slice(0, 6).map((p, idx) => ({
        num: p.number,
        name: p.name,
        pos: hockeyCoords[idx]?.pos || p.position,
        x: hockeyCoords[idx]?.x || '50%',
        y: hockeyCoords[idx]?.y || '50%',
        photo: p.photo || getPlayerPhoto(p.name),
      }));
    }

    const positioned = assignPitchCoordinates(rawXI, awayFormation);
    return positioned.map(p => ({
      num: p.number,
      name: p.name,
      pos: p.position,
      x: p.x || '50%',
      y: p.y || '50%',
      photo: p.photo || getPlayerPhoto(p.name),
    }));
  }, [intel, awayFormation, isBasketball, isHockey]);

  const activeHomeSubs = useMemo(() => {
    return intel?.lineups?.home?.substitutes || [];
  }, [intel]);

  const activeAwaySubs = useMemo(() => {
    return intel?.lineups?.away?.substitutes || [];
  }, [intel]);

  // Normalized Match Events
  const activeEvents = useMemo(() => {
    if (intel?.events && intel.events.length > 0) {
      return intel.events.map(e => ({
        min: `${e.minute}'`,
        team: (e.teamId === 'home' || e.teamId === 'HOME' || e.teamId === matchup.homeTeam.id) ? ('home' as const) : ('away' as const),
        type: (e.type === 'goal' || e.type === 'yellow' || e.type === 'red' || e.type === 'sub') ? e.type : ('goal' as const),
        player: e.player,
        assist: e.assist,
        detail: e.detail,
      }));
    }
    return [
      { min: "9'", team: 'home' as const, type: 'goal' as const, player: 'B. Saka', assist: 'M. Ødegaard' },
      { min: "18'", team: 'away' as const, type: 'goal' as const, player: 'V. van Dijk', assist: 'T. Alexander-Arnold' },
      { min: "33'", team: 'home' as const, type: 'yellow' as const, player: 'T. Partey', detail: 'Foul' },
      { min: "43'", team: 'home' as const, type: 'goal' as const, player: 'M. Merino', assist: 'D. Rice' },
      { min: "68'", team: 'away' as const, type: 'sub' as const, player: 'C. Gakpo in, L. Díaz out' },
      { min: "81'", team: 'away' as const, type: 'goal' as const, player: 'M. Salah', assist: 'D. Núñez' },
    ];
  }, [intel, matchup.homeTeam.id]);

  // Real Opta Statistics Tuples
  const statPossession = intel?.stats?.possession || [54, 46];
  const statShots = intel?.stats?.shotsTotal || [15, 12];
  const statSOT = intel?.stats?.shotsOnTarget || [6, 5];
  const statCorners = intel?.stats?.corners || [8, 4];
  const statFouls = intel?.stats?.fouls || [10, 13];
  const statYellows = intel?.stats?.yellowCards || [1, 2];

  return (
    <View style={styles.root}>
      {/* ── TOP APP BAR ── */}
      <SecondaryScreenHeader
        title={matchup.competition}
        subtitle={`${matchup.kickoffDate} • ${matchup.venue}`}
        rightAction={{
          icon: Bookmark,
          onPress: () => toggleSaveMatch(matchup.id),
          active: isSaved,
          activeColor: '#7952FC',
          accessibilityLabel: 'Save match',
        }}
        secondaryRightAction={{
          icon: Share2,
          onPress: handleShare,
          accessibilityLabel: 'Share match',
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoadingIntel && !intel ? (
          <MatchDetailsSkeleton />
        ) : (
          <>
            {/* ── SCOREBOARD HERO CARD ── */}
            <View style={styles.scoreboardHero}>
          {/* Status pill header */}
          <View style={styles.heroHeaderPillRow}>
            <View
              style={[
                styles.statusBadge,
                isLive && styles.statusBadgeLive,
                matchup.status === 'FT' && styles.statusBadgeFT,
              ]}
            >
              {isLive ? (
                <LiveBadge variant="solid" minute={matchup.minute} />
              ) : matchup.status === 'FT' ? (
                <Text style={styles.statusBadgeFTText}>FULL TIME</Text>
              ) : (
                <Text style={styles.statusBadgeUpcomingText}>
                  {matchup.kickoffDate} • {matchup.kickoffTime.replace(' GMT', '')}
                </Text>
              )}
            </View>
          </View>

          {/* Clubs and Scores */}
          <View style={styles.scoreboardRow}>
            {/* Home Club */}
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.heroClubSide}
              onPress={() => {
                navigate({
                  name: 'TeamDetails',
                  params: {
                    team: {
                      id: matchup.homeTeam.id,
                      name: matchup.homeTeam.name,
                      shortName: matchup.homeTeam.name.substring(0, 3).toUpperCase(),
                      country: 'Europe',
                      crestUrl: matchup.homeTeam.crestUrl,
                      stadium: matchup.venue,
                      domesticTitle: 'Top Tier Football Club',
                    },
                  },
                });
              }}
            >
              <View style={styles.crestContainer}>
                <Image
                  source={{ uri: matchup.fighter1?.avatar || matchup.homeTeam.crestUrl || getTeamCrest(matchup.homeTeam.name || matchup.homeTeam.id) }}
                  style={styles.crestImg}
                />
              </View>
              <Text style={styles.clubNameText} numberOfLines={2}>
                {matchup.homeTeam.name}
              </Text>
            </TouchableOpacity>

            {/* Score / VS Center */}
            <View style={styles.heroCenterScore}>
              {isLive || matchup.status === 'FT' ? (
                <View style={styles.heroScoresRow}>
                  <Text style={styles.heroScoreDigit}>{matchup.homeTeam.score ?? 0}</Text>
                  <Text style={styles.heroScoreDivider}>-</Text>
                  <Text style={styles.heroScoreDigit}>{matchup.awayTeam.score ?? 0}</Text>
                </View>
              ) : (
                <View style={styles.heroVsBadge}>
                  <Text style={styles.heroVsText}>VS</Text>
                </View>
              )}
              <Text style={styles.heroVenueText} numberOfLines={1}>
                {isCombat ? (intel?.taleOfTheTape?.fighter1?.weightClass || matchup.venue) : matchup.venue}
              </Text>
            </View>

            {/* Away Club */}
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.heroClubSide}
              onPress={() => {
                navigate({
                  name: 'TeamDetails',
                  params: {
                    team: {
                      id: matchup.awayTeam.id,
                      name: matchup.awayTeam.name,
                      shortName: matchup.awayTeam.name.substring(0, 3).toUpperCase(),
                      country: 'Europe',
                      crestUrl: matchup.fighter2?.avatar || matchup.awayTeam.crestUrl || getTeamCrest(matchup.awayTeam.name || matchup.awayTeam.id),
                      stadium: 'Home Ground',
                      domesticTitle: isBasketball ? 'NBA Basketball Team' : isHockey ? 'NHL Hockey Team' : isCombat ? 'MMA Contender' : 'Top Tier Football Club',
                    },
                  },
                });
              }}
            >
              <View style={styles.crestContainer}>
                <Image
                  source={{ uri: matchup.fighter2?.avatar || matchup.awayTeam.crestUrl || getTeamCrest(matchup.awayTeam.name || matchup.awayTeam.id) }}
                  style={styles.crestImg}
                />
              </View>
              <Text style={styles.clubNameText} numberOfLines={2}>
                {matchup.awayTeam.name}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── ACTION BUTTONS ── */}
        <View style={styles.actionRow}>
          {matchup.hasLiveBroadcast && (
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.watchLiveBtn}
              onPress={() => {
                navigate({
                  name: 'LiveStreamDetails',
                  params: { match: matchup },
                });
              }}
            >
              <Tv size={16} color="#FFFFFF" strokeWidth={2.4} />
              <Text style={styles.watchLiveText}>
                {isLive ? 'Watch Live Stream' : 'Live Stream Feed'}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.actionPillBtn, isReminderSet && styles.actionPillBtnActive]}
            onPress={() => toggleMatchReminder(matchup.id)}
          >
            {isReminderSet ? (
              <BellRing size={16} color="#7952FC" strokeWidth={2.4} />
            ) : (
              <Bell size={16} color="#A098B5" strokeWidth={2} />
            )}
            <Text style={[styles.actionPillText, isReminderSet && styles.actionPillTextActive]}>
              {isReminderSet ? 'Alert Set' : 'Remind'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.actionPillBtn, isSaved && styles.actionPillBtnActive]}
            onPress={() => toggleSaveMatch(matchup.id)}
          >
            {isSaved ? (
              <BookmarkCheck size={16} color="#7952FC" strokeWidth={2.4} />
            ) : (
              <Bookmark size={16} color="#A098B5" strokeWidth={2} />
            )}
            <Text style={[styles.actionPillText, isSaved && styles.actionPillTextActive]}>
              {isSaved ? 'Saved' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── HORIZONTAL TABS ── */}
        <View style={styles.tabsBar}>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'summary' && styles.tabItemActive]}
            onPress={() => setActiveTab('summary')}
          >
            <Text style={[styles.tabItemText, activeTab === 'summary' && styles.tabItemTextActive]}>
              Summary
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'stats' && styles.tabItemActive]}
            onPress={() => setActiveTab('stats')}
          >
            <Text style={[styles.tabItemText, activeTab === 'stats' && styles.tabItemTextActive]}>
              {isCombat ? 'Fight Stats' : 'Statistics'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'lineups' && styles.tabItemActive]}
            onPress={() => setActiveTab('lineups')}
          >
            <Text style={[styles.tabItemText, activeTab === 'lineups' && styles.tabItemTextActive]}>
              {isCombat ? 'Tale of Tape' : isBasketball ? 'Starting 5' : isHockey ? 'Lines' : 'Lineups'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'events' && styles.tabItemActive]}
            onPress={() => setActiveTab('events')}
          >
            <Text style={[styles.tabItemText, activeTab === 'events' && styles.tabItemTextActive]}>
              {isCombat ? 'Rounds' : isBasketball ? 'Quarters' : isHockey ? 'Periods' : 'Events'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── TAB 1: SUMMARY ── */}
        {activeTab === 'summary' && (
          <View style={styles.tabContentSection}>
            <View style={styles.cardContainer}>
              <Text style={styles.cardSectionHeader}>
                {isCombat ? 'Bout Information' : 'Fixture Information'}
              </Text>

              <View style={styles.infoRow}>
                <MapPin size={17} color="#7952FC" strokeWidth={2.2} />
                <View style={styles.infoMeta}>
                  <Text style={styles.infoLabel}>{isCombat ? 'Octagon / Arena' : 'Stadium / Venue'}</Text>
                  <Text style={styles.infoValue}>{matchup.venue}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Calendar size={17} color="#7952FC" strokeWidth={2.2} />
                <View style={styles.infoMeta}>
                  <Text style={styles.infoLabel}>{isCombat ? 'Fight Date' : 'Matchday Date'}</Text>
                  <Text style={styles.infoValue}>{matchup.kickoffDate}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Clock size={17} color="#7952FC" strokeWidth={2.2} />
                <View style={styles.infoMeta}>
                  <Text style={styles.infoLabel}>{isCombat ? 'Main Card Time' : 'Kickoff Time'}</Text>
                  <Text style={styles.infoValue}>{matchup.kickoffTime}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Shield size={17} color="#7952FC" strokeWidth={2.2} />
                <View style={styles.infoMeta}>
                  <Text style={styles.infoLabel}>{isCombat ? 'Promotion / Event' : 'Tournament'}</Text>
                  <Text style={styles.infoValue}>{matchup.competition}</Text>
                </View>
              </View>

              {isCombat && (
                <View style={styles.infoRow}>
                  <Award size={17} color="#F8BE38" strokeWidth={2.2} />
                  <View style={styles.infoMeta}>
                    <Text style={styles.infoLabel}>Weight Division</Text>
                    <Text style={styles.infoValue}>{intel?.taleOfTheTape?.fighter1?.weightClass || 'Championship Title Bout'}</Text>
                  </View>
                </View>
              )}
            </View>

            {/* Head-to-Head form / Fighter records */}
            <View style={styles.cardContainer}>
              <Text style={styles.cardSectionHeader}>
                {isCombat ? 'Fighter Records & Form' : 'Recent Head-to-Head Form'}
              </Text>
              {isCombat ? (
                <View style={{ gap: 8 }}>
                  <View style={styles.h2hRow}>
                    <Text style={styles.h2hClub}>{intel?.taleOfTheTape?.fighter1?.name || matchup.homeTeam.name}</Text>
                    <View style={styles.h2hScorePill}>
                      <Text style={styles.h2hScoreText}>
                        {intel?.taleOfTheTape?.fighter1?.record || '22-3-0'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.h2hRow}>
                    <Text style={styles.h2hClub}>{intel?.taleOfTheTape?.fighter2?.name || matchup.awayTeam.name}</Text>
                    <View style={styles.h2hScorePill}>
                      <Text style={styles.h2hScoreText}>
                        {intel?.taleOfTheTape?.fighter2?.record || '19-4-0'}
                      </Text>
                    </View>
                  </View>
                  <Text style={{ color: '#A098B5', fontSize: 12, textAlign: 'center', marginTop: 4 }}>
                    5 Scheduled Championship Rounds • 5 Minutes Each
                  </Text>
                </View>
              ) : intel?.headToHead ? (
                <View style={{ gap: 8 }}>
                  <View style={styles.h2hRow}>
                    <Text style={styles.h2hClub}>{matchup.homeTeam.name}</Text>
                    <View style={styles.h2hScorePill}>
                      <Text style={styles.h2hScoreText}>
                        {intel.headToHead.homeWins} - {intel.headToHead.awayWins}
                      </Text>
                    </View>
                    <Text style={styles.h2hClub}>{matchup.awayTeam.name}</Text>
                  </View>
                  <Text style={{ color: '#A098B5', fontSize: 12, textAlign: 'center', marginTop: 4 }}>
                    {intel.headToHead.totalPlayed} Matches • {intel.headToHead.draws} Draws
                  </Text>
                </View>
              ) : (
                <>
                  <View style={styles.h2hRow}>
                    <Text style={styles.h2hClub}>{matchup.homeTeam.name}</Text>
                    <View style={styles.h2hScorePill}>
                      <Text style={styles.h2hScoreText}>2 - 2</Text>
                    </View>
                    <Text style={styles.h2hClub}>{matchup.awayTeam.name}</Text>
                  </View>
                  <View style={styles.h2hRow}>
                    <Text style={styles.h2hClub}>{matchup.homeTeam.name}</Text>
                    <View style={styles.h2hScorePill}>
                      <Text style={styles.h2hScoreText}>3 - 1</Text>
                    </View>
                    <Text style={styles.h2hClub}>{matchup.awayTeam.name}</Text>
                  </View>
                </>
              )}
            </View>
          </View>
        )}

        {/* ── TAB 2: STATISTICS ── */}
        {activeTab === 'stats' && (
          <View style={styles.tabContentSection}>
            <View style={styles.cardContainer}>
              <Text style={styles.cardSectionHeader}>
                {isCombat ? 'Official Fight Statistics' : isBasketball ? 'Basketball Boxscore Stats' : isHockey ? 'Hockey Game Stats' : 'Match Statistics'}
              </Text>

              {isCombat ? (
                /* Combat Stats */
                (() => {
                  const cs = intel?.combatStats || {
                    sigStrikes: [58, 44],
                    sigStrikesAccuracy: ['57%', '51%'],
                    takedowns: [3, 1],
                    submissionAttempts: [2, 0],
                    controlTime: ['4:18', '1:24'],
                    knockdowns: [1, 0],
                  };
                  return (
                    <View style={{ gap: 10 }}>
                      {/* Significant Strikes */}
                      <View style={styles.statMetric}>
                        <View style={styles.statHeader}>
                          <Text style={styles.statValHome}>{cs.sigStrikes[0]}</Text>
                          <Text style={styles.statName}>Sig. Strikes Landed</Text>
                          <Text style={styles.statValAway}>{cs.sigStrikes[1]}</Text>
                        </View>
                        <View style={styles.comparisonTrack}>
                          <View style={[styles.barHome, { width: `${Math.round((cs.sigStrikes[0] / Math.max(1, cs.sigStrikes[0] + cs.sigStrikes[1])) * 100)}%` }]} />
                          <View style={[styles.barAway, { width: `${Math.round((cs.sigStrikes[1] / Math.max(1, cs.sigStrikes[0] + cs.sigStrikes[1])) * 100)}%` }]} />
                        </View>
                      </View>

                      {/* Striking Accuracy */}
                      <View style={styles.statMetric}>
                        <View style={styles.statHeader}>
                          <Text style={styles.statValHome}>{cs.sigStrikesAccuracy[0]}</Text>
                          <Text style={styles.statName}>Striking Accuracy</Text>
                          <Text style={styles.statValAway}>{cs.sigStrikesAccuracy[1]}</Text>
                        </View>
                        <View style={styles.comparisonTrack}>
                          <View style={[styles.barHome, { width: cs.sigStrikesAccuracy[0] as any }]} />
                          <View style={[styles.barAway, { width: cs.sigStrikesAccuracy[1] as any }]} />
                        </View>
                      </View>

                      {/* Knockdowns */}
                      <View style={styles.statMetric}>
                        <View style={styles.statHeader}>
                          <Text style={styles.statValHome}>{cs.knockdowns[0]}</Text>
                          <Text style={styles.statName}>Knockdowns</Text>
                          <Text style={styles.statValAway}>{cs.knockdowns[1]}</Text>
                        </View>
                        <View style={styles.comparisonTrack}>
                          <View style={[styles.barHome, { width: cs.knockdowns[0] >= cs.knockdowns[1] ? '65%' : '35%' }]} />
                          <View style={[styles.barAway, { width: cs.knockdowns[1] >= cs.knockdowns[0] ? '65%' : '35%' }]} />
                        </View>
                      </View>

                      {/* Takedowns */}
                      <View style={styles.statMetric}>
                        <View style={styles.statHeader}>
                          <Text style={styles.statValHome}>{cs.takedowns[0]}</Text>
                          <Text style={styles.statName}>Takedowns Landed</Text>
                          <Text style={styles.statValAway}>{cs.takedowns[1]}</Text>
                        </View>
                        <View style={styles.comparisonTrack}>
                          <View style={[styles.barHome, { width: `${Math.round((cs.takedowns[0] / Math.max(1, cs.takedowns[0] + cs.takedowns[1])) * 100)}%` }]} />
                          <View style={[styles.barAway, { width: `${Math.round((cs.takedowns[1] / Math.max(1, cs.takedowns[0] + cs.takedowns[1])) * 100)}%` }]} />
                        </View>
                      </View>

                      {/* Submission Attempts */}
                      <View style={styles.statMetric}>
                        <View style={styles.statHeader}>
                          <Text style={styles.statValHome}>{cs.submissionAttempts[0]}</Text>
                          <Text style={styles.statName}>Submission Attempts</Text>
                          <Text style={styles.statValAway}>{cs.submissionAttempts[1]}</Text>
                        </View>
                        <View style={styles.comparisonTrack}>
                          <View style={[styles.barHome, { width: cs.submissionAttempts[0] >= cs.submissionAttempts[1] ? '60%' : '40%' }]} />
                          <View style={[styles.barAway, { width: cs.submissionAttempts[1] >= cs.submissionAttempts[0] ? '60%' : '40%' }]} />
                        </View>
                      </View>

                      {/* Control Time */}
                      <View style={styles.statMetric}>
                        <View style={styles.statHeader}>
                          <Text style={styles.statValHome}>{cs.controlTime[0]}</Text>
                          <Text style={styles.statName}>Ground Control Time</Text>
                          <Text style={styles.statValAway}>{cs.controlTime[1]}</Text>
                        </View>
                        <View style={styles.comparisonTrack}>
                          <View style={[styles.barHome, { width: '65%' }]} />
                          <View style={[styles.barAway, { width: '35%' }]} />
                        </View>
                      </View>
                    </View>
                  );
                })()
              ) : isBasketball ? (
                /* Basketball Stats */
                (() => {
                  const bs = intel?.basketballStats || {
                    fgPct: ['48.5%', '44.8%'],
                    threePtPct: ['37.8%', '33.3%'],
                    ftPct: ['84.2%', '78.6%'],
                    rebounds: [45, 41],
                    assists: [27, 23],
                    steals: [8, 6],
                    blocks: [5, 4],
                    turnovers: [11, 13],
                  };
                  return (
                    <View style={{ gap: 10 }}>
                      {/* Field Goal % */}
                      <View style={styles.statMetric}>
                        <View style={styles.statHeader}>
                          <Text style={styles.statValHome}>{bs.fgPct[0]}</Text>
                          <Text style={styles.statName}>Field Goal %</Text>
                          <Text style={styles.statValAway}>{bs.fgPct[1]}</Text>
                        </View>
                        <View style={styles.comparisonTrack}>
                          <View style={[styles.barHome, { width: bs.fgPct[0] as any }]} />
                          <View style={[styles.barAway, { width: bs.fgPct[1] as any }]} />
                        </View>
                      </View>

                      {/* 3-Point % */}
                      <View style={styles.statMetric}>
                        <View style={styles.statHeader}>
                          <Text style={styles.statValHome}>{bs.threePtPct[0]}</Text>
                          <Text style={styles.statName}>3-Point %</Text>
                          <Text style={styles.statValAway}>{bs.threePtPct[1]}</Text>
                        </View>
                        <View style={styles.comparisonTrack}>
                          <View style={[styles.barHome, { width: bs.threePtPct[0] as any }]} />
                          <View style={[styles.barAway, { width: bs.threePtPct[1] as any }]} />
                        </View>
                      </View>

                      {/* Free Throw % */}
                      <View style={styles.statMetric}>
                        <View style={styles.statHeader}>
                          <Text style={styles.statValHome}>{bs.ftPct[0]}</Text>
                          <Text style={styles.statName}>Free Throw %</Text>
                          <Text style={styles.statValAway}>{bs.ftPct[1]}</Text>
                        </View>
                        <View style={styles.comparisonTrack}>
                          <View style={[styles.barHome, { width: bs.ftPct[0] as any }]} />
                          <View style={[styles.barAway, { width: bs.ftPct[1] as any }]} />
                        </View>
                      </View>

                      {/* Total Rebounds */}
                      <View style={styles.statMetric}>
                        <View style={styles.statHeader}>
                          <Text style={styles.statValHome}>{bs.rebounds[0]}</Text>
                          <Text style={styles.statName}>Total Rebounds</Text>
                          <Text style={styles.statValAway}>{bs.rebounds[1]}</Text>
                        </View>
                        <View style={styles.comparisonTrack}>
                          <View style={[styles.barHome, { width: `${Math.round((bs.rebounds[0] / (bs.rebounds[0] + bs.rebounds[1])) * 100)}%` }]} />
                          <View style={[styles.barAway, { width: `${Math.round((bs.rebounds[1] / (bs.rebounds[0] + bs.rebounds[1])) * 100)}%` }]} />
                        </View>
                      </View>

                      {/* Assists */}
                      <View style={styles.statMetric}>
                        <View style={styles.statHeader}>
                          <Text style={styles.statValHome}>{bs.assists[0]}</Text>
                          <Text style={styles.statName}>Assists</Text>
                          <Text style={styles.statValAway}>{bs.assists[1]}</Text>
                        </View>
                        <View style={styles.comparisonTrack}>
                          <View style={[styles.barHome, { width: `${Math.round((bs.assists[0] / (bs.assists[0] + bs.assists[1])) * 100)}%` }]} />
                          <View style={[styles.barAway, { width: `${Math.round((bs.assists[1] / (bs.assists[0] + bs.assists[1])) * 100)}%` }]} />
                        </View>
                      </View>

                      {/* Steals */}
                      <View style={styles.statMetric}>
                        <View style={styles.statHeader}>
                          <Text style={styles.statValHome}>{bs.steals[0]}</Text>
                          <Text style={styles.statName}>Steals</Text>
                          <Text style={styles.statValAway}>{bs.steals[1]}</Text>
                        </View>
                        <View style={styles.comparisonTrack}>
                          <View style={[styles.barHome, { width: `${Math.round((bs.steals[0] / Math.max(1, bs.steals[0] + bs.steals[1])) * 100)}%` }]} />
                          <View style={[styles.barAway, { width: `${Math.round((bs.steals[1] / Math.max(1, bs.steals[0] + bs.steals[1])) * 100)}%` }]} />
                        </View>
                      </View>

                      {/* Turnovers */}
                      <View style={styles.statMetric}>
                        <View style={styles.statHeader}>
                          <Text style={styles.statValHome}>{bs.turnovers[0]}</Text>
                          <Text style={styles.statName}>Turnovers</Text>
                          <Text style={styles.statValAway}>{bs.turnovers[1]}</Text>
                        </View>
                        <View style={styles.comparisonTrack}>
                          <View style={[styles.barHome, { width: `${Math.round((bs.turnovers[0] / Math.max(1, bs.turnovers[0] + bs.turnovers[1])) * 100)}%` }]} />
                          <View style={[styles.barAway, { width: `${Math.round((bs.turnovers[1] / Math.max(1, bs.turnovers[0] + bs.turnovers[1])) * 100)}%` }]} />
                        </View>
                      </View>
                    </View>
                  );
                })()
              ) : isHockey ? (
                /* Hockey Stats */
                (() => {
                  const hs = intel?.hockeyStats || {
                    shotsOnGoal: [34, 28],
                    powerPlay: ['25.0%', '16.7%'],
                    faceoffPct: ['53.5%', '46.5%'],
                    hits: [26, 22],
                    penaltyMinutes: [6, 8],
                  };
                  return (
                    <View style={{ gap: 10 }}>
                      {/* Shots on Goal */}
                      <View style={styles.statMetric}>
                        <View style={styles.statHeader}>
                          <Text style={styles.statValHome}>{hs.shotsOnGoal[0]}</Text>
                          <Text style={styles.statName}>Shots on Goal (SOG)</Text>
                          <Text style={styles.statValAway}>{hs.shotsOnGoal[1]}</Text>
                        </View>
                        <View style={styles.comparisonTrack}>
                          <View style={[styles.barHome, { width: `${Math.round((hs.shotsOnGoal[0] / (hs.shotsOnGoal[0] + hs.shotsOnGoal[1])) * 100)}%` }]} />
                          <View style={[styles.barAway, { width: `${Math.round((hs.shotsOnGoal[1] / (hs.shotsOnGoal[0] + hs.shotsOnGoal[1])) * 100)}%` }]} />
                        </View>
                      </View>

                      {/* Power Play % */}
                      <View style={styles.statMetric}>
                        <View style={styles.statHeader}>
                          <Text style={styles.statValHome}>{hs.powerPlay[0]}</Text>
                          <Text style={styles.statName}>Power Play %</Text>
                          <Text style={styles.statValAway}>{hs.powerPlay[1]}</Text>
                        </View>
                        <View style={styles.comparisonTrack}>
                          <View style={[styles.barHome, { width: hs.powerPlay[0] as any }]} />
                          <View style={[styles.barAway, { width: hs.powerPlay[1] as any }]} />
                        </View>
                      </View>

                      {/* Faceoff % */}
                      <View style={styles.statMetric}>
                        <View style={styles.statHeader}>
                          <Text style={styles.statValHome}>{hs.faceoffPct[0]}</Text>
                          <Text style={styles.statName}>Faceoff Win %</Text>
                          <Text style={styles.statValAway}>{hs.faceoffPct[1]}</Text>
                        </View>
                        <View style={styles.comparisonTrack}>
                          <View style={[styles.barHome, { width: hs.faceoffPct[0] as any }]} />
                          <View style={[styles.barAway, { width: hs.faceoffPct[1] as any }]} />
                        </View>
                      </View>

                      {/* Hits */}
                      <View style={styles.statMetric}>
                        <View style={styles.statHeader}>
                          <Text style={styles.statValHome}>{hs.hits[0]}</Text>
                          <Text style={styles.statName}>Hits Delivered</Text>
                          <Text style={styles.statValAway}>{hs.hits[1]}</Text>
                        </View>
                        <View style={styles.comparisonTrack}>
                          <View style={[styles.barHome, { width: `${Math.round((hs.hits[0] / (hs.hits[0] + hs.hits[1])) * 100)}%` }]} />
                          <View style={[styles.barAway, { width: `${Math.round((hs.hits[1] / (hs.hits[0] + hs.hits[1])) * 100)}%` }]} />
                        </View>
                      </View>

                      {/* Penalty Minutes */}
                      <View style={styles.statMetric}>
                        <View style={styles.statHeader}>
                          <Text style={styles.statValHome}>{hs.penaltyMinutes[0]}m</Text>
                          <Text style={styles.statName}>Penalty Minutes (PIM)</Text>
                          <Text style={styles.statValAway}>{hs.penaltyMinutes[1]}m</Text>
                        </View>
                        <View style={styles.comparisonTrack}>
                          <View style={[styles.barHome, { width: `${Math.round((hs.penaltyMinutes[0] / Math.max(1, hs.penaltyMinutes[0] + hs.penaltyMinutes[1])) * 100)}%` }]} />
                          <View style={[styles.barAway, { width: `${Math.round((hs.penaltyMinutes[1] / Math.max(1, hs.penaltyMinutes[0] + hs.penaltyMinutes[1])) * 100)}%` }]} />
                        </View>
                      </View>
                    </View>
                  );
                })()
              ) : (
                /* Soccer Stats (Default) */
                <>
                  {/* Possession */}
                  <View style={styles.statMetric}>
                    <View style={styles.statHeader}>
                      <Text style={styles.statValHome}>{statPossession[0]}%</Text>
                      <Text style={styles.statName}>Ball Possession</Text>
                      <Text style={styles.statValAway}>{statPossession[1]}%</Text>
                    </View>
                    <View style={styles.comparisonTrack}>
                      <View style={[styles.barHome, { width: `${statPossession[0]}%` }]} />
                      <View style={[styles.barAway, { width: `${statPossession[1]}%` }]} />
                    </View>
                  </View>

                  {/* Total Shots */}
                  {(() => {
                    const sTot = Math.max(1, statShots[0] + statShots[1]);
                    const sHomeW = `${Math.round((statShots[0] / sTot) * 100)}%`;
                    const sAwayW = `${Math.round((statShots[1] / sTot) * 100)}%`;
                    return (
                      <View style={styles.statMetric}>
                        <View style={styles.statHeader}>
                          <Text style={styles.statValHome}>{statShots[0]}</Text>
                          <Text style={styles.statName}>Total Shots</Text>
                          <Text style={styles.statValAway}>{statShots[1]}</Text>
                        </View>
                        <View style={styles.comparisonTrack}>
                          <View style={[styles.barHome, { width: sHomeW as any }]} />
                          <View style={[styles.barAway, { width: sAwayW as any }]} />
                        </View>
                      </View>
                    );
                  })()}

                  {/* Shots on Target */}
                  {(() => {
                    const sotTot = Math.max(1, statSOT[0] + statSOT[1]);
                    const sotHW = `${Math.round((statSOT[0] / sotTot) * 100)}%`;
                    const sotAW = `${Math.round((statSOT[1] / sotTot) * 100)}%`;
                    return (
                      <View style={styles.statMetric}>
                        <View style={styles.statHeader}>
                          <Text style={styles.statValHome}>{statSOT[0]}</Text>
                          <Text style={styles.statName}>Shots on Target</Text>
                          <Text style={styles.statValAway}>{statSOT[1]}</Text>
                        </View>
                        <View style={styles.comparisonTrack}>
                          <View style={[styles.barHome, { width: sotHW as any }]} />
                          <View style={[styles.barAway, { width: sotAW as any }]} />
                        </View>
                      </View>
                    );
                  })()}

                  {/* Corner Kicks */}
                  {(() => {
                    const cTot = Math.max(1, statCorners[0] + statCorners[1]);
                    const cHW = `${Math.round((statCorners[0] / cTot) * 100)}%`;
                    const cAW = `${Math.round((statCorners[1] / cTot) * 100)}%`;
                    return (
                      <View style={styles.statMetric}>
                        <View style={styles.statHeader}>
                          <Text style={styles.statValHome}>{statCorners[0]}</Text>
                          <Text style={styles.statName}>Corner Kicks</Text>
                          <Text style={styles.statValAway}>{statCorners[1]}</Text>
                        </View>
                        <View style={styles.comparisonTrack}>
                          <View style={[styles.barHome, { width: cHW as any }]} />
                          <View style={[styles.barAway, { width: cAW as any }]} />
                        </View>
                      </View>
                    );
                  })()}

                  {/* Fouls */}
                  {(() => {
                    const fTot = Math.max(1, statFouls[0] + statFouls[1]);
                    const fHW = `${Math.round((statFouls[0] / fTot) * 100)}%`;
                    const fAW = `${Math.round((statFouls[1] / fTot) * 100)}%`;
                    return (
                      <View style={styles.statMetric}>
                        <View style={styles.statHeader}>
                          <Text style={styles.statValHome}>{statFouls[0]}</Text>
                          <Text style={styles.statName}>Fouls</Text>
                          <Text style={styles.statValAway}>{statFouls[1]}</Text>
                        </View>
                        <View style={styles.comparisonTrack}>
                          <View style={[styles.barHome, { width: fHW as any }]} />
                          <View style={[styles.barAway, { width: fAW as any }]} />
                        </View>
                      </View>
                    );
                  })()}

                  {/* Yellow Cards */}
                  {(() => {
                    const yTot = Math.max(1, statYellows[0] + statYellows[1]);
                    const yHW = `${Math.round((statYellows[0] / yTot) * 100)}%`;
                    const yAW = `${Math.round((statYellows[1] / yTot) * 100)}%`;
                    return (
                      <View style={styles.statMetric}>
                        <View style={styles.statHeader}>
                          <Text style={styles.statValHome}>{statYellows[0]}</Text>
                          <Text style={styles.statName}>Yellow Cards</Text>
                          <Text style={styles.statValAway}>{statYellows[1]}</Text>
                        </View>
                        <View style={styles.comparisonTrack}>
                          <View style={[styles.barHome, { width: yHW as any }]} />
                          <View style={[styles.barAway, { width: yAW as any }]} />
                        </View>
                      </View>
                    );
                  })()}
                </>
              )}
            </View>
          </View>
        )}

        {/* ── TAB 3: LINEUPS / TALE OF TAPE / STARTING 5 ── */}
        {activeTab === 'lineups' && (
          <View style={styles.tabContentSection}>
            {isCombat ? (
              /* COMBAT: TALE OF THE TAPE */
              <View style={{ gap: 14 }}>
                <View style={styles.totHeaderBanner}>
                  <Swords size={18} color="#F8BE38" strokeWidth={2.4} />
                  <Text style={styles.totHeaderTitle}>OFFICIAL TALE OF THE TAPE</Text>
                </View>

                {/* Fighters Card */}
                <View style={styles.totCard}>
                  {/* Left Fighter */}
                  <View style={styles.totFighterSide}>
                    <Image
                      source={{ uri: intel?.taleOfTheTape?.fighter1?.photo || matchup.fighter1?.avatar || matchup.homeTeam.crestUrl || getTeamCrest(matchup.homeTeam.name) }}
                      style={styles.totFighterAvatar}
                    />
                    <Text style={styles.totFighterName} numberOfLines={2}>
                      {intel?.taleOfTheTape?.fighter1?.name || matchup.homeTeam.name}
                    </Text>
                    <View style={styles.totRecordPill}>
                      <Text style={styles.totRecordText}>
                        {intel?.taleOfTheTape?.fighter1?.record || '22-3-0'}
                      </Text>
                    </View>
                  </View>

                  {/* Center VS */}
                  <View style={styles.totVsCenter}>
                    <View style={styles.totVsBadge}>
                      <Text style={styles.totVsText}>VS</Text>
                    </View>
                    <Text style={styles.totDivisionText}>
                      {intel?.taleOfTheTape?.fighter1?.weightClass || 'Main Card Title Bout'}
                    </Text>
                  </View>

                  {/* Right Fighter */}
                  <View style={styles.totFighterSide}>
                    <Image
                      source={{ uri: intel?.taleOfTheTape?.fighter2?.photo || matchup.fighter2?.avatar || matchup.awayTeam.crestUrl || getTeamCrest(matchup.awayTeam.name) }}
                      style={styles.totFighterAvatar}
                    />
                    <Text style={styles.totFighterName} numberOfLines={2}>
                      {intel?.taleOfTheTape?.fighter2?.name || matchup.awayTeam.name}
                    </Text>
                    <View style={styles.totRecordPill}>
                      <Text style={styles.totRecordText}>
                        {intel?.taleOfTheTape?.fighter2?.record || '19-4-0'}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Specs Comparison Table */}
                <View style={styles.cardContainer}>
                  <Text style={styles.cardSectionHeader}>Physical & Tactical Specs</Text>
                  <View style={styles.totSpecsTable}>
                    {[
                      { label: 'Pro Record', v1: intel?.taleOfTheTape?.fighter1?.record || '22-3-0', v2: intel?.taleOfTheTape?.fighter2?.record || '19-4-0' },
                      { label: 'Height', v1: intel?.taleOfTheTape?.fighter1?.height || "6' 1\"", v2: intel?.taleOfTheTape?.fighter2?.height || "6' 0\"" },
                      { label: 'Reach', v1: intel?.taleOfTheTape?.fighter1?.reach || '76 in', v2: intel?.taleOfTheTape?.fighter2?.reach || '74 in' },
                      { label: 'Stance', v1: intel?.taleOfTheTape?.fighter1?.stance || 'Orthodox', v2: intel?.taleOfTheTape?.fighter2?.stance || 'Southpaw' },
                      { label: 'Strikes/Min', v1: intel?.taleOfTheTape?.fighter1?.sigStrikesPerMin || '5.24', v2: intel?.taleOfTheTape?.fighter2?.sigStrikesPerMin || '4.88' },
                      { label: 'Striking Acc.', v1: intel?.taleOfTheTape?.fighter1?.strikingAccuracy || '57%', v2: intel?.taleOfTheTape?.fighter2?.strikingAccuracy || '51%' },
                      { label: 'Takedown Avg.', v1: intel?.taleOfTheTape?.fighter1?.takedownAvg || '2.40', v2: intel?.taleOfTheTape?.fighter2?.takedownAvg || '1.80' },
                      { label: 'Submissions/15m', v1: intel?.taleOfTheTape?.fighter1?.subAvg || '1.2', v2: intel?.taleOfTheTape?.fighter2?.subAvg || '0.8' },
                    ].map((row, rIdx) => (
                      <View key={rIdx} style={styles.totSpecRow}>
                        <Text style={styles.totSpecVal1}>{row.v1}</Text>
                        <Text style={styles.totSpecLabel}>{row.label}</Text>
                        <Text style={styles.totSpecVal2}>{row.v2}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            ) : (
              /* TEAM SPORTS (Basketball, Hockey, Soccer) */
              <>
                {/* View Selector: Visual Formation vs List View */}
                <View style={styles.lineupViewSelector}>
                  <TouchableOpacity
                    style={[styles.lineupViewBtn, lineupView === 'pitch' && styles.lineupViewBtnActive]}
                    onPress={() => setLineupView('pitch')}
                  >
                    <Text style={[styles.lineupViewBtnText, lineupView === 'pitch' && styles.lineupViewBtnTextActive]}>
                      {isBasketball ? 'Court Starting 5' : isHockey ? 'Rink Lines' : 'Tactical Pitch'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.lineupViewBtn, lineupView === 'list' && styles.lineupViewBtnActive]}
                    onPress={() => setLineupView('list')}
                  >
                    <Text style={[styles.lineupViewBtnText, lineupView === 'list' && styles.lineupViewBtnTextActive]}>
                      Roster List
                    </Text>
                  </TouchableOpacity>
                </View>

                {lineupView === 'pitch' ? (
                  <View>
                    {/* Team Selector */}
                    <View style={styles.pitchTeamSelector}>
                      <TouchableOpacity
                        style={[styles.pitchTeamBtn, pitchTeam === 'home' && styles.pitchTeamBtnActive]}
                        onPress={() => setPitchTeam('home')}
                      >
                        <Image
                          source={{ uri: matchup.homeTeam.crestUrl || getTeamCrest(matchup.homeTeam.name || matchup.homeTeam.id) }}
                          style={styles.pitchTeamCrest}
                        />
                        <Text
                          style={[styles.pitchTeamBtnText, pitchTeam === 'home' && styles.pitchTeamBtnTextActive]}
                          numberOfLines={1}
                        >
                          {matchup.homeTeam.name} ({homeFormation})
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.pitchTeamBtn, pitchTeam === 'away' && styles.pitchTeamBtnActive]}
                        onPress={() => setPitchTeam('away')}
                      >
                        <Image
                          source={{ uri: matchup.awayTeam.crestUrl || getTeamCrest(matchup.awayTeam.name || matchup.awayTeam.id) }}
                          style={styles.pitchTeamCrest}
                        />
                        <Text
                          style={[styles.pitchTeamBtnText, pitchTeam === 'away' && styles.pitchTeamBtnTextActive]}
                          numberOfLines={1}
                        >
                          {matchup.awayTeam.name} ({awayFormation})
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* Playing Surface Container: Basketball Hardwood vs Hockey Rink vs Soccer Pitch */}
                    <View
                      style={[
                        styles.tacticalPitchContainer,
                        isBasketball && styles.basketballCourtContainer,
                        isHockey && styles.hockeyRinkContainer,
                      ]}
                    >
                      {isBasketball ? (
                        /* Basketball Court Markings */
                        <>
                          <View style={styles.bballKey} />
                          <View style={styles.bballThreePointLine} />
                          <View style={styles.bballFreeThrowCircle} />
                          <View style={styles.bballRim} />
                        </>
                      ) : isHockey ? (
                        /* Hockey Rink Markings */
                        <>
                          <View style={styles.hockeyRedLine} />
                          <View style={styles.hockeyBlueLine} />
                          <View style={styles.hockeyFaceoffCircleLeft} />
                          <View style={styles.hockeyFaceoffCircleRight} />
                        </>
                      ) : (
                        /* Soccer Pitch Markings */
                        <>
                          <View style={styles.pitchHalfwayLine} />
                          <View style={styles.pitchCenterCircle} />
                          <View style={styles.pitchCenterDot} />
                          <View style={styles.pitchPenaltyBoxTop} />
                          <View style={styles.pitchGoalBoxTop} />
                          <View style={styles.pitchPenaltyBoxBottom} />
                          <View style={styles.pitchGoalBoxBottom} />
                        </>
                      )}

                      {/* Positioned Player Markers */}
                      {(pitchTeam === 'home' ? activeHomeXI : activeAwayXI).map(p => (
                        <View
                          key={`${p.num}-${p.name}`}
                          style={[
                            styles.pitchPlayerMarker,
                            {
                              left: p.x as any,
                              top: p.y as any,
                            },
                          ]}
                        >
                          <View style={styles.pitchAvatarContainer}>
                            <Image
                              source={{ uri: p.photo || getPlayerPhoto(p.name) }}
                              style={styles.pitchPlayerAvatar}
                            />
                            <View style={styles.pitchNumberBadge}>
                              <Text style={styles.pitchNumberText}>{p.num}</Text>
                            </View>
                          </View>
                          <View style={styles.pitchPlayerNamePill}>
                            <Text style={styles.pitchPlayerNameText} numberOfLines={1}>
                              {p.name.replace(' (C)', '')}
                            </Text>
                            <Text style={styles.pitchPlayerPosSubText}>{p.pos}</Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>
                ) : (
                  <View style={{ gap: 12 }}>
                    {/* Home Roster List */}
                    <View style={styles.cardContainer}>
                      <View style={styles.listHeaderRow}>
                        <Image
                          source={{ uri: matchup.homeTeam.crestUrl || getTeamCrest(matchup.homeTeam.name || matchup.homeTeam.id) }}
                          style={styles.listHeaderCrest}
                        />
                        <Text style={styles.cardSectionHeader}>
                          {matchup.homeTeam.name} {isBasketball ? 'Starting 5' : isHockey ? 'Starting Lines' : 'Starting XI'} ({homeFormation})
                        </Text>
                      </View>
                      {activeHomeXI.map(p => (
                        <View key={`${p.num}-${p.name}`} style={styles.playerItemRow}>
                          <View style={styles.playerNumPill}>
                            <Text style={styles.playerNumText}>{p.num}</Text>
                          </View>
                          <Image source={{ uri: p.photo || getPlayerPhoto(p.name) }} style={styles.playerListAvatar} />
                          <Text style={styles.playerItemName}>{p.name}</Text>
                          <View style={styles.playerPosBadge}>
                            <Text style={styles.playerItemPos}>{p.pos}</Text>
                          </View>
                        </View>
                      ))}

                      {activeHomeSubs.length > 0 && (
                        <>
                          <Text style={[styles.cardSectionHeader, { marginTop: 14, fontSize: 13 }]}>
                            {isBasketball ? 'Bench Reserves' : 'Substitutes'}
                          </Text>
                          {activeHomeSubs.map(s => (
                            <View key={`sub-${s.number}-${s.name}`} style={styles.playerItemRow}>
                              <View style={styles.playerNumPill}>
                                <Text style={styles.playerNumText}>{s.number}</Text>
                              </View>
                              <Image source={{ uri: s.photo || getPlayerPhoto(s.name) }} style={styles.playerListAvatar} />
                              <Text style={styles.playerItemName}>{s.name}</Text>
                              <View style={styles.playerPosBadge}>
                                <Text style={styles.playerItemPos}>{s.position}</Text>
                              </View>
                            </View>
                          ))}
                        </>
                      )}
                    </View>

                    {/* Away Roster List */}
                    <View style={styles.cardContainer}>
                      <View style={styles.listHeaderRow}>
                        <Image
                          source={{ uri: matchup.awayTeam.crestUrl || getTeamCrest(matchup.awayTeam.name || matchup.awayTeam.id) }}
                          style={styles.listHeaderCrest}
                        />
                        <Text style={styles.cardSectionHeader}>
                          {matchup.awayTeam.name} {isBasketball ? 'Starting 5' : isHockey ? 'Starting Lines' : 'Starting XI'} ({awayFormation})
                        </Text>
                      </View>
                      {activeAwayXI.map(p => (
                        <View key={`${p.num}-${p.name}`} style={styles.playerItemRow}>
                          <View style={styles.playerNumPill}>
                            <Text style={styles.playerNumText}>{p.num}</Text>
                          </View>
                          <Image source={{ uri: p.photo || getPlayerPhoto(p.name) }} style={styles.playerListAvatar} />
                          <Text style={styles.playerItemName}>{p.name}</Text>
                          <View style={styles.playerPosBadge}>
                            <Text style={styles.playerItemPos}>{p.pos}</Text>
                          </View>
                        </View>
                      ))}

                      {activeAwaySubs.length > 0 && (
                        <>
                          <Text style={[styles.cardSectionHeader, { marginTop: 14, fontSize: 13 }]}>
                            {isBasketball ? 'Bench Reserves' : 'Substitutes'}
                          </Text>
                          {activeAwaySubs.map(s => (
                            <View key={`sub-${s.number}-${s.name}`} style={styles.playerItemRow}>
                              <View style={styles.playerNumPill}>
                                <Text style={styles.playerNumText}>{s.number}</Text>
                              </View>
                              <Image source={{ uri: s.photo || getPlayerPhoto(s.name) }} style={styles.playerListAvatar} />
                              <Text style={styles.playerItemName}>{s.name}</Text>
                              <View style={styles.playerPosBadge}>
                                <Text style={styles.playerItemPos}>{s.position}</Text>
                              </View>
                            </View>
                          ))}
                        </>
                      )}
                    </View>
                  </View>
                )}
              </>
            )}
          </View>
        )}

        {/* ── TAB 4: EVENTS / SCORING ── */}
        {activeTab === 'events' && (
          <View style={styles.tabContentSection}>
            {isCombat ? (
              /* Combat Rounds & Result */
              <View style={styles.cardContainer}>
                <View style={styles.combatResultCard}>
                  <Trophy size={18} color="#F8BE38" strokeWidth={2.4} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.combatResultTitle}>
                      {matchup.status === 'FT' ? 'Official Result' : 'Bout Status'}
                    </Text>
                    <Text style={styles.combatResultSub}>
                      {matchup.status === 'FT' ? '5 Rounds Completed • Unanimous Decision' : 'Scheduled for 5 Championship Rounds'}
                    </Text>
                  </View>
                </View>

                <Text style={styles.cardSectionHeader}>Round-by-Round Breakdown</Text>
                {activeEvents.map((evt, idx) => (
                  <View key={idx} style={styles.eventRow}>
                    <View style={styles.eventMinuteBox}>
                      <Text style={styles.eventMinuteText}>R{Math.min(5, idx + 1)}</Text>
                    </View>
                    <View style={styles.eventIconBox}>
                      <Flame size={16} color="#F8BE38" strokeWidth={2.4} />
                    </View>
                    <View style={styles.eventDetailsBox}>
                      <Text style={styles.eventPlayerText}>{evt.player}</Text>
                      {evt.detail && (
                        <Text style={styles.eventAssistText}>{evt.detail}</Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            ) : isBasketball ? (
              /* Basketball Quarter Box Score */
              <View style={{ gap: 12 }}>
                <View style={styles.cardContainer}>
                  <Text style={styles.cardSectionHeader}>Quarter Scoring Box</Text>
                  <View style={styles.boxScoreTable}>
                    <View style={styles.boxScoreRow}>
                      <Text style={[styles.boxScoreHeaderCell, { flex: 2, textAlign: 'left' }]}>Team</Text>
                      <Text style={styles.boxScoreHeaderCell}>Q1</Text>
                      <Text style={styles.boxScoreHeaderCell}>Q2</Text>
                      <Text style={styles.boxScoreHeaderCell}>Q3</Text>
                      <Text style={styles.boxScoreHeaderCell}>Q4</Text>
                      <Text style={[styles.boxScoreHeaderCell, { fontWeight: '900', color: '#FFFFFF' }]}>TOT</Text>
                    </View>
                    {/* Home row */}
                    <View style={styles.boxScoreRow}>
                      <Text style={[styles.boxScoreCell, { flex: 2, textAlign: 'left', fontWeight: '700', color: '#FFFFFF' }]} numberOfLines={1}>
                        {matchup.homeTeam.name}
                      </Text>
                      <Text style={styles.boxScoreCell}>{intel?.quarterScores?.q1?.[0] ?? 28}</Text>
                      <Text style={styles.boxScoreCell}>{intel?.quarterScores?.q2?.[0] ?? 31}</Text>
                      <Text style={styles.boxScoreCell}>{intel?.quarterScores?.q3?.[0] ?? 26}</Text>
                      <Text style={styles.boxScoreCell}>{intel?.quarterScores?.q4?.[0] ?? 27}</Text>
                      <Text style={[styles.boxScoreCell, { fontWeight: '900', color: '#7952FC' }]}>{matchup.homeTeam.score ?? 112}</Text>
                    </View>
                    {/* Away row */}
                    <View style={styles.boxScoreRow}>
                      <Text style={[styles.boxScoreCell, { flex: 2, textAlign: 'left', fontWeight: '700', color: '#FFFFFF' }]} numberOfLines={1}>
                        {matchup.awayTeam.name}
                      </Text>
                      <Text style={styles.boxScoreCell}>{intel?.quarterScores?.q1?.[1] ?? 26}</Text>
                      <Text style={styles.boxScoreCell}>{intel?.quarterScores?.q2?.[1] ?? 29}</Text>
                      <Text style={styles.boxScoreCell}>{intel?.quarterScores?.q3?.[1] ?? 28}</Text>
                      <Text style={styles.boxScoreCell}>{intel?.quarterScores?.q4?.[1] ?? 24}</Text>
                      <Text style={[styles.boxScoreCell, { fontWeight: '900', color: '#F8BE38' }]}>{matchup.awayTeam.score ?? 107}</Text>
                    </View>
                  </View>
                </View>

                {/* Key Game Runs */}
                <View style={styles.cardContainer}>
                  <Text style={styles.cardSectionHeader}>Chronological Highlights</Text>
                  {activeEvents.map((evt, idx) => (
                    <View key={idx} style={styles.eventRow}>
                      <View style={styles.eventMinuteBox}>
                        <Text style={styles.eventMinuteText}>{evt.min}</Text>
                      </View>
                      <View style={styles.eventIconBox}>
                        <Zap size={16} color="#F8BE38" strokeWidth={2.4} />
                      </View>
                      <View style={styles.eventDetailsBox}>
                        <Text style={styles.eventPlayerText}>{evt.player}</Text>
                        {evt.detail && (
                          <Text style={styles.eventAssistText}>{evt.detail}</Text>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            ) : isHockey ? (
              /* Hockey Period Box Score */
              <View style={{ gap: 12 }}>
                <View style={styles.cardContainer}>
                  <Text style={styles.cardSectionHeader}>Period Scoring Box</Text>
                  <View style={styles.boxScoreTable}>
                    <View style={styles.boxScoreRow}>
                      <Text style={[styles.boxScoreHeaderCell, { flex: 2, textAlign: 'left' }]}>Team</Text>
                      <Text style={styles.boxScoreHeaderCell}>1st</Text>
                      <Text style={styles.boxScoreHeaderCell}>2nd</Text>
                      <Text style={styles.boxScoreHeaderCell}>3rd</Text>
                      <Text style={[styles.boxScoreHeaderCell, { fontWeight: '900', color: '#FFFFFF' }]}>TOT</Text>
                    </View>
                    {/* Home row */}
                    <View style={styles.boxScoreRow}>
                      <Text style={[styles.boxScoreCell, { flex: 2, textAlign: 'left', fontWeight: '700', color: '#FFFFFF' }]} numberOfLines={1}>
                        {matchup.homeTeam.name}
                      </Text>
                      <Text style={styles.boxScoreCell}>{intel?.periodScores?.p1?.[0] ?? 1}</Text>
                      <Text style={styles.boxScoreCell}>{intel?.periodScores?.p2?.[0] ?? 1}</Text>
                      <Text style={styles.boxScoreCell}>{intel?.periodScores?.p3?.[0] ?? 2}</Text>
                      <Text style={[styles.boxScoreCell, { fontWeight: '900', color: '#7952FC' }]}>{matchup.homeTeam.score ?? 4}</Text>
                    </View>
                    {/* Away row */}
                    <View style={styles.boxScoreRow}>
                      <Text style={[styles.boxScoreCell, { flex: 2, textAlign: 'left', fontWeight: '700', color: '#FFFFFF' }]} numberOfLines={1}>
                        {matchup.awayTeam.name}
                      </Text>
                      <Text style={styles.boxScoreCell}>{intel?.periodScores?.p1?.[1] ?? 0}</Text>
                      <Text style={styles.boxScoreCell}>{intel?.periodScores?.p2?.[1] ?? 2}</Text>
                      <Text style={styles.boxScoreCell}>{intel?.periodScores?.p3?.[1] ?? 1}</Text>
                      <Text style={[styles.boxScoreCell, { fontWeight: '900', color: '#F8BE38' }]}>{matchup.awayTeam.score ?? 3}</Text>
                    </View>
                  </View>
                </View>

                {/* Period Events */}
                <View style={styles.cardContainer}>
                  <Text style={styles.cardSectionHeader}>Chronological Goals & Penalties</Text>
                  {activeEvents.map((evt, idx) => (
                    <View key={idx} style={styles.eventRow}>
                      <View style={styles.eventMinuteBox}>
                        <Text style={styles.eventMinuteText}>{evt.min}</Text>
                      </View>
                      <View style={styles.eventIconBox}>
                        <CircleDot size={16} color="#60A5FA" strokeWidth={2.4} />
                      </View>
                      <View style={styles.eventDetailsBox}>
                        <Text style={styles.eventPlayerText}>{evt.player}</Text>
                        {evt.detail && (
                          <Text style={styles.eventAssistText}>{evt.detail}</Text>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            ) : (
              /* Soccer Match Events (Default) */
              <View style={styles.cardContainer}>
                <Text style={styles.cardSectionHeader}>Chronological Match Events</Text>
                {activeEvents.map((evt, idx) => {
                  const isHome = evt.team === 'home';
                  const teamName = isHome ? matchup.homeTeam.name : matchup.awayTeam.name;

                  return (
                    <View key={idx} style={styles.eventRow}>
                      <View style={styles.eventMinuteBox}>
                        <Text style={styles.eventMinuteText}>{evt.min}</Text>
                      </View>

                      <View style={styles.eventIconBox}>
                        {evt.type === 'goal' && (
                          <CircleDot size={18} color="#22C55E" strokeWidth={2.5} />
                        )}
                        {evt.type === 'yellow' && (
                          <View style={styles.yellowCardIcon} />
                        )}
                        {evt.type === 'sub' && (
                          <ArrowRightLeft size={16} color="#A098B5" strokeWidth={2.4} />
                        )}
                      </View>

                      {/* Circular player portrait */}
                      <Image
                        source={{ uri: getPlayerPhoto(evt.player) }}
                        style={styles.eventPlayerAvatar}
                      />

                      <View style={styles.eventDetailsBox}>
                        <Text style={styles.eventPlayerText}>{evt.player}</Text>
                        {evt.assist && (
                          <View style={styles.assistRow}>
                            <Image
                              source={{ uri: getPlayerPhoto(evt.assist) }}
                              style={styles.assistPlayerAvatar}
                            />
                            <Text style={styles.eventAssistText}>Assist: {evt.assist}</Text>
                          </View>
                        )}
                        {evt.detail && (
                          <Text style={styles.eventAssistText}>{evt.detail}</Text>
                        )}
                      </View>

                      <View style={styles.eventTeamBadgeRow}>
                        <Image
                          source={{ uri: getTeamCrest(teamName) }}
                          style={styles.eventTeamCrest}
                        />
                        <Text style={styles.eventTeamBadge}>
                          {teamName.substring(0, 3).toUpperCase()}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        )}
          </>
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
  scoreboardHero: {
    margin: 16,
    marginBottom: 12,
    borderRadius: 20,
    backgroundColor: '#1E1730',
    padding: 18,
  },
  heroHeaderPillRow: {
    alignItems: 'center',
    marginBottom: 14,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4.5,
    borderRadius: 8,
    backgroundColor: '#2A2045',
  },
  statusBadgeLive: {
    backgroundColor: 'rgba(34, 197, 94, 0.16)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  livePulsingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
    marginRight: 6,
  },
  statusBadgeLiveText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#22C55E',
    letterSpacing: 0.4,
  },
  statusBadgeFT: {
    backgroundColor: '#2A2045',
  },
  statusBadgeFTText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#A098B5',
  },
  statusBadgeUpcomingText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#F8BE38',
  },
  scoreboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroClubSide: {
    flex: 1,
    alignItems: 'center',
  },
  crestContainer: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#181524',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  crestImg: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  clubNameText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  heroCenterScore: {
    width: 100,
    alignItems: 'center',
  },
  heroScoresRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  heroScoreDigit: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  heroScoreDivider: {
    fontSize: 24,
    fontWeight: '700',
    color: '#7952FC',
    marginHorizontal: 4,
  },
  heroVsBadge: {
    backgroundColor: '#2A2045',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 4,
  },
  heroVsText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#7952FC',
  },
  heroVenueText: {
    fontSize: 10.5,
    color: '#A098B5',
    textAlign: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 14,
    gap: 8,
  },
  watchLiveBtn: {
    flex: 1,
    height: 44,
    backgroundColor: '#7952FC',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  watchLiveText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  actionPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1730',
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 12,
    gap: 6,
  },
  actionPillBtnActive: {
    backgroundColor: '#2A2045',
  },
  actionPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#A098B5',
  },
  actionPillTextActive: {
    color: '#7952FC',
  },
  tabsBar: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 14,
    backgroundColor: '#181524',
    borderRadius: 12,
    padding: 4,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 9,
  },
  tabItemActive: {
    backgroundColor: '#2A2045',
  },
  tabItemText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#A098B5',
  },
  tabItemTextActive: {
    color: '#FFFFFF',
  },
  tabContentSection: {
    paddingHorizontal: 16,
    gap: 12,
  },
  cardContainer: {
    backgroundColor: '#1E1730',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  cardSectionHeader: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoMeta: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: '#A098B5',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 1,
  },
  h2hRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#181524',
  },
  h2hClub: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  h2hScorePill: {
    backgroundColor: '#2A2045',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  h2hScoreText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7952FC',
  },
  statMetric: {
    marginBottom: 8,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  statValHome: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    width: 40,
  },
  statName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#A098B5',
  },
  statValAway: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    width: 40,
    textAlign: 'right',
  },
  comparisonTrack: {
    height: 6,
    backgroundColor: '#181524',
    borderRadius: 3,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  barHome: {
    height: '100%',
    backgroundColor: '#7952FC',
  },
  barAway: {
    height: '100%',
    backgroundColor: '#F8BE38',
  },
  formationBanner: {
    backgroundColor: '#2A2045',
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 4,
  },
  formationText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  playerItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#181524',
  },
  playerNumPill: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2A2045',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  playerNumText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7952FC',
  },
  playerItemName: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  playerItemPos: {
    fontSize: 11,
    fontWeight: '600',
    color: '#A098B5',
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#181524',
  },
  eventMinuteBox: {
    width: 32,
  },
  eventMinuteText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#7952FC',
  },
  eventIconBox: {
    width: 26,
    alignItems: 'center',
    marginRight: 8,
  },
  yellowCardIcon: {
    width: 10,
    height: 14,
    backgroundColor: '#F8BE38',
    borderRadius: 2,
  },
  eventDetailsBox: {
    flex: 1,
  },
  eventPlayerText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  eventAssistText: {
    fontSize: 11,
    color: '#A098B5',
  },
  eventTeamBadge: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#A098B5',
  },
  // ── Lineup View Switcher ──
  lineupViewSelector: {
    flexDirection: 'row',
    backgroundColor: '#1E1730',
    borderRadius: 12,
    padding: 3,
    marginBottom: 4,
  },
  lineupViewBtn: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: 9,
  },
  lineupViewBtnActive: {
    backgroundColor: '#7952FC',
  },
  lineupViewBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#A098B5',
  },
  lineupViewBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  // ── Tactical Pitch Team Selector ──
  pitchTeamSelector: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 8,
  },
  pitchTeamBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: '#1E1730',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  pitchTeamBtnActive: {
    backgroundColor: '#2A2045',
    borderColor: '#7952FC',
  },
  pitchTeamCrest: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  pitchTeamBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#A098B5',
  },
  pitchTeamBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  // ── Tactical Football Pitch ──
  tacticalPitchContainer: {
    height: 480,
    backgroundColor: '#123D20',
    borderRadius: 16,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginVertical: 4,
  },
  pitchHalfwayLine: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.28)',
  },
  pitchCenterCircle: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.28)',
    marginTop: -43,
    marginLeft: -43,
  },
  pitchCenterDot: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    marginTop: -3,
    marginLeft: -3,
  },
  pitchPenaltyBoxTop: {
    position: 'absolute',
    top: 0,
    left: '24%',
    right: '24%',
    height: 68,
    borderBottomWidth: 1.5,
    borderLeftWidth: 1.5,
    borderRightWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.28)',
  },
  pitchGoalBoxTop: {
    position: 'absolute',
    top: 0,
    left: '37%',
    right: '37%',
    height: 28,
    borderBottomWidth: 1.5,
    borderLeftWidth: 1.5,
    borderRightWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.22)',
  },
  pitchPenaltyBoxBottom: {
    position: 'absolute',
    bottom: 0,
    left: '24%',
    right: '24%',
    height: 68,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderRightWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.28)',
  },
  pitchGoalBoxBottom: {
    position: 'absolute',
    bottom: 0,
    left: '37%',
    right: '37%',
    height: 28,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderRightWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.22)',
  },
  // Pitch Player Marker
  pitchPlayerMarker: {
    position: 'absolute',
    width: 66,
    marginLeft: -33,
    alignItems: 'center',
  },
  pitchAvatarContainer: {
    position: 'relative',
    width: 38,
    height: 38,
  },
  pitchPlayerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: '#1E1730',
  },
  pitchNumberBadge: {
    position: 'absolute',
    bottom: -2,
    right: -4,
    backgroundColor: '#7952FC',
    width: 17,
    height: 17,
    borderRadius: 8.5,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.2,
    borderColor: '#FFFFFF',
  },
  pitchNumberText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  pitchPlayerNamePill: {
    marginTop: 3,
    backgroundColor: 'rgba(14, 13, 20, 0.88)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    maxWidth: 66,
  },
  pitchPlayerNameText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '700',
    textAlign: 'center',
  },
  // ── Roster List Additions ──
  listHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  listHeaderCrest: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
  },
  playerListAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
    backgroundColor: '#2A2045',
  },
  playerPosBadge: {
    backgroundColor: '#2A2045',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  // ── Event Additions ──
  eventPlayerAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    marginRight: 10,
    backgroundColor: '#2A2045',
  },
  assistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  assistPlayerAvatar: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  eventTeamBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#2A2045',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  eventTeamCrest: {
    width: 15,
    height: 15,
    resizeMode: 'contain',
  },
  pitchPlayerPosSubText: {
    color: '#7952FC',
    fontSize: 8.5,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 1,
  },
  // ── Tale of the Tape ──
  totHeaderBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1E1730',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(248, 190, 56, 0.3)',
  },
  totHeaderTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#F8BE38',
    letterSpacing: 0.8,
  },
  totCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1730',
    borderRadius: 16,
    padding: 16,
  },
  totFighterSide: {
    flex: 1,
    alignItems: 'center',
  },
  totFighterAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#2A2045',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#7952FC',
  },
  totFighterName: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  totRecordPill: {
    backgroundColor: '#2A2045',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  totRecordText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#F8BE38',
  },
  totVsCenter: {
    width: 90,
    alignItems: 'center',
  },
  totVsBadge: {
    backgroundColor: '#2A2045',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 4,
  },
  totVsText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#7952FC',
  },
  totDivisionText: {
    fontSize: 10,
    color: '#A098B5',
    textAlign: 'center',
    fontWeight: '600',
  },
  totSpecsTable: {
    gap: 8,
    marginTop: 4,
  },
  totSpecRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#181524',
  },
  totSpecVal1: {
    width: 90,
    fontSize: 12.5,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'left',
  },
  totSpecLabel: {
    flex: 1,
    fontSize: 11,
    fontWeight: '600',
    color: '#A098B5',
    textAlign: 'center',
  },
  totSpecVal2: {
    width: 90,
    fontSize: 12.5,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'right',
  },
  // ── Basketball Court Surface ──
  basketballCourtContainer: {
    backgroundColor: '#1E120A',
    borderColor: 'rgba(235, 137, 53, 0.45)',
  },
  bballKey: {
    position: 'absolute',
    top: 0,
    left: '32%',
    right: '32%',
    height: 120,
    borderWidth: 1.5,
    borderTopWidth: 0,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    backgroundColor: 'rgba(235, 137, 53, 0.08)',
  },
  bballThreePointLine: {
    position: 'absolute',
    top: -20,
    left: '12%',
    right: '12%',
    height: 220,
    borderBottomLeftRadius: 160,
    borderBottomRightRadius: 160,
    borderWidth: 1.5,
    borderTopWidth: 0,
    borderColor: 'rgba(255, 255, 255, 0.32)',
  },
  bballFreeThrowCircle: {
    position: 'absolute',
    top: 90,
    left: '50%',
    width: 60,
    height: 60,
    borderRadius: 30,
    marginLeft: -30,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  bballRim: {
    position: 'absolute',
    top: 14,
    left: '50%',
    width: 14,
    height: 14,
    borderRadius: 7,
    marginLeft: -7,
    backgroundColor: '#F8BE38',
  },
  // ── Hockey Rink Surface ──
  hockeyRinkContainer: {
    backgroundColor: '#0D1E30',
    borderColor: 'rgba(96, 165, 250, 0.4)',
  },
  hockeyRedLine: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 2.5,
    backgroundColor: 'rgba(239, 68, 68, 0.65)',
  },
  hockeyBlueLine: {
    position: 'absolute',
    top: '32%',
    left: 0,
    right: 0,
    height: 2.5,
    backgroundColor: 'rgba(59, 130, 246, 0.75)',
  },
  hockeyFaceoffCircleLeft: {
    position: 'absolute',
    top: '18%',
    left: '14%',
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1.5,
    borderColor: 'rgba(239, 68, 68, 0.45)',
  },
  hockeyFaceoffCircleRight: {
    position: 'absolute',
    top: '18%',
    right: '14%',
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1.5,
    borderColor: 'rgba(239, 68, 68, 0.45)',
  },
  // ── Box Score Table ──
  boxScoreTable: {
    gap: 8,
    marginTop: 4,
  },
  boxScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#181524',
  },
  boxScoreHeaderCell: {
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
    color: '#A098B5',
    textAlign: 'center',
  },
  boxScoreCell: {
    flex: 1,
    fontSize: 12,
    color: '#A098B5',
    textAlign: 'center',
    fontWeight: '600',
  },
  // ── Combat Result ──
  combatResultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#2A2045',
    padding: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
  combatResultTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  combatResultSub: {
    fontSize: 11,
    color: '#A098B5',
    marginTop: 2,
  },
});
