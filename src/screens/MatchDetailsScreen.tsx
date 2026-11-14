import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
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
import Colors from '../theme/colors';
import { SecondaryScreenHeader } from '../components/common/SecondaryScreenHeader';
import { getTeamCrest, DEFAULT_CREST } from '../utils/teamCrestResolver';
import { resolveSportBackground } from '../utils/sportBackgroundResolver';
import { DiscoverMatchup, UPCOMING_HIGHLIGHTS } from '../constants/discoverData';
import { useProfile } from '../hooks/useProfile';
import { useAppNavigation } from '../navigation/NavigationContext';
import { streamingApiService } from '../services/streamingApiService';
import { sportsApiService } from '../services/sportsApiService';
import { UniversalMatchCard } from '../components/common/UniversalMatchCard';
import { normalizeMatchStatus } from '../utils/matchStatus';

export type NormalizedSport =
  | 'football'
  | 'basketball'
  | 'mma'
  | 'boxing'
  | 'nfl'
  | 'hockey'
  | 'motorsport'
  | 'wrestling'
  | 'tennis'
  | 'cricket'
  | 'other';

export function normalizeSport(rawSport?: string, competitionName?: string): NormalizedSport {
  const s = (rawSport || '').toLowerCase();
  const c = (competitionName || '').toLowerCase();

  if (s === 'boxing' || c.includes('boxing') || c.includes('wbc') || c.includes('wba')) return 'boxing';
  if (s === 'wrestling' || c.includes('wwe') || c.includes('aew') || c.includes('tna') || c.includes('wrestling')) return 'wrestling';
  if (s === 'mma' || s === 'combat' || c.includes('ufc') || c.includes('mma') || c.includes('bellator') || c.includes('pfl')) return 'mma';
  if (s === 'basketball' || c.includes('nba') || c.includes('euroleague') || c.includes('basketball')) return 'basketball';
  if (s === 'hockey' || c.includes('nhl') || c.includes('khl') || c.includes('hockey')) return 'hockey';
  if (s === 'american_football' || s === 'nfl' || c.includes('nfl') || c.includes('american football')) return 'nfl';
  if (s === 'motorsport' || s === 'racing' || s === 'f1' || c.includes('f1') || c.includes('formula') || c.includes('grand prix') || c.includes('motorsport') || c.includes('nascar')) return 'motorsport';
  if (s === 'tennis' || c.includes('tennis') || c.includes('atp') || c.includes('wta') || c.includes('wimbledon') || c.includes('us open')) return 'tennis';
  if (s === 'cricket' || c.includes('cricket') || c.includes('ipl') || c.includes('icc') || c.includes('bbl')) return 'cricket';
  if (s === 'soccer' || s === 'football' || c.includes('premier') || c.includes('la liga') || c.includes('serie a') || c.includes('bundesliga') || c.includes('champions') || c.includes('fifa') || c.includes('uefa') || c.includes('league')) return 'football';

  return 'football';
}

interface MatchDetailsScreenProps {
  matchup: DiscoverMatchup;
}

