import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Share,
} from 'react-native';
import {
  Play,
  Pause,
  Maximize2,
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
  Sparkles,
  ShieldAlert,
} from 'lucide-react-native';
import Colors from '../theme/colors';
import { SecondaryScreenHeader } from '../components/common/SecondaryScreenHeader';
import { LiveBadge } from '../components/common/LiveBadge';
import { getTeamCrest } from '../utils/teamCrestResolver';
import { DiscoverMatchup } from '../constants/discoverData';
import { useProfile } from '../hooks/useProfile';
import { getAllLiveStreamMatches } from '../navigation/navHelpers';
import { useAppNavigation } from '../navigation/NavigationContext';

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

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState<'1080p' | '720p'>('1080p');

  const isLive = match.status === 'LIVE';
  const isReminderSet = profile.matchReminderIds.includes(match.id);
  const isSaved = profile.savedMatchIds.includes(match.id);

  const relatedStreams = getAllLiveStreamMatches()
    .filter(m => m.id !== match.id)
    .slice(0, 3);

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
    <View style={styles.root}>
      {/* ── TOP APP BAR ── */}
      <SecondaryScreenHeader
        title={match.competition}
        subtitle={`${match.homeTeam.name} vs ${match.awayTeam.name}`}
        rightAction={{
          icon: Share2,
          onPress: handleShare,
          accessibilityLabel: 'Share stream',
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── 1. WIDESCREEN 16:9 STREAM PLAYER CONTAINER ── */}
        <View style={styles.playerContainer}>
          {isLive ? (
            <View style={styles.livePlayerSurface}>
              {/* Simulated Stadium Broadcast Background */}
              <View style={styles.fieldBackdrop} />

              {/* Top Stream Overlay */}
              <View style={styles.playerTopOverlay}>
                <View style={styles.liveBadgeCluster}>
                  <View style={styles.pulsingRedDot} />
                  <Text style={styles.liveStreamBadgeText}>
                    LIVE {match.minute ? `• ${match.minute}'` : ''}
                  </Text>
                </View>

                <View style={styles.qualityPill}>
                  <Text style={styles.qualityPillText}>{selectedQuality} 60FPS</Text>
                </View>
              </View>

              {/* Center Match Score Bug Overlay */}
              <View style={styles.streamScoreBug}>
                <Image
                  source={{ uri: getTeamCrest(match.homeTeam.name || match.homeTeam.id) }}
                  style={styles.bugCrest}
                />
                <Text style={styles.bugTeamName}>{match.homeTeam.name.substring(0, 3).toUpperCase()}</Text>
                <Text style={styles.bugScore}>{match.homeTeam.score ?? 0}</Text>
                <Text style={styles.bugDivider}>-</Text>
                <Text style={styles.bugScore}>{match.awayTeam.score ?? 0}</Text>
                <Text style={styles.bugTeamName}>{match.awayTeam.name.substring(0, 3).toUpperCase()}</Text>
                <Image
                  source={{ uri: getTeamCrest(match.awayTeam.name || match.awayTeam.id) }}
                  style={styles.bugCrest}
                />
              </View>

              {/* Bottom Player Controls Overlay */}
              <View style={styles.playerBottomControls}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.playerCtrlBtn}
                  onPress={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? (
                    <Pause size={18} color="#FFFFFF" strokeWidth={2.4} />
                  ) : (
                    <Play size={18} color="#FFFFFF" strokeWidth={2.4} />
                  )}
                </TouchableOpacity>

                {/* Scrubber line */}
                <View style={styles.scrubberBar}>
                  <View style={styles.scrubberFill} />
                  <View style={styles.scrubberThumb} />
                </View>

                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.playerCtrlBtn}
                  onPress={() => setIsMuted(!isMuted)}
                >
                  {isMuted ? (
                    <VolumeX size={18} color="#EF4444" strokeWidth={2.4} />
                  ) : (
                    <Volume2 size={18} color="#FFFFFF" strokeWidth={2.4} />
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.playerCtrlBtn}
                  onPress={() => {
                    setSelectedQuality(selectedQuality === '1080p' ? '720p' : '1080p');
                  }}
                >
                  <Text style={styles.qualityToggleText}>{selectedQuality}</Text>
                </TouchableOpacity>

                <TouchableOpacity activeOpacity={0.8} style={styles.playerCtrlBtn}>
                  <Maximize2 size={16} color="#FFFFFF" strokeWidth={2.4} />
                </TouchableOpacity>
              </View>
            </View>
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

        {/* ── 2. MATCH IDENTITY & SCOREBOARD CARD ── */}
        <View style={styles.matchIdentityCard}>
          <View style={styles.teamsRow}>
            {/* Home */}
            <View style={styles.matchTeamSide}>
              <View style={styles.crestContainer}>
                <Image
                  source={{ uri: getTeamCrest(match.homeTeam.name || match.homeTeam.id) }}
                  style={styles.crestImage}
                />
              </View>
              <Text style={styles.teamNameText} numberOfLines={1}>
                {match.homeTeam.name}
              </Text>
            </View>

            {/* Score / VS Center */}
            <View style={styles.matchScoreCenter}>
              {isLive || match.status === 'FT' ? (
                <View style={styles.scoreRow}>
                  <Text style={styles.scoreNumber}>{match.homeTeam.score ?? 0}</Text>
                  <Text style={styles.scoreColon}> - </Text>
                  <Text style={styles.scoreNumber}>{match.awayTeam.score ?? 0}</Text>
                </View>
              ) : (
                <View style={styles.vsBadge}>
                  <Text style={styles.vsText}>VS</Text>
                </View>
              )}
              <Text style={styles.matchStatusSub}>
                {isLive ? `${match.minute}' In-Play` : match.kickoffTime}
              </Text>
            </View>

            {/* Away */}
            <View style={styles.matchTeamSide}>
              <View style={styles.crestContainer}>
                <Image
                  source={{ uri: getTeamCrest(match.awayTeam.name || match.awayTeam.id) }}
                  style={styles.crestImage}
                />
              </View>
              <Text style={styles.teamNameText} numberOfLines={1}>
                {match.awayTeam.name}
              </Text>
            </View>
          </View>
        </View>

        {/* ── 3. ACTION BUTTONS BAR ── */}
        <View style={styles.actionsBar}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.matchDetailsActionBtn}
            onPress={() => {
              navigate({
                name: 'MatchDetails',
                params: { matchup: match },
              });
            }}
          >
            <Info size={16} color="#FFFFFF" strokeWidth={2.4} />
            <Text style={styles.matchDetailsActionText}>Match Details & Lineups</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.iconActionBtn, isReminderSet && styles.iconActionBtnActive]}
            onPress={() => toggleMatchReminder(match.id)}
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
          >
            {isSaved ? (
              <BookmarkCheck size={18} color="#7952FC" strokeWidth={2.4} />
            ) : (
              <Bookmark size={18} color="#A098B5" strokeWidth={2} />
            )}
          </TouchableOpacity>
        </View>

        {/* ── 4. BROADCAST METADATA CARD ── */}
        <View style={styles.metaCard}>
          <Text style={styles.metaCardTitle}>Live Stream Specifications</Text>

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Feed Source</Text>
            <Text style={styles.metaVal}>BALLIVE Authorized Satellite Feed 1</Text>
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Resolution</Text>
            <Text style={styles.metaVal}>{selectedQuality} 60FPS (Auto Variable Bitrate)</Text>
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Audio Commentary</Text>
            <Text style={styles.metaVal}>English (Dolby Surround 5.1)</Text>
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Broadcast Latency</Text>
            <Text style={styles.metaVal}>Ultra-low latency (&lt;1.8s live)</Text>
          </View>
        </View>

        {/* ── 5. OTHER LIVE STREAMS CAROUSEL ── */}
        {relatedStreams.length > 0 && (
          <View style={styles.relatedSection}>
            <Text style={styles.relatedSectionTitle}>Other Live Matches</Text>

            {relatedStreams.map(rel => (
              <TouchableOpacity
                key={rel.id}
                activeOpacity={0.85}
                style={styles.relatedRow}
                onPress={() => {
                  navigate({
                    name: 'LiveStreamDetails',
                    params: { match: rel },
                  });
                }}
              >
                <View style={styles.relatedLeft}>
                  <Text style={styles.relatedComp}>{rel.competition}</Text>
                  <Text style={styles.relatedVersus} numberOfLines={1}>
                    {rel.homeTeam.name} vs {rel.awayTeam.name}
                  </Text>
                  <Text style={styles.relatedTime}>
                    {rel.status === 'LIVE' ? `${rel.minute}' LIVE` : rel.kickoffTime}
                  </Text>
                </View>

                <View style={styles.watchMiniBtn}>
                  <Tv size={14} color="#FFFFFF" strokeWidth={2.2} />
                  <Text style={styles.watchMiniText}>Switch</Text>
                </View>
              </TouchableOpacity>
            ))}
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
  playerContainer: {
    width: SCREEN_WIDTH,
    height: PLAYER_HEIGHT,
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
    padding: 16,
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
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#181524',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  crestImage: {
    width: 36,
    height: 36,
    resizeMode: 'contain',
  },
  teamNameText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  matchScoreCenter: {
    width: 90,
    alignItems: 'center',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  scoreNumber: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  scoreColon: {
    fontSize: 22,
    fontWeight: '700',
    color: '#7952FC',
    marginHorizontal: 3,
  },
  vsBadge: {
    backgroundColor: '#2A2045',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 3,
  },
  vsText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#7952FC',
  },
  matchStatusSub: {
    fontSize: 10.5,
    color: '#A098B5',
    fontWeight: '600',
  },
  actionsBar: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  matchDetailsActionBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#7952FC',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  matchDetailsActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  iconActionBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#1E1730',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconActionBtnActive: {
    backgroundColor: '#2A2045',
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
    fontSize: 13,
    fontWeight: '700',
    color: '#A098B5',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  relatedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1730',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
  },
  relatedLeft: {
    flex: 1,
  },
  relatedComp: {
    fontSize: 10,
    fontWeight: '700',
    color: '#7952FC',
    textTransform: 'uppercase',
  },
  relatedVersus: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    marginVertical: 2,
  },
  relatedTime: {
    fontSize: 10.5,
    color: '#A098B5',
  },
  watchMiniBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#2A2045',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  watchMiniText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
