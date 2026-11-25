import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageBackground,
  Share,
  ScrollView,
  StatusBar,
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
  Trophy,
  CheckCircle,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../theme/colors';
import { SecondaryScreenHeader } from '../components/common/SecondaryScreenHeader';
import { CompetitionLogo } from '../components/common/CompetitionLogo';
import { MatchArtworkBackground } from '../components/common/MatchArtworkBackground';
import { TeamCrest } from '../components/common/TeamCrest';
import { WinProbabilityBar } from '../components/match/WinProbabilityBar';
import { winProbabilityService, WinProbabilityResult } from '../services/winProbabilityService';
import { getTeamCrest, DEFAULT_CREST } from '../utils/teamCrestResolver';
import {
  resolveSportBackground,
  isGenuineEventArtwork,
} from '../utils/sportBackgroundResolver';
import { DiscoverMatchup, UPCOMING_HIGHLIGHTS } from '../constants/discoverData';
import { useProfile } from '../hooks/useProfile';
import { useSavedMatches } from '../hooks/useSavedMatches';
import { useAppNavigation } from '../navigation/NavigationContext';
import { navigateToMatch, findCompetitionById, findTeamById } from '../navigation/navHelpers';
import { streamingApiService } from '../services/streamingApiService';
import { sportsApiService } from '../services/sportsApiService';
import { UniversalMatchCard } from '../components/common/UniversalMatchCard';
import {
  normalizeMatchStatus,
  sortMatchesWithLiveFirst,
  deduplicateMatchups,
  isSameFixture,
} from '../utils/matchStatus';
import { theSportsDbService } from '../services/theSportsDbService';
import {
  isCombatSport,
  isMotorsport,
  getSportDisplayName,
} from '../utils/sportClassifier';

export type NormalizedSport =
  | 'football'
  | 'basketball'
  | 'nfl'
  | 'hockey'
  | 'motorsport'
  | 'tennis'
  | 'cricket'
  | 'other';

export function normalizeSport(rawSport?: string, competitionName?: string): NormalizedSport {
  const s = (rawSport || '').toLowerCase();
  const c = (competitionName || '').toLowerCase();

  // 1. Explicit Football / Soccer / EFL / Tournaments (Highest Priority)
  const isSoccer =
    s === 'soccer' ||
    s === 'football' ||
    s === 'association football' ||
    c.includes('soccer') ||
    c.includes('premier') ||
    c.includes('efl') ||
    c.includes('championship') ||
    c.includes('league one') ||
    c.includes('league two') ||
    c.includes('la liga') ||
    c.includes('laliga') ||
    c.includes('serie a') ||
    c.includes('bundesliga') ||
    c.includes('ligue 1') ||
    c.includes('ligue 2') ||
    c.includes('coupe') ||
    c.includes('copa') ||
    c.includes('fa cup') ||
    c.includes('carabao') ||
    c.includes('champions') ||
    c.includes('europa') ||
    c.includes('conference') ||
    c.includes('fifa') ||
    c.includes('uefa') ||
    c.includes('friendly') ||
    c.includes('wsl');

  if (isSoccer && !s.includes('american') && !c.includes('nfl')) {
    return 'football';
  }
  if (s === 'basketball' || c.includes('nba') || c.includes('euroleague') || c.includes('basketball')) return 'basketball';
  if (s === 'hockey' || c.includes('nhl') || c.includes('khl') || c.includes('hockey')) return 'hockey';
  if (s === 'american_football' || s === 'nfl' || c.includes('nfl') || c.includes('american football')) return 'nfl';
  if (s === 'motorsport' || s === 'racing' || s === 'f1' || c.includes('f1') || c.includes('formula') || c.includes('grand prix') || c.includes('motorsport') || c.includes('nascar')) return 'motorsport';
  if (s === 'tennis' || c.includes('tennis') || c.includes('atp') || c.includes('wta') || c.includes('wimbledon') || c.includes('us open')) return 'tennis';
  if (s === 'cricket' || c.includes('cricket') || c.includes('ipl') || c.includes('icc') || c.includes('bbl')) return 'cricket';

  return 'football';
}

interface MatchDetailsScreenProps {
  matchup: DiscoverMatchup;
}

