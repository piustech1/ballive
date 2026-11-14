import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  Image,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Trophy, Clock, Calendar, Sparkles } from 'lucide-react-native';
import Colors from '../../theme/colors';
import { DiscoverMatchup } from '../../constants/discoverData';
import { streamingApiService } from '../../services/streamingApiService';
import { resolveSportBackground } from '../../utils/sportBackgroundResolver';
import { getTeamCrest, DEFAULT_CREST } from '../../utils/teamCrestResolver';
import { normalizeMatchStatus } from '../../utils/matchStatus';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Abbreviation & short-name dictionary for compact timeline presentation
const TEAM_ABBREVIATIONS: Record<string, string> = {
  // Football / Soccer
  'Arsenal': 'Arsenal',
  'Chelsea': 'Chelsea',
  'Liverpool': 'Liverpool',
  'Manchester City': 'Man City',
  'Manchester United': 'Man United',
  'Real Madrid': 'Real Madrid',
  'FC Barcelona': 'Barcelona',
  'Bayern Munich': 'Bayern',
  'Paris Saint-Germain': 'PSG',
  'Juventus': 'Juventus',
  'Inter Milan': 'Inter',
  'AC Milan': 'Milan',
  'Netherlands': 'Netherlands',
  'Greece': 'Greece',
  'Andorra': 'Andorra',
  'Gibraltar': 'Gibraltar',
  'Bulgaria': 'Bulgaria',
  'Iceland': 'Iceland',

  // NFL
  'Kansas City Chiefs': 'Chiefs',
  'Cincinnati Bengals': 'Bengals',
  'Philadelphia Eagles': 'Eagles',
  'San Francisco 49ers': '49ers',
  'Dallas Cowboys': 'Cowboys',
  'Baltimore Ravens': 'Ravens',
  'Buffalo Bills': 'Bills',
  'Detroit Lions': 'Lions',

  // NBA
  'Boston Celtics': 'BOS',
  'Miami Heat': 'MIA',
  'Los Angeles Lakers': 'LAL',
  'Golden State Warriors': 'GSW',
  'New York Knicks': 'NYK',
  'Indiana Pacers': 'IND',
  'Milwaukee Bucks': 'MIL',
  'Orlando Magic': 'ORL',
  'Dallas Mavericks': 'DAL',
  'Cleveland Cavaliers': 'CLE',
  'Chicago Bulls': 'CHI',
  'Atlanta Hawks': 'ATL',
  'Houston Rockets': 'HOU',
  'Utah Jazz': 'UTA',
  'San Antonio Spurs': 'SAS',

  // NHL
  'New York Rangers': 'NYR',
  'Toronto Maple Leafs': 'TOR',
  'Vancouver Canucks': 'VAN',
  'Boston Bruins': 'BOS',
  'Vegas Golden Knights': 'VGK',
  'Nashville Predators': 'NSH',
  'Montreal Canadiens': 'MTL',
  'Chicago Blackhawks': 'CHI',
  'Edmonton Oilers': 'EDM',
};

function getDisplayTeamName(fullName: string): string {
  if (!fullName) return '';
  const trimmed = fullName.trim();
  if (TEAM_ABBREVIATIONS[trimmed]) {
    return TEAM_ABBREVIATIONS[trimmed];
  }

  // If already short (<= 9 chars), return as-is
  if (trimmed.length <= 9) return trimmed;

  // Extract last word (mascot / nickname, e.g. "Hurricanes", "Warriors", "Cowboys")
  const parts = trimmed.split(' ');
  const last = parts[parts.length - 1];
  if (last && last.length >= 3 && last.length <= 10) {
    return last;
  }

  return trimmed.substring(0, 10);
}

