import React, { useState, useEffect, useMemo } from 'react';
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
} from 'lucide-react-native';
import Colors from '../theme/colors';
import { SecondaryScreenHeader } from '../components/common/SecondaryScreenHeader';
import { LiveBadge } from '../components/common/LiveBadge';
import { getTeamCrest } from '../utils/teamCrestResolver';
import { DiscoverMatchup, UPCOMING_HIGHLIGHTS } from '../constants/discoverData';
import { useProfile } from '../hooks/useProfile';
import { getAllLiveStreamMatches, resolveLiveMatchToMatchup, determineMatchRoute } from '../navigation/navHelpers';
import { useAppNavigation } from '../navigation/NavigationContext';
import { LiveStreamPlayer } from '../components/player/LiveStreamPlayer';
import { streamingApiService } from '../services/streamingApiService';
import { sportsApiService } from '../services/sportsApiService';
import { UniversalMatchCard } from '../components/common/UniversalMatchCard';
import { normalizeMatchStatus } from '../utils/matchStatus';

interface LiveStreamDetailsScreenProps {
  match: DiscoverMatchup;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PLAYER_HEIGHT = Math.round((SCREEN_WIDTH * 9) / 16);

export const LiveStreamDetailsScreen: React.FC<LiveStreamDetailsScreenProps> = ({
  match,
}) => {
  const { navigate } = useAppNavigation();
  const { profile, toggleMatchReminder, toggleSaveMatch } = useProfile();

  const [activeMatch, setActiveMatch] = useState<DiscoverMatchup>(match);

  useEffect(() => {
    setActiveMatch(match);
  }, [match.id]);

  const [activeStreamUrl, setActiveStreamUrl] = useState<string | undefined>(activeMatch.streamUrl);
  const [activeStreams, setActiveStreams] = useState<any[] | undefined>(activeMatch.streams);
  const [isFullscreen, setIsFullscreen] = useState(false);

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
  const isLive =
    normalizedStatus.isLive ||
    activeMatch.status === 'LIVE' ||
    Boolean((activeMatch as any).isLive) ||
    (activeMatch.minute !== undefined && activeMatch.minute > 0) ||
    Boolean(activeMatch.playTime && activeMatch.playTime.toUpperCase().includes('LIVE')) ||
    hasPlayableStream;
  const isFinished = (normalizedStatus.isFinished || activeMatch.status === 'FT') && !hasPlayableStream;
  const isReminderSet = profile.matchReminderIds.includes(activeMatch.id);
  const isSaved = profile.savedMatchIds.includes(activeMatch.id);

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

  // Dynamic real other live matches and upcoming fixtures from catalog
  const [liveRelatedStreams, setLiveRelatedStreams] = useState<DiscoverMatchup[]>([]);
  const [upcomingRelatedMatches, setUpcomingRelatedMatches] = useState<DiscoverMatchup[]>([]);

  useEffect(() => {
    let isMounted = true;
    const fallbackStream = isLive
      ? activeMatch.streamUrl || streamingApiService.getDefaultStreamUrl(activeMatch.competition, activeMatch.sport)
      : activeMatch.streamUrl;

    setActiveStreamUrl(fallbackStream);
    setActiveStreams(
      activeMatch.streams && activeMatch.streams.length > 0
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

    if (activeMatch.id) {
      streamingApiService
        .resolveStreamMirrors(
          activeMatch.id,
          activeMatch.competition,
          activeMatch.homeTeam.name,
          activeMatch.awayTeam.name
        )
        .then(mirrors => {
          if (isMounted && mirrors.length > 0) {
            setActiveStreams(mirrors);
            setActiveStreamUrl(mirrors[0].url);
          }
        })
        .catch(() => {});
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
            setLiveRelatedStreams(others.slice(0, 10));
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
            setUpcomingRelatedMatches(others.slice(0, 10));
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
      clearInterval(pollInterval);
    };
  }, [activeMatch.id, activeMatch.streamUrl, activeMatch.homeTeam.name, activeMatch.awayTeam.name, activeMatch.sport]);

  // Fullscreen orientation and hardware back button management
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
      // Restore portrait whenever leaving this screen
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch(() => {});
    };
  }, [isFullscreen]);

  const handleEnterFullscreen = async () => {
    try {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    } catch {
      // ignore
    }
    setIsFullscreen(true);
  };

  const handleExitFullscreen = async () => {
    try {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    } catch {
      // ignore
    }
    setIsFullscreen(false);
  };


  const otherMatches = useMemo(() => {
    let combined = [...liveRelatedStreams, ...upcomingRelatedMatches];
    if (combined.length === 0) {
      const fallbackLive = getAllLiveStreamMatches().filter(m => m.id !== activeMatch.id);
      const fallbackUpcoming = UPCOMING_HIGHLIGHTS.filter(m => m.id !== activeMatch.id);
      combined = [...fallbackLive, ...fallbackUpcoming];
    }
    const seen = new Set<string>();
    const result: DiscoverMatchup[] = [];
    for (const m of combined) {
      if (m.id !== activeMatch.id && !seen.has(m.id)) {
        seen.add(m.id);
        result.push(m);
      }
    }
    return result;
  }, [liveRelatedStreams, upcomingRelatedMatches, activeMatch.id]);

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
            key={`player-${activeMatch.id}`}
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
          {/* ── 2. MATCH SCORE CENTRE (MODERN & ACCURATE) ── */}
          <View style={styles.matchIdentityCard}>
            <View style={styles.teamsRow}>
              {/* Home Team */}
              <View style={styles.matchTeamSide}>
                <View style={styles.crestContainer}>
                  <Image
                    source={{ uri: activeMatch.homeTeam.crestUrl || (activeMatch as any).homeBadge || getTeamCrest(activeMatch.homeTeam.name || activeMatch.homeTeam.id) }}
                    style={styles.crestImage}
                  />
                </View>
                <Text style={styles.teamNameText} numberOfLines={1} ellipsizeMode="tail">
                  {activeMatch.homeTeam.name}
                </Text>
              </View>

              {/* Score / Match State Center */}
              <View style={styles.matchScoreCenter}>
                {isLive || activeMatch.status === 'FT' ? (
                  <>
                    <View style={styles.scoreRow}>
                      <Text style={styles.scoreNumber}>{liveScore.home}</Text>
                      <Text style={styles.scoreColon}>:</Text>
                      <Text style={styles.scoreNumber}>{liveScore.away}</Text>
                    </View>
                    <View style={[styles.statusBadgePill, isLive ? styles.statusBadgeLive : styles.statusBadgeFT]}>
                      {isLive && <View style={styles.liveClockDot} />}
                      <Text style={styles.statusBadgeText}>
                        {liveScore.statusText || (isLive ? `${liveScore.minute || activeMatch.minute || 45}' LIVE` : 'FULL TIME')}
                      </Text>
                    </View>
                  </>
                ) : (
                  <>
                    <View style={styles.vsBadge}>
                      <Text style={styles.vsText}>VS</Text>
                    </View>
                    <Text style={styles.matchStatusSub}>
                      {activeMatch.kickoffTime || '17:30'} • Today
                    </Text>
                  </>
                )}
              </View>

              {/* Away Team */}
              <View style={styles.matchTeamSide}>
                <View style={styles.crestContainer}>
                  <Image
                    source={{ uri: activeMatch.awayTeam.crestUrl || (activeMatch as any).awayBadge || getTeamCrest(activeMatch.awayTeam.name || activeMatch.awayTeam.id) }}
                    style={styles.crestImage}
                  />
                </View>
                <Text style={styles.teamNameText} numberOfLines={1} ellipsizeMode="tail">
                  {activeMatch.awayTeam.name}
                </Text>
              </View>
            </View>
          </View>

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
              onPress={() => toggleSaveMatch(activeMatch.id)}
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
    zIndex: 999,
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
  crestContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#181524',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  crestImage: {
    width: 34,
    height: 34,
    resizeMode: 'contain',
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
