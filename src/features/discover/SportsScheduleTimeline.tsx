import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  Image,
  StyleSheet,
} from 'react-native';
import { Trophy } from 'lucide-react-native';
import { DiscoverMatchup } from '../../constants/discoverData';
import { streamingApiService } from '../../services/streamingApiService';
import { resolveSportBackground } from '../../utils/sportBackgroundResolver';
import { getTeamCrest, DEFAULT_CREST } from '../../utils/teamCrestResolver';

// Team name dictionary for Large Card (readable display names)
const TEAM_DISPLAY_NAMES: Record<string, string> = {
  // Football / Soccer
  'Arsenal': 'Arsenal',
  'Chelsea': 'Chelsea',
  'Liverpool': 'Liverpool',
  'Manchester City': 'Man City',
  'Manchester United': 'Man United',
  'Real Madrid': 'Real Madrid',
  'FC Barcelona': 'Barcelona',
  'Barcelona': 'Barcelona',
  'Bayern Munich': 'Bayern',
  'Paris Saint-Germain': 'PSG',
  'Juventus': 'Juventus',
  'Inter Milan': 'Inter',
  'AC Milan': 'AC Milan',
  'Tottenham Hotspur': 'Tottenham',
  'Atletico Madrid': 'Atlético',
  'Borussia Dortmund': 'Dortmund',

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
  'Boston Celtics': 'Celtics',
  'Miami Heat': 'Heat',
  'Los Angeles Lakers': 'Lakers',
  'Golden State Warriors': 'Warriors',
  'New York Knicks': 'Knicks',
  'Milwaukee Bucks': 'Bucks',

  // NHL
  'New York Rangers': 'Rangers',
  'Toronto Maple Leafs': 'Maple Leafs',
  'Vancouver Canucks': 'Canucks',
  'Boston Bruins': 'Bruins',
};

// 2-4 letter abbreviations for Small Cards
const TEAM_ABBREVIATIONS: Record<string, string> = {
  // Football / Soccer
  'Arsenal': 'ARS',
  'Chelsea': 'CHE',
  'Liverpool': 'LIV',
  'Manchester City': 'MCI',
  'Manchester United': 'MUN',
  'Tottenham Hotspur': 'TOT',
  'Aston Villa': 'AVL',
  'Newcastle United': 'NEW',
  'Real Madrid': 'RMA',
  'FC Barcelona': 'BAR',
  'Barcelona': 'BAR',
  'Atletico Madrid': 'ATM',
  'Bayern Munich': 'BAY',
  'Borussia Dortmund': 'BVB',
  'Paris Saint-Germain': 'PSG',
  'Juventus': 'JUV',
  'Inter Milan': 'INT',
  'AC Milan': 'MIL',
  'Napoli': 'NAP',

  // NFL
  'Kansas City Chiefs': 'KC',
  'Cincinnati Bengals': 'CIN',
  'Philadelphia Eagles': 'PHI',
  'San Francisco 49ers': 'SF',
  'Dallas Cowboys': 'DAL',
  'Baltimore Ravens': 'BAL',
  'Buffalo Bills': 'BUF',
  'Detroit Lions': 'DET',

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
  'Denver Nuggets': 'DEN',
  'Phoenix Suns': 'PHX',

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
  if (TEAM_DISPLAY_NAMES[trimmed]) {
    return TEAM_DISPLAY_NAMES[trimmed];
  }
  if (trimmed.length <= 13) return trimmed;

  const parts = trimmed.split(' ');
  const last = parts[parts.length - 1];
  if (last && last.length >= 3 && last.length <= 11) {
    return last;
  }
  return trimmed.substring(0, 13);
}

