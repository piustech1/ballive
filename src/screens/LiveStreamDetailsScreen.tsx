import React, { useState, useEffect } from 'react';
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
import { DiscoverMatchup } from '../constants/discoverData';
import { useProfile } from '../hooks/useProfile';
import { getAllLiveStreamMatches, resolveLiveMatchToMatchup } from '../navigation/navHelpers';
import { useAppNavigation } from '../navigation/NavigationContext';
import { LiveStreamPlayer } from '../components/player/LiveStreamPlayer';
import { streamingApiService } from '../services/streamingApiService';
import { sportsApiService } from '../services/sportsApiService';
import { InlineMatchDetailsModule } from '../components/player/InlineMatchDetailsModule';

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

  const [activeStreamUrl, setActiveStreamUrl] = useState<string | undefined>(match.streamUrl);
  const [activeStreams, setActiveStreams] = useState<any[] | undefined>(match.streams);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeBottomView, setActiveBottomView] = useState<'streams' | 'details'>('streams');

  // Live real-time scores and clock
  const [liveScore, setLiveScore] = useState<{
    home: number;
    away: number;
    minute?: number;
    statusText?: string;
  }>({
    home: match.homeTeam.score ?? 0,
    away: match.awayTeam.score ?? 0,
    minute: match.minute,
    statusText: match.playTime
      ? `${match.playTime} LIVE`
      : match.minute && match.minute > 0
      ? `${match.minute}' LIVE`
      : undefined,
  });

  // Dynamic real other live matches and upcoming fixtures from catalog
  const [liveRelatedStreams, setLiveRelatedStreams] = useState<DiscoverMatchup[]>([]);
  const [upcomingRelatedMatches, setUpcomingRelatedMatches] = useState<DiscoverMatchup[]>([]);

  useEffect(() => {
    let isMounted = true;
    setActiveStreamUrl(match.streamUrl);
    setActiveStreams(match.streams);
    setLiveScore({
      home: match.homeTeam.score ?? 0,
      away: match.awayTeam.score ?? 0,
      minute: match.minute,
      statusText: match.playTime
        ? `${match.playTime} LIVE`
        : match.minute && match.minute > 0
        ? `${match.minute}' LIVE`
        : undefined,
    });

    if (match.id) {
      streamingApiService
        .resolveStreamMirrors(match.id, match.competition)
        .then(mirrors => {
          if (isMounted && mirrors.length > 0) {
            setActiveStreams(mirrors);
            setActiveStreamUrl(mirrors[0].url);
          }
        })
        .catch(() => {});
    }

    // Dynamic Live Matches for Related Streams
    streamingApiService.getLiveMatches().then(matches => {
      if (isMounted && matches && matches.length > 0) {
        const others = matches
          .filter(m => m.id !== match.id && (m.status === 'LIVE' || m.minute > 0))
          .map(resolveLiveMatchToMatchup);
        if (others.length > 0) {
          setLiveRelatedStreams(others.slice(0, 5));
        }
      }
    }).catch(() => {});

    // Dynamic Upcoming Matches for context / recommendation
    streamingApiService.getUpcomingMatches().then(upcoming => {
      if (isMounted && upcoming && upcoming.length > 0) {
        const others = upcoming
          .filter(m => m.id !== match.id)
          .map(resolveLiveMatchToMatchup);
        if (others.length > 0) {
          setUpcomingRelatedMatches(others.slice(0, 6));
        }
      }
    }).catch(() => {});

    // Real-time score and play-time sync from ESPN Scoreboard via findEspnEvent
    const syncLiveScore = () => {
      sportsApiService
        .findEspnEvent(match.homeTeam.name, match.awayTeam.name, match.sport)
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
  }, [match.id, match.streamUrl, match.homeTeam.name, match.awayTeam.name, match.sport]);

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

  const isLive = match.status === 'LIVE';
  const isReminderSet = profile.matchReminderIds.includes(match.id);
  const isSaved = profile.savedMatchIds.includes(match.id);

  const relatedStreams = liveRelatedStreams;
  const showUpcomingSection = !isLive || match.status === 'UPCOMING' || relatedStreams.length === 0;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Watch ${match.homeTeam.name} vs ${match.awayTeam.name} live in Full HD on BALLIVE!`,
        title: `${match.homeTeam.name} vs ${match.awayTeam.name}`,
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
          title={match.competition}
          subtitle={`${match.homeTeam.name} vs ${match.awayTeam.name}`}
          rightAction={{
            icon: Share2,
            onPress: handleShare,
            accessibilityLabel: 'Share stream',
          }}
        />
      )}

      {/* ── 1. WIDESCREEN / FULLSCREEN STREAM PLAYER CONTAINER ── */}
      <View style={isFullscreen ? styles.fullscreenPlayerWrapper : styles.playerContainer}>
        {isLive ? (
          <LiveStreamPlayer
            key={`player-${match.id}`}
            streamUrl={activeStreamUrl || match.streamUrl}
            streams={activeStreams || match.streams}
            isLive={isLive}
            isFullscreen={isFullscreen}
            poster={match.homeTeam.crestUrl || (match as any).homeBadge || getTeamCrest(match.homeTeam.name || match.homeTeam.id)}
            homeTeamName={match.homeTeam.name}
            awayTeamName={match.awayTeam.name}
            title={`${match.homeTeam.name} vs ${match.awayTeam.name}`}
            onToggleFullscreen={isFullscreen ? handleExitFullscreen : handleEnterFullscreen}
            style={isFullscreen ? { width: '100%', height: '100%' } : undefined}
          />
        ) : (
          /* Upcoming / Unavailable Stream Experience */
          <View style={styles.upcomingPlayerSurface}>
            <View style={styles.upcomingCountdownIcon}>
              <Clock size={32} color="#7952FC" strokeWidth={2.2} />
            </View>
            <Text style={styles.upcomingPlayerTitle}>Broadcast Starts Before Kickoff</Text>
            <Text style={styles.upcomingPlayerSubtitle}>
              Live satellite coverage begins 15 minutes before {match.kickoffTime}. Set an alert to be notified when the feed connects!
            </Text>
            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.remindMePill, isReminderSet && styles.remindMePillActive]}
              onPress={() => toggleMatchReminder(match.id)}
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
                    source={{ uri: match.homeTeam.crestUrl || (match as any).homeBadge || getTeamCrest(match.homeTeam.name || match.homeTeam.id) }}
                    style={styles.crestImage}
                  />
                </View>
                <Text style={styles.teamNameText} numberOfLines={1} ellipsizeMode="tail">
                  {match.homeTeam.name}
                </Text>
              </View>

              {/* Score / Match State Center */}
              <View style={styles.matchScoreCenter}>
                {isLive || match.status === 'FT' ? (
                  <>
                    <View style={styles.scoreRow}>
                      <Text style={styles.scoreNumber}>{liveScore.home}</Text>
                      <Text style={styles.scoreColon}>:</Text>
                      <Text style={styles.scoreNumber}>{liveScore.away}</Text>
                    </View>
                    <View style={[styles.statusBadgePill, isLive ? styles.statusBadgeLive : styles.statusBadgeFT]}>
                      {isLive && <View style={styles.liveClockDot} />}
                      <Text style={styles.statusBadgeText}>
                        {liveScore.statusText || (isLive ? `${liveScore.minute || match.minute || 45}' LIVE` : 'FULL TIME')}
                      </Text>
                    </View>
                  </>
                ) : (
                  <>
                    <View style={styles.vsBadge}>
                      <Text style={styles.vsText}>VS</Text>
                    </View>
                    <Text style={styles.matchStatusSub}>
                      {match.kickoffTime || '17:30'} • Today
                    </Text>
                  </>
                )}
              </View>

              {/* Away Team */}
              <View style={styles.matchTeamSide}>
                <View style={styles.crestContainer}>
                  <Image
                    source={{ uri: match.awayTeam.crestUrl || (match as any).awayBadge || getTeamCrest(match.awayTeam.name || match.awayTeam.id) }}
                    style={styles.crestImage}
                  />
                </View>
                <Text style={styles.teamNameText} numberOfLines={1} ellipsizeMode="tail">
                  {match.awayTeam.name}
                </Text>
              </View>
            </View>
          </View>

          {/* ── 3. MATCH ACTIONS BAR ── */}
          <View style={styles.actionsBar}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.matchDetailsActionBtn,
                activeBottomView === 'details' && styles.matchDetailsActionBtnActive,
              ]}
              onPress={() => {
                setActiveBottomView(prev => prev === 'details' ? 'streams' : 'details');
              }}
            >
              {activeBottomView === 'details' ? (
                <>
                  <Tv size={15} color="#ECE9FA" strokeWidth={2.4} />
                  <Text style={styles.matchDetailsActionText}>Show Other Live Streams</Text>
                </>
              ) : (
                <>
                  <Info size={15} color="#FFFFFF" strokeWidth={2.4} />
                  <Text style={styles.matchDetailsActionText}>Match Details & Lineups</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.iconActionBtn, isReminderSet && styles.iconActionBtnActive]}
              onPress={() => toggleMatchReminder(match.id)}
              accessibilityLabel="Toggle kickoff reminder"
            >
              {isReminderSet ? (
                <BellRing size={18} color="#7952FC" strokeWidth={2.4} />
              ) : (
                <Bell size={18} color="#A098B5" strokeWidth={2} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.iconActionBtn, isSaved && styles.iconActionBtnActive]}
              onPress={() => toggleSaveMatch(match.id)}
              accessibilityLabel="Bookmark match"
            >
              {isSaved ? (
                <BookmarkCheck size={18} color="#7952FC" strokeWidth={2.4} />
              ) : (
                <Bookmark size={18} color="#A098B5" strokeWidth={2} />
              )}
            </TouchableOpacity>
          </View>

          {/* ── 4. CONTENT AREA: INLINE MATCH DETAILS OR OTHER LIVE MATCHES ── */}
          {activeBottomView === 'details' ? (
            <View style={styles.inlineDetailsWrapper}>
              <InlineMatchDetailsModule
                matchup={match}
                liveScore={liveScore}
                onSwitchToLiveStreams={() => setActiveBottomView('streams')}
                liveStreamCount={relatedStreams.length}
              />
            </View>
          ) : (
            <View style={styles.relatedSection}>
              {showUpcomingSection ? (
                <>
                  <Text style={styles.relatedSectionTitle}>OTHER UPCOMING FIXTURES</Text>
                  {upcomingRelatedMatches.length > 0 ? (
                    upcomingRelatedMatches.map(rel => {
                      const relHomeCrest = rel.homeTeam.crestUrl || (rel as any).homeBadge || getTeamCrest(rel.homeTeam.name || rel.homeTeam.id);
                      const relAwayCrest = rel.awayTeam.crestUrl || (rel as any).awayBadge || getTeamCrest(rel.awayTeam.name || rel.awayTeam.id);
                      const isReminder = profile.matchReminderIds.includes(rel.id);

                      return (
                        <TouchableOpacity
                          key={rel.id}
                          activeOpacity={0.8}
                          style={styles.relatedRow}
                          onPress={() => {
                            navigate({
                              name: 'LiveStreamDetails',
                              params: { match: rel },
                            });
                          }}
                        >
                          {/* Top Meta: Comp + Kickoff Pill */}
                          <View style={styles.relatedMetaRow}>
                            <Text style={styles.relatedComp} numberOfLines={1} ellipsizeMode="tail">
                              {rel.competition}
                            </Text>
                            <View style={styles.relatedTimePill}>
                              <Clock size={10} color="#93C5FD" strokeWidth={2.2} style={{ marginRight: 4 }} />
                              <Text style={styles.relatedTimeText}>
                                {rel.kickoffTime || 'UPCOMING'}
                              </Text>
                            </View>
                          </View>

                          {/* Matchup Content Row */}
                          <View style={styles.relatedMatchupRow}>
                            <View style={styles.relatedTeamsGroup}>
                              <Image source={{ uri: relHomeCrest }} style={styles.relatedCrest} />
                              <Text style={styles.relatedTeamName} numberOfLines={1} ellipsizeMode="tail">
                                {rel.homeTeam.name}
                              </Text>
                              <Text style={styles.relatedVs}>vs</Text>
                              <Text style={styles.relatedTeamName} numberOfLines={1} ellipsizeMode="tail">
                                {rel.awayTeam.name}
                              </Text>
                              <Image source={{ uri: relAwayCrest }} style={styles.relatedCrest} />
                            </View>

                            <TouchableOpacity
                              activeOpacity={0.7}
                              style={[styles.remindMiniBtn, isReminder && styles.remindMiniBtnActive]}
                              onPress={(e) => {
                                e.stopPropagation?.();
                                toggleMatchReminder(rel.id);
                              }}
                            >
                              {isReminder ? (
                                <BellRing size={12} color="#7952FC" strokeWidth={2.4} />
                              ) : (
                                <Bell size={12} color="#CBD5E1" strokeWidth={2} />
                              )}
                              <Text style={[styles.remindMiniText, isReminder && styles.remindMiniTextActive]}>
                                {isReminder ? 'Set' : 'Remind'}
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </TouchableOpacity>
                      );
                    })
                  ) : (
                    <View style={styles.emptyOtherLive}>
                      <Calendar size={22} color="#6D6A87" strokeWidth={2} />
                      <Text style={styles.emptyOtherLiveText}>No upcoming fixtures scheduled right now</Text>
                    </View>
                  )}
                </>
              ) : (
                <>
                  <Text style={styles.relatedSectionTitle}>OTHER LIVE MATCHES</Text>
                  {relatedStreams.map(rel => {
                    const relHomeCrest = rel.homeTeam.crestUrl || (rel as any).homeBadge || getTeamCrest(rel.homeTeam.name || rel.homeTeam.id);
                    const relAwayCrest = rel.awayTeam.crestUrl || (rel as any).awayBadge || getTeamCrest(rel.awayTeam.name || rel.awayTeam.id);
                    const isRelLive = rel.status === 'LIVE' || (rel.minute && rel.minute > 0);

                    return (
                      <TouchableOpacity
                        key={rel.id}
                        activeOpacity={0.8}
                        style={styles.relatedRow}
                        onPress={() => {
                          navigate({
                            name: 'LiveStreamDetails',
                            params: { match: rel },
                          });
                        }}
                      >
                        {/* Top Meta: Comp + Live Badge */}
                        <View style={styles.relatedMetaRow}>
                          <Text style={styles.relatedComp} numberOfLines={1} ellipsizeMode="tail">
                            {rel.competition}
                          </Text>
                          <View style={[styles.relatedLivePill, !isRelLive && styles.relatedTimePill]}>
                            {isRelLive && <View style={styles.relatedLiveDot} />}
                            <Text style={styles.relatedLiveText}>
                              {isRelLive ? `${rel.minute || 45}' LIVE` : rel.kickoffTime}
                            </Text>
                          </View>
                        </View>

                        {/* Matchup Content Row */}
                        <View style={styles.relatedMatchupRow}>
                          <View style={styles.relatedTeamsGroup}>
                            <Image source={{ uri: relHomeCrest }} style={styles.relatedCrest} />
                            <Text style={styles.relatedTeamName} numberOfLines={1} ellipsizeMode="tail">
                              {rel.homeTeam.name}
                            </Text>
                            <Text style={styles.relatedVs}>vs</Text>
                            <Text style={styles.relatedTeamName} numberOfLines={1} ellipsizeMode="tail">
                              {rel.awayTeam.name}
                            </Text>
                            <Image source={{ uri: relAwayCrest }} style={styles.relatedCrest} />
                          </View>

                          <View style={styles.watchMiniBtn}>
                            <Tv size={12} color="#FFFFFF" strokeWidth={2.2} />
                            <Text style={styles.watchMiniText}>Switch</Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </>
              )}
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
    flex: 1,
    backgroundColor: '#181524',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
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
  matchDetailsActionBtn: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#7952FC',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  matchDetailsActionBtnActive: {
    backgroundColor: '#2A2045',
  },
  inlineDetailsWrapper: {
    marginHorizontal: 16,
  },
  matchDetailsActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
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
  metaCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#1E1730',
    gap: 10,
  },
  metaCardTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  metaLabel: {
    fontSize: 12,
    color: '#A098B5',
  },
  metaVal: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  relatedSection: {
    paddingHorizontal: 16,
  },
  relatedSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#A098B5',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
    paddingLeft: 2,
  },
  relatedRow: {
    backgroundColor: '#1E1730',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
  },
  relatedMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  relatedComp: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#7952FC',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    flex: 1,
    marginRight: 8,
  },
  relatedLivePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FF2E56',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 5,
  },
  relatedTimePill: {
    backgroundColor: '#2A2045',
  },
  relatedLiveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#FFFFFF',
  },
  relatedLiveText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  relatedMatchupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  relatedTeamsGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginRight: 10,
  },
  relatedCrest: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  relatedTeamName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    flexShrink: 1,
  },
  relatedVs: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7952FC',
    marginHorizontal: 2,
  },
  watchMiniBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#2A2045',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 8,
  },
  watchMiniText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  remindMiniBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  remindMiniBtnActive: {
    backgroundColor: 'rgba(121, 82, 252, 0.25)',
    borderColor: '#7952FC',
  },
  remindMiniText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#CBD5E1',
  },
  remindMiniTextActive: {
    color: '#A78BFA',
  },
  relatedTimeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#93C5FD',
  },
  emptyOtherLive: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 6,
    backgroundColor: '#1E1730',
    borderRadius: 14,
  },
  emptyOtherLiveText: {
    fontSize: 12,
    color: '#A098B5',
    fontWeight: '500',
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
