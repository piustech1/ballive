import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Share,
  StatusBar,
  BackHandler,
} from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';
import {
  Play,
  Pause,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Radio,
  Tv,
  Bell,
  BellRing,
  Bookmark,
  BookmarkCheck,
  ChevronRight,
  Info,
  Share2,
  Clock,
  Calendar,
  Sparkles,
  ShieldAlert,
  ArrowLeft,
  Check,
  CheckCircle,
  RefreshCw,
} from 'lucide-react-native';
import Colors from '../theme/colors';
import { SecondaryScreenHeader } from '../components/common/SecondaryScreenHeader';
import { LiveBadge } from '../components/common/LiveBadge';
import { TeamCrest } from '../components/common/TeamCrest';
import { getTeamCrest } from '../utils/teamCrestResolver';
import { DiscoverMatchup, UPCOMING_HIGHLIGHTS } from '../constants/discoverData';
import { useProfile } from '../hooks/useProfile';
import { useSavedMatches } from '../hooks/useSavedMatches';
import { getAllLiveStreamMatches, resolveLiveMatchToMatchup, determineMatchRoute } from '../navigation/navHelpers';
import { useAppNavigation } from '../navigation/NavigationContext';
import {
  normalizeMatchStatus,
  sortMatchesWithLiveFirst,
  deduplicateMatchups,
  isSameFixture,
} from '../utils/matchStatus';
import { LiveStreamPlayer } from '../components/player/LiveStreamPlayer';
import { streamingApiService } from '../services/streamingApiService';
import { sportsApiService } from '../services/sportsApiService';
import { UniversalMatchCard } from '../components/common/UniversalMatchCard';
import { isMotorsport, cleanEventTitle } from '../utils/sportClassifier';

