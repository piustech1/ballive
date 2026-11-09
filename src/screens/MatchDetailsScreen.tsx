import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Share,
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
} from 'lucide-react-native';
import Colors from '../theme/colors';
import { SecondaryScreenHeader } from '../components/common/SecondaryScreenHeader';
import { LiveBadge } from '../components/common/LiveBadge';
import { getTeamCrest } from '../utils/teamCrestResolver';
import { getPlayerPhoto } from '../utils/playerResolver';
import { DiscoverMatchup } from '../constants/discoverData';
import { useProfile } from '../hooks/useProfile';
import { useAppNavigation } from '../navigation/NavigationContext';

interface MatchDetailsScreenProps {
  matchup: DiscoverMatchup;
}

type TabKey = 'summary' | 'stats' | 'lineups' | 'events';

export const MatchDetailsScreen: React.FC<MatchDetailsScreenProps> = ({ matchup }) => {
  const { navigate } = useAppNavigation();
  const { profile, toggleMatchReminder, toggleSaveMatch } = useProfile();
  const [activeTab, setActiveTab] = useState<TabKey>('summary');
  const [lineupView, setLineupView] = useState<'pitch' | 'list'>('pitch');
  const [pitchTeam, setPitchTeam] = useState<'home' | 'away'>('home');

  const isReminderSet = profile.matchReminderIds.includes(matchup.id);
  const isSaved = profile.savedMatchIds.includes(matchup.id);
  const isLive = matchup.status === 'LIVE';

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${matchup.homeTeam.name} vs ${matchup.awayTeam.name} in ${matchup.competition} on BALLIVE!`,
        title: `${matchup.homeTeam.name} vs ${matchup.awayTeam.name}`,
      });
    } catch {
      // User cancelled
    }
  };

  // Structured Lineups with coordinates for pitch layout
  const homeStartingXI = [
    { num: 1, name: 'D. Raya', pos: 'GK', x: '50%', y: '84%' },
    { num: 4, name: 'B. White', pos: 'RB', x: '82%', y: '64%' },
    { num: 2, name: 'W. Saliba', pos: 'CB', x: '61%', y: '66%' },
    { num: 6, name: 'Gabriel M.', pos: 'CB', x: '39%', y: '66%' },
    { num: 12, name: 'J. Timber', pos: 'LB', x: '18%', y: '64%' },
    { num: 5, name: 'T. Partey', pos: 'CDM', x: '50%', y: '48%' },
    { num: 41, name: 'D. Rice', pos: 'CM', x: '28%', y: '42%' },
    { num: 8, name: 'M. Ødegaard (C)', pos: 'CAM', x: '72%', y: '42%' },
    { num: 7, name: 'B. Saka', pos: 'RW', x: '80%', y: '18%' },
    { num: 29, name: 'K. Havertz', pos: 'ST', x: '50%', y: '14%' },
    { num: 11, name: 'G. Martinelli', pos: 'LW', x: '20%', y: '18%' },
  ];

  const awayStartingXI = [
    { num: 1, name: 'Alisson B.', pos: 'GK', x: '50%', y: '84%' },
    { num: 66, name: 'T. Alexander-Arnold', pos: 'RB', x: '82%', y: '64%' },
    { num: 5, name: 'I. Konaté', pos: 'CB', x: '61%', y: '66%' },
    { num: 4, name: 'V. van Dijk (C)', pos: 'CB', x: '39%', y: '66%' },
    { num: 26, name: 'A. Robertson', pos: 'LB', x: '18%', y: '64%' },
    { num: 38, name: 'R. Gravenberch', pos: 'CDM', x: '50%', y: '48%' },
    { num: 10, name: 'A. Mac Allister', pos: 'CM', x: '28%', y: '42%' },
    { num: 8, name: 'D. Szoboszlai', pos: 'CAM', x: '72%', y: '42%' },
    { num: 11, name: 'M. Salah', pos: 'RW', x: '80%', y: '18%' },
    { num: 9, name: 'D. Núñez', pos: 'ST', x: '50%', y: '14%' },
    { num: 7, name: 'L. Díaz', pos: 'LW', x: '20%', y: '18%' },
  ];

  // Match Timeline Events
  const matchEvents = [
    { min: "9'", team: 'home', type: 'goal', player: 'B. Saka', assist: 'M. Ødegaard' },
    { min: "18'", team: 'away', type: 'goal', player: 'V. van Dijk', assist: 'T. Alexander-Arnold' },
    { min: "33'", team: 'home', type: 'yellow', player: 'T. Partey', detail: 'Foul' },
    { min: "43'", team: 'home', type: 'goal', player: 'M. Merino', assist: 'D. Rice' },
    { min: "68'", team: 'away', type: 'sub', player: 'C. Gakpo in, L. Díaz out' },
    { min: "81'", team: 'away', type: 'goal', player: 'M. Salah', assist: 'D. Núñez' },
  ];

  return (
    <View style={styles.root}>
      {/* ── TOP APP BAR ── */}
      <SecondaryScreenHeader
        title={matchup.competition}
        subtitle={`${matchup.kickoffDate} • ${matchup.venue}`}
        rightAction={{
          icon: Bookmark,
          onPress: () => toggleSaveMatch(matchup.id),
          active: isSaved,
          activeColor: '#7952FC',
          accessibilityLabel: 'Save match',
        }}
        secondaryRightAction={{
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
        {/* ── SCOREBOARD HERO CARD ── */}
        <View style={styles.scoreboardHero}>
          {/* Status pill header */}
          <View style={styles.heroHeaderPillRow}>
            <View
              style={[
                styles.statusBadge,
                isLive && styles.statusBadgeLive,
                matchup.status === 'FT' && styles.statusBadgeFT,
              ]}
            >
              {isLive ? (
                <LiveBadge variant="solid" minute={matchup.minute} />
              ) : matchup.status === 'FT' ? (
                <Text style={styles.statusBadgeFTText}>FULL TIME</Text>
              ) : (
                <Text style={styles.statusBadgeUpcomingText}>
                  {matchup.kickoffDate} • {matchup.kickoffTime.replace(' GMT', '')}
                </Text>
              )}
            </View>
          </View>

          {/* Clubs and Scores */}
          <View style={styles.scoreboardRow}>
            {/* Home Club */}
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.heroClubSide}
              onPress={() => {
                navigate({
                  name: 'TeamDetails',
                  params: {
                    team: {
                      id: matchup.homeTeam.id,
                      name: matchup.homeTeam.name,
                      shortName: matchup.homeTeam.name.substring(0, 3).toUpperCase(),
                      country: 'Europe',
                      crestUrl: matchup.homeTeam.crestUrl,
                      stadium: matchup.venue,
                      domesticTitle: 'Top Tier Football Club',
                    },
                  },
                });
              }}
            >
              <View style={styles.crestContainer}>
                <Image
                  source={{ uri: getTeamCrest(matchup.homeTeam.name || matchup.homeTeam.id) }}
                  style={styles.crestImg}
                />
              </View>
              <Text style={styles.clubNameText} numberOfLines={2}>
                {matchup.homeTeam.name}
              </Text>
            </TouchableOpacity>

            {/* Score / VS Center */}
            <View style={styles.heroCenterScore}>
              {isLive || matchup.status === 'FT' ? (
                <View style={styles.heroScoresRow}>
                  <Text style={styles.heroScoreDigit}>{matchup.homeTeam.score ?? 0}</Text>
                  <Text style={styles.heroScoreDivider}>-</Text>
                  <Text style={styles.heroScoreDigit}>{matchup.awayTeam.score ?? 0}</Text>
                </View>
              ) : (
                <View style={styles.heroVsBadge}>
                  <Text style={styles.heroVsText}>VS</Text>
                </View>
              )}
              <Text style={styles.heroVenueText} numberOfLines={1}>
                {matchup.venue}
              </Text>
            </View>

            {/* Away Club */}
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.heroClubSide}
              onPress={() => {
                navigate({
                  name: 'TeamDetails',
                  params: {
                    team: {
                      id: matchup.awayTeam.id,
                      name: matchup.awayTeam.name,
                      shortName: matchup.awayTeam.name.substring(0, 3).toUpperCase(),
                      country: 'Europe',
                      crestUrl: getTeamCrest(matchup.awayTeam.name || matchup.awayTeam.id),
                      stadium: 'Home Ground',
                      domesticTitle: 'Top Tier Football Club',
                    },
                  },
                });
              }}
            >
              <View style={styles.crestContainer}>
                <Image
                  source={{ uri: getTeamCrest(matchup.awayTeam.name || matchup.awayTeam.id) }}
                  style={styles.crestImg}
                />
              </View>
              <Text style={styles.clubNameText} numberOfLines={2}>
                {matchup.awayTeam.name}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── ACTION BUTTONS ── */}
        <View style={styles.actionRow}>
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
              <Tv size={16} color="#FFFFFF" strokeWidth={2.4} />
              <Text style={styles.watchLiveText}>
                {isLive ? 'Watch Live Stream' : 'Live Stream Feed'}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.actionPillBtn, isReminderSet && styles.actionPillBtnActive]}
            onPress={() => toggleMatchReminder(matchup.id)}
          >
            {isReminderSet ? (
              <BellRing size={16} color="#7952FC" strokeWidth={2.4} />
            ) : (
              <Bell size={16} color="#A098B5" strokeWidth={2} />
            )}
            <Text style={[styles.actionPillText, isReminderSet && styles.actionPillTextActive]}>
              {isReminderSet ? 'Alert Set' : 'Remind'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.actionPillBtn, isSaved && styles.actionPillBtnActive]}
            onPress={() => toggleSaveMatch(matchup.id)}
          >
            {isSaved ? (
              <BookmarkCheck size={16} color="#7952FC" strokeWidth={2.4} />
            ) : (
              <Bookmark size={16} color="#A098B5" strokeWidth={2} />
            )}
            <Text style={[styles.actionPillText, isSaved && styles.actionPillTextActive]}>
              {isSaved ? 'Saved' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── HORIZONTAL TABS ── */}
        <View style={styles.tabsBar}>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'summary' && styles.tabItemActive]}
            onPress={() => setActiveTab('summary')}
          >
            <Text style={[styles.tabItemText, activeTab === 'summary' && styles.tabItemTextActive]}>
              Summary
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'stats' && styles.tabItemActive]}
            onPress={() => setActiveTab('stats')}
          >
            <Text style={[styles.tabItemText, activeTab === 'stats' && styles.tabItemTextActive]}>
              Statistics
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'lineups' && styles.tabItemActive]}
            onPress={() => setActiveTab('lineups')}
          >
            <Text style={[styles.tabItemText, activeTab === 'lineups' && styles.tabItemTextActive]}>
              Lineups
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'events' && styles.tabItemActive]}
            onPress={() => setActiveTab('events')}
          >
            <Text style={[styles.tabItemText, activeTab === 'events' && styles.tabItemTextActive]}>
              Events
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── TAB 1: SUMMARY ── */}
        {activeTab === 'summary' && (
          <View style={styles.tabContentSection}>
            <View style={styles.cardContainer}>
              <Text style={styles.cardSectionHeader}>Fixture Information</Text>

              <View style={styles.infoRow}>
                <MapPin size={17} color="#7952FC" strokeWidth={2.2} />
                <View style={styles.infoMeta}>
                  <Text style={styles.infoLabel}>Stadium / Venue</Text>
                  <Text style={styles.infoValue}>{matchup.venue}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Calendar size={17} color="#7952FC" strokeWidth={2.2} />
                <View style={styles.infoMeta}>
                  <Text style={styles.infoLabel}>Matchday Date</Text>
                  <Text style={styles.infoValue}>{matchup.kickoffDate}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Clock size={17} color="#7952FC" strokeWidth={2.2} />
                <View style={styles.infoMeta}>
                  <Text style={styles.infoLabel}>Kickoff Time</Text>
                  <Text style={styles.infoValue}>{matchup.kickoffTime}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Shield size={17} color="#7952FC" strokeWidth={2.2} />
                <View style={styles.infoMeta}>
                  <Text style={styles.infoLabel}>Tournament</Text>
                  <Text style={styles.infoValue}>{matchup.competition}</Text>
                </View>
              </View>
            </View>

            {/* Head-to-Head form preview */}
            <View style={styles.cardContainer}>
              <Text style={styles.cardSectionHeader}>Recent Head-to-Head Form</Text>
              <View style={styles.h2hRow}>
                <Text style={styles.h2hClub}>{matchup.homeTeam.name}</Text>
                <View style={styles.h2hScorePill}>
                  <Text style={styles.h2hScoreText}>2 - 2</Text>
                </View>
                <Text style={styles.h2hClub}>{matchup.awayTeam.name}</Text>
              </View>
              <View style={styles.h2hRow}>
                <Text style={styles.h2hClub}>{matchup.homeTeam.name}</Text>
                <View style={styles.h2hScorePill}>
                  <Text style={styles.h2hScoreText}>3 - 1</Text>
                </View>
                <Text style={styles.h2hClub}>{matchup.awayTeam.name}</Text>
              </View>
            </View>
          </View>
        )}

        {/* ── TAB 2: STATISTICS ── */}
        {activeTab === 'stats' && (
          <View style={styles.tabContentSection}>
            <View style={styles.cardContainer}>
              <Text style={styles.cardSectionHeader}>Match Statistics</Text>

              {/* Possession */}
              <View style={styles.statMetric}>
                <View style={styles.statHeader}>
                  <Text style={styles.statValHome}>54%</Text>
                  <Text style={styles.statName}>Ball Possession</Text>
                  <Text style={styles.statValAway}>46%</Text>
                </View>
                <View style={styles.comparisonTrack}>
                  <View style={[styles.barHome, { width: '54%' }]} />
                  <View style={[styles.barAway, { width: '46%' }]} />
                </View>
              </View>

              {/* Total Shots */}
              <View style={styles.statMetric}>
                <View style={styles.statHeader}>
                  <Text style={styles.statValHome}>15</Text>
                  <Text style={styles.statName}>Total Shots</Text>
                  <Text style={styles.statValAway}>12</Text>
                </View>
                <View style={styles.comparisonTrack}>
                  <View style={[styles.barHome, { width: '55%' }]} />
                  <View style={[styles.barAway, { width: '45%' }]} />
                </View>
              </View>

              {/* Shots on Target */}
              <View style={styles.statMetric}>
                <View style={styles.statHeader}>
                  <Text style={styles.statValHome}>6</Text>
                  <Text style={styles.statName}>Shots on Target</Text>
                  <Text style={styles.statValAway}>5</Text>
                </View>
                <View style={styles.comparisonTrack}>
                  <View style={[styles.barHome, { width: '54%' }]} />
                  <View style={[styles.barAway, { width: '46%' }]} />
                </View>
              </View>

              {/* Corner Kicks */}
              <View style={styles.statMetric}>
                <View style={styles.statHeader}>
                  <Text style={styles.statValHome}>8</Text>
                  <Text style={styles.statName}>Corner Kicks</Text>
                  <Text style={styles.statValAway}>4</Text>
                </View>
                <View style={styles.comparisonTrack}>
                  <View style={[styles.barHome, { width: '66%' }]} />
                  <View style={[styles.barAway, { width: '34%' }]} />
                </View>
              </View>

              {/* Fouls */}
              <View style={styles.statMetric}>
                <View style={styles.statHeader}>
                  <Text style={styles.statValHome}>10</Text>
                  <Text style={styles.statName}>Fouls</Text>
                  <Text style={styles.statValAway}>13</Text>
                </View>
                <View style={styles.comparisonTrack}>
                  <View style={[styles.barHome, { width: '43%' }]} />
                  <View style={[styles.barAway, { width: '57%' }]} />
                </View>
              </View>

              {/* Yellow Cards */}
              <View style={styles.statMetric}>
                <View style={styles.statHeader}>
                  <Text style={styles.statValHome}>1</Text>
                  <Text style={styles.statName}>Yellow Cards</Text>
                  <Text style={styles.statValAway}>2</Text>
                </View>
                <View style={styles.comparisonTrack}>
                  <View style={[styles.barHome, { width: '33%' }]} />
                  <View style={[styles.barAway, { width: '67%' }]} />
                </View>
              </View>
            </View>
          </View>
        )}

        {/* ── TAB 3: LINEUPS ── */}
        {activeTab === 'lineups' && (
          <View style={styles.tabContentSection}>
            {/* View Selector: Pitch View vs List View */}
            <View style={styles.lineupViewSelector}>
              <TouchableOpacity
                style={[styles.lineupViewBtn, lineupView === 'pitch' && styles.lineupViewBtnActive]}
                onPress={() => setLineupView('pitch')}
              >
                <Text style={[styles.lineupViewBtnText, lineupView === 'pitch' && styles.lineupViewBtnTextActive]}>
                  Tactical Pitch
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.lineupViewBtn, lineupView === 'list' && styles.lineupViewBtnActive]}
                onPress={() => setLineupView('list')}
              >
                <Text style={[styles.lineupViewBtnText, lineupView === 'list' && styles.lineupViewBtnTextActive]}>
                  Roster List
                </Text>
              </TouchableOpacity>
            </View>

            {lineupView === 'pitch' ? (
              <View>
                {/* Team Selector for Pitch */}
                <View style={styles.pitchTeamSelector}>
                  <TouchableOpacity
                    style={[styles.pitchTeamBtn, pitchTeam === 'home' && styles.pitchTeamBtnActive]}
                    onPress={() => setPitchTeam('home')}
                  >
                    <Image
                      source={{ uri: getTeamCrest(matchup.homeTeam.name || matchup.homeTeam.id) }}
                      style={styles.pitchTeamCrest}
                    />
                    <Text
                      style={[styles.pitchTeamBtnText, pitchTeam === 'home' && styles.pitchTeamBtnTextActive]}
                      numberOfLines={1}
                    >
                      {matchup.homeTeam.name} (4-3-3)
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.pitchTeamBtn, pitchTeam === 'away' && styles.pitchTeamBtnActive]}
                    onPress={() => setPitchTeam('away')}
                  >
                    <Image
                      source={{ uri: getTeamCrest(matchup.awayTeam.name || matchup.awayTeam.id) }}
                      style={styles.pitchTeamCrest}
                    />
                    <Text
                      style={[styles.pitchTeamBtnText, pitchTeam === 'away' && styles.pitchTeamBtnTextActive]}
                      numberOfLines={1}
                    >
                      {matchup.awayTeam.name} (4-3-3)
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Tactical Football Pitch Container */}
                <View style={styles.tacticalPitchContainer}>
                  {/* Outer & inner pitch field lines */}
                  <View style={styles.pitchHalfwayLine} />
                  <View style={styles.pitchCenterCircle} />
                  <View style={styles.pitchCenterDot} />
                  <View style={styles.pitchPenaltyBoxTop} />
                  <View style={styles.pitchGoalBoxTop} />
                  <View style={styles.pitchPenaltyBoxBottom} />
                  <View style={styles.pitchGoalBoxBottom} />

                  {/* 11 Positioned Player Markers */}
                  {(pitchTeam === 'home' ? homeStartingXI : awayStartingXI).map(p => (
                    <View
                      key={p.num}
                      style={[
                        styles.pitchPlayerMarker,
                        {
                          left: p.x as any,
                          top: p.y as any,
                        },
                      ]}
                    >
                      <View style={styles.pitchAvatarContainer}>
                        <Image
                          source={{ uri: getPlayerPhoto(p.name) }}
                          style={styles.pitchPlayerAvatar}
                        />
                        <View style={styles.pitchNumberBadge}>
                          <Text style={styles.pitchNumberText}>{p.num}</Text>
                        </View>
                      </View>
                      <View style={styles.pitchPlayerNamePill}>
                        <Text style={styles.pitchPlayerNameText} numberOfLines={1}>
                          {p.name.replace(' (C)', '')}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            ) : (
              <View style={{ gap: 12 }}>
                {/* Home Starting XI List */}
                <View style={styles.cardContainer}>
                  <View style={styles.listHeaderRow}>
                    <Image
                      source={{ uri: getTeamCrest(matchup.homeTeam.name || matchup.homeTeam.id) }}
                      style={styles.listHeaderCrest}
                    />
                    <Text style={styles.cardSectionHeader}>{matchup.homeTeam.name} Starting XI (4-3-3)</Text>
                  </View>
                  {homeStartingXI.map(p => (
                    <View key={p.num} style={styles.playerItemRow}>
                      <View style={styles.playerNumPill}>
                        <Text style={styles.playerNumText}>{p.num}</Text>
                      </View>
                      <Image source={{ uri: getPlayerPhoto(p.name) }} style={styles.playerListAvatar} />
                      <Text style={styles.playerItemName}>{p.name}</Text>
                      <View style={styles.playerPosBadge}>
                        <Text style={styles.playerItemPos}>{p.pos}</Text>
                      </View>
                    </View>
                  ))}
                </View>

                {/* Away Starting XI List */}
                <View style={styles.cardContainer}>
                  <View style={styles.listHeaderRow}>
                    <Image
                      source={{ uri: getTeamCrest(matchup.awayTeam.name || matchup.awayTeam.id) }}
                      style={styles.listHeaderCrest}
                    />
                    <Text style={styles.cardSectionHeader}>{matchup.awayTeam.name} Starting XI (4-3-3)</Text>
                  </View>
                  {awayStartingXI.map(p => (
                    <View key={p.num} style={styles.playerItemRow}>
                      <View style={styles.playerNumPill}>
                        <Text style={styles.playerNumText}>{p.num}</Text>
                      </View>
                      <Image source={{ uri: getPlayerPhoto(p.name) }} style={styles.playerListAvatar} />
                      <Text style={styles.playerItemName}>{p.name}</Text>
                      <View style={styles.playerPosBadge}>
                        <Text style={styles.playerItemPos}>{p.pos}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        {/* ── TAB 4: EVENTS ── */}
        {activeTab === 'events' && (
          <View style={styles.tabContentSection}>
            <View style={styles.cardContainer}>
              <Text style={styles.cardSectionHeader}>Chronological Match Events</Text>

              {matchEvents.map((evt, idx) => {
                const isHome = evt.team === 'home';
                const teamName = isHome ? matchup.homeTeam.name : matchup.awayTeam.name;

                return (
                  <View key={idx} style={styles.eventRow}>
                    <View style={styles.eventMinuteBox}>
                      <Text style={styles.eventMinuteText}>{evt.min}</Text>
                    </View>

                    <View style={styles.eventIconBox}>
                      {evt.type === 'goal' && (
                        <CircleDot size={18} color="#22C55E" strokeWidth={2.5} />
                      )}
                      {evt.type === 'yellow' && (
                        <View style={styles.yellowCardIcon} />
                      )}
                      {evt.type === 'sub' && (
                        <ArrowRightLeft size={16} color="#A098B5" strokeWidth={2.4} />
                      )}
                    </View>

                    {/* Circular player portrait */}
                    <Image
                      source={{ uri: getPlayerPhoto(evt.player) }}
                      style={styles.eventPlayerAvatar}
                    />

                    <View style={styles.eventDetailsBox}>
                      <Text style={styles.eventPlayerText}>{evt.player}</Text>
                      {evt.assist && (
                        <View style={styles.assistRow}>
                          <Image
                            source={{ uri: getPlayerPhoto(evt.assist) }}
                            style={styles.assistPlayerAvatar}
                          />
                          <Text style={styles.eventAssistText}>Assist: {evt.assist}</Text>
                        </View>
                      )}
                      {evt.detail && (
                        <Text style={styles.eventAssistText}>{evt.detail}</Text>
                      )}
                    </View>

                    <View style={styles.eventTeamBadgeRow}>
                      <Image
                        source={{ uri: getTeamCrest(teamName) }}
                        style={styles.eventTeamCrest}
                      />
                      <Text style={styles.eventTeamBadge}>
                        {teamName.substring(0, 3).toUpperCase()}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
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
  scoreboardHero: {
    margin: 16,
    marginBottom: 12,
    borderRadius: 20,
    backgroundColor: '#1E1730',
    padding: 18,
  },
  heroHeaderPillRow: {
    alignItems: 'center',
    marginBottom: 14,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4.5,
    borderRadius: 8,
    backgroundColor: '#2A2045',
  },
  statusBadgeLive: {
    backgroundColor: 'rgba(34, 197, 94, 0.16)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  livePulsingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
    marginRight: 6,
  },
  statusBadgeLiveText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#22C55E',
    letterSpacing: 0.4,
  },
  statusBadgeFT: {
    backgroundColor: '#2A2045',
  },
  statusBadgeFTText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#A098B5',
  },
  statusBadgeUpcomingText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#F8BE38',
  },
  scoreboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroClubSide: {
    flex: 1,
    alignItems: 'center',
  },
  crestContainer: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#181524',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  crestImg: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  clubNameText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  heroCenterScore: {
    width: 100,
    alignItems: 'center',
  },
  heroScoresRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  heroScoreDigit: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  heroScoreDivider: {
    fontSize: 24,
    fontWeight: '700',
    color: '#7952FC',
    marginHorizontal: 4,
  },
  heroVsBadge: {
    backgroundColor: '#2A2045',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 4,
  },
  heroVsText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#7952FC',
  },
  heroVenueText: {
    fontSize: 10.5,
    color: '#A098B5',
    textAlign: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 14,
    gap: 8,
  },
  watchLiveBtn: {
    flex: 1,
    height: 44,
    backgroundColor: '#7952FC',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  watchLiveText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  actionPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1730',
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 12,
    gap: 6,
  },
  actionPillBtnActive: {
    backgroundColor: '#2A2045',
  },
  actionPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#A098B5',
  },
  actionPillTextActive: {
    color: '#7952FC',
  },
  tabsBar: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 14,
    backgroundColor: '#181524',
    borderRadius: 12,
    padding: 4,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 9,
  },
  tabItemActive: {
    backgroundColor: '#2A2045',
  },
  tabItemText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#A098B5',
  },
  tabItemTextActive: {
    color: '#FFFFFF',
  },
  tabContentSection: {
    paddingHorizontal: 16,
    gap: 12,
  },
  cardContainer: {
    backgroundColor: '#1E1730',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  cardSectionHeader: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoMeta: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: '#A098B5',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 1,
  },
  h2hRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#181524',
  },
  h2hClub: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  h2hScorePill: {
    backgroundColor: '#2A2045',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  h2hScoreText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7952FC',
  },
  statMetric: {
    marginBottom: 8,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  statValHome: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    width: 40,
  },
  statName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#A098B5',
  },
  statValAway: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    width: 40,
    textAlign: 'right',
  },
  comparisonTrack: {
    height: 6,
    backgroundColor: '#181524',
    borderRadius: 3,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  barHome: {
    height: '100%',
    backgroundColor: '#7952FC',
  },
  barAway: {
    height: '100%',
    backgroundColor: '#F8BE38',
  },
  formationBanner: {
    backgroundColor: '#2A2045',
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 4,
  },
  formationText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  playerItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#181524',
  },
  playerNumPill: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2A2045',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  playerNumText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7952FC',
  },
  playerItemName: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  playerItemPos: {
    fontSize: 11,
    fontWeight: '600',
    color: '#A098B5',
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#181524',
  },
  eventMinuteBox: {
    width: 32,
  },
  eventMinuteText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#7952FC',
  },
  eventIconBox: {
    width: 26,
    alignItems: 'center',
    marginRight: 8,
  },
  yellowCardIcon: {
    width: 10,
    height: 14,
    backgroundColor: '#F8BE38',
    borderRadius: 2,
  },
  eventDetailsBox: {
    flex: 1,
  },
  eventPlayerText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  eventAssistText: {
    fontSize: 11,
    color: '#A098B5',
  },
  eventTeamBadge: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#A098B5',
  },
  // ── Lineup View Switcher ──
  lineupViewSelector: {
    flexDirection: 'row',
    backgroundColor: '#1E1730',
    borderRadius: 12,
    padding: 3,
    marginBottom: 4,
  },
  lineupViewBtn: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: 9,
  },
  lineupViewBtnActive: {
    backgroundColor: '#7952FC',
  },
  lineupViewBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#A098B5',
  },
  lineupViewBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  // ── Tactical Pitch Team Selector ──
  pitchTeamSelector: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 8,
  },
  pitchTeamBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: '#1E1730',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  pitchTeamBtnActive: {
    backgroundColor: '#2A2045',
    borderColor: '#7952FC',
  },
  pitchTeamCrest: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  pitchTeamBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#A098B5',
  },
  pitchTeamBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  // ── Tactical Football Pitch ──
  tacticalPitchContainer: {
    height: 480,
    backgroundColor: '#123D20',
    borderRadius: 16,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginVertical: 4,
  },
  pitchHalfwayLine: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.28)',
  },
  pitchCenterCircle: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.28)',
    marginTop: -43,
    marginLeft: -43,
  },
  pitchCenterDot: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    marginTop: -3,
    marginLeft: -3,
  },
  pitchPenaltyBoxTop: {
    position: 'absolute',
    top: 0,
    left: '24%',
    right: '24%',
    height: 68,
    borderBottomWidth: 1.5,
    borderLeftWidth: 1.5,
    borderRightWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.28)',
  },
  pitchGoalBoxTop: {
    position: 'absolute',
    top: 0,
    left: '37%',
    right: '37%',
    height: 28,
    borderBottomWidth: 1.5,
    borderLeftWidth: 1.5,
    borderRightWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.22)',
  },
  pitchPenaltyBoxBottom: {
    position: 'absolute',
    bottom: 0,
    left: '24%',
    right: '24%',
    height: 68,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderRightWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.28)',
  },
  pitchGoalBoxBottom: {
    position: 'absolute',
    bottom: 0,
    left: '37%',
    right: '37%',
    height: 28,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderRightWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.22)',
  },
  // Pitch Player Marker
  pitchPlayerMarker: {
    position: 'absolute',
    width: 66,
    marginLeft: -33,
    alignItems: 'center',
  },
  pitchAvatarContainer: {
    position: 'relative',
    width: 38,
    height: 38,
  },
  pitchPlayerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: '#1E1730',
  },
  pitchNumberBadge: {
    position: 'absolute',
    bottom: -2,
    right: -4,
    backgroundColor: '#7952FC',
    width: 17,
    height: 17,
    borderRadius: 8.5,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.2,
    borderColor: '#FFFFFF',
  },
  pitchNumberText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  pitchPlayerNamePill: {
    marginTop: 3,
    backgroundColor: 'rgba(14, 13, 20, 0.88)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    maxWidth: 66,
  },
  pitchPlayerNameText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '700',
    textAlign: 'center',
  },
  // ── Roster List Additions ──
  listHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  listHeaderCrest: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
  },
  playerListAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
    backgroundColor: '#2A2045',
  },
  playerPosBadge: {
    backgroundColor: '#2A2045',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  // ── Event Additions ──
  eventPlayerAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    marginRight: 10,
    backgroundColor: '#2A2045',
  },
  assistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  assistPlayerAvatar: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  eventTeamBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#2A2045',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  eventTeamCrest: {
    width: 15,
    height: 15,
    resizeMode: 'contain',
  },
});
