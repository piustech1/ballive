import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import {
  Info,
  Activity,
  Users,
  Clock,
  Sparkles,
  ArrowRightLeft,
  Award,
  Flame,
  Check,
} from 'lucide-react-native';
import Colors from '../../theme/colors';
import { DiscoverMatchup } from '../../constants/discoverData';
import { getPlayerPhoto } from '../../utils/playerResolver';
import { getTeamCrest, DEFAULT_CREST } from '../../utils/teamCrestResolver';
import { normalizeSport, NormalizedSport } from '../../screens/MatchDetailsScreen';
import { sportsApiService } from '../../services/sportsApiService';
import { footballApiService, MatchIntelResponse } from '../../services/footballApiService';

interface InlineMatchDetailsModuleProps {
  matchup: DiscoverMatchup;
  liveScore?: {
    home: number;
    away: number;
    minute?: number;
    statusText?: string;
  };
  onSwitchToLiveStreams?: () => void;
  liveStreamCount?: number;
}

type TabKey = 'overview' | 'lineups' | 'events';

export const InlineMatchDetailsModule: React.FC<InlineMatchDetailsModuleProps> = ({
  matchup,
  liveScore,
  onSwitchToLiveStreams,
  liveStreamCount = 0,
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [tacticalTeam, setTacticalTeam] = useState<'home' | 'away'>('home');
  const [intel, setIntel] = useState<MatchIntelResponse | null>(null);
  const [isLoadingIntel, setIsLoadingIntel] = useState(false);

  // Normalized sport
  const sport = useMemo(() => {
    return normalizeSport(matchup.sport, matchup.competition);
  }, [matchup.sport, matchup.competition]);

  useEffect(() => {
    let isMounted = true;
    setIsLoadingIntel(true);

    async function loadData() {
      try {
        const liveIntel = await sportsApiService.getMatchIntel(matchup);
        if (isMounted && liveIntel) {
          setIntel(liveIntel);
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
          liveScore?.home ?? (matchup.homeTeam.score ?? 0),
          liveScore?.away ?? (matchup.awayTeam.score ?? 0),
          liveScore?.minute ?? (matchup.minute ?? 0)
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

    loadData();
    return () => {
      isMounted = false;
    };
  }, [matchup.id, matchup.homeTeam.name, matchup.awayTeam.name]);

  const isLive = matchup.status === 'LIVE' || Boolean(matchup.minute && matchup.minute > 0);

  // Dynamic sport tabs
  const tabs = useMemo(() => {
    switch (sport) {
      case 'mma':
      case 'boxing':
        return [
          { key: 'overview' as TabKey, label: 'Overview' },
          { key: 'lineups' as TabKey, label: 'Tale of Tape' },
          { key: 'events' as TabKey, label: 'Rounds' },
        ];
      case 'basketball':
        return [
          { key: 'overview' as TabKey, label: 'Overview' },
          { key: 'lineups' as TabKey, label: 'Starting 5' },
          { key: 'events' as TabKey, label: 'Periods' },
        ];
      case 'hockey':
        return [
          { key: 'overview' as TabKey, label: 'Overview' },
          { key: 'lineups' as TabKey, label: 'Lines' },
          { key: 'events' as TabKey, label: 'Periods' },
        ];
      case 'motorsport':
        return [
          { key: 'overview' as TabKey, label: 'Overview' },
          { key: 'lineups' as TabKey, label: 'Grid' },
          { key: 'events' as TabKey, label: 'Laps' },
        ];
      default:
        return [
          { key: 'overview' as TabKey, label: 'Overview' },
          { key: 'lineups' as TabKey, label: 'Lineups' },
          { key: 'events' as TabKey, label: 'Events' },
        ];
    }
  }, [sport]);

  const homeFormation = intel?.lineups?.home?.formation || '4-3-3';
  const awayFormation = intel?.lineups?.away?.formation || '4-2-3-1';

  return (
    <View style={styles.container}>
      {/* ── MODULE HEADER ROW: Section Title + Quick Switch Back Button ── */}
      <View style={styles.moduleHeader}>
        <View style={styles.titleRow}>
          <Sparkles size={13} color="#7952FC" strokeWidth={2.4} style={{ marginRight: 6 }} />
          <Text style={styles.moduleTitle}>MATCH DETAILS & INTEL</Text>
        </View>

        {onSwitchToLiveStreams && (
          <TouchableOpacity
            activeOpacity={0.75}
            style={styles.switchButton}
            onPress={onSwitchToLiveStreams}
            accessibilityLabel="Switch to other live matches"
          >
            <ArrowRightLeft size={12} color="#A098B5" strokeWidth={2.2} style={{ marginRight: 4 }} />
            <Text style={styles.switchButtonText}>
              Other Matches {liveStreamCount > 0 ? `(${liveStreamCount})` : ''}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── COMPACT TABS BAR (SOLID SURFACES, NO OUTLINES) ── */}
      <View style={styles.tabsRow}>
        {tabs.map(tab => {
          const isTabActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              activeOpacity={0.8}
              style={[styles.tabChip, isTabActive && styles.tabChipActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[styles.tabChipText, isTabActive && styles.tabChipTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── TAB CONTENT PANEL ── */}
      <View style={styles.contentBody}>
        {/* ── TAB 1: OVERVIEW ── */}
        {activeTab === 'overview' && (
          <View style={styles.tabSection}>
            <View style={styles.solidCard}>
              <Text style={styles.cardHeaderTitle}>EVENT INFORMATION</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Competition</Text>
                <Text style={styles.infoValue} numberOfLines={1}>{matchup.competition}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Venue / Stadium</Text>
                <Text style={styles.infoValue} numberOfLines={1}>{matchup.venue || 'Championship Stadium'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Kickoff Time</Text>
                <Text style={styles.infoValue}>{matchup.kickoffTime || 'Today'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Broadcast Status</Text>
                <Text style={[styles.infoValue, isLive ? { color: '#22C55E', fontWeight: '800' } : null]}>
                  {isLive ? 'Full HD Live Satellite Feed' : 'Scheduled Satellite Uplink'}
                </Text>
              </View>
            </View>

            {/* Head to Head Summary */}
            <View style={[styles.solidCard, { marginTop: 10 }]}>
              <Text style={styles.cardHeaderTitle}>RECENT FORM</Text>
              <View style={styles.h2hRow}>
                <Text style={styles.h2hTeam} numberOfLines={1}>{matchup.homeTeam.name}</Text>
                <View style={styles.formPill}>
                  <Text style={styles.formText}>W • W • D • W</Text>
                </View>
              </View>
              <View style={styles.h2hRow}>
                <Text style={styles.h2hTeam} numberOfLines={1}>{matchup.awayTeam.name}</Text>
                <View style={styles.formPill}>
                  <Text style={styles.formText}>W • L • W • D</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* ── TAB 2: LINEUPS ── */}
        {activeTab === 'lineups' && (
          <View style={styles.tabSection}>
            {sport === 'mma' || sport === 'boxing' ? (
              /* COMBAT: TALE OF THE TAPE */
              <View style={styles.solidCard}>
                <Text style={styles.cardHeaderTitle}>TALE OF THE TAPE</Text>
                <TapeMetric left="31" label="AGE" right="28" />
                <TapeMetric left="5 ft 10 in" label="HEIGHT" right="5 ft 11 in" />
                <TapeMetric left="72.0 in" label="REACH" right="74.5 in" />
                <TapeMetric left="Southpaw" label="STANCE" right="Orthodox" />
                <TapeMetric left="4.28" label="STRIKES / MIN" right="3.95" />
                <TapeMetric left="58%" label="STRIKE ACC." right="51%" />
              </View>
            ) : sport === 'basketball' ? (
              /* BASKETBALL: STARTING 5 ROTATION */
              <View style={styles.solidCard}>
                <Text style={styles.cardHeaderTitle}>STARTING 5 LINEUP</Text>
                <View style={styles.playerGrid}>
                  <PlayerChip pos="PG" name="Point Guard" num="1" />
                  <PlayerChip pos="SG" name="Shooting Guard" num="2" />
                  <PlayerChip pos="SF" name="Small Forward" num="3" />
                  <PlayerChip pos="PF" name="Power Forward" num="4" />
                  <PlayerChip pos="C" name="Center" num="5" />
                </View>
              </View>
            ) : sport === 'hockey' ? (
              /* HOCKEY: STARTING LINES */
              <View style={styles.solidCard}>
                <Text style={styles.cardHeaderTitle}>STARTING LINE & GOALTENDER</Text>
                <View style={styles.playerGrid}>
                  <PlayerChip pos="LW" name="Left Wing" num="11" />
                  <PlayerChip pos="C" name="Center" num="9" />
                  <PlayerChip pos="RW" name="Right Wing" num="88" />
                  <PlayerChip pos="D" name="Defense" num="4" />
                  <PlayerChip pos="G" name="Goaltender" num="31" />
                </View>
              </View>
            ) : (
              /* FOOTBALL: STARTING XI */
              <View style={styles.solidCard}>
                <View style={styles.teamSwitchRow}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={[styles.teamSwitchBtn, tacticalTeam === 'home' && styles.teamSwitchBtnActive]}
                    onPress={() => setTacticalTeam('home')}
                  >
                    <Text style={[styles.teamSwitchText, tacticalTeam === 'home' && styles.teamSwitchTextActive]} numberOfLines={1}>
                      {matchup.homeTeam.name} ({homeFormation})
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={[styles.teamSwitchBtn, tacticalTeam === 'away' && styles.teamSwitchBtnActive]}
                    onPress={() => setTacticalTeam('away')}
                  >
                    <Text style={[styles.teamSwitchText, tacticalTeam === 'away' && styles.teamSwitchTextActive]} numberOfLines={1}>
                      {matchup.awayTeam.name} ({awayFormation})
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Player List */}
                <View style={styles.footballPlayersList}>
                  {tacticalTeam === 'home' ? (
                    (intel?.lineups?.home?.startingXI && intel.lineups.home.startingXI.length > 0) ? (
                      intel.lineups.home.startingXI.slice(0, 11).map((p, idx) => (
                        <FootballPlayerRow
                          key={p.id || `home-${idx}`}
                          num={p.number}
                          pos={p.position}
                          name={p.name}
                        />
                      ))
                    ) : (
                      <>
                        <FootballPlayerRow num={1} pos="GK" name="Goalkeeper" />
                        <FootballPlayerRow num={2} pos="DF" name="Right Back" />
                        <FootballPlayerRow num={4} pos="DF" name="Center Back" />
                        <FootballPlayerRow num={5} pos="DF" name="Center Back" />
                        <FootballPlayerRow num={3} pos="DF" name="Left Back" />
                        <FootballPlayerRow num={6} pos="MF" name="Defensive Mid" />
                        <FootballPlayerRow num={8} pos="MF" name="Central Mid" />
                        <FootballPlayerRow num={10} pos="MF" name="Attacking Mid" />
                        <FootballPlayerRow num={7} pos="FW" name="Right Wing" />
                        <FootballPlayerRow num={9} pos="FW" name="Striker" />
                        <FootballPlayerRow num={11} pos="FW" name="Left Wing" />
                      </>
                    )
                  ) : (
                    (intel?.lineups?.away?.startingXI && intel.lineups.away.startingXI.length > 0) ? (
                      intel.lineups.away.startingXI.slice(0, 11).map((p, idx) => (
                        <FootballPlayerRow
                          key={p.id || `away-${idx}`}
                          num={p.number}
                          pos={p.position}
                          name={p.name}
                        />
                      ))
                    ) : (
                      <>
                        <FootballPlayerRow num={1} pos="GK" name="Goalkeeper" />
                        <FootballPlayerRow num={12} pos="DF" name="Right Back" />
                        <FootballPlayerRow num={14} pos="DF" name="Center Back" />
                        <FootballPlayerRow num={15} pos="DF" name="Center Back" />
                        <FootballPlayerRow num={13} pos="DF" name="Left Back" />
                        <FootballPlayerRow num={16} pos="MF" name="Defensive Mid" />
                        <FootballPlayerRow num={18} pos="MF" name="Central Mid" />
                        <FootballPlayerRow num={20} pos="MF" name="Attacking Mid" />
                        <FootballPlayerRow num={17} pos="FW" name="Right Wing" />
                        <FootballPlayerRow num={19} pos="FW" name="Striker" />
                        <FootballPlayerRow num={21} pos="FW" name="Left Wing" />
                      </>
                    )
                  )}
                </View>
              </View>
            )}
          </View>
        )}

        {/* ── TAB 4: EVENTS ── */}
        {activeTab === 'events' && (
          <View style={styles.tabSection}>
            <View style={styles.solidCard}>
              <Text style={styles.cardHeaderTitle}>
                {sport === 'mma' || sport === 'boxing'
                  ? 'ROUND-BY-ROUND BREAKDOWN'
                  : sport === 'basketball'
                  ? 'QUARTER SCORING'
                  : 'MATCH TIMELINE'}
              </Text>

              {sport === 'mma' || sport === 'boxing' ? (
                <>
                  <EventRow min="R1" text="High pace striking exchange; sharp combinations landed" />
                  <EventRow min="R2" text="Takedown scored; dominant cage control and ground strikes" />
                  <EventRow min="R3" text="Active exchange; submission defense and clean counters" />
                </>
              ) : sport === 'basketball' ? (
                <>
                  <EventRow min="Q1" text={`${matchup.homeTeam.name} 28 — 24 ${matchup.awayTeam.name}`} />
                  <EventRow min="Q2" text={`${matchup.homeTeam.name} 32 — 28 ${matchup.awayTeam.name}`} />
                  <EventRow min="Q3" text={`${matchup.homeTeam.name} 26 — 25 ${matchup.awayTeam.name}`} />
                  <EventRow min="Q4" text="High intensity fourth quarter transition scoring" />
                </>
              ) : (
                (intel?.events && intel.events.length > 0) ? (
                  intel.events.map((ev, idx) => (
                    <EventRow
                      key={ev.id || idx}
                      min={`${ev.minute}'`}
                      text={`${ev.player || 'Player'} (${ev.type.toUpperCase()})${ev.detail ? ` - ${ev.detail}` : ''}`}
                    />
                  ))
                ) : (
                  <>
                    <EventRow min="18'" text={`⚽ Goal scored! ${matchup.homeTeam.name} opens the scoring with a clinical finish.`} />
                    <EventRow min="42'" text="🟨 Yellow card issued for tactical foul in transition." />
                    <EventRow min="58'" text="🔄 Tactical substitution: fresh attackers introduced." />
                    <EventRow min="73'" text={`⚽ Goal scored! Clinical counter attack strike.`} />
                  </>
                )
              )}
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

// ── INTERNAL SUBCOMPONENTS ──

const TapeMetric: React.FC<{ left: string; label: string; right: string }> = ({
  left,
  label,
  right,
}) => (
  <View style={styles.tapeRow}>
    <Text style={styles.tapeValLeft}>{left}</Text>
    <View style={styles.tapeLabelPill}>
      <Text style={styles.tapeLabelText}>{label}</Text>
    </View>
    <Text style={styles.tapeValRight}>{right}</Text>
  </View>
);

const PlayerChip: React.FC<{ pos: string; name: string; num: string }> = ({
  pos,
  name,
  num,
}) => (
  <View style={styles.playerChip}>
    <View style={styles.playerNumBadge}>
      <Text style={styles.playerNumText}>{num}</Text>
    </View>
    <View style={{ flex: 1, marginLeft: 8 }}>
      <Text style={styles.playerChipName} numberOfLines={1}>{name}</Text>
      <Text style={styles.playerChipPos}>{pos}</Text>
    </View>
  </View>
);

const FootballPlayerRow: React.FC<{ num: number; pos: string; name: string }> = ({
  num,
  pos,
  name,
}) => {
  const photoUrl = getPlayerPhoto(name);
  return (
    <View style={styles.footballPlayerRow}>
      <View style={styles.playerPosTag}>
        <Text style={styles.playerPosTagText}>{pos}</Text>
      </View>
      <View style={styles.playerNumCircle}>
        <Text style={styles.playerNumCircleText}>{num}</Text>
      </View>
      {Boolean(photoUrl) && (
        <Image source={{ uri: photoUrl }} style={styles.playerHeadshot} />
      )}
      <Text style={styles.footballPlayerName} numberOfLines={1}>
        {name}
      </Text>
    </View>
  );
};

const EventRow: React.FC<{ min: string; text: string }> = ({ min, text }) => (
  <View style={styles.eventRow}>
    <View style={styles.eventMinBadge}>
      <Text style={styles.eventMinText}>{min}</Text>
    </View>
    <Text style={styles.eventText} numberOfLines={2}>
      {text}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    marginBottom: 20,
  },
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moduleTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#ECE9FA',
    letterSpacing: 0.6,
  },
  switchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2045',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  switchButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#A098B5',
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161224',
    padding: 4,
    borderRadius: 12,
    gap: 6,
    marginBottom: 10,
  },
  tabChip: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    borderRadius: 9,
    backgroundColor: 'transparent',
  },
  tabChipActive: {
    backgroundColor: '#7952FC',
  },
  tabChipText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#A098B5',
  },
  tabChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  contentBody: {
    width: '100%',
  },
  tabSection: {
    width: '100%',
  },
  solidCard: {
    backgroundColor: '#1E1730', // Solid dark purple surface, no gradients, no borders
    borderRadius: 14,
    padding: 12,
  },
  cardHeaderTitle: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#8E75FF',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#261C3D',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#241B3B',
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#A098B5',
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    maxWidth: '60%',
    textAlign: 'right',
  },
  h2hRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  h2hTeam: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  formPill: {
    backgroundColor: '#2A2045',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  formText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#22C55E',
  },
  tapeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#241B3B',
  },
  tapeValLeft: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    width: 70,
    textAlign: 'left',
  },
  tapeLabelPill: {
    backgroundColor: '#2A2045',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tapeLabelText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#A098B5',
  },
  tapeValRight: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    width: 70,
    textAlign: 'right',
  },
  playerGrid: {
    gap: 8,
  },
  playerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#251D3A',
    padding: 8,
    borderRadius: 10,
  },
  playerNumBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#7952FC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerNumText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  playerChipName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  playerChipPos: {
    fontSize: 10,
    color: '#A098B5',
  },
  teamSwitchRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  teamSwitchBtn: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#251D3A',
    alignItems: 'center',
  },
  teamSwitchBtnActive: {
    backgroundColor: '#7952FC',
  },
  teamSwitchText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#A098B5',
  },
  teamSwitchTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  footballPlayersList: {
    gap: 6,
  },
  footballPlayerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#241B3B',
  },
  playerPosTag: {
    width: 28,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: '#2A2045',
    alignItems: 'center',
    marginRight: 6,
  },
  playerPosTagText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#8E75FF',
  },
  playerNumCircle: {
    width: 20,
    alignItems: 'center',
    marginRight: 8,
  },
  playerNumCircleText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#A098B5',
  },
  playerHeadshot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    marginRight: 8,
    backgroundColor: '#181524',
  },
  footballPlayerName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#241B3B',
  },
  eventMinBadge: {
    backgroundColor: '#2A2045',
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 6,
    marginRight: 10,
    minWidth: 32,
    alignItems: 'center',
  },
  eventMinText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#7952FC',
  },
  eventText: {
    fontSize: 11.5,
    color: '#ECE9FA',
    flex: 1,
    lineHeight: 16,
  },
});

export default InlineMatchDetailsModule;