function getTeamAbbr(fullName: string): string {
  if (!fullName) return '';
  const trimmed = fullName.trim();
  if (TEAM_ABBREVIATIONS[trimmed]) {
    return TEAM_ABBREVIATIONS[trimmed];
  }

  // Multi-word team name: take initials
  const words = trimmed.split(/[\s-]+/).filter(Boolean);
  if (words.length >= 2) {
    if (words.length === 2 && words[0].length <= 3) {
      return (words[0] + words[1][0]).toUpperCase();
    }
    const initials = words.map(w => w[0]).join('').toUpperCase();
    return initials.substring(0, 3);
  }

  // Single word: take first 3 letters uppercase
  return trimmed.substring(0, 3).toUpperCase();
}

function formatKickoffTime(rawTime?: string): string {
  if (!rawTime) return '8:00 PM';
  return rawTime
    .replace(/\s*\(EAT\)/i, '')
    .replace(/\s*EAT/i, '')
    .trim();
}

function getShortCompetition(comp?: string, sport?: string): string {
  if (!comp) return 'MATCH';
  const c = comp.toUpperCase();
  if (c.includes('NHL') || sport === 'hockey') return 'NHL';
  if (c.includes('NBA') || sport === 'basketball') return 'NBA';
  if (c.includes('NFL') || sport === 'american_football') {
    if (comp.includes('Super Bowl') || comp.includes('Superbowl')) {
      return comp;
    }
    return 'NFL';
  }
  if (c.includes('CHAMPIONS LEAGUE')) return 'UCL';
  if (c.includes('PREMIER LEAGUE')) return 'Premier League';
  if (c.includes('LA LIGA')) return 'La Liga';
  if (c.includes('SERIE A')) return 'Serie A';
  if (c.includes('BUNDESLIGA')) return 'Bundesliga';
  if (comp.length <= 14) return comp;
  return comp.split('•')[0].trim().substring(0, 14);
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

export interface SportsScheduleTimelineProps {
  onMatchPress: (matchup: DiscoverMatchup) => void;
  matches?: DiscoverMatchup[];
}

export const SportsScheduleTimeline: React.FC<SportsScheduleTimelineProps> = ({
  onMatchPress,
  matches: propMatches,
}) => {
  const [internalMatches, setInternalMatches] = useState<DiscoverMatchup[]>([]);

  useEffect(() => {
    let isMounted = true;

    if (propMatches && propMatches.length > 0) {
      setInternalMatches(propMatches);
      return;
    }

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
            return;
          }
        }
        setInternalMatches(FALLBACK_TIMELINE_MATCHES);
      })
      .catch(() => {
        if (isMounted) {
          setInternalMatches(FALLBACK_TIMELINE_MATCHES);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [propMatches]);

  // Select top 3 fixtures for the 1 Large + 2 Small arrangement
  const displayMatches = useMemo(() => {
    const list = internalMatches.length > 0 ? internalMatches : FALLBACK_TIMELINE_MATCHES;
    return list.slice(0, 3);
  }, [internalMatches]);

  const topMatch = displayMatches[0];
  const lowerLeftMatch = displayMatches.length > 1 ? displayMatches[1] : null;
  const lowerRightMatch = displayMatches.length > 2 ? displayMatches[2] : null;

  if (!topMatch) {
    return null;
  }

  const topTime = formatKickoffTime(topMatch.kickoffTime);
  const lowerTime = lowerLeftMatch
    ? formatKickoffTime(lowerLeftMatch.kickoffTime)
    : topTime;

  return (
    <View style={styles.container}>
      {/* ── TIMELINE WRAPPER: TIME AXIS ON LEFT + CARDS ON RIGHT ── */}
      <View style={styles.timelineRow}>
        {/* 1. LEFT COMPACT TIME AXIS */}
        <View style={styles.timeAxisCol}>
          {/* Top Milestone (aligned with Top Card) */}
          <View style={styles.topMilestoneBox}>
            <Text style={styles.timeLabelText} numberOfLines={1}>
              {topTime}
            </Text>
            <View style={styles.milestoneDot} />
          </View>

          {/* Vertical Connecting Line */}
          {lowerLeftMatch && <View style={styles.axisConnectingLine} />}

          {/* Lower Milestone (aligned with Lower Row) */}
          {lowerLeftMatch && (
            <View style={styles.lowerMilestoneBox}>
              <Text style={styles.timeLabelText} numberOfLines={1}>
                {lowerTime}
              </Text>
              <View style={styles.milestoneDot} />
            </View>
          )}
        </View>

        {/* 2. RIGHT CARDS COMPOSITION */}
        <View style={styles.cardsCol}>
          {/* ── TOP LARGE MATCH CARD ── */}
          <TopLargeCard
            match={topMatch}
            onPress={() => onMatchPress(topMatch)}
          />

          {/* ── LOWER ROW: TWO SMALL CARDS SIDE-BY-SIDE ── */}
          {(lowerLeftMatch || lowerRightMatch) && (
            <View style={styles.lowerCardsRow}>
              {lowerLeftMatch && (
                <SmallMatchCard
                  match={lowerLeftMatch}
                  themeColor="#3F4D85"
                  onPress={() => onMatchPress(lowerLeftMatch)}
                />
              )}
              {lowerRightMatch && (
                <SmallMatchCard
                  match={lowerRightMatch}
                  themeColor="#D84315"
                  onPress={() => onMatchPress(lowerRightMatch)}
                />
              )}
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   TOP LARGE MATCH CARD (Purple/Indigo Sport Graphic Surface)
───────────────────────────────────────────────────────────────────────────── */
interface TopLargeCardProps {
  match: DiscoverMatchup;
  onPress: () => void;
}

const TopLargeCard: React.FC<TopLargeCardProps> = ({ match, onPress }) => {
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

  const kickoffTime = formatKickoffTime(match.kickoffTime);

  // Match artwork or sport background
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
      style={styles.topCardBase}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${match.homeTeam.name} vs ${match.awayTeam.name}, kickoff ${kickoffTime}`}
    >
      <ImageBackground
        source={{ uri: bgImage }}
        style={styles.topCardBg}
        imageStyle={styles.topCardBgImage}
        resizeMode="cover"
      >
        {/* Subtle sports overlay ensuring high contrast without muddying artwork */}
        <View style={styles.topCardOverlay}>
          {/* Kickoff Time at Top Left */}
          <Text style={styles.topKickoffText} numberOfLines={1}>
            {kickoffTime}
          </Text>

          {/* Teams Vertical Stack */}
          <View style={styles.topTeamsStack}>
            {/* Home Team */}
            <View style={styles.topTeamRow}>
              <Image
                source={{ uri: homeCrest }}
                style={styles.topCrest}
                resizeMode="contain"
              />
              <Text style={styles.topTeamName} numberOfLines={1}>
                {homeName}
              </Text>
            </View>

            {/* Away Team */}
            <View style={styles.topTeamRow}>
              <Image
                source={{ uri: awayCrest }}
                style={styles.topCrest}
                resizeMode="contain"
              />
              <Text style={styles.topTeamName} numberOfLines={1}>
                {awayName}
              </Text>
            </View>
          </View>

          {/* Competition / Sport Tag at Bottom */}
          <View style={styles.topCompRow}>
            <Trophy
              size={11}
              color="rgba(255, 255, 255, 0.9)"
              strokeWidth={2.4}
              style={{ marginRight: 5 }}
            />
            <Text style={styles.topCompText} numberOfLines={1}>
              {match.competition}
            </Text>
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   LOWER SMALL MATCH CARD (Slate Blue or Warm Orange Surface)
───────────────────────────────────────────────────────────────────────────── */
interface SmallMatchCardProps {
  match: DiscoverMatchup;
  themeColor: string;
  onPress: () => void;
}

const SmallMatchCard: React.FC<SmallMatchCardProps> = ({
  match,
  themeColor,
  onPress,
}) => {
  const homeAbbr = getTeamAbbr(match.homeTeam.name);
  const awayAbbr = getTeamAbbr(match.awayTeam.name);

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

  const kickoffTime = formatKickoffTime(match.kickoffTime);
  const compLabel = getShortCompetition(match.competition, match.sport);

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      style={[styles.smallCardBase, { backgroundColor: themeColor }]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${homeAbbr} vs ${awayAbbr}, kickoff ${kickoffTime}`}
    >
      <View style={styles.smallCardContent}>
        {/* Kickoff Time at Top Left */}
        <Text style={styles.smallKickoffText} numberOfLines={1}>
          {kickoffTime}
        </Text>

        {/* Teams Vertical Stack with Abbreviated Names */}
        <View style={styles.smallTeamsStack}>
          {/* Home Team */}
          <View style={styles.smallTeamRow}>
            <Image
              source={{ uri: homeCrest }}
              style={styles.smallCrest}
              resizeMode="contain"
            />
            <Text style={styles.smallTeamText} numberOfLines={1}>
              {homeAbbr}
            </Text>
          </View>

          {/* Away Team */}
          <View style={styles.smallTeamRow}>
            <Image
              source={{ uri: awayCrest }}
              style={styles.smallCrest}
              resizeMode="contain"
            />
            <Text style={styles.smallTeamText} numberOfLines={1}>
              {awayAbbr}
            </Text>
          </View>
        </View>

        {/* Sport / Competition Identifier at Bottom */}
        <Text style={styles.smallCompText} numberOfLines={1}>
          {compLabel}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   STYLES: CLEAN REFERENCE-FAITHFUL TIMELINE COMPOSITION
───────────────────────────────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  container: {
    marginTop: 18,
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },

  /* ── LEFT TIME AXIS ── */
  timeAxisCol: {
    width: 62,
    alignItems: 'flex-start',
    position: 'relative',
    paddingTop: 12,
  },
  topMilestoneBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingRight: 6,
  },
  lowerMilestoneBox: {
    position: 'absolute',
    top: 146,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 6,
  },
  timeLabelText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#A58BFC',
    letterSpacing: -0.2,
  },
  milestoneDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#7952FC',
  },
  axisConnectingLine: {
    position: 'absolute',
    right: 8.5,
    top: 20,
    height: 126,
    width: 1.5,
    backgroundColor: 'rgba(165, 139, 252, 0.22)',
  },

  /* ── RIGHT CARDS COLUMN ── */
  cardsCol: {
    flex: 1,
    paddingLeft: 10,
  },

  /* ── TOP LARGE CARD ── */
  topCardBase: {
    width: '100%',
    height: 126,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#35235A',
  },
  topCardBg: {
    width: '100%',
    height: '100%',
  },
  topCardBgImage: {
    borderRadius: 16,
  },
  topCardOverlay: {
    flex: 1,
    backgroundColor: 'rgba(38, 22, 68, 0.45)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    justifyContent: 'space-between',
  },
  topKickoffText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  topTeamsStack: {
    gap: 6,
    marginVertical: 4,
  },
  topTeamRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topCrest: {
    width: 18,
    height: 18,
    marginRight: 8,
  },
  topTeamName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  topCompRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topCompText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.85)',
    letterSpacing: 0.2,
  },

  /* ── LOWER ROW: TWO SMALL CARDS ── */
  lowerCardsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  smallCardBase: {
    flex: 1,
    height: 134,
    borderRadius: 16,
    overflow: 'hidden',
  },
  smallCardContent: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    justifyContent: 'space-between',
  },
  smallKickoffText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  smallTeamsStack: {
    gap: 6,
    marginVertical: 4,
  },
  smallTeamRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  smallCrest: {
    width: 16,
    height: 16,
    marginRight: 6,
  },
  smallTeamText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  smallCompText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.82)',
    letterSpacing: 0.2,
  },
});

export default SportsScheduleTimeline;