export const MatchDetailsScreen: React.FC<MatchDetailsScreenProps> = ({ matchup }) => {
  const { navigate } = useAppNavigation();
  const { profile, toggleMatchReminder } = useProfile();
  const { isSaved: checkIsSaved, toggleSave } = useSavedMatches();
  const [activeMatchup, setActiveMatchup] = useState<DiscoverMatchup>(matchup);
  const [moreMatches, setMoreMatches] = useState<DiscoverMatchup[]>(() => {
    const cachedLive = streamingApiService.getCachedLiveMatches();
    if (cachedLive && cachedLive.length > 0) {
      const converted = cachedLive.map(m => streamingApiService.convertLiveMatchToMatchup(m));
      const filtered = converted.filter(m => !isSameFixture(m, matchup));
      return deduplicateMatchups(sortMatchesWithLiveFirst(filtered)).slice(0, 4);
    }
    return [];
  });

  useEffect(() => {
    setActiveMatchup(matchup);
  }, [matchup]);

  // Synchronize real-time live score, game clock, and stream mirrors for the active match
  useEffect(() => {
    let isMounted = true;

    // 1. Cross-reference with live scoreboards (e.g. ESPN) if active
    sportsApiService
      .findEspnEvent(activeMatchup.homeTeam.name, activeMatchup.awayTeam.name, activeMatchup.sport)
      .then(found => {
        if (!isMounted || !found) return;
        if (found.isLive) {
          setActiveMatchup(prev => ({
            ...prev,
            status: 'LIVE',
            isLive: true,
            minute: found.minute,
            playTime: found.playTime,
            homeTeam: { ...prev.homeTeam, score: found.scoreHome },
            awayTeam: { ...prev.awayTeam, score: found.scoreAway },
          }));
        } else if (found.statusText && found.statusText.includes('FINAL')) {
          setActiveMatchup(prev => ({
            ...prev,
            status: 'FT',
            homeTeam: { ...prev.homeTeam, score: found.scoreHome },
            awayTeam: { ...prev.awayTeam, score: found.scoreAway },
          }));
        }
      })
      .catch(() => {});

    // 2. Resolve stream mirrors
    if (activeMatchup.id) {
      streamingApiService
        .resolveStreamMirrors(
          activeMatchup.id,
          activeMatchup.competition,
          activeMatchup.homeTeam.name,
          activeMatchup.awayTeam.name
        )
        .then(mirrors => {
          if (isMounted && mirrors.length > 0) {
            setActiveMatchup(prev => ({
              ...prev,
              streamUrl: mirrors[0].url,
              streams: mirrors,
              hasLiveBroadcast: true,
            }));
          }
        })
        .catch(() => {});
    }

    return () => {
      isMounted = false;
    };
  }, [activeMatchup.id]);

  // Team crests
  const homeCrest =
    activeMatchup.homeTeam.crestUrl ||
    (activeMatchup as any).homeBadge ||
    getTeamCrest(activeMatchup.homeTeam.name) ||
    DEFAULT_CREST;

  const awayCrest =
    activeMatchup.awayTeam.crestUrl ||
    (activeMatchup as any).awayBadge ||
    getTeamCrest(activeMatchup.awayTeam.name) ||
    DEFAULT_CREST;

  // Resolve authentic, sharp, unblurred sport-specific background
  const [asyncArtwork, setAsyncArtwork] = useState<string | null>(() => {
    return theSportsDbService.getCachedArtwork(activeMatchup.homeTeam.name, activeMatchup.awayTeam.name);
  });

  useEffect(() => {
    let isMounted = true;
    const key = theSportsDbService.buildCacheKey(activeMatchup.homeTeam.name, activeMatchup.awayTeam.name);

    const cached = theSportsDbService.getCachedArtwork(activeMatchup.homeTeam.name, activeMatchup.awayTeam.name);
    if (cached && cached !== asyncArtwork) {
      setAsyncArtwork(cached);
    }

    const unsubscribe = theSportsDbService.subscribe((eventKey, url) => {
      if (isMounted && eventKey === key && url) {
        setAsyncArtwork(url);
      }
    });

    theSportsDbService
      .fetchEventArtwork(
        activeMatchup.homeTeam.name,
        activeMatchup.awayTeam.name,
        activeMatchup.sport,
        (activeMatchup as any).rawDate || activeMatchup.kickoffDate
      )
      .then(art => {
        if (isMounted && art) {
          setAsyncArtwork(art);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [activeMatchup.homeTeam.name, activeMatchup.awayTeam.name, activeMatchup.sport, activeMatchup.kickoffDate]);

  const rawImage =
    activeMatchup.poster ||
    (activeMatchup as any).imageUrl ||
    activeMatchup.matchBannerUrl ||
    null;

  const heroArtworkUrl = useMemo(() => {
    if (asyncArtwork && isGenuineEventArtwork(asyncArtwork)) return asyncArtwork;
    const resolved = resolveSportBackground(
      activeMatchup.sport,
      activeMatchup.competition,
      rawImage,
      activeMatchup.homeTeam.name,
      activeMatchup.awayTeam.name,
      activeMatchup.id
    );
    if (resolved && isGenuineEventArtwork(resolved)) return resolved;
    return null;
  }, [
    asyncArtwork,
    activeMatchup.sport,
    activeMatchup.competition,
    rawImage,
    activeMatchup.homeTeam.name,
    activeMatchup.awayTeam.name,
    activeMatchup.id,
  ]);

  const isReminderSet = profile.matchReminderIds.includes(activeMatchup.id);
  const isSaved = checkIsSaved(activeMatchup.id);

  // Authoritative match status resolution
  const normalizedStatus = normalizeMatchStatus({
    rawStatus: activeMatchup.status,
    playTime: activeMatchup.playTime,
    minute: activeMatchup.minute,
    sport: activeMatchup.sport,
  });

  const isFinished = normalizedStatus.isFinished || activeMatchup.status === 'FT';
  const isLive = !isFinished && (
    normalizedStatus.isLive ||
    activeMatchup.status === 'LIVE' ||
    Boolean(activeMatchup.isLive) ||
    (activeMatchup.minute !== undefined && activeMatchup.minute > 0 && activeMatchup.minute <= 130) ||
    activeMatchup.playTime === 'HT' ||
    Boolean(activeMatchup.playTime && activeMatchup.playTime.includes('LIVE'))
  );
  const isUpcoming = !isLive && !isFinished;
  const hasLiveStream = isLive && Boolean(activeMatchup.streamUrl || activeMatchup.hasLiveBroadcast || (activeMatchup.streams && activeMatchup.streams.length > 0));

  const homeScore = activeMatchup.homeTeam.score ?? 0;
  const awayScore = activeMatchup.awayTeam.score ?? 0;

  const isCombat = isCombatSport(
    activeMatchup.sport,
    activeMatchup.competition,
    `${activeMatchup.homeTeam.name} ${activeMatchup.awayTeam.name}`
  );
  const isMotor = isMotorsport(
    activeMatchup.sport,
    activeMatchup.competition,
    `${activeMatchup.homeTeam.name} ${activeMatchup.awayTeam.name}`
  );
  const cleanAway = activeMatchup.awayTeam.name.trim().toLowerCase();
  const isPlaceholderAway =
    !cleanAway ||
    ['opponent', 'tbd', 'tba', 'unknown', 'none', 'f1', 'formula 1', 'grand prix', 'red corner', 'blue corner'].includes(cleanAway);

  // Load genuine win probability for upcoming matches
  const [winProb, setWinProb] = useState<WinProbabilityResult | null>(null);
  const [isLoadingProb, setIsLoadingProb] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (isUpcoming) {
      setIsLoadingProb(true);
      winProbabilityService
        .getWinProbability({
          matchId: activeMatchup.id,
          sport: activeMatchup.sport,
          competition: activeMatchup.competition,
          homeTeam: activeMatchup.homeTeam.name,
          awayTeam: activeMatchup.awayTeam.name,
        })
        .then(result => {
          if (isMounted) {
            setWinProb(result);
            setIsLoadingProb(false);
          }
        })
        .catch(() => {
          if (isMounted) {
            setWinProb({ isAvailable: false });
            setIsLoadingProb(false);
          }
        });
    } else {
      setWinProb(null);
      setIsLoadingProb(false);
    }
    return () => {
      isMounted = false;
    };
  }, [activeMatchup.id, activeMatchup.homeTeam.name, activeMatchup.awayTeam.name, isUpcoming]);

  // Load real related live & upcoming matches for discovery navigation
  useEffect(() => {
    let isMounted = true;

    streamingApiService
      .getLiveMatches()
      .then(liveMatches => {
        if (!isMounted) return;
        const converted = (liveMatches || []).map(m => streamingApiService.convertLiveMatchToMatchup(m));
        const pool = converted.length > 0 ? converted : UPCOMING_HIGHLIGHTS;

        // Strictly exclude active fixture by canonical identity and ID
        const filtered = pool.filter(m => !isSameFixture(m, activeMatchup));

        // Deduplicate fixtures by canonical event identity
        const deduplicated = deduplicateMatchups(filtered);

        // Prioritize same competition, then same sport, sorted chronologically with live first
        const sameComp = deduplicated.filter(
          m => m.competition.toLowerCase() === activeMatchup.competition.toLowerCase()
        );
        const sameSport = deduplicated.filter(
          m =>
            m.sport === activeMatchup.sport &&
            m.competition.toLowerCase() !== activeMatchup.competition.toLowerCase()
        );
        const others = deduplicated.filter(
          m =>
            m.sport !== activeMatchup.sport &&
            m.competition.toLowerCase() !== activeMatchup.competition.toLowerCase()
        );

        const sorted = [
          ...sortMatchesWithLiveFirst(sameComp),
          ...sortMatchesWithLiveFirst(sameSport),
          ...sortMatchesWithLiveFirst(others),
        ];

        setMoreMatches(deduplicateMatchups(sorted).slice(0, 4));
      })
      .catch(() => {
        if (isMounted) {
          const fallbackFiltered = UPCOMING_HIGHLIGHTS.filter(m => !isSameFixture(m, activeMatchup));
          setMoreMatches(deduplicateMatchups(sortMatchesWithLiveFirst(fallbackFiltered)).slice(0, 4));
        }
      });

    return () => {
      isMounted = false;
    };
  }, [
    activeMatchup.id,
    activeMatchup.competition,
    activeMatchup.sport,
    activeMatchup.homeTeam.name,
    activeMatchup.awayTeam.name,
  ]);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${activeMatchup.homeTeam.name} vs ${activeMatchup.awayTeam.name} — ${activeMatchup.competition} on BALLIVE`,
        title: `${activeMatchup.homeTeam.name} vs ${activeMatchup.awayTeam.name}`,
      });
    } catch {
      // User cancelled
    }
  };

  const handleWatchLive = () => {
    navigate({
      name: 'LiveStreamDetails',
      params: { match: activeMatchup },
    });
  };

  const formattedKickoff = (activeMatchup.kickoffTime || 'Today')
    .replace(/\s*\(EAT\)/i, '')
    .replace(/\s*EAT/i, '')
    .trim();

  const handleOpenCompetition = () => {
    if (!activeMatchup.competition) return;
    const compObj = findCompetitionById(activeMatchup.competition, {
      sport: activeMatchup.sport,
      logoUrl: activeMatchup.competitionLogo,
    });
    navigate({ name: 'CompetitionDetails', params: { competition: compObj } });
  };

  const handleOpenTeam = (teamSide: { id?: string; name: string; crestUrl?: string }, resolvedCrest?: string) => {
    if (!teamSide?.name) return;
    const teamObj = findTeamById(teamSide.id || teamSide.name, {
      name: teamSide.name,
      crestUrl: resolvedCrest || teamSide.crestUrl,
      sport: activeMatchup.sport,
      competitionName: activeMatchup.competition,
    });
    navigate({ name: 'TeamDetails', params: { team: teamObj } });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.headerPurple} translucent={false} />

      {/* ── 1. CURVED SECONDARY TOP APP BAR ── */}
      <SecondaryScreenHeader
        title={activeMatchup.competition}
        subtitle={`${activeMatchup.homeTeam.name} vs ${activeMatchup.awayTeam.name}`}
        onTitlePress={handleOpenCompetition}
        rightAction={{
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
        {/* ── 2. STATIC MATCH HERO BANNER (WELL-PROPORTIONED, NO BLUR, NO OVERLAYS) ── */}
        <View style={styles.heroContainer}>
          <MatchArtworkBackground
            matchId={activeMatchup.id}
            homeTeamId={(activeMatchup.homeTeam as any).id}
            awayTeamId={(activeMatchup.awayTeam as any).id}
            sport={activeMatchup.sport}
            homeTeamName={activeMatchup.homeTeam.name}
            awayTeamName={activeMatchup.awayTeam.name}
            homeCrest={homeCrest}
            awayCrest={awayCrest}
            competition={activeMatchup.competition}
            competitionLogo={activeMatchup.competitionLogo}
            originalArtworkUrl={heroArtworkUrl}
            style={styles.heroImage}
          />
        </View>

        {isUpcoming ? (
          <>
            {/* ── 3. UPCOMING: WIN PROBABILITY EXPLAINER (Directly beneath match hero banner) ── */}
            <WinProbabilityBar
              homeTeamId={activeMatchup.homeTeam.id}
              awayTeamId={activeMatchup.awayTeam.id}
              homeTeamName={activeMatchup.homeTeam.name}
              awayTeamName={activeMatchup.awayTeam.name}
              homeCrest={homeCrest}
              awayCrest={awayCrest}
              sport={activeMatchup.sport}
              probabilityData={winProb}
              isLoading={isLoadingProb}
              onHomePress={() => handleOpenTeam(activeMatchup.homeTeam, homeCrest)}
              onAwayPress={() => handleOpenTeam(activeMatchup.awayTeam, awayCrest)}
            />

            {/* ── 4. UPCOMING: STREAMLINED ACTION ROW (Notify Kickoff + Save Match Bookmark) ── */}
            <View style={styles.actionsContainer}>
              <View style={styles.actionsRow}>
                {/* Primary Action Button: Notify Kickoff */}
                <TouchableOpacity
                  style={[
                    styles.primaryActionButton,
                    isReminderSet && styles.primaryActionActive,
                  ]}
                  activeOpacity={0.85}
                  onPress={() => toggleMatchReminder(activeMatchup.id)}
                  accessibilityRole="button"
                  accessibilityLabel={isReminderSet ? 'Kickoff reminder set' : 'Notify at kickoff'}
                >
                  {isReminderSet ? (
                    <>
                      <BellRing size={16} color="#7952FC" strokeWidth={2.4} />
                      <Text style={[styles.primaryActionText, { color: '#A58BFC' }]}>
                        Kickoff Alert Active
                      </Text>
                    </>
                  ) : (
                    <>
                      <Bell size={16} color="#FFFFFF" strokeWidth={2.2} />
                      <Text style={styles.primaryActionText}>Notify Kickoff</Text>
                    </>
                  )}
                </TouchableOpacity>

                {/* Bookmark Action */}
                <TouchableOpacity
                  style={[styles.iconButton, isSaved && styles.iconButtonActive]}
                  activeOpacity={0.8}
                  onPress={() => toggleSave(activeMatchup)}
                  accessibilityRole="button"
                  accessibilityLabel={isSaved ? 'Remove from saved' : 'Save match'}
                >
                  <Bookmark
                    size={18}
                    color={isSaved ? '#7952FC' : '#A098B5'}
                    fill={isSaved ? '#7952FC' : 'transparent'}
                    strokeWidth={2}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </>
        ) : (
          <>
            {/* ── 3. REFINED MATCHUP CARD WITH INTEGRATED METADATA STRIP ── */}
            <View style={styles.matchupCard}>
              {isMotor ? (
                /* Motorsport Event Card: Grand Prix, Venue, and Session info — NO fake scores */
                <View style={styles.racingDetailsRow}>
                  <View style={styles.racingDetailsCol}>
                    <Text style={styles.racingEventTitle} numberOfLines={2}>
                      {activeMatchup.homeTeam.name || activeMatchup.competition}
                    </Text>
                    <Text style={styles.racingVenueSubtitle} numberOfLines={1}>
                      {!isPlaceholderAway && activeMatchup.awayTeam.name
                        ? activeMatchup.awayTeam.name
                        : (activeMatchup.venue || 'Official Session')}
                    </Text>
                  </View>
                  <View style={styles.racingStatusCol}>
                    {isLive ? (
                      <View style={styles.livePill}>
                        <View style={styles.liveDot} />
                        <Text style={styles.livePillText}>RACE LIVE</Text>
                      </View>
                    ) : isFinished ? (
                      <View style={styles.ftPill}>
                        <Text style={styles.ftPillText}>COMPLETED</Text>
                      </View>
                    ) : (
                      <View style={styles.timePill}>
                        <Clock size={11} color="#A58BFC" style={{ marginRight: 4 }} />
                        <Text style={styles.kickoffTimeText} numberOfLines={1}>
                          {formattedKickoff}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              ) : isCombat && isPlaceholderAway ? (
                /* Combat Single Event Banner */
                <View style={styles.racingDetailsRow}>
                  <View style={styles.racingDetailsCol}>
                    <Text style={styles.racingEventTitle} numberOfLines={2}>
                      {activeMatchup.homeTeam.name}
                    </Text>
                    <Text style={styles.racingVenueSubtitle} numberOfLines={1}>
                      {activeMatchup.competition}
                    </Text>
                  </View>
                  <View style={styles.racingStatusCol}>
                    {isLive ? (
                      <View style={styles.livePill}>
                        <View style={styles.liveDot} />
                        <Text style={styles.livePillText}>BOUT LIVE</Text>
                      </View>
                    ) : (
                      <View style={styles.timePill}>
                        <Clock size={11} color="#A58BFC" style={{ marginRight: 4 }} />
                        <Text style={styles.kickoffTimeText} numberOfLines={1}>
                          {formattedKickoff}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              ) : isCombat ? (
                /* Combat Sport: Red Corner vs Blue Corner */
                <View style={styles.matchupRow}>
                  {/* Red Corner Fighter */}
                  <TouchableOpacity
                    activeOpacity={0.75}
                    style={styles.teamCol}
                    onPress={() => handleOpenTeam(activeMatchup.homeTeam, homeCrest)}
                  >
                    <TeamCrest
                      uri={homeCrest}
                      teamId={activeMatchup.homeTeam.id}
                      teamName={activeMatchup.homeTeam.name}
                      size={48}
                      containerStyle={styles.crestFlatContainer}
                    />
                    <Text style={styles.teamName} numberOfLines={2}>
                      {activeMatchup.homeTeam.name}
                    </Text>
                    <Text style={styles.cornerSubLabelRed}>RED CORNER</Text>
                  </TouchableOpacity>

                  {/* Center Bout Status (No fake football 0 - 0) */}
                  <View style={styles.centerCol}>
                    {isLive ? (
                      <View style={styles.livePill}>
                        <View style={styles.liveDot} />
                        <Text style={styles.livePillText}>
                          {activeMatchup.playTime || 'BOUT LIVE'}
                        </Text>
                      </View>
                    ) : isFinished ? (
                      <View style={styles.ftPill}>
                        <Text style={styles.ftPillText}>FINAL</Text>
                      </View>
                    ) : (
                      <>
                        <View style={styles.vsPill}>
                          <Text style={styles.vsText}>VS</Text>
                        </View>
                        <View style={styles.timePill}>
                          <Clock size={11} color="#A58BFC" style={{ marginRight: 4 }} />
                          <Text style={styles.kickoffTimeText} numberOfLines={1}>
                            {formattedKickoff}
                          </Text>
                        </View>
                      </>
                    )}
                  </View>

                  {/* Blue Corner Fighter */}
                  <TouchableOpacity
                    activeOpacity={0.75}
                    style={styles.teamCol}
                    onPress={() => handleOpenTeam(activeMatchup.awayTeam, awayCrest)}
                  >
                    <TeamCrest
                      uri={awayCrest}
                      teamId={activeMatchup.awayTeam.id}
                      teamName={activeMatchup.awayTeam.name}
                      size={48}
                      containerStyle={styles.crestFlatContainer}
                    />
                    <Text style={styles.teamName} numberOfLines={2}>
                      {activeMatchup.awayTeam.name}
                    </Text>
                    <Text style={styles.cornerSubLabelBlue}>BLUE CORNER</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                /* Standard Team Score Matchup (Football, American Football, Basketball, Hockey) */
                <View style={styles.matchupRow}>
                  {/* Home Team */}
                  <TouchableOpacity
                    activeOpacity={0.75}
                    style={styles.teamCol}
                    onPress={() => handleOpenTeam(activeMatchup.homeTeam, homeCrest)}
                  >
                    <TeamCrest
                      uri={homeCrest}
                      teamId={activeMatchup.homeTeam.id}
                      teamName={activeMatchup.homeTeam.name}
                      size={48}
                      containerStyle={styles.crestFlatContainer}
                    />
                    <Text style={styles.teamName} numberOfLines={2}>
                      {activeMatchup.homeTeam.name}
                    </Text>
                  </TouchableOpacity>

                  {/* Center: Score / Status / VS */}
                  <View style={styles.centerCol}>
                    {isLive ? (
                      <View style={styles.livePill}>
                        <View style={styles.liveDot} />
                        <Text style={styles.livePillText}>LIVE</Text>
                      </View>
                    ) : isFinished ? (
                      <View style={styles.ftPill}>
                        <Text style={styles.ftPillText}>FULL TIME</Text>
                      </View>
                    ) : (
                      <>
                        <View style={styles.vsPill}>
                          <Text style={styles.vsText}>VS</Text>
                        </View>
                        <View style={styles.timePill}>
                          <Clock size={11} color="#A58BFC" style={{ marginRight: 4 }} />
                          <Text style={styles.kickoffTimeText} numberOfLines={1}>
                            {formattedKickoff}
                          </Text>
                        </View>
                      </>
                    )}
                  </View>

                  {/* Away Team */}
                  <TouchableOpacity
                    activeOpacity={0.75}
                    style={styles.teamCol}
                    onPress={() => handleOpenTeam(activeMatchup.awayTeam, awayCrest)}
                  >
                    <TeamCrest
                      uri={awayCrest}
                      teamId={activeMatchup.awayTeam.id}
                      teamName={activeMatchup.awayTeam.name}
                      size={48}
                      containerStyle={styles.crestFlatContainer}
                    />
                    <Text style={styles.teamName} numberOfLines={2}>
                      {activeMatchup.awayTeam.name}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Integrated Metadata Strip */}
              <View style={styles.cardMetaStrip}>
                {activeMatchup.venue ? (
                  <View style={styles.metaItem}>
                    <MapPin size={11} color="#A58BFC" style={{ marginRight: 4 }} />
                    <Text style={styles.metaText} numberOfLines={1}>
                      {activeMatchup.venue}
                    </Text>
                  </View>
                ) : null}

                {activeMatchup.venue && <Text style={styles.metaDivider}>•</Text>}

                <View style={styles.metaItem}>
                  <Calendar size={11} color="#A58BFC" style={{ marginRight: 4 }} />
                  <Text style={styles.metaText} numberOfLines={1}>
                    {activeMatchup.kickoffDate || 'Today'}
                  </Text>
                </View>
              </View>
            </View>

            {/* ── 4. BALANCED ACTION ROW (COMPACT, HIGH-IMPACT, ZERO WASTED SPACE) ── */}
            <View style={styles.actionsContainer}>
              <View style={styles.actionsRow}>
                {/* Primary Action Button */}
                {isLive ? (
                  <TouchableOpacity
                    style={styles.primaryActionButton}
                    activeOpacity={0.85}
                    onPress={handleWatchLive}
                    accessibilityRole="button"
                    accessibilityLabel="Watch Live Stream"
                  >
                    <Tv size={16} color="#FFFFFF" strokeWidth={2.4} />
                    <Text style={styles.primaryActionText}>Watch Live Stream</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={[styles.primaryActionButton, styles.completedActionButton]}>
                    <CheckCircle size={16} color="#10B981" strokeWidth={2.2} />
                    <Text style={[styles.primaryActionText, { color: '#E2E8F0' }]}>Match Concluded (FT)</Text>
                  </View>
                )}

                {/* If match is live, allow setting reminder / alert via icon button */}
                {isLive && (
                  <TouchableOpacity
                    style={[styles.iconButton, isReminderSet && styles.iconButtonActive]}
                    activeOpacity={0.8}
                    onPress={() => toggleMatchReminder(activeMatchup.id)}
                    accessibilityRole="button"
                    accessibilityLabel="Toggle reminder"
                  >
                    {isReminderSet ? (
                      <BellRing size={18} color="#7952FC" strokeWidth={2.4} />
                    ) : (
                      <Bell size={18} color="#A098B5" strokeWidth={2} />
                    )}
                  </TouchableOpacity>
                )}

                {/* Bookmark Action */}
                <TouchableOpacity
                  style={[styles.iconButton, isSaved && styles.iconButtonActive]}
                  activeOpacity={0.8}
                  onPress={() => toggleSave(activeMatchup)}
                  accessibilityRole="button"
                  accessibilityLabel={isSaved ? 'Remove from saved' : 'Save match'}
                >
                  <Bookmark
                    size={18}
                    color={isSaved ? '#7952FC' : '#A098B5'}
                    fill={isSaved ? '#7952FC' : 'transparent'}
                    strokeWidth={2}
                  />
                </TouchableOpacity>

                {/* Share Action */}
                <TouchableOpacity
                  style={styles.iconButton}
                  activeOpacity={0.8}
                  onPress={handleShare}
                  accessibilityRole="button"
                  accessibilityLabel="Share match"
                >
                  <Share2 size={18} color="#A098B5" strokeWidth={2} />
                </TouchableOpacity>
              </View>
            </View>

            {/* ── 5. MATCH INFORMATION PANEL (BALANCED TWO-COLUMN ARRANGEMENT) ── */}
            <View style={styles.overviewCard}>
              <View style={styles.overviewGrid}>
                {/* Left Column: Venue & Competition */}
                <View style={styles.overviewCol}>
                  {/* Item 1: Venue */}
                  <View style={styles.overviewItem}>
                    <View style={styles.overviewIconCircle}>
                      <MapPin size={13} color="#A58BFC" strokeWidth={2.2} />
                    </View>
                    <View style={styles.overviewTextCol}>
                      <Text style={styles.overviewLabel}>VENUE</Text>
                      <Text style={styles.overviewValue} numberOfLines={1}>
                        {activeMatchup.venue || 'Stadium'}
                      </Text>
                    </View>
                  </View>

                  {/* Item 2: Competition */}
                  <TouchableOpacity
                    activeOpacity={0.75}
                    style={styles.overviewItem}
                    onPress={handleOpenCompetition}
                  >
                    <View style={styles.overviewIconCircle}>
                      <Trophy size={13} color="#A58BFC" strokeWidth={2.2} />
                    </View>
                    <View style={styles.overviewTextCol}>
                      <Text style={styles.overviewLabel}>COMPETITION</Text>
                      <Text style={[styles.overviewValue, { color: '#A58BFC' }]} numberOfLines={1}>
                        {activeMatchup.competition}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>

                {/* Right Column: Kickoff & Broadcast */}
                <View style={styles.overviewCol}>
                  {/* Item 3: Kickoff */}
                  <View style={styles.overviewItem}>
                    <View style={styles.overviewIconCircle}>
                      <Clock size={13} color="#A58BFC" strokeWidth={2.2} />
                    </View>
                    <View style={styles.overviewTextCol}>
                      <Text style={styles.overviewLabel}>KICKOFF</Text>
                      <Text style={styles.overviewValue} numberOfLines={1}>
                        {formattedKickoff}
                      </Text>
                    </View>
                  </View>

                  {/* Item 4: Coverage / Broadcast */}
                  <View style={styles.overviewItem}>
                    <View style={styles.overviewIconCircle}>
                      <Tv size={13} color="#A58BFC" strokeWidth={2.2} />
                    </View>
                    <View style={styles.overviewTextCol}>
                      <Text style={styles.overviewLabel}>BROADCAST</Text>
                      <Text
                        style={[
                          styles.overviewValue,
                          hasLiveStream && { color: '#EF4444' },
                        ]}
                        numberOfLines={1}
                      >
                        {hasLiveStream ? 'BALLIVE Live Broadcast' : 'BALLIVE Coverage'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </>
        )}

        {/* ── 6. MORE LIVE & UPCOMING FIXTURES (REAL RELATED MATCHES) ── */}
        {moreMatches.length > 0 && (
          <View style={styles.moreSection}>
            <View style={styles.moreHeaderRow}>
              <Text style={styles.moreSectionTitle}>More live & upcoming matches</Text>
            </View>

            <View style={styles.moreList}>
              {moreMatches.map(item => (
                <UniversalMatchCard
                  key={item.id}
                  match={item}
                  layout="full"
                  onPress={() => navigateToMatch(navigate, item)}
                />
              ))}
            </View>
          </View>
        )}
      </ScrollView>
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
    paddingBottom: 36,
  },

  // ── Static Match Hero ──
  heroContainer: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 10,
    height: 170,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#1E1730',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroFallback: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  heroFallbackContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroFallbackComp: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ECE9FA',
    marginTop: 8,
    letterSpacing: 0.3,
  },
  heroFallbackTeams: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9CA3AF',
    marginTop: 4,
  },

  // ── Matchup Card ──
  matchupCard: {
    backgroundColor: '#1E1730',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  matchupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  teamCol: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  crestFlatContainer: {
    marginBottom: 6,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamName: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 16,
  },
  centerCol: {
    flex: 1.1,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  scoreText: {
    fontSize: 26,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: 1,
  },
  scoreColon: {
    fontSize: 20,
    fontWeight: '900',
    color: '#7952FC',
    marginHorizontal: 4,
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D161E',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
  },
  livePillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#EF4444',
    letterSpacing: 0.5,
  },
  ftPill: {
    backgroundColor: '#271D3E',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  ftPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#A58BFC',
    letterSpacing: 0.5,
  },
  vsPill: {
    backgroundColor: '#271D3E',
    paddingVertical: 3,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 4,
  },
  vsText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#A58BFC',
    letterSpacing: 1,
  },
  timePill: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  kickoffTimeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D4CEF2',
  },
  racingDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  racingDetailsCol: {
    flex: 1,
    marginRight: 12,
  },
  racingEventTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  racingVenueSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#A5B4FC',
    marginTop: 3,
  },
  racingStatusCol: {
    alignItems: 'flex-end',
  },
  redCornerCircle: {
    borderWidth: 2,
    borderColor: 'rgba(239, 68, 68, 0.75)',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  blueCornerCircle: {
    borderWidth: 2,
    borderColor: 'rgba(59, 130, 246, 0.75)',
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
  },
  cornerSubLabelRed: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#F87171',
    letterSpacing: 0.4,
    marginTop: 4,
  },
  cornerSubLabelBlue: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#60A5FA',
    letterSpacing: 0.4,
    marginTop: 4,
  },

  // ── Integrated Card Metadata Strip ──
  cardMetaStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    paddingTop: 8,
    marginTop: 8,
    gap: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '45%',
  },
  metaText: {
    fontSize: 11,
    color: '#A098B5',
    fontWeight: '600',
  },
  metaDivider: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.2)',
  },

  // ── Balanced Action Controls ──
  actionsContainer: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  primaryActionButton: {
    flex: 1,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7952FC',
    borderRadius: 12,
    gap: 7,
  },
  primaryActionActive: {
    backgroundColor: '#271D3E',
  },
  completedActionButton: {
    backgroundColor: '#1E1730',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.35)',
  },
  primaryActionText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#1E1730',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonActive: {
    backgroundColor: '#271D3E',
  },

  // ── Match Information Panel (Balanced Two Columns) ──
  overviewCard: {
    backgroundColor: '#1E1730',
    borderRadius: 14,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 14,
  },
  overviewGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  overviewCol: {
    flex: 1,
    gap: 12,
  },
  overviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  overviewIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#181524',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overviewTextCol: {
    flex: 1,
  },
  overviewLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#A098B5',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  overviewValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // ── More Matches ──
  moreSection: {
    marginTop: 4,
    paddingHorizontal: 16,
  },
  moreHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  moreSectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: 0.5,
  },
  moreList: {
    gap: 8,
  },
});

export default MatchDetailsScreen;