// Fallback multi-sport authentic upcoming matches if network is unavailable
const FALLBACK_TIMELINE_MATCHES: DiscoverMatchup[] = [
  {
    id: 'tl-nfl-superbowl',
    competition: 'NFL • Super Bowl LVIII',
    competitionLogo: 'https://a.espncdn.com/i/teamlogos/leagues/500/nfl.png',
    status: 'UPCOMING',
    kickoffDate: 'Today',
    kickoffTime: '6:00 PM',
    sport: 'american_football',
    homeTeam: {
      id: 'team-chiefs',
      name: 'Kansas City Chiefs',
      crestUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/scoreboard/kc.png',
      score: 0,
    },
    awayTeam: {
      id: 'team-bengals',
      name: 'Cincinnati Bengals',
      crestUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/scoreboard/cin.png',
      score: 0,
    },
    venue: 'Allegiant Stadium',
    hasLiveBroadcast: false,
  },
  {
    id: 'tl-nhl-rangers',
    competition: 'NHL',
    competitionLogo: 'https://a.espncdn.com/i/teamlogos/leagues/500/nhl.png',
    status: 'UPCOMING',
    kickoffDate: 'Today',
    kickoffTime: '8:00 PM',
    sport: 'hockey',
    homeTeam: {
      id: 'team-nyr',
      name: 'New York Rangers',
      crestUrl: 'https://a.espncdn.com/i/teamlogos/nhl/500/scoreboard/nyr.png',
      score: 0,
    },
    awayTeam: {
      id: 'team-tor',
      name: 'Toronto Maple Leafs',
      crestUrl: 'https://a.espncdn.com/i/teamlogos/nhl/500/scoreboard/tor.png',
      score: 0,
    },
    venue: 'Madison Square Garden',
    hasLiveBroadcast: false,
  },
  {
    id: 'tl-nba-celtics',
    competition: 'NBA',
    competitionLogo: 'https://a.espncdn.com/i/teamlogos/leagues/500/nba.png',
    status: 'UPCOMING',
    kickoffDate: 'Today',
    kickoffTime: '8:15 PM',
    sport: 'basketball',
    homeTeam: {
      id: 'team-bos',
      name: 'Boston Celtics',
      crestUrl: 'https://a.espncdn.com/i/teamlogos/nba/500/scoreboard/bos.png',
      score: 0,
    },
    awayTeam: {
      id: 'team-mia',
      name: 'Miami Heat',
      crestUrl: 'https://a.espncdn.com/i/teamlogos/nba/500/scoreboard/mia.png',
      score: 0,
    },
    venue: 'TD Garden',
    hasLiveBroadcast: false,
  },
  {
    id: 'tl-ucl-madrid',
    competition: 'UEFA Champions League',
    competitionLogo: 'https://a.espncdn.com/i/teamlogos/leagues/500/uefa.champions.png',
    status: 'UPCOMING',
    kickoffDate: 'Today',
    kickoffTime: '10:00 PM',
    sport: 'soccer',
    homeTeam: {
      id: 'team-real-madrid',
      name: 'Real Madrid',
      crestUrl: 'https://crests.football-data.org/86.png',
      score: 0,
    },
    awayTeam: {
      id: 'team-man-city',
      name: 'Manchester City',
      crestUrl: 'https://crests.football-data.org/65.png',
      score: 0,
    },
    venue: 'Santiago Bernabéu',
    hasLiveBroadcast: false,
  },
];

interface TimelineSlot {
  timeLabel: string;
  matches: DiscoverMatchup[];
}

export interface SportsScheduleTimelineProps {
  onMatchPress: (matchup: DiscoverMatchup) => void;
  matches?: DiscoverMatchup[];
}

