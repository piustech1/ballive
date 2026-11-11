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
  const homeFormation = intel?.lineups?.home?.formation || '4-3-3';
  const awayFormation = intel?.lineups?.away?.formation || '4-3-3';

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

  // Active Starting XIs with dynamically calculated tactical pitch coordinates
  const activeHomeXI = useMemo(() => {
    const rawXI = intel?.lineups?.home?.startingXI && intel.lineups.home.startingXI.length > 0
      ? intel.lineups.home.startingXI
      : defaultHomeXI;
    const positioned = assignPitchCoordinates(rawXI, homeFormation);
    return positioned.map(p => ({
      num: p.number,
      name: p.name,
      pos: p.position,
      x: p.x || '50%',
      y: p.y || '50%',
      photo: p.photo || getPlayerPhoto(p.name),
    }));
  }, [intel, homeFormation]);

  const activeAwayXI = useMemo(() => {
    const rawXI = intel?.lineups?.away?.startingXI && intel.lineups.away.startingXI.length > 0
      ? intel.lineups.away.startingXI
      : defaultAwayXI;
    const positioned = assignPitchCoordinates(rawXI, awayFormation);
    return positioned.map(p => ({
      num: p.number,
      name: p.name,
      pos: p.position,
      x: p.x || '50%',
      y: p.y || '50%',
      photo: p.photo || getPlayerPhoto(p.name),
    }));
  }, [intel, awayFormation]);

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
                  source={{ uri: getTeamCrest(matchup.homeTeam.name || matchup.homeTeam.id) }}
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
                {matchup.venue}
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
                      crestUrl: getTeamCrest(matchup.awayTeam.name || matchup.awayTeam.id),
                      stadium: 'Home Ground',
                      domesticTitle: 'Top Tier Football Club',
                    },
                  },
                });
              }}
            >
              <View style={styles.crestContainer}>
                <Image
                  source={{ uri: getTeamCrest(matchup.awayTeam.name || matchup.awayTeam.id) }}
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
              Statistics
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'lineups' && styles.tabItemActive]}
            onPress={() => setActiveTab('lineups')}
          >
            <Text style={[styles.tabItemText, activeTab === 'lineups' && styles.tabItemTextActive]}>
              Lineups
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'events' && styles.tabItemActive]}
            onPress={() => setActiveTab('events')}
          >
            <Text style={[styles.tabItemText, activeTab === 'events' && styles.tabItemTextActive]}>
              Events
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── TAB 1: SUMMARY ── */}
        {activeTab === 'summary' && (
          <View style={styles.tabContentSection}>
            <View style={styles.cardContainer}>
              <Text style={styles.cardSectionHeader}>Fixture Information</Text>

              <View style={styles.infoRow}>
                <MapPin size={17} color="#7952FC" strokeWidth={2.2} />
                <View style={styles.infoMeta}>
                  <Text style={styles.infoLabel}>Stadium / Venue</Text>
                  <Text style={styles.infoValue}>{matchup.venue}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Calendar size={17} color="#7952FC" strokeWidth={2.2} />
                <View style={styles.infoMeta}>
                  <Text style={styles.infoLabel}>Matchday Date</Text>
                  <Text style={styles.infoValue}>{matchup.kickoffDate}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Clock size={17} color="#7952FC" strokeWidth={2.2} />
                <View style={styles.infoMeta}>
                  <Text style={styles.infoLabel}>Kickoff Time</Text>
                  <Text style={styles.infoValue}>{matchup.kickoffTime}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Shield size={17} color="#7952FC" strokeWidth={2.2} />
                <View style={styles.infoMeta}>
                  <Text style={styles.infoLabel}>Tournament</Text>
                  <Text style={styles.infoValue}>{matchup.competition}</Text>
                </View>
              </View>
            </View>

            {/* Head-to-Head form preview */}
            <View style={styles.cardContainer}>
              <Text style={styles.cardSectionHeader}>Recent Head-to-Head Form</Text>
              {intel?.headToHead ? (
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
              <Text style={styles.cardSectionHeader}>Match Statistics</Text>

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
            </View>
          </View>
        )}

        {/* ── TAB 3: LINEUPS ── */}
        {activeTab === 'lineups' && (
          <View style={styles.tabContentSection}>
            {/* View Selector: Pitch View vs List View */}
            <View style={styles.lineupViewSelector}>
              <TouchableOpacity
                style={[styles.lineupViewBtn, lineupView === 'pitch' && styles.lineupViewBtnActive]}
                onPress={() => setLineupView('pitch')}
              >
                <Text style={[styles.lineupViewBtnText, lineupView === 'pitch' && styles.lineupViewBtnTextActive]}>
                  Tactical Pitch
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
                {/* Team Selector for Pitch */}
                <View style={styles.pitchTeamSelector}>
                  <TouchableOpacity
                    style={[styles.pitchTeamBtn, pitchTeam === 'home' && styles.pitchTeamBtnActive]}
                    onPress={() => setPitchTeam('home')}
                  >
                    <Image
                      source={{ uri: getTeamCrest(matchup.homeTeam.name || matchup.homeTeam.id) }}
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
                      source={{ uri: getTeamCrest(matchup.awayTeam.name || matchup.awayTeam.id) }}
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

                {/* Tactical Football Pitch Container */}
                <View style={styles.tacticalPitchContainer}>
                  {/* Outer & inner pitch field lines */}
                  <View style={styles.pitchHalfwayLine} />
                  <View style={styles.pitchCenterCircle} />
                  <View style={styles.pitchCenterDot} />
                  <View style={styles.pitchPenaltyBoxTop} />
                  <View style={styles.pitchGoalBoxTop} />
                  <View style={styles.pitchPenaltyBoxBottom} />
                  <View style={styles.pitchGoalBoxBottom} />

                  {/* 11 Positioned Player Markers */}
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
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            ) : (
              <View style={{ gap: 12 }}>
                {/* Home Starting XI List */}
                <View style={styles.cardContainer}>
                  <View style={styles.listHeaderRow}>
                    <Image
                      source={{ uri: getTeamCrest(matchup.homeTeam.name || matchup.homeTeam.id) }}
                      style={styles.listHeaderCrest}
                    />
                    <Text style={styles.cardSectionHeader}>{matchup.homeTeam.name} Starting XI ({homeFormation})</Text>
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
                      <Text style={[styles.cardSectionHeader, { marginTop: 14, fontSize: 13 }]}>Substitutes</Text>
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

                {/* Away Starting XI List */}
                <View style={styles.cardContainer}>
                  <View style={styles.listHeaderRow}>
                    <Image
                      source={{ uri: getTeamCrest(matchup.awayTeam.name || matchup.awayTeam.id) }}
                      style={styles.listHeaderCrest}
                    />
                    <Text style={styles.cardSectionHeader}>{matchup.awayTeam.name} Starting XI ({awayFormation})</Text>
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
                      <Text style={[styles.cardSectionHeader, { marginTop: 14, fontSize: 13 }]}>Substitutes</Text>
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
          </View>
        )}

        {/* ── TAB 4: EVENTS ── */}
        {activeTab === 'events' && (
          <View style={styles.tabContentSection}>
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
});
