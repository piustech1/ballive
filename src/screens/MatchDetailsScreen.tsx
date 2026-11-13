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
  ArrowRight,
} from 'lucide-react-native';
import Colors from '../theme/colors';
import { SecondaryScreenHeader } from '../components/common/SecondaryScreenHeader';
import { getTeamCrest, DEFAULT_CREST } from '../utils/teamCrestResolver';
import { resolveSportBackground } from '../utils/sportBackgroundResolver';
import { DiscoverMatchup, UPCOMING_HIGHLIGHTS } from '../constants/discoverData';
import { useProfile } from '../hooks/useProfile';
import { useAppNavigation } from '../navigation/NavigationContext';
import { streamingApiService } from '../services/streamingApiService';
import { UniversalMatchCard } from '../components/common/UniversalMatchCard';

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
  const [moreMatches, setMoreMatches] = useState<DiscoverMatchup[]>([]);

  // Resolve authentic, sharp, unblurred sport-specific background
  const rawImage =
    matchup.poster ||
    (matchup as any).imageUrl ||
    matchup.matchBannerUrl ||
    null;

  const heroArtworkUrl = useMemo(() => {
    return resolveSportBackground(matchup.sport, matchup.competition, rawImage);
  }, [matchup.sport, matchup.competition, rawImage]);

  // Team crests
  const homeCrest =
    matchup.homeTeam.crestUrl ||
    (matchup as any).homeBadge ||
    getTeamCrest(matchup.homeTeam.name) ||
    DEFAULT_CREST;

  const awayCrest =
    matchup.awayTeam.crestUrl ||
    (matchup as any).awayBadge ||
    getTeamCrest(matchup.awayTeam.name) ||
    DEFAULT_CREST;

  const isReminderSet = profile.matchReminderIds.includes(matchup.id);
  const isSaved = profile.savedMatchIds.includes(matchup.id);
  const isLive = matchup.status === 'LIVE' || Boolean(matchup.minute && matchup.minute > 0);
  const isFinished = matchup.status === 'FT';

  const homeScore = matchup.homeTeam.score ?? 0;
  const awayScore = matchup.awayTeam.score ?? 0;

  // Load other live & upcoming matches for discovery navigation
  useEffect(() => {
    let isMounted = true;
    streamingApiService
      .getLiveMatches()
      .then(matches => {
        if (!isMounted) return;
        const converted = matches
          .map(m => streamingApiService.convertLiveMatchToMatchup(m))
          .filter(m => m.id !== matchup.id);

        if (converted.length > 0) {
          setMoreMatches(converted.slice(0, 6));
        } else {
          setMoreMatches(UPCOMING_HIGHLIGHTS.filter(m => m.id !== matchup.id).slice(0, 6));
        }
      })
      .catch(() => {
        if (isMounted) {
          setMoreMatches(UPCOMING_HIGHLIGHTS.filter(m => m.id !== matchup.id).slice(0, 6));
        }
      });

    return () => {
      isMounted = false;
    };
  }, [matchup.id]);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${matchup.homeTeam.name} vs ${matchup.awayTeam.name} — ${matchup.competition} on BALLIVE`,
        title: `${matchup.homeTeam.name} vs ${matchup.awayTeam.name}`,
      });
    } catch {
      // User cancelled
    }
  };

  const handleWatchLive = () => {
    navigate({
      name: 'LiveStreamDetails',
      params: { match: matchup },
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.headerPurple} translucent={false} />

      {/* ── 1. CURVED SECONDARY TOP APP BAR ── */}
      <SecondaryScreenHeader
        title={matchup.competition}
        subtitle={`${matchup.homeTeam.name} vs ${matchup.awayTeam.name}`}
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
        {/* ── 2. STATIC MATCH HERO IMAGE (SHARP, NO BLUR, NO OVERLAYS) ── */}
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: heroArtworkUrl }}
            style={styles.heroImage}
            resizeMode="cover"
          />
        </View>

        {/* ── 3. COMPACT MATCHUP CARD ── */}
        <View style={styles.matchupCard}>
          {/* Home Team */}
          <View style={styles.teamCol}>
            <View style={styles.crestCircle}>
              <Image source={{ uri: homeCrest }} style={styles.crestImage} resizeMode="contain" />
            </View>
            <Text style={styles.teamName} numberOfLines={1}>
              {matchup.homeTeam.name}
            </Text>
          </View>

          {/* Center VS / Score & Status */}
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
                    {matchup.playTime || (matchup.minute ? `${matchup.minute}' LIVE` : 'LIVE')}
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
                    {matchup.kickoffTime || 'Today'}
                  </Text>
                </View>
              </>
            )}

            <View style={styles.venueRow}>
              <MapPin size={11} color={Colors.textMuted} style={{ marginRight: 3 }} />
              <Text style={styles.venueText} numberOfLines={1}>
                {matchup.venue || matchup.competition}
              </Text>
            </View>
          </View>

          {/* Away Team */}
          <View style={styles.teamCol}>
            <View style={styles.crestCircle}>
              <Image source={{ uri: awayCrest }} style={styles.crestImage} resizeMode="contain" />
            </View>
            <Text style={styles.teamName} numberOfLines={1}>
              {matchup.awayTeam.name}
            </Text>
          </View>
        </View>

        {/* ── 4. PRIMARY & SECONDARY ACTIONS ── */}
        <View style={styles.actionsContainer}>
          {/* If Live Broadcast is available: Watch Live Stream button */}
          {(matchup.hasLiveBroadcast || isLive) && (
            <TouchableOpacity
              style={styles.watchLiveButton}
              activeOpacity={0.85}
              onPress={handleWatchLive}
              accessibilityRole="button"
              accessibilityLabel="Watch Live Stream"
            >
              <Tv size={16} color="#FFFFFF" strokeWidth={2.4} />
              <Text style={styles.watchLiveText}>Watch Live Stream</Text>
            </TouchableOpacity>
          )}

          {/* Action Row: Notify Kickoff + Save + Share */}
          <View style={styles.actionsRow}>
            {/* Primary Kickoff Alert Button */}
            <TouchableOpacity
              style={[
                styles.notifyButton,
                isReminderSet && styles.notifyButtonActive,
              ]}
              activeOpacity={0.85}
              onPress={() => toggleMatchReminder(matchup.id)}
              accessibilityRole="button"
              accessibilityLabel={isReminderSet ? 'Kickoff reminder set' : 'Notify at kickoff'}
            >
              {isReminderSet ? (
                <>
                  <BellRing size={16} color="#7952FC" strokeWidth={2.4} />
                  <Text style={[styles.notifyText, { color: '#A58BFC' }]}>
                    Kickoff Alert Active
                  </Text>
                </>
              ) : (
                <>
                  <Bell size={16} color="#FFFFFF" strokeWidth={2.2} />
                  <Text style={styles.notifyText}>Notify Kickoff</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Bookmark Action */}
            <TouchableOpacity
              style={[styles.iconButton, isSaved && styles.iconButtonActive]}
              activeOpacity={0.8}
              onPress={() => toggleSaveMatch(matchup.id)}
              accessibilityRole="button"
              accessibilityLabel="Save match"
            >
              {isSaved ? (
                <BookmarkCheck size={18} color="#7952FC" strokeWidth={2.4} />
              ) : (
                <Bookmark size={18} color="#A098B5" strokeWidth={2} />
              )}
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

        {/* ── 5. MORE LIVE & UPCOMING FIXTURES (USEFUL NAVIGATION) ── */}
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
                    if (item.status === 'LIVE' || item.hasLiveBroadcast) {
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
    paddingBottom: 48,
  },
  // ── Static Match Hero ──
  heroContainer: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 10,
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#1E1730', // Deliberate neutral solid fallback
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  // ── Matchup Card ──
  matchupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E1730',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  teamCol: {
    flex: 1,
    alignItems: 'center',
  },
  crestCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#181524',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  crestImage: {
    width: 32,
    height: 32,
  },
  teamName: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  centerCol: {
    flex: 1.2,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  scoreText: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: 1,
  },
  scoreColon: {
    fontSize: 18,
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
    marginBottom: 6,
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
    marginBottom: 6,
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
    paddingHorizontal: 10,
    borderRadius: 6,
    marginBottom: 4,
  },
  vsText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#A58BFC',
    letterSpacing: 1,
  },
  timePill: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  kickoffTimeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D4CEF2',
  },
  venueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '90%',
  },
  venueText: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  // ── Actions ──
  actionsContainer: {
    marginHorizontal: 16,
    marginBottom: 20,
    gap: 10,
  },
  watchLiveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7952FC',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  watchLiveText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notifyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7952FC',
    paddingVertical: 11,
    borderRadius: 12,
    gap: 7,
  },
  notifyButtonActive: {
    backgroundColor: '#271D3E',
  },
  notifyText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
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
  // ── More Matches ──
  moreSection: {
    marginTop: 8,
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