interface LiveStreamDetailsScreenProps {
  match: DiscoverMatchup;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PLAYER_HEIGHT = Math.round((SCREEN_WIDTH * 9) / 16);

export const LiveStreamDetailsScreen: React.FC<LiveStreamDetailsScreenProps> = ({
  match,
}) => {
  const { navigate, isFullscreen, setIsFullscreen } = useAppNavigation();
  const { profile, toggleMatchReminder } = useProfile();
  const { isSaved: checkIsSaved, toggleSave } = useSavedMatches();

  const [activeMatch, setActiveMatch] = useState<DiscoverMatchup>(match);

  useEffect(() => {
    setActiveMatch(match);
  }, [match.id]);

  const [activeStreamUrl, setActiveStreamUrl] = useState<string | undefined>(activeMatch.streamUrl);
  const [activeStreams, setActiveStreams] = useState<any[] | undefined>(activeMatch.streams);

  const isRacing = useMemo(
    () =>
      isMotorsport(
        activeMatch.sport,
        activeMatch.competition,
        `${activeMatch.homeTeam?.name || ''} ${activeMatch.awayTeam?.name || ''}`
      ),
    [activeMatch.sport, activeMatch.competition, activeMatch.homeTeam?.name, activeMatch.awayTeam?.name]
  );


  const normalizedStatus = useMemo(
    () =>
      normalizeMatchStatus({
        rawStatus: activeMatch.status,
        playTime: activeMatch.playTime,
        minute: activeMatch.minute,
        sport: activeMatch.sport,
      }),
    [activeMatch.status, activeMatch.playTime, activeMatch.minute, activeMatch.sport]
  );
  const hasPlayableStream = Boolean(activeStreamUrl || (activeStreams && activeStreams.length > 0));
  const isFinished = normalizedStatus.isFinished || activeMatch.status === 'FT';
  const isLive = !isFinished && (
    normalizedStatus.isLive ||
    activeMatch.status === 'LIVE' ||
    Boolean((activeMatch as any).isLive) ||
    (activeMatch.minute !== undefined && activeMatch.minute > 0 && activeMatch.minute <= 130) ||
    Boolean(activeMatch.playTime && activeMatch.playTime.toUpperCase().includes('LIVE'))
  );
  const isUpcoming = !isLive && !isFinished;
  const isReminderSet = profile.matchReminderIds.includes(activeMatch.id);
  const isSaved = checkIsSaved(activeMatch.id);

  // Live real-time scores and clock
  const [liveScore, setLiveScore] = useState<{
    home: number;
    away: number;
    minute?: number;
    statusText?: string;
  }>({
    home: activeMatch.homeTeam.score ?? 0,
    away: activeMatch.awayTeam.score ?? 0,
    minute: activeMatch.minute,
    statusText: activeMatch.playTime
      ? `${activeMatch.playTime} LIVE`
      : activeMatch.minute && activeMatch.minute > 0
      ? `${activeMatch.minute}' LIVE`
      : undefined,
  });

  // Dynamic real other live matches and upcoming fixtures from catalog (synchronously pre-filled from cache)
  const [liveRelatedStreams, setLiveRelatedStreams] = useState<DiscoverMatchup[]>(() => {
    const cached = streamingApiService.getCachedLiveMatches();
    if (cached && cached.length > 0) {
      return cached
        .filter(m => m.id !== match.id && (m.status === 'LIVE' || m.minute > 0))
        .map(resolveLiveMatchToMatchup)
        .slice(0, 4);
    }
    return [];
  });
  const [upcomingRelatedMatches, setUpcomingRelatedMatches] = useState<DiscoverMatchup[]>(() => {
    const cached = streamingApiService.getCachedUpcomingMatches();
    if (cached && cached.length > 0) {
      return cached
        .filter(m => m.id !== match.id)
        .map(resolveLiveMatchToMatchup)
        .slice(0, 4);
    }
    return [];
  });

  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();

    const isDirectMediaUrl = activeMatch.streamUrl && !activeMatch.streamUrl.endsWith('.json') && !activeMatch.streamUrl.includes('/stream/tv/');
    const fallbackStream = isLive && isDirectMediaUrl ? activeMatch.streamUrl : undefined;

    setActiveStreamUrl(fallbackStream);
    setActiveStreams(
      activeMatch.streams && activeMatch.streams.length > 0 && !activeMatch.streams[0].url.endsWith('.json')
        ? activeMatch.streams
        : fallbackStream
        ? [{ id: 'srv-primary', name: 'Server 1 (Live HD Broadcast)', url: fallbackStream }]
        : undefined
    );

    setLiveScore({
      home: activeMatch.homeTeam.score ?? 0,
      away: activeMatch.awayTeam.score ?? 0,
      minute: activeMatch.minute,
      statusText: activeMatch.playTime
        ? `${activeMatch.playTime} LIVE`
        : activeMatch.minute && activeMatch.minute > 0
        ? `${activeMatch.minute}' LIVE`
        : undefined,
    });

    // Only resolve live streams if fixture is actively live and not concluded
    if (activeMatch.id && isLive && !isFinished) {
      const resolveWithRetry = async (attempt = 1) => {
        if (!isMounted || abortController.signal.aborted) return;
        try {
          const mirrors = await streamingApiService.resolveStreamMirrors(
            activeMatch.id,
            activeMatch.competition,
            activeMatch.homeTeam.name,
            activeMatch.awayTeam.name
          );
          if (!isMounted || abortController.signal.aborted) return;
          if (mirrors.length > 0) {
            setActiveStreams(mirrors);
            setActiveStreamUrl(mirrors[0].url);
          } else if (attempt < 3) {
            const delay = attempt === 1 ? 1200 : 2500;
            setTimeout(() => {
              if (isMounted && !abortController.signal.aborted) {
                resolveWithRetry(attempt + 1);
              }
            }, delay);
          }
        } catch {
          if (attempt < 3 && isMounted && !abortController.signal.aborted) {
            const delay = attempt === 1 ? 1200 : 2500;
            setTimeout(() => {
              if (isMounted && !abortController.signal.aborted) {
                resolveWithRetry(attempt + 1);
              }
            }, delay);
          }
        }
      };

      resolveWithRetry(1);
    }

    // Dynamic Live Matches for Related Streams
    streamingApiService
      .getLiveMatches()
      .then(matches => {
        if (isMounted && matches && matches.length > 0) {
          const others = matches
            .filter(m => m.id !== activeMatch.id && (m.status === 'LIVE' || m.minute > 0))
            .map(resolveLiveMatchToMatchup);
          if (others.length > 0) {
            setLiveRelatedStreams(others.slice(0, 4));
          }
        }
      })
      .catch(() => {});

    // Dynamic Upcoming Matches for context / recommendation
    streamingApiService
      .getUpcomingMatches()
      .then(upcoming => {
        if (isMounted && upcoming && upcoming.length > 0) {
          const others = upcoming
            .filter(m => m.id !== activeMatch.id)
            .map(resolveLiveMatchToMatchup);
          if (others.length > 0) {
            setUpcomingRelatedMatches(others.slice(0, 4));
          }
        }
      })
      .catch(() => {});

    // Real-time score and play-time sync from ESPN Scoreboard via findEspnEvent
    const syncLiveScore = () => {
      sportsApiService
        .findEspnEvent(activeMatch.homeTeam.name, activeMatch.awayTeam.name, activeMatch.sport)
        .then(found => {
          if (!isMounted || !found) return;
          setLiveScore({
            home: found.scoreHome,
            away: found.scoreAway,
            minute: found.minute,
            statusText:
              found.isLive
                ? found.playTime
                  ? `${found.playTime} LIVE`
                  : `${found.minute}' LIVE`
                : found.statusText || 'FULL TIME',
          });
        })
        .catch(() => {});
    };

    syncLiveScore();
    const pollInterval = setInterval(syncLiveScore, 30000);

    return () => {
      isMounted = false;
      abortController.abort();
      clearInterval(pollInterval);
    };
  }, [activeMatch.id, activeMatch.streamUrl, activeMatch.homeTeam.name, activeMatch.awayTeam.name, activeMatch.sport]);

  const handleEnterFullscreen = useCallback(async () => {
    try {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    } catch {
      // ignore
    }
    setIsFullscreen(true);
  }, [setIsFullscreen]);

  const handleExitFullscreen = useCallback(async () => {
    try {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    } catch {
      // ignore
    }
    setIsFullscreen(false);
  }, [setIsFullscreen]);

  // Unmount safety: restore portrait orientation ONLY when component unmounts
  useEffect(() => {
    return () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch(() => {});
      setIsFullscreen(false);
    };
  }, [setIsFullscreen]);

  // Hardware Android Back button handler - cleanly exits fullscreen back to portrait
  useEffect(() => {
    const onBackPress = () => {
      if (isFullscreen) {
        handleExitFullscreen();
        return true;
      }
      return false;
    };

    const backSub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => {
      backSub.remove();
    };
  }, [isFullscreen, handleExitFullscreen]);

  const otherMatches = useMemo(() => {
    let combined = [...liveRelatedStreams, ...upcomingRelatedMatches];
    if (combined.length === 0) {
      const fallbackLive = getAllLiveStreamMatches().filter(m => !isSameFixture(m, activeMatch));
      const fallbackUpcoming = UPCOMING_HIGHLIGHTS.filter(m => !isSameFixture(m, activeMatch));
      combined = [...fallbackLive, ...fallbackUpcoming];
    }

    // Exclude the currently opened match using canonical fixture comparison
    const filtered = combined.filter(m => !isSameFixture(m, activeMatch));

    // Deduplicate fixtures by canonical event identity
    const deduplicated = deduplicateMatchups(filtered);

    return sortMatchesWithLiveFirst(deduplicated).slice(0, 4);
  }, [liveRelatedStreams, upcomingRelatedMatches, activeMatch]);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Watch ${activeMatch.homeTeam.name} vs ${activeMatch.awayTeam.name} live in Full HD on BALLIVE!`,
        title: `${activeMatch.homeTeam.name} vs ${activeMatch.awayTeam.name}`,
      });
    } catch {
      // User cancelled
    }
  };

  return (
    <View style={isFullscreen ? styles.fullscreenRoot : styles.root}>
      <StatusBar hidden={isFullscreen} barStyle="light-content" />

      {!isFullscreen && (
        <SecondaryScreenHeader
          title={activeMatch.competition}
          subtitle={`${activeMatch.homeTeam.name} vs ${activeMatch.awayTeam.name}`}
          sport={activeMatch.sport}
          rightAction={{
            icon: Share2,
            onPress: handleShare,
            accessibilityLabel: 'Share stream',
          }}
        />
      )}

      {/* ── 1. WIDESCREEN / FULLSCREEN STREAM PLAYER CONTAINER ── */}
      <View style={isFullscreen ? styles.fullscreenPlayerWrapper : styles.playerContainer}>
        {isLive && hasPlayableStream ? (
          <LiveStreamPlayer
            key={`player-${activeMatch.id}-${activeStreamUrl || 'default'}`}
            streamUrl={activeStreamUrl || activeMatch.streamUrl}
            streams={activeStreams || activeMatch.streams}
            isLive={isLive}
            isFullscreen={isFullscreen}
            poster={activeMatch.homeTeam.crestUrl || (activeMatch as any).homeBadge || getTeamCrest(activeMatch.homeTeam.name || activeMatch.homeTeam.id)}
            homeTeamName={activeMatch.homeTeam.name}
            awayTeamName={activeMatch.awayTeam.name}
            title={`${activeMatch.homeTeam.name} vs ${activeMatch.awayTeam.name}`}
            onToggleFullscreen={isFullscreen ? handleExitFullscreen : handleEnterFullscreen}
            style={isFullscreen ? { width: '100%', height: '100%' } : undefined}
          />
        ) : isLive ? (
          /* Live Stream Connecting / Buffering Experience */
          <View style={styles.upcomingPlayerSurface}>
            <View style={styles.upcomingCountdownIcon}>
              <Radio size={28} color="#7952FC" strokeWidth={2.4} />
            </View>
            <Text style={styles.upcomingPlayerTitle}>Connecting to Live Broadcast...</Text>
            <Text style={styles.upcomingPlayerSubtitle}>
              Establishing live satellite stream for {activeMatch.competition}. Please wait a moment...
            </Text>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.remindMePill, { marginTop: 14 }]}
              onPress={() => {
                streamingApiService
                  .resolveStreamMirrors(
                    activeMatch.id,
                    activeMatch.competition,
                    activeMatch.homeTeam.name,
                    activeMatch.awayTeam.name
                  )
                  .then(mirrors => {
                    if (mirrors.length > 0) {
                      setActiveStreams(mirrors);
                      setActiveStreamUrl(mirrors[0].url);
                    }
                  })
                  .catch(() => {});
              }}
            >
              <RefreshCw size={13} color="#FFFFFF" strokeWidth={2.2} style={{ marginRight: 6 }} />
              <Text style={styles.remindMePillText}>Retry Stream</Text>
            </TouchableOpacity>
          </View>
        ) : isFinished ? (
          /* Completed / Concluded Match Experience */
          <View style={styles.upcomingPlayerSurface}>
            <View style={[styles.upcomingCountdownIcon, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
              <CheckCircle size={32} color="#10B981" strokeWidth={2.2} />
            </View>
            <Text style={styles.upcomingPlayerTitle}>Match Concluded</Text>
            <Text style={styles.upcomingPlayerSubtitle}>
              This fixture has finished. The live satellite broadcast is now offline.
            </Text>
          </View>
        ) : (
          /* Upcoming Scheduled Kickoff Experience */
          <View style={styles.upcomingPlayerSurface}>
            <View style={styles.upcomingCountdownIcon}>
              <Clock size={32} color="#7952FC" strokeWidth={2.2} />
            </View>
            <Text style={styles.upcomingPlayerTitle}>Broadcast Starts Before Kickoff</Text>
            <Text style={styles.upcomingPlayerSubtitle}>
              Live satellite coverage begins 15 minutes before {activeMatch.kickoffTime || 'kickoff'}. Set an alert to be notified when the feed connects!
            </Text>
            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.remindMePill, isReminderSet && styles.remindMePillActive]}
              onPress={() => toggleMatchReminder(activeMatch.id)}
            >
              {isReminderSet ? (
                <BellRing size={15} color="#FFFFFF" strokeWidth={2.4} />
              ) : (
                <Bell size={15} color="#FFFFFF" strokeWidth={2.2} />
              )}
              <Text style={styles.remindMePillText}>
                {isReminderSet ? 'Kickoff Alert Enabled' : 'Notify When Live'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {!isFullscreen && (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ── 2. MATCH SCORE CENTRE / EVENT IDENTITY BANNER ── */}
          {isRacing ? (
            <View style={styles.racingIdentityCard}>
              <View style={styles.racingIdentityRow}>
                <View style={styles.racingIdentityCol}>
                  <View style={styles.racingCategoryPill}>
                    <Text style={styles.racingCategoryText}>MOTORSPORT</Text>
                  </View>
                  <Text style={styles.racingEventTitle} numberOfLines={2}>
                    {cleanEventTitle(activeMatch.competition || activeMatch.homeTeam.name, 'motorsport')}
                  </Text>
                  <Text style={styles.racingVenueSubtitle} numberOfLines={1}>
                    {activeMatch.homeTeam.name && activeMatch.awayTeam.name && !['tbd', 'tba', 'opponent'].includes(activeMatch.awayTeam.name.toLowerCase())
                      ? `${activeMatch.homeTeam.name} • ${activeMatch.awayTeam.name}`
                      : (activeMatch.homeTeam.name || 'Official Session')}
                  </Text>
                </View>
                <View style={styles.racingStatusCol}>
                  {isLive ? (
                    <View style={styles.racingLiveBadge}>
                      <View style={styles.liveClockDot} />
                      <Text style={styles.racingLiveBadgeText}>RACE LIVE</Text>
                    </View>
                  ) : (
                    <View style={styles.racingUpcomingBadge}>
                      <Clock size={11} color="#A58BFC" style={{ marginRight: 4 }} />
                      <Text style={styles.racingUpcomingBadgeText}>
                        {activeMatch.kickoffTime || 'Today'}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.matchIdentityCard}>
              <View style={styles.teamsRow}>
                {/* Home Team */}
                <View style={styles.matchTeamSide}>
                  <TeamCrest
                    uri={activeMatch.homeTeam.crestUrl || (activeMatch as any).homeBadge || getTeamCrest(activeMatch.homeTeam.name || activeMatch.homeTeam.id)}
                    teamName={activeMatch.homeTeam.name}
                    size={48}
                    containerStyle={styles.crestFlatContainer}
                  />
                  <Text style={styles.teamNameText} numberOfLines={1} ellipsizeMode="tail">
                    {activeMatch.homeTeam.name}
                  </Text>
                </View>

                {/* Score / Match State Center */}
                <View style={styles.matchScoreCenter}>
                  {isLive ? (
                    <View style={[styles.statusBadgePill, styles.statusBadgeLive]}>
                      <View style={styles.liveClockDot} />
                      <Text style={styles.statusBadgeText}>LIVE</Text>
                    </View>
                  ) : activeMatch.status === 'FT' ? (
                    <View style={[styles.statusBadgePill, styles.statusBadgeFT]}>
                      <Text style={styles.statusBadgeText}>FULL TIME</Text>
                    </View>
                  ) : (
                    <>
                      <View style={styles.vsBadge}>
                        <Text style={styles.vsText}>VS</Text>
                      </View>
                      <Text style={styles.matchStatusSub}>
                        {activeMatch.kickoffTime || 'Today'}
                      </Text>
                    </>
                  )}
                </View>

                {/* Away Team */}
                <View style={styles.matchTeamSide}>
                  <TeamCrest
                    uri={activeMatch.awayTeam.crestUrl || (activeMatch as any).awayBadge || getTeamCrest(activeMatch.awayTeam.name || activeMatch.awayTeam.id)}
                    teamName={activeMatch.awayTeam.name}
                    size={48}
                    containerStyle={styles.crestFlatContainer}
                  />
                  <Text style={styles.teamNameText} numberOfLines={1} ellipsizeMode="tail">
                    {activeMatch.awayTeam.name}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* ── 3. MATCH ACTIONS BAR ── */}
          <View style={styles.actionsBar}>
            {isLive ? (
              <TouchableOpacity
                activeOpacity={0.85}
                style={[styles.actionPrimaryBtn, styles.actionPrimaryBtnLive]}
                onPress={handleEnterFullscreen}
              >
                <Radio size={16} color="#FFFFFF" strokeWidth={2.4} />
                <Text style={styles.actionPrimaryBtnText}>Watch Fullscreen</Text>
              </TouchableOpacity>
            ) : isFinished ? (
              <View style={[styles.actionPrimaryBtn, styles.actionPrimaryBtnFinished]}>
                <Clock size={16} color="#A098B5" strokeWidth={2.2} />
                <Text style={[styles.actionPrimaryBtnText, { color: '#A098B5' }]}>
                  Match Concluded (FT)
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.actionPrimaryBtn, isReminderSet && styles.actionPrimaryBtnActive]}
                onPress={() => toggleMatchReminder(activeMatch.id)}
              >
                {isReminderSet ? (
                  <BellRing size={16} color="#FFFFFF" strokeWidth={2.4} />
                ) : (
                  <Bell size={16} color="#FFFFFF" strokeWidth={2.2} />
                )}
                <Text style={styles.actionPrimaryBtnText}>
                  {isReminderSet ? 'Alert Enabled' : 'Notify Kickoff'}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.iconActionBtn, isSaved && styles.iconActionBtnActive]}
              onPress={() => toggleSave(activeMatch)}
              accessibilityLabel="Bookmark match"
            >
              {isSaved ? (
                <BookmarkCheck size={18} color="#7952FC" strokeWidth={2.4} />
              ) : (
                <Bookmark size={18} color="#A098B5" strokeWidth={2} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.iconActionBtn}
              onPress={handleShare}
              accessibilityLabel="Share match"
            >
              <Share2 size={18} color="#A098B5" strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {/* ── 4. MORE LIVE & UPCOMING FIXTURES (VERTICAL FULL-WIDTH LIST) ── */}
          {otherMatches.length > 0 && (
            <View style={styles.relatedSection}>
              <View style={styles.relatedSectionHeader}>
                <Text style={styles.relatedSectionTitle}>More live & upcoming matches</Text>
              </View>

              <View style={styles.relatedList}>
                {otherMatches.map(rel => (
                  <UniversalMatchCard
                    key={rel.id}
                    match={rel}
                    layout="full"
                    onPress={() => {
                      const target = determineMatchRoute(rel);
                      if (target.name === 'MatchDetails') {
                        navigate(target);
                      } else {
                        setActiveMatch(rel);
                      }
                    }}
                  />
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0E0D14',
  },
  fullscreenRoot: {
    flex: 1,
    backgroundColor: '#000000',
  },
  fullscreenPlayerWrapper: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
    zIndex: 99999,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 96,
  },
  playerContainer: {
    width: SCREEN_WIDTH,
    minHeight: PLAYER_HEIGHT,
    backgroundColor: '#000000',
  },
  livePlayerSurface: {
    flex: 1,
    backgroundColor: '#08070D',
    justifyContent: 'space-between',
  },
  fieldBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0F1218',
    opacity: 0.8,
  },
  playerTopOverlay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 12,
  },
  liveBadgeCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
  },
  pulsingRedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    marginRight: 5,
  },
  liveStreamBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
  qualityPill: {
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
  },
  qualityPillText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  streamScoreBug: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgba(24, 21, 36, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  bugCrest: {
    width: 18,
    height: 18,
    resizeMode: 'contain',
  },
  bugTeamName: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  bugScore: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  bugDivider: {
    fontSize: 12,
    color: '#7952FC',
    fontWeight: '700',
  },
  playerBottomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    gap: 8,
  },
  playerCtrlBtn: {
    padding: 6,
  },
  scrubberBar: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 2,
    position: 'relative',
    justifyContent: 'center',
  },
  scrubberFill: {
    width: '70%',
    height: '100%',
    backgroundColor: '#7952FC',
    borderRadius: 2,
  },
  scrubberThumb: {
    position: 'absolute',
    left: '70%',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    marginLeft: -4,
  },
  qualityToggleText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  upcomingPlayerSurface: {
    minHeight: PLAYER_HEIGHT,
    backgroundColor: '#181524',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  upcomingCountdownIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2A2045',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  upcomingPlayerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  upcomingPlayerSubtitle: {
    fontSize: 12,
    color: '#A098B5',
    textAlign: 'center',
    lineHeight: 17,
    marginBottom: 12,
  },
  remindMePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#7952FC',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
  },
  remindMePillActive: {
    backgroundColor: '#352558',
  },
  remindMePillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  racingIdentityCard: {
    margin: 16,
    marginBottom: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: '#1E1730',
  },
  racingIdentityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  racingIdentityCol: {
    flex: 1,
    paddingRight: 12,
  },
  racingCategoryPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(121, 82, 252, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(121, 82, 252, 0.4)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 6,
  },
  racingCategoryText: {
    color: '#A58BFC',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  racingEventTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
    marginBottom: 4,
  },
  racingVenueSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9E94B8',
  },
  racingStatusCol: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  racingLiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FF2E56',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  racingLiveBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  racingUpcomingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2045',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  racingUpcomingBadgeText: {
    color: '#ECE9FA',
    fontSize: 11,
    fontWeight: '700',
  },
  combatIdentityCard: {
    margin: 16,
    marginBottom: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: '#1E1730',
  },
  combatTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  combatCompTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9E94B8',
    flex: 1,
  },
  combatFightersRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  combatFighterSide: {
    flex: 1,
    alignItems: 'center',
  },
  combatFighterName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  cornerSubLabelRed: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#FF4D6D',
    letterSpacing: 0.8,
  },
  cornerSubLabelBlue: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#38BDF8',
    letterSpacing: 0.8,
  },
  combatCenterBadge: {
    width: 80,
    alignItems: 'center',
  },
  matchIdentityCard: {
    margin: 16,
    marginBottom: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: '#1E1730',
  },
  teamsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  matchTeamSide: {
    flex: 1,
    alignItems: 'center',
  },
  crestFlatContainer: {
    marginBottom: 6,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamNameText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  matchScoreCenter: {
    width: 104,
    alignItems: 'center',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  scoreNumber: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  scoreColon: {
    fontSize: 24,
    fontWeight: '700',
    color: '#7952FC',
    marginHorizontal: 3,
  },
  statusBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeLive: {
    backgroundColor: '#FF2E56',
  },
  statusBadgeFT: {
    backgroundColor: '#2A2045',
  },
  liveClockDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#FFFFFF',
  },
  statusBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
  vsBadge: {
    backgroundColor: '#2A2045',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 4,
  },
  vsText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#7952FC',
  },
  matchStatusSub: {
    fontSize: 11,
    color: '#A098B5',
    fontWeight: '600',
  },
  serverSection: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#151322',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: '#241E38',
  },
  serverSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  serverSectionTitle: {
    color: '#ECE6F0',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  serverSectionHint: {
    color: '#7E7694',
    fontSize: 10.5,
    marginLeft: 'auto',
  },
  serverPillList: {
    flexDirection: 'row',
    gap: 8,
  },
  serverPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1A30',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2D264A',
  },
  serverPillActive: {
    backgroundColor: '#7952FC',
    borderColor: '#906BFF',
  },
  serverPillText: {
    color: '#A098B5',
    fontSize: 11.5,
    fontWeight: '600',
  },
  serverPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  actionsBar: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    gap: 10,
  },
  actionPrimaryBtn: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#7952FC',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionPrimaryBtnActive: {
    backgroundColor: '#2A2045',
  },
  actionPrimaryBtnLive: {
    backgroundColor: '#7952FC',
  },
  actionPrimaryBtnFinished: {
    backgroundColor: '#1E1730',
  },
  actionPrimaryBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  inlineDetailsWrapper: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  iconActionBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#1E1730',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconActionBtnActive: {
    backgroundColor: '#352558',
  },
  relatedSection: {
    marginTop: 10,
    marginBottom: 24,
  },
  relatedSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  relatedSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  relatedList: {
    paddingHorizontal: 16,
  },
  // Fullscreen Landscape Video Player
  fullscreenContainer: {
    flex: 1,
    backgroundColor: '#050409',
    justifyContent: 'space-between',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  fullscreenTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  fullscreenBackBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(30, 23, 48, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullscreenTitleCluster: {
    flex: 1,
    marginHorizontal: 14,
  },
  fullscreenCompTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7952FC',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fullscreenMatchTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  fullscreenTopRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fullscreenLiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  fullscreenLiveText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  fullscreenQualityPill: {
    backgroundColor: 'rgba(30, 23, 48, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  fullscreenQualityText: {
    color: '#ECE9FA',
    fontSize: 10.5,
    fontWeight: '700',
  },
  fullscreenCenterBug: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullscreenScoreBugContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(18, 14, 28, 0.85)',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  fullscreenBugCrest: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
  },
  fullscreenBugTeamName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  fullscreenBugScore: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  fullscreenBugDivider: {
    fontSize: 18,
    fontWeight: '700',
    color: '#7952FC',
  },
  fullscreenBottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(18, 14, 28, 0.85)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    gap: 12,
  },
  fullscreenCtrlBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2A2045',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullscreenScrubberContainer: {
    flex: 1,
    height: 16,
    justifyContent: 'center',
  },
  fullscreenScrubberTrack: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    position: 'relative',
  },
  fullscreenScrubberFill: {
    width: '68%',
    height: '100%',
    backgroundColor: '#7952FC',
    borderRadius: 2,
  },
  fullscreenScrubberThumb: {
    position: 'absolute',
    left: '68%',
    top: -4,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
  },
  fullscreenQualityBtn: {
    backgroundColor: '#2A2045',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
});