export const SportsScheduleTimeline: React.FC<SportsScheduleTimelineProps> = ({
  onMatchPress,
  matches: propMatches,
}) => {
  const [internalMatches, setInternalMatches] = useState<DiscoverMatchup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    if (propMatches && propMatches.length > 0) {
      setInternalMatches(propMatches);
      setIsLoading(false);
      return;
    }

    // Fetch real upcoming fixtures across sports
    streamingApiService
      .getUpcomingMatches()
      .then(upcoming => {
        if (!isMounted) return;
        if (upcoming && upcoming.length > 0) {
          const converted = upcoming
            .filter(m => m.status === 'UPCOMING')
            .map(m => streamingApiService.convertLiveMatchToMatchup(m));
          if (converted.length > 0) {
            setInternalMatches(converted);
            setIsLoading(false);
            return;
          }
        }
        setInternalMatches(FALLBACK_TIMELINE_MATCHES);
        setIsLoading(false);
      })
      .catch(() => {
        if (isMounted) {
          setInternalMatches(FALLBACK_TIMELINE_MATCHES);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [propMatches]);

  // Group fixtures into chronological timeline slots
  const timelineSlots = useMemo<TimelineSlot[]>(() => {
    const list = internalMatches.length > 0 ? internalMatches : FALLBACK_TIMELINE_MATCHES;

    // Map matches to standardized time labels and group near-simultaneous games
    const slotMap = new Map<string, DiscoverMatchup[]>();

    list.slice(0, 10).forEach(m => {
      const raw = m.kickoffTime || '8:00 PM';
      let cleanTime = raw
        .replace(/\s*\(EAT\)/i, '')
        .replace(/\s*EAT/i, '')
        .trim();

      // Normalize time label to match the reference format (e.g. 6:00 PM, 8:00 PM)
      let slotKey = cleanTime;
      if (cleanTime.match(/^\d{1,2}:\d{2}\s*(AM|PM)?$/i)) {
        slotKey = cleanTime.toUpperCase();
      }

      const existing = slotMap.get(slotKey) || [];
      existing.push(m);
      slotMap.set(slotKey, existing);
    });

    const slots: TimelineSlot[] = [];
    slotMap.forEach((matchesInSlot, timeLabel) => {
      slots.push({
        timeLabel,
        matches: matchesInSlot,
      });
    });

    return slots.slice(0, 4); // Show top 4 time milestones for a balanced Discover layout
  }, [internalMatches]);

  return (
    <View style={styles.container}>
      {/* ── SECTION HEADER ── */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Text style={styles.sectionTitle}>Sports schedule</Text>
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>Timeline</Text>
          </View>
        </View>

        <View style={styles.eatBadge}>
          <Clock size={11} color="#A58BFC" strokeWidth={2.4} style={{ marginRight: 4 }} />
          <Text style={styles.eatBadgeText}>EAT (UTC+3)</Text>
        </View>
      </View>

      {/* ── TIMELINE BODY: DARK SUBTLE BACKGROUND WITH TIME AXIS & CARDS ── */}
      <View style={styles.timelineSurface}>
        {isLoading && internalMatches.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#7952FC" />
            <Text style={styles.loadingText}>Loading sports schedule...</Text>
          </View>
        ) : (
          timelineSlots.map((slot, slotIndex) => {
            const isLast = slotIndex === timelineSlots.length - 1;
            const isMultiCard = slot.matches.length >= 2;

            return (
              <View key={`slot-${slotIndex}`} style={styles.slotRow}>
                {/* 1. LEFT TIME AXIS */}
                <View style={styles.timeAxisCol}>
                  <Text style={styles.timeLabelText} numberOfLines={1}>
                    {slot.timeLabel}
                  </Text>
                  <View style={styles.axisMilestoneDot} />
                  {!isLast && <View style={styles.axisLine} />}
                </View>

                {/* 2. MATCH CARDS CONTAINER (RIGHT OF AXIS) */}
                <View style={styles.cardsCol}>
                  {/* Subtle horizontal guideline across the grid */}
                  <View style={styles.horizontalGuideline} />

                  {isMultiCard ? (
                    /* Side-by-side 2-column cards (like 8:00 PM and 8:15 PM in reference image) */
                    <View style={styles.multiCardsRow}>
                      {slot.matches.slice(0, 2).map(match => (
                        <TimelineMatchCard
                          key={match.id}
                          match={match}
                          compact
                          onPress={() => onMatchPress(match)}
                        />
                      ))}
                    </View>
                  ) : (
                    /* Single full-width card (like 6:00 PM in reference image) */
                    <TimelineMatchCard
                      match={slot.matches[0]}
                      compact={false}
                      onPress={() => onMatchPress(slot.matches[0])}
                    />
                  )}
                </View>
              </View>
            );
          })
        )}
      </View>
    </View>
  );
};

interface TimelineMatchCardProps {
  match: DiscoverMatchup;
  compact: boolean;
  onPress: () => void;
}

const TimelineMatchCard: React.FC<TimelineMatchCardProps> = ({
  match,
  compact,
  onPress,
}) => {
  const homeName = getDisplayTeamName(match.homeTeam.name);
  const awayName = getDisplayTeamName(match.awayTeam.name);

  const homeCrest =
    match.homeTeam.crestUrl ||
    (match as any).homeBadge ||
    getTeamCrest(match.homeTeam.name) ||
    DEFAULT_CREST;

  const awayCrest =
    match.awayTeam.crestUrl ||
    (match as any).awayBadge ||
    getTeamCrest(match.awayTeam.name) ||
    DEFAULT_CREST;

  // Resolve authentic, match-specific backdrop with 100% clarity
  const bgImage = resolveSportBackground(
    match.sport,
    match.competition,
    match.poster || (match as any).imageUrl || match.matchBannerUrl,
    match.homeTeam.name,
    match.awayTeam.name,
    match.id
  );

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      style={[styles.cardBase, compact ? styles.cardCompact : styles.cardWide]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${match.homeTeam.name} vs ${match.awayTeam.name} kickoff at ${match.kickoffTime}`}
    >
      <ImageBackground
        source={{ uri: bgImage }}
        style={styles.cardBg}
        imageStyle={styles.cardBgImage}
        resizeMode="cover"
      >
        {/*
          100% NATURAL CLARITY:
          No full-card blur and no dark opacity reduction over the entire photo.
          Text legibility is achieved through compact, localized solid surfaces.
        */}

        {/* ── CARD TOP: Kickoff Time Badge ── */}
        <View style={styles.cardTopRow}>
          <View style={styles.kickoffBadge}>
            <Text style={styles.kickoffBadgeText} numberOfLines={1}>
              {match.kickoffTime.replace(/\s*\(EAT\)/i, '')}
            </Text>
          </View>
        </View>

        {/* ── CARD MIDDLE: Team Matchup Rows ── */}
        <View style={styles.teamsBox}>
          {/* Home Team */}
          <View style={styles.teamLine}>
            <Image
              source={{ uri: homeCrest }}
              style={styles.crestImg}
              resizeMode="contain"
            />
            <Text
              style={[styles.teamNameText, compact && styles.teamNameCompact]}
              numberOfLines={1}
            >
              {homeName}
            </Text>
          </View>

          {/* Away Team */}
          <View style={styles.teamLine}>
            <Image
              source={{ uri: awayCrest }}
              style={styles.crestImg}
              resizeMode="contain"
            />
            <Text
              style={[styles.teamNameText, compact && styles.teamNameCompact]}
              numberOfLines={1}
            >
              {awayName}
            </Text>
          </View>
        </View>

        {/* ── CARD BOTTOM: Sport / Competition Badge ── */}
        <View style={styles.cardBottomRow}>
          <View style={styles.compSurface}>
            <Trophy size={10} color="#C4B5FD" strokeWidth={2.4} style={{ marginRight: 4 }} />
            <Text style={styles.compText} numberOfLines={1}>
              {match.competition}
            </Text>
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    marginBottom: 20,
    paddingHorizontal: 18,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(121, 82, 252, 0.18)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#7952FC',
    marginRight: 5,
  },
  liveText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#A58BFC',
    textTransform: 'uppercase',
  },
  eatBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1730',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(165, 139, 252, 0.2)',
  },
  eatBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#C4B5FD',
  },

  /* ── TIMELINE SURFACE (DARK SUBTLE BACKGROUND) ── */
  timelineSurface: {
    backgroundColor: '#120E22',
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(165, 139, 252, 0.12)',
    overflow: 'hidden',
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingText: {
    fontSize: 12,
    color: '#A098B5',
    fontWeight: '500',
  },

  /* ── TIME SLOT ROW ── */
  slotRow: {
    flexDirection: 'row',
    marginBottom: 16,
    position: 'relative',
  },

  /* ── LEFT TIME AXIS ── */
  timeAxisCol: {
    width: 68,
    alignItems: 'flex-start',
    position: 'relative',
    paddingTop: 8,
  },
  timeLabelText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#A58BFC',
    letterSpacing: 0.2,
  },
  axisMilestoneDot: {
    position: 'absolute',
    right: 6,
    top: 14,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#7952FC',
    zIndex: 2,
    borderWidth: 1.5,
    borderColor: '#120E22',
  },
  axisLine: {
    position: 'absolute',
    right: 9,
    top: 21,
    bottom: -16,
    width: 1.5,
    backgroundColor: 'rgba(165, 139, 252, 0.2)',
    zIndex: 1,
  },

  /* ── RIGHT CARDS CONTAINER ── */
  cardsCol: {
    flex: 1,
    paddingLeft: 10,
    position: 'relative',
  },
  horizontalGuideline: {
    position: 'absolute',
    left: 0,
    right: -14,
    top: 17,
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  multiCardsRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },

  /* ── TIMELINE MATCH CARDS ── */
  cardBase: {
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: '#181329',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
  cardWide: {
    width: '100%',
    height: 130,
  },
  cardCompact: {
    flex: 1,
    height: 138,
  },
  cardBg: {
    width: '100%',
    height: '100%',
    justifyContent: 'space-between',
    padding: 10,
  },
  cardBgImage: {
    borderRadius: 18,
  },

  /* ── CARD INNER SECTIONS ── */
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  kickoffBadge: {
    backgroundColor: 'rgba(18, 14, 28, 0.88)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 0.8,
    borderColor: 'rgba(255, 255, 255, 0.16)',
  },
  kickoffBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },

  teamsBox: {
    gap: 6,
    marginVertical: 4,
  },
  teamLine: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 12, 26, 0.78)',
    paddingHorizontal: 7,
    paddingVertical: 3.5,
    borderRadius: 8,
    alignSelf: 'flex-start',
    maxWidth: '100%',
  },
  crestImg: {
    width: 16,
    height: 16,
    marginRight: 6,
  },
  teamNameText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  teamNameCompact: {
    fontSize: 12,
  },

  cardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  compSurface: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(18, 14, 28, 0.88)',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
    borderWidth: 0.6,
    borderColor: 'rgba(165, 139, 252, 0.22)',
    maxWidth: '100%',
  },
  compText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#C4B5FD',
    letterSpacing: 0.2,
  },
});

export default SportsScheduleTimeline;