export const MatchDetailsScreen: React.FC<MatchDetailsScreenProps> = ({ matchup }) => {
  const { navigate } = useAppNavigation();
  const { profile, toggleMatchReminder, toggleSaveMatch } = useProfile();
  const [activeMatchup, setActiveMatchup] = useState<DiscoverMatchup>(matchup);
  const [moreMatches, setMoreMatches] = useState<DiscoverMatchup[]>([]);

  useEffect(() => {
    setActiveMatchup(matchup);
  }, [matchup]);

  // Synchronize real-time live score, game clock, and stream mirrors for the active match
  useEffect(() => {
    let isMounted = true;

    // 1. Cross-reference with live scoreboards (e.g. ESPN)
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
        } else if (found.statusText === 'FT' || (found as any).state === 'post') {
          setActiveMatchup(prev => ({
            ...prev,
            status: 'FT',
            isLive: false,
            minute: 90,
            playTime: 'FT',
            homeTeam: { ...prev.homeTeam, score: found.scoreHome },
            awayTeam: { ...prev.awayTeam, score: found.scoreAway },
          }));
        }
      })
      .catch(() => {});

    // 2. Resolve stream mirrors
    if (activeMatchup.id) {
      streamingApiService
        .resolveStreamMirrors(activeMatchup.id, activeMatchup.competition)
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
  const rawImage =
    activeMatchup.poster ||
    (activeMatchup as any).imageUrl ||
    activeMatchup.matchBannerUrl ||
    null;

  const heroArtworkUrl = useMemo(() => {
    return resolveSportBackground(
      activeMatchup.sport,
      activeMatchup.competition,
      rawImage,
      activeMatchup.homeTeam.name,
      activeMatchup.awayTeam.name,
      activeMatchup.id,
      homeCrest,
      awayCrest
    );
  }, [activeMatchup.sport, activeMatchup.competition, rawImage, activeMatchup.homeTeam.name, activeMatchup.awayTeam.name, activeMatchup.id, homeCrest, awayCrest]);

  const isReminderSet = profile.matchReminderIds.includes(activeMatchup.id);
  const isSaved = profile.savedMatchIds.includes(activeMatchup.id);
  const normalizedStatus = normalizeMatchStatus({
    rawStatus: activeMatchup.status,
    playTime: activeMatchup.playTime,
    minute: activeMatchup.minute,
  });
  const isLive =
    normalizedStatus.isLive ||
    activeMatchup.status === 'LIVE' ||
    Boolean(activeMatchup.isLive) ||
    (activeMatchup.minute !== undefined && activeMatchup.minute > 0) ||
    activeMatchup.playTime === 'HT' ||
    Boolean(activeMatchup.playTime && activeMatchup.playTime.includes('LIVE')) ||
    Boolean(activeMatchup.hasLiveBroadcast || activeMatchup.streamUrl);
  const isFinished = normalizedStatus.isFinished || activeMatchup.status === 'FT';
  const isUpcoming = !isLive && !isFinished;
  const hasLiveStream = isLive && Boolean(activeMatchup.streamUrl || activeMatchup.hasLiveBroadcast || (activeMatchup.streams && activeMatchup.streams.length > 0));

  const homeScore = activeMatchup.homeTeam.score ?? 0;
  const awayScore = activeMatchup.awayTeam.score ?? 0;

  // Load other live & upcoming matches for discovery navigation
  useEffect(() => {
    let isMounted = true;
    streamingApiService
      .getLiveMatches()
      .then(matches => {
        if (!isMounted) return;
        const converted = matches
          .map(m => streamingApiService.convertLiveMatchToMatchup(m))
          .filter(m => m.id !== activeMatchup.id);

        if (converted.length > 0) {
          setMoreMatches(converted.slice(0, 6));
        } else {
          setMoreMatches(UPCOMING_HIGHLIGHTS.filter(m => m.id !== activeMatchup.id).slice(0, 6));
        }
      })
      .catch(() => {
        if (isMounted) {
          setMoreMatches(UPCOMING_HIGHLIGHTS.filter(m => m.id !== activeMatchup.id).slice(0, 6));
        }
      });

    return () => {
      isMounted = false;
    };
  }, [activeMatchup.id]);

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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.headerPurple} translucent={false} />

      {/* ── 1. CURVED SECONDARY TOP APP BAR ── */}
      <SecondaryScreenHeader
        title={activeMatchup.competition}
        subtitle={`${activeMatchup.homeTeam.name} vs ${activeMatchup.awayTeam.name}`}
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
          <Image
            source={{ uri: heroArtworkUrl }}
            style={styles.heroImage}
            resizeMode="cover"
          />
        </View>

        {/* ── 3. REFINED MATCHUP CARD WITH INTEGRATED METADATA STRIP ── */}
        <View style={styles.matchupCard}>
          {/* Main Matchup Score Row */}
          <View style={styles.matchupRow}>
            {/* Home Team */}
            <View style={styles.teamCol}>
              <View style={styles.crestCircle}>
                <Image source={{ uri: homeCrest }} style={styles.crestImage} resizeMode="contain" />
              </View>
              <Text style={styles.teamName} numberOfLines={2}>
                {activeMatchup.homeTeam.name}
              </Text>
            </View>

            {/* Center: Score / Status / VS */}
            <View style={styles.centerCol}>
              {isLive ? (
                <>
                  <View style={styles.scoreRow}>
                    <Text style={styles.scoreText}>{homeScore}</Text>
                    <Text style={styles.scoreColon}>:</Text>
                    <Text style={styles.scoreText}>{awayScore}</Text>
                  </View>
                  <View style={styles.livePill}>
                    <View style={styles.liveDot} />
                    <Text style={styles.livePillText}>
                      {activeMatchup.playTime || (activeMatchup.minute ? `${activeMatchup.minute}' LIVE` : 'LIVE')}
                    </Text>
                  </View>
                </>
              ) : isFinished ? (
                <>
                  <View style={styles.scoreRow}>
                    <Text style={styles.scoreText}>{homeScore}</Text>
                    <Text style={styles.scoreColon}>:</Text>
                    <Text style={styles.scoreText}>{awayScore}</Text>
                  </View>
                  <View style={styles.ftPill}>
                    <Text style={styles.ftPillText}>FULL TIME</Text>
                  </View>
                </>
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
            <View style={styles.teamCol}>
              <View style={styles.crestCircle}>
                <Image source={{ uri: awayCrest }} style={styles.crestImage} resizeMode="contain" />
              </View>
              <Text style={styles.teamName} numberOfLines={2}>
                {activeMatchup.awayTeam.name}
              </Text>
            </View>
          </View>

          {/* Integrated Metadata Strip (No Empty Gaps) */}
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
            ) : isFinished ? (
              <View style={[styles.primaryActionButton, styles.completedActionButton]}>
                <CheckCircle size={16} color="#10B981" strokeWidth={2.2} />
                <Text style={[styles.primaryActionText, { color: '#E2E8F0' }]}>Match Concluded (FT)</Text>
              </View>
            ) : (
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
              onPress={() => toggleSaveMatch(activeMatchup.id)}
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

        {/* ── 5. ESSENTIAL MATCH OVERVIEW CARD (SMART SPACE UTILIZATION) ── */}
        <View style={styles.overviewCard}>
          <View style={styles.overviewGrid}>
            {/* Item 1: Venue */}
            <View style={styles.overviewItem}>
              <View style={styles.overviewIconCircle}>
                <MapPin size={13} color="#A58BFC" strokeWidth={2.2} />
              </View>
              <View style={styles.overviewTextCol}>
                <Text style={styles.overviewLabel}>VENUE</Text>
                <Text style={styles.overviewValue} numberOfLines={1}>
                  {matchup.venue || 'Stadium'}
                </Text>
              </View>
            </View>

            {/* Item 2: Kickoff */}
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

            {/* Item 3: Competition */}
            <View style={styles.overviewItem}>
              <View style={styles.overviewIconCircle}>
                <Trophy size={13} color="#A58BFC" strokeWidth={2.2} />
              </View>
              <View style={styles.overviewTextCol}>
                <Text style={styles.overviewLabel}>COMPETITION</Text>
                <Text style={styles.overviewValue} numberOfLines={1}>
                  {matchup.competition}
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
                  {hasLiveStream ? 'Live Stream Active' : 'BALLIVE Coverage'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── 6. MORE LIVE & UPCOMING FIXTURES ── */}
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
                  onPress={() => {
                    const isItemLive =
                      item.status === 'LIVE' ||
                      (item.minute !== undefined && item.minute > 0) ||
                      Boolean(item.isLive) ||
                      Boolean(item.hasLiveBroadcast || item.streamUrl);

                    if (isItemLive) {
                      navigate({ name: 'LiveStreamDetails', params: { match: item } });
                    } else {
                      navigate({ name: 'MatchDetails', params: { matchup: item } });
                    }
                  }}
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
    marginBottom: 8,
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#1E1730',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },

  // ── Matchup Card ──
  matchupCard: {
    backgroundColor: '#1E1730',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginBottom: 10,
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
  crestCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#181524',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  crestImage: {
    width: 34,
    height: 34,
  },
  teamName: {
    fontSize: 12,
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
    marginBottom: 10,
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

  // ── Essential Match Overview Card ──
  overviewCard: {
    backgroundColor: '#1E1730',
    borderRadius: 14,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 14,
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  overviewItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  overviewIconCircle: {
    width: 30,
    height: 30,
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
    marginBottom: 1,
  },
  overviewValue: {
    fontSize: 11,
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
