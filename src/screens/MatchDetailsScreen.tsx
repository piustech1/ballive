import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Share,
  ActivityIndicator,
  Dimensions,
  ScrollView,
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
  Flame,
  Zap,
  Swords,
  Trophy,
} from 'lucide-react-native';
import Colors from '../theme/colors';
import { SecondaryScreenHeader } from '../components/common/SecondaryScreenHeader';
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

interface MatchDetailsScreenProps {
  matchup: DiscoverMatchup;
}

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

type TabKey = 'overview' | 'lineups' | 'events';

export const MatchDetailsScreen: React.FC<MatchDetailsScreenProps> = ({ matchup }) => {
  const { navigate } = useAppNavigation();
  const { profile, toggleMatchReminder, toggleSaveMatch } = useProfile();
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [tacticalTeam, setTacticalTeam] = useState<'home' | 'away'>('home');

  const [intel, setIntel] = useState<MatchIntelResponse | null>(null);
  const [isLoadingIntel, setIsLoadingIntel] = useState(false);
  const [currentScore, setCurrentScore] = useState<{ home: number; away: number }>({
    home: matchup.homeTeam.score ?? 0,
    away: matchup.awayTeam.score ?? 0,
  });
  const [currentPlayTime, setCurrentPlayTime] = useState<string | undefined>(
    matchup.playTime || (matchup.minute && matchup.minute > 0 ? `${matchup.minute}'` : undefined)
  );

  // Normalized Sport Type
  const sport = useMemo(() => {
    return normalizeSport(matchup.sport, matchup.competition);
  }, [matchup.sport, matchup.competition]);

  useEffect(() => {
    let isMounted = true;
    setIsLoadingIntel(true);
    setCurrentScore({
      home: matchup.homeTeam.score ?? 0,
      away: matchup.awayTeam.score ?? 0,
    });
    setCurrentPlayTime(
      matchup.playTime || (matchup.minute && matchup.minute > 0 ? `${matchup.minute}'` : undefined)
    );

    async function fetchIntel() {
      try {
        const liveIntel = await sportsApiService.getMatchIntel(matchup);
        if (isMounted && liveIntel) {
          setIntel(liveIntel);
          if (liveIntel.liveScore) {
            setCurrentScore(liveIntel.liveScore);
          }
          if (liveIntel.playTime) {
            setCurrentPlayTime(liveIntel.playTime);
          }
          setIsLoadingIntel(false);
          return;
        }
      } catch {
        // fallback
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
      } catch {
        // ignore
      } finally {
        if (isMounted) setIsLoadingIntel(false);
      }
    }

    // Direct live score polling from ESPN Scoreboards
    sportsApiService
      .findEspnEvent(matchup.homeTeam.name, matchup.awayTeam.name, sport)
      .then(found => {
        if (isMounted && found) {
          setCurrentScore({ home: found.scoreHome, away: found.scoreAway });
          if (found.playTime) {
            setCurrentPlayTime(found.playTime);
          }
        }
      })
      .catch(() => {});

    fetchIntel();
    return () => {
      isMounted = false;
    };
  }, [matchup.id, matchup.homeTeam.name, matchup.awayTeam.name, sport]);

  const isReminderSet = profile.matchReminderIds.includes(matchup.id);
  const isSaved = profile.savedMatchIds.includes(matchup.id);
  const isLive = matchup.status === 'LIVE' || Boolean(matchup.minute && matchup.minute > 0);

  const homeCrest = matchup.homeTeam.crestUrl || (matchup as any).homeBadge || getTeamCrest(matchup.homeTeam.name);
  const awayCrest = matchup.awayTeam.crestUrl || (matchup as any).awayBadge || getTeamCrest(matchup.awayTeam.name);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Match Details: ${matchup.homeTeam.name} vs ${matchup.awayTeam.name} on BALLIVE`,
        title: `${matchup.homeTeam.name} vs ${matchup.awayTeam.name}`,
      });
    } catch {
      // user cancel
    }
  };

  // Sport-specific tabs configuration
  const tabs = useMemo(() => {
    switch (sport) {
      case 'mma':
        return [
          { key: 'overview' as TabKey, label: 'Overview' },
          { key: 'lineups' as TabKey, label: 'Tale of Tape' },
          { key: 'events' as TabKey, label: 'Rounds' },
        ];
      case 'boxing':
        return [
          { key: 'overview' as TabKey, label: 'Overview' },
          { key: 'lineups' as TabKey, label: 'Fighters' },
          { key: 'events' as TabKey, label: 'Results' },
        ];
      case 'basketball':
        return [
          { key: 'overview' as TabKey, label: 'Overview' },
          { key: 'lineups' as TabKey, label: 'Starting 5' },
          { key: 'events' as TabKey, label: 'Play-by-Play' },
        ];
      case 'hockey':
        return [
          { key: 'overview' as TabKey, label: 'Overview' },
          { key: 'lineups' as TabKey, label: 'Lines' },
          { key: 'events' as TabKey, label: 'Periods' },
        ];
      case 'nfl':
        return [
          { key: 'overview' as TabKey, label: 'Overview' },
          { key: 'lineups' as TabKey, label: 'Rosters' },
          { key: 'events' as TabKey, label: 'Drives' },
        ];
      case 'motorsport':
        return [
          { key: 'overview' as TabKey, label: 'Overview' },
          { key: 'lineups' as TabKey, label: 'Grid' },
          { key: 'events' as TabKey, label: 'Results' },
        ];
      case 'wrestling':
        return [
          { key: 'overview' as TabKey, label: 'Overview' },
          { key: 'lineups' as TabKey, label: 'Match Card' },
          { key: 'events' as TabKey, label: 'Results' },
        ];
      case 'tennis':
        return [
          { key: 'overview' as TabKey, label: 'Overview' },
          { key: 'lineups' as TabKey, label: 'Players' },
          { key: 'events' as TabKey, label: 'Sets' },
        ];
      case 'cricket':
        return [
          { key: 'overview' as TabKey, label: 'Overview' },
          { key: 'lineups' as TabKey, label: 'XI' },
          { key: 'events' as TabKey, label: 'Overs' },
        ];
      default:
        return [
          { key: 'overview' as TabKey, label: 'Overview' },
          { key: 'lineups' as TabKey, label: 'Lineups' },
          { key: 'events' as TabKey, label: 'Events' },
        ];
    }
  }, [sport]);

  // Tactical Starting 5 / Lines / XI coordinates
  const homeFormation = intel?.lineups?.home?.formation || '4-3-3';
  const awayFormation = intel?.lineups?.away?.formation || '4-3-3';

  return (
    <View style={styles.fixedRoot}>
      {/* ── 1. FIXED CURVED TOP APP BAR ── */}
      <SecondaryScreenHeader
        title={matchup.competition}
        subtitle={`${matchup.homeTeam.name} vs ${matchup.awayTeam.name}`}
        rightAction={{
          icon: Share2,
          onPress: handleShare,
          accessibilityLabel: 'Share event',
        }}
      />

      {/* ── 2. BOUNDED VIEWPORT (ZERO VERTICAL SCROLLING) ── */}
      <View style={styles.viewport}>
        {/* ── 2A. SPORT-SPECIFIC EVENT HERO ── */}
        <View style={styles.heroCard}>
          {sport === 'mma' || sport === 'boxing' || sport === 'wrestling' ? (
            /* COMBAT SPORTS HERO */
            <View style={styles.combatHeroContent}>
              {/* Fighter 1 */}
              <View style={styles.fighterCol}>
                <View style={styles.fighterAvatarRing}>
                  <Image
                    source={{
                      uri:
                        matchup.fighter1?.photoUrl ||
                        intel?.taleOfTheTape?.fighter1?.photo ||
                        'https://a.espncdn.com/combiner/i?img=/i/headshots/mma/players/full/3929452.png&w=120&h=120',
                    }}
                    style={styles.fighterAvatar}
                  />
                </View>
                <Text style={styles.fighterName} numberOfLines={1}>
                  {matchup.fighter1?.name || intel?.taleOfTheTape?.fighter1?.name || matchup.homeTeam.name}
                </Text>
                <Text style={styles.fighterRecord}>
                  {matchup.fighter1?.record || intel?.taleOfTheTape?.fighter1?.record || '26-1-0'}
                </Text>
              </View>

              {/* Combat Status Center */}
              <View style={styles.combatCenterCol}>
                <View style={styles.weightClassBadge}>
                  <Award size={11} color="#F8BE38" strokeWidth={2.5} style={{ marginRight: 3 }} />
                  <Text style={styles.weightClassText} numberOfLines={1}>
                    {intel?.taleOfTheTape?.fighter1?.weightClass || 'Championship Title Bout'}
                  </Text>
                </View>

                <View style={styles.combatRoundBadge}>
                  {isLive ? (
                    <>
                      <View style={styles.pulseRedDot} />
                      <Text style={styles.combatLiveText}>ROUND 3 • IN OCTAGON</Text>
                    </>
                  ) : matchup.status === 'FT' ? (
                    <Text style={styles.combatFtText}>FINAL • DECISION</Text>
                  ) : (
                    <Text style={styles.combatUpcomingText}>SCHEDULED • 5 RDS</Text>
                  )}
                </View>

                <Text style={styles.combatSubtitle}>
                  {matchup.venue || 'T-Mobile Arena, Las Vegas'}
                </Text>
              </View>

              {/* Fighter 2 */}
              <View style={styles.fighterCol}>
                <View style={styles.fighterAvatarRing}>
                  <Image
                    source={{
                      uri:
                        matchup.fighter2?.photoUrl ||
                        intel?.taleOfTheTape?.fighter2?.photo ||
                        'https://a.espncdn.com/combiner/i?img=/i/headshots/mma/players/full/2335639.png&w=120&h=120',
                    }}
                    style={styles.fighterAvatar}
                  />
                </View>
                <Text style={styles.fighterName} numberOfLines={1}>
                  {matchup.fighter2?.name || intel?.taleOfTheTape?.fighter2?.name || matchup.awayTeam.name}
                </Text>
                <Text style={styles.fighterRecord}>
                  {matchup.fighter2?.record || intel?.taleOfTheTape?.fighter2?.record || '21-3-0'}
                </Text>
              </View>
            </View>
          ) : sport === 'motorsport' ? (
            /* MOTORSPORT / FORMULA 1 HERO */
            <View style={styles.racingHeroContent}>
              <View style={styles.racingMetaRow}>
                <View style={styles.racingFlagPill}>
                  <Flame size={12} color="#E10600" strokeWidth={2.4} style={{ marginRight: 4 }} />
                  <Text style={styles.racingFlagText}>FORMULA 1 GRAND PRIX</Text>
                </View>
                <Text style={styles.racingCircuitText} numberOfLines={1}>
                  {matchup.venue || 'Circuit de Monaco'}
                </Text>
              </View>

              <View style={styles.racingCenterRow}>
                <View style={styles.racingLeadBox}>
                  <Text style={styles.racingPosBadge}>P1 LEADER</Text>
                  <Text style={styles.racingDriverName}>M. Verstappen</Text>
                  <Text style={styles.racingTeamName}>Oracle Red Bull Racing</Text>
                </View>

                <View style={styles.racingLapBox}>
                  <Text style={styles.racingLapLabel}>LAP 48 / 78</Text>
                  <View style={styles.racingTrackDotRow}>
                    <View style={[styles.trackDot, styles.trackDotGreen]} />
                    <Text style={styles.racingTrackStatus}>TRACK CLEAR</Text>
                  </View>
                  <Text style={styles.racingGapText}>INTERVAL: +3.412s</Text>
                </View>
              </View>
            </View>
          ) : (
            /* BALL / TEAM SPORTS HERO (Football, Basketball, Hockey, NFL, Tennis, Cricket) */
            <View style={styles.teamHeroContent}>
              {/* Home Team */}
              <View style={styles.teamHeroSide}>
                <View style={styles.teamHeroCrestCircle}>
                  <Image source={{ uri: homeCrest }} style={styles.teamHeroCrest} />
                </View>
                <Text style={styles.teamHeroName} numberOfLines={1}>
                  {matchup.homeTeam.name}
                </Text>
              </View>

              {/* Center Score & Clock */}
              <View style={styles.teamHeroCenter}>
                {isLive || matchup.status === 'FT' ? (
                  <>
                    <View style={styles.heroScoreRow}>
                      <Text style={styles.heroScoreNum}>{currentScore.home}</Text>
                      <Text style={styles.heroScoreColon}>:</Text>
                      <Text style={styles.heroScoreNum}>{currentScore.away}</Text>
                    </View>
                    <View style={[styles.heroClockBadge, !isLive && styles.heroClockBadgeFT]}>
                      {isLive && <View style={styles.pulseRedDot} />}
                      <Text style={styles.heroClockText}>
                        {isLive
                          ? currentPlayTime || (matchup.playTime ? `${matchup.playTime} LIVE` : (matchup.minute ? `${matchup.minute}' LIVE` : 'LIVE IN-PLAY'))
                          : 'FULL TIME'}
                      </Text>
                    </View>
                  </>
                ) : (
                  <>
                    <View style={styles.heroVsPill}>
                      <Text style={styles.heroVsText}>VS</Text>
                    </View>
                    <Text style={styles.heroUpcomingTime}>
                      {matchup.kickoffTime || '19:45 GMT'}
                    </Text>
                  </>
                )}
                <Text style={styles.heroVenueSubtitle} numberOfLines={1}>
                  {matchup.venue || 'Championship Arena'}
                </Text>
              </View>

              {/* Away Team */}
              <View style={styles.teamHeroSide}>
                <View style={styles.teamHeroCrestCircle}>
                  <Image source={{ uri: awayCrest }} style={styles.teamHeroCrest} />
                </View>
                <Text style={styles.teamHeroName} numberOfLines={1}>
                  {matchup.awayTeam.name}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* ── 2B. COMPACT EVENT ACTIONS ROW ── */}
        <View style={styles.actionsBar}>
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
              <Tv size={14} color="#FFFFFF" strokeWidth={2.4} style={{ marginRight: 5 }} />
              <Text style={styles.watchLiveBtnText}>Watch Live Stream</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.iconActionBtn, isReminderSet && styles.iconActionBtnActive]}
            onPress={() => toggleMatchReminder(matchup.id)}
            accessibilityLabel="Alert reminder"
          >
            {isReminderSet ? (
              <BellRing size={16} color="#7952FC" strokeWidth={2.4} />
            ) : (
              <Bell size={16} color="#A098B5" strokeWidth={2} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.iconActionBtn, isSaved && styles.iconActionBtnActive]}
            onPress={() => toggleSaveMatch(matchup.id)}
            accessibilityLabel="Bookmark match"
          >
            {isSaved ? (
              <BookmarkCheck size={16} color="#7952FC" strokeWidth={2.4} />
            ) : (
              <Bookmark size={16} color="#A098B5" strokeWidth={2} />
            )}
          </TouchableOpacity>
        </View>

        {/* ── 2C. SPORT-SPECIFIC TAB BAR ── */}
        <View style={styles.tabsBar}>
          {tabs.map(t => {
            const isTabActive = activeTab === t.key;
            return (
              <TouchableOpacity
                key={t.key}
                activeOpacity={0.8}
                style={[styles.tabButton, isTabActive && styles.tabButtonActive]}
                onPress={() => setActiveTab(t.key)}
              >
                <Text style={[styles.tabButtonText, isTabActive && styles.tabButtonTextActive]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── 2D. ADAPTIVE CONTENT PANEL (BOUNDED, NO VERTICAL SCROLLING) ── */}
        <View style={styles.contentPanel}>
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <View style={styles.overviewGrid}>
              <View style={styles.overviewCard}>
                <Text style={styles.overviewSectionTitle}>EVENT INFORMATION</Text>
                <View style={styles.overviewRow}>
                  <Text style={styles.overviewLabel}>Venue / Stadium</Text>
                  <Text style={styles.overviewValue} numberOfLines={1}>{matchup.venue}</Text>
                </View>
                <View style={styles.overviewRow}>
                  <Text style={styles.overviewLabel}>Scheduled Time</Text>
                  <Text style={styles.overviewValue}>{matchup.kickoffTime || 'Today'}</Text>
                </View>
                <View style={styles.overviewRow}>
                  <Text style={styles.overviewLabel}>Competition / Series</Text>
                  <Text style={styles.overviewValue} numberOfLines={1}>{matchup.competition}</Text>
                </View>
                <View style={styles.overviewRow}>
                  <Text style={styles.overviewLabel}>Match Status</Text>
                  <Text style={[styles.overviewValue, isLive ? { color: '#EF4444', fontWeight: '800' } : null]}>
                    {isLive ? 'Active In-Play' : matchup.status === 'FT' ? 'Finished' : 'Upcoming Fixture'}
                  </Text>
                </View>
              </View>

              {/* Head-to-Head / Record Snippet */}
              <View style={styles.overviewCard}>
                <Text style={styles.overviewSectionTitle}>HEAD-TO-HEAD FORM</Text>
                <View style={styles.h2hRow}>
                  <Text style={styles.h2hTeam} numberOfLines={1}>{matchup.homeTeam.name}</Text>
                  <View style={styles.h2hPill}><Text style={styles.h2hPillText}>W • W • D</Text></View>
                </View>
                <View style={styles.h2hRow}>
                  <Text style={styles.h2hTeam} numberOfLines={1}>{matchup.awayTeam.name}</Text>
                  <View style={styles.h2hPill}><Text style={styles.h2hPillText}>W • L • W</Text></View>
                </View>
              </View>
            </View>
          )}

          {/* TAB 2: LINEUPS / SQUAD SHEETS (LINE VIEW) */}
          {activeTab === 'lineups' && (
            <View style={styles.lineupsPanel}>
              {sport === 'mma' || sport === 'boxing' ? (
                /* TALE OF THE TAPE (COMBAT SPORTS) */
                <View style={styles.tapeTable}>
                  <View style={styles.tapeHeaderRow}>
                    <Text style={styles.tapeFighterLabel} numberOfLines={1}>{matchup.homeTeam.name}</Text>
                    <Text style={styles.tapeMetricHeader}>METRIC</Text>
                    <Text style={styles.tapeFighterLabel} numberOfLines={1}>{matchup.awayTeam.name}</Text>
                  </View>
                  <TapeRow left="31" metric="AGE" right="28" />
                  <TapeRow left="5 ft 10 in" metric="HEIGHT" right="5 ft 11 in" />
                  <TapeRow left="72.0 in" metric="REACH" right="74.5 in" />
                  <TapeRow left="Southpaw" metric="STANCE" right="Orthodox" />
                  <TapeRow left="4.28" metric="STRIKES / MIN" right="3.95" />
                  <TapeRow left="58%" metric="STRIKE ACC." right="51%" />
                  <TapeRow left="3.12" metric="TAKEDOWNS/15M" right="1.45" />
                </View>
              ) : (
                /* LINE VIEW: SQUAD LIST (NO FAKE PITCH DIV!) */
                <View style={styles.lineViewContainer}>
                  {/* Team Switcher Header */}
                  <View style={styles.lineupTeamSwitch}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={[styles.lineupTeamBtn, tacticalTeam === 'home' && styles.lineupTeamBtnActive]}
                      onPress={() => setTacticalTeam('home')}
                    >
                      <Text
                        style={[styles.lineupTeamBtnText, tacticalTeam === 'home' && styles.lineupTeamBtnTextActive]}
                        numberOfLines={1}
                      >
                        {matchup.homeTeam.name} ({intel?.lineups?.home?.formation || '4-3-3'})
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={[styles.lineupTeamBtn, tacticalTeam === 'away' && styles.lineupTeamBtnActive]}
                      onPress={() => setTacticalTeam('away')}
                    >
                      <Text
                        style={[styles.lineupTeamBtnText, tacticalTeam === 'away' && styles.lineupTeamBtnTextActive]}
                        numberOfLines={1}
                      >
                        {matchup.awayTeam.name} ({intel?.lineups?.away?.formation || '4-3-3'})
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Scrollable Line View Squad List */}
                  <ScrollView
                    style={styles.lineupScroll}
                    contentContainerStyle={styles.lineupScrollContent}
                    showsVerticalScrollIndicator={false}
                  >
                    {/* STARTING SQUAD SECTION */}
                    <View style={styles.lineupSectionHeader}>
                      <Text style={styles.lineupSectionTitle}>
                        {sport === 'basketball' ? 'STARTING FIVE' : sport === 'hockey' ? 'STARTING LINE' : 'STARTING XI'}
                      </Text>
                      <View style={styles.lineupCountBadge}>
                        <Text style={styles.lineupCountText}>
                          {(tacticalTeam === 'home' ? intel?.lineups?.home?.startingXI : intel?.lineups?.away?.startingXI)?.length || 0} PLAYERS
                        </Text>
                      </View>
                    </View>

                    {((tacticalTeam === 'home' ? intel?.lineups?.home?.startingXI : intel?.lineups?.away?.startingXI) || []).map((p, idx) => (
                      <View key={p.id || `starter-${idx}`} style={styles.playerLineRow}>
                        <View style={styles.playerJerseyPill}>
                          <Text style={styles.playerJerseyText}>{p.number || idx + 1}</Text>
                        </View>
                        <View style={[styles.playerPosBadge, getPosBadgeStyle(p.position)]}>
                          <Text style={styles.playerPosText}>{p.position}</Text>
                        </View>
                        <View style={styles.playerNameCol}>
                          <View style={styles.playerNameRow}>
                            <Text style={styles.playerFullName} numberOfLines={1}>
                              {p.name}
                            </Text>
                            {p.isCaptain && (
                              <View style={styles.captainPill}>
                                <Text style={styles.captainPillText}>C</Text>
                              </View>
                            )}
                          </View>
                          {p.positionName ? (
                            <Text style={styles.playerPositionSubtitle} numberOfLines={1}>
                              {p.positionName}
                            </Text>
                          ) : null}
                        </View>
                        <View style={styles.playerRatingPill}>
                          <Text style={styles.playerRatingText}>★ {p.rating ? p.rating.toFixed(1) : '7.5'}</Text>
                        </View>
                      </View>
                    ))}

                    {/* BENCH / SUBSTITUTES SECTION */}
                    {((tacticalTeam === 'home' ? intel?.lineups?.home?.substitutes : intel?.lineups?.away?.substitutes) || []).length > 0 && (
                      <>
                        <View style={[styles.lineupSectionHeader, { marginTop: 10 }]}>
                          <Text style={styles.lineupSectionTitle}>SUBSTITUTES & BENCH</Text>
                          <View style={styles.lineupCountBadge}>
                            <Text style={styles.lineupCountText}>
                              {(tacticalTeam === 'home' ? intel?.lineups?.home?.substitutes : intel?.lineups?.away?.substitutes)?.length} SUBS
                            </Text>
                          </View>
                        </View>

                        {((tacticalTeam === 'home' ? intel?.lineups?.home?.substitutes : intel?.lineups?.away?.substitutes) || []).map((p, idx) => (
                          <View key={p.id || `sub-${idx}`} style={styles.playerLineRow}>
                            <View style={[styles.playerJerseyPill, styles.playerJerseyPillSub]}>
                              <Text style={styles.playerJerseyTextSub}>{p.number || idx + 12}</Text>
                            </View>
                            <View style={[styles.playerPosBadge, getPosBadgeStyle(p.position)]}>
                              <Text style={styles.playerPosText}>{p.position}</Text>
                            </View>
                            <View style={styles.playerNameCol}>
                              <Text style={styles.playerFullNameSub} numberOfLines={1}>
                                {p.name}
                              </Text>
                              {p.positionName ? (
                                <Text style={styles.playerPositionSubtitle} numberOfLines={1}>
                                  {p.positionName}
                                </Text>
                              ) : null}
                            </View>
                            <View style={styles.subTagPill}>
                              <Text style={styles.subTagText}>SUB</Text>
                            </View>
                          </View>
                        ))}
                      </>
                    )}

                    {/* COACH & FORMATION FOOTER */}
                    <View style={styles.coachFooterRow}>
                      <View style={styles.coachItem}>
                        <Text style={styles.coachLabel}>HEAD COACH</Text>
                        <Text style={styles.coachValue}>
                          {(tacticalTeam === 'home' ? intel?.lineups?.home?.coach : intel?.lineups?.away?.coach) || 'Head Coach'}
                        </Text>
                      </View>
                      <View style={styles.coachItemRight}>
                        <Text style={styles.coachLabel}>FORMATION</Text>
                        <Text style={styles.coachValue}>
                          {(tacticalTeam === 'home' ? intel?.lineups?.home?.formation : intel?.lineups?.away?.formation) || '4-3-3'}
                        </Text>
                      </View>
                    </View>
                  </ScrollView>
                </View>
              )}
            </View>
          )}

          {/* TAB 4: EVENTS / ROUNDS / PLAY-BY-PLAY */}
          {activeTab === 'events' && (
            <View style={styles.eventsPanel}>
              {sport === 'mma' || sport === 'boxing' ? (
                <View style={styles.roundsCard}>
                  <Text style={styles.overviewSectionTitle}>ROUND-BY-ROUND BREAKDOWN</Text>
                  <EventItem min="R1" text="High action striking exchange, heavy leg kicks by both fighters" />
                  <EventItem min="R2" text="Takedown scored with octagon control time and ground strikes" />
                  <EventItem min="R3" text="Active round, submission defense and clean counter strikes" />
                </View>
              ) : sport === 'basketball' ? (
                <View style={styles.roundsCard}>
                  <Text style={styles.overviewSectionTitle}>QUARTER-BY-QUARTER SCORING</Text>
                  <EventItem min="Q1" text={`${matchup.homeTeam.name} 28 — 24 ${matchup.awayTeam.name}`} />
                  <EventItem min="Q2" text={`${matchup.homeTeam.name} 32 — 28 ${matchup.awayTeam.name}`} />
                  <EventItem min="Q3" text={`${matchup.homeTeam.name} 26 — 25 ${matchup.awayTeam.name}`} />
                  <EventItem min="Q4" text="Fast break scoring run and key defensive stops" />
                </View>
              ) : (
                <View style={styles.roundsCard}>
                  <Text style={styles.overviewSectionTitle}>KEY MATCH HIGHLIGHTS</Text>
                  <EventItem min="18'" text="Goal scored from edge of box into top corner" />
                  <EventItem min="42'" text="Yellow card issued for tactical foul in transition" />
                  <EventItem min="68'" text="Substitution: fresh attackers introduced" />
                  <EventItem min="81'" text="Decisive goal scored off counter attack" />
                </View>
              )}
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

// ── SUBCOMPONENTS ──
const TapeRow: React.FC<{ left: string; metric: string; right: string }> = ({ left, metric, right }) => (
  <View style={styles.tapeRow}>
    <Text style={styles.tapeValLeft}>{left}</Text>
    <View style={styles.tapeMetricPill}><Text style={styles.tapeMetricText}>{metric}</Text></View>
    <Text style={styles.tapeValRight}>{right}</Text>
  </View>
);

const getPosBadgeStyle = (pos: string) => {
  switch (pos) {
    case 'GK':
    case 'G':
      return styles.posGK;
    case 'DF':
    case 'D':
    case 'PF':
    case 'C':
      return styles.posDF;
    case 'MF':
    case 'PG':
    case 'SG':
    case 'SF':
      return styles.posMF;
    case 'FW':
    case 'LW':
    case 'RW':
      return styles.posFW;
    default:
      return styles.posMF;
  }
};

const EventItem: React.FC<{ min: string; text: string }> = ({ min, text }) => (
  <View style={styles.eventItemRow}>
    <View style={styles.eventMinBadge}><Text style={styles.eventMinText}>{min}</Text></View>
    <Text style={styles.eventDetailText} numberOfLines={2}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  fixedRoot: {
    flex: 1,
    backgroundColor: '#0E0D14',
  },
  viewport: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 6,
  },

  /* ── HERO SECTION ── */
  heroCard: {
    backgroundColor: '#1E1730',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(121, 82, 252, 0.22)',
    marginBottom: 8,
  },
  teamHeroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  teamHeroSide: {
    flex: 1,
    alignItems: 'center',
  },
  teamHeroCrestCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2A2045',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  teamHeroCrest: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  teamHeroName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    maxWidth: 95,
  },
  teamHeroCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  heroScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroScoreNum: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  heroScoreColon: {
    fontSize: 22,
    fontWeight: '800',
    color: '#7952FC',
    marginHorizontal: 3,
  },
  heroClockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.18)',
    borderWidth: 1,
    borderColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 3,
  },
  heroClockBadgeFT: {
    backgroundColor: '#2A2045',
    borderColor: '#7952FC',
  },
  heroClockText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#EF4444',
  },
  heroVsPill: {
    backgroundColor: '#2A2045',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  heroVsText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#7952FC',
  },
  heroUpcomingTime: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#F8BE38',
    marginTop: 2,
  },
  heroVenueSubtitle: {
    fontSize: 9.5,
    fontWeight: '500',
    color: '#8E87A5',
    marginTop: 3,
    maxWidth: 130,
  },

  /* ── COMBAT HERO ── */
  combatHeroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fighterCol: {
    flex: 1,
    alignItems: 'center',
  },
  fighterAvatarRing: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2A2045',
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#7952FC',
    marginBottom: 4,
  },
  fighterAvatar: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  fighterName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    maxWidth: 95,
  },
  fighterRecord: {
    fontSize: 10,
    fontWeight: '600',
    color: '#A098B5',
    marginTop: 1,
  },
  combatCenterCol: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  weightClassBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(248, 190, 56, 0.15)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 4,
  },
  weightClassText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#F8BE38',
  },
  combatRoundBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: '#EF4444',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  combatLiveText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#EF4444',
  },
  combatFtText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#A098B5',
  },
  combatUpcomingText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#F8BE38',
  },
  combatSubtitle: {
    fontSize: 9,
    fontWeight: '500',
    color: '#8E87A5',
    marginTop: 4,
  },

  /* ── RACING HERO ── */
  racingHeroContent: {
    gap: 8,
  },
  racingMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  racingFlagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(225, 6, 0, 0.15)',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  racingFlagText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#E10600',
  },
  racingCircuitText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#A098B5',
  },
  racingCenterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  racingLeadBox: {
    flex: 1,
  },
  racingPosBadge: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#F8BE38',
  },
  racingDriverName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  racingTeamName: {
    fontSize: 10.5,
    color: '#A098B5',
  },
  racingLapBox: {
    alignItems: 'flex-end',
  },
  racingLapLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  racingTrackDotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 1,
  },
  trackDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  trackDotGreen: {
    backgroundColor: '#22C55E',
  },
  racingTrackStatus: {
    fontSize: 9,
    fontWeight: '700',
    color: '#22C55E',
  },
  racingGapText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#A098B5',
    marginTop: 1,
  },

  /* ── ACTIONS BAR ── */
  actionsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  watchLiveBtn: {
    flex: 1,
    height: 38,
    backgroundColor: '#7952FC',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  watchLiveBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  iconActionBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#1E1730',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  iconActionBtnActive: {
    borderColor: '#7952FC',
    backgroundColor: 'rgba(121, 82, 252, 0.2)',
  },

  /* ── TABS BAR ── */
  tabsBar: {
    flexDirection: 'row',
    backgroundColor: '#161324',
    borderRadius: 10,
    padding: 3,
    marginBottom: 8,
    gap: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: '#7952FC',
  },
  tabButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#A098B5',
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  /* ── CONTENT PANEL (FIXED HEIGHT, NO OVERFLOW) ── */
  contentPanel: {
    flex: 1,
    backgroundColor: '#161324',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },

  /* OVERVIEW */
  overviewGrid: {
    flex: 1,
    gap: 10,
  },
  overviewCard: {
    backgroundColor: '#1E1730',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  overviewSectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#7952FC',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  overviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  overviewLabel: {
    fontSize: 11,
    color: '#A098B5',
  },
  overviewValue: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
    maxWidth: '55%',
    textAlign: 'right',
  },
  h2hRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  h2hTeam: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  h2hPill: {
    backgroundColor: '#2A2045',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  h2hPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#F8BE38',
  },

  /* LINEUPS / TALE OF TAPE */
  lineupsPanel: {
    flex: 1,
  },
  tapeTable: {
    flex: 1,
    justifyContent: 'space-around',
  },
  tapeHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  tapeFighterLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  tapeMetricHeader: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#7952FC',
    width: 90,
    textAlign: 'center',
  },
  tapeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  tapeValLeft: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ECE9FA',
    flex: 1,
    textAlign: 'center',
  },
  tapeMetricPill: {
    width: 90,
    alignItems: 'center',
    backgroundColor: '#201A33',
    paddingVertical: 2.5,
    borderRadius: 4,
  },
  tapeMetricText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#A098B5',
  },
  tapeValRight: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ECE9FA',
    flex: 1,
    textAlign: 'center',
  },

  /* ── LINE VIEW: SQUAD LIST ── */
  lineViewContainer: {
    flex: 1,
  },
  lineupTeamSwitch: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  lineupTeamBtn: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#1E1730',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  lineupTeamBtnActive: {
    backgroundColor: 'rgba(121, 82, 252, 0.25)',
    borderColor: '#7952FC',
  },
  lineupTeamBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#A098B5',
  },
  lineupTeamBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  lineupScroll: {
    flex: 1,
  },
  lineupScrollContent: {
    paddingBottom: 8,
  },
  lineupSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 4,
  },
  lineupSectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#7952FC',
    letterSpacing: 0.6,
  },
  lineupCountBadge: {
    backgroundColor: '#201A33',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  lineupCountText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#A098B5',
  },
  playerLineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
    gap: 8,
  },
  playerJerseyPill: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#7952FC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerJerseyText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  playerJerseyPillSub: {
    backgroundColor: '#2A2045',
  },
  playerJerseyTextSub: {
    fontSize: 10,
    fontWeight: '700',
    color: '#A098B5',
  },
  playerPosBadge: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    minWidth: 26,
    alignItems: 'center',
  },
  playerPosText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  posGK: {
    backgroundColor: '#D97706',
  },
  posDF: {
    backgroundColor: '#2563EB',
  },
  posMF: {
    backgroundColor: '#059669',
  },
  posFW: {
    backgroundColor: '#DC2626',
  },
  playerNameCol: {
    flex: 1,
  },
  playerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  playerFullName: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  playerFullNameSub: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ECE9FA',
  },
  captainPill: {
    backgroundColor: '#F8BE38',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  captainPillText: {
    fontSize: 8.5,
    fontWeight: '900',
    color: '#161324',
  },
  playerPositionSubtitle: {
    fontSize: 9.5,
    fontWeight: '500',
    color: '#8E87A5',
    marginTop: 1,
  },
  playerRatingPill: {
    backgroundColor: 'rgba(248, 190, 56, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(248, 190, 56, 0.3)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  playerRatingText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#F8BE38',
  },
  subTagPill: {
    backgroundColor: '#201A33',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  subTagText: {
    fontSize: 8.5,
    fontWeight: '700',
    color: '#8E87A5',
  },
  coachFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#1E1730',
    borderRadius: 8,
    padding: 8,
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  coachItem: {
    flex: 1,
  },
  coachItemRight: {
    alignItems: 'flex-end',
  },
  coachLabel: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#7952FC',
    letterSpacing: 0.5,
  },
  coachValue: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 2,
  },

  /* EVENTS PANEL */
  eventsPanel: {
    flex: 1,
  },
  roundsCard: {
    flex: 1,
    justifyContent: 'space-around',
  },
  eventItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  eventMinBadge: {
    backgroundColor: '#7952FC',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    minWidth: 28,
    alignItems: 'center',
  },
  eventMinText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  eventDetailText: {
    fontSize: 11,
    color: '#ECE9FA',
    flex: 1,
  },

  pulseRedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
    marginRight: 4,
  },
});

export default MatchDetailsScreen;
