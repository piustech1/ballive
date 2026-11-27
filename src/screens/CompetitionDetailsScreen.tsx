import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  StatusBar,
  ImageSourcePropType,
} from 'react-native';
import {
  Check,
  Plus,
  Bookmark,
  Users,
  Trophy,
  Globe,
  Activity,
  Dribbble,
} from 'lucide-react-native';
import { ExtendedHeroHeader, HeroStickyTopBar } from '../components/common/ExtendedHeroHeader';
import { SegmentedControl } from '../components/common/SegmentedControl';
import { CircularCountryFlag } from '../components/common/CircularCountryFlag';
import { InfoRowCard, InfoRowItem } from '../components/common/InfoRowCard';
import { CompetitionLogo } from '../components/common/CompetitionLogo';
import { TeamCrest } from '../components/common/TeamCrest';
import {
  DiscoverCompetition,
  PopularLeague,
  DiscoverMatchup,
} from '../constants/discoverData';
import { useProfile } from '../hooks/useProfile';
import { useSavedMatches } from '../hooks/useSavedMatches';
import { useAppNavigation } from '../navigation/NavigationContext';
import { findTeamById, navigateToMatch } from '../navigation/navHelpers';
import { normalizeLeagueId } from '../services/profileStorage';
import { sportsApiService, resolveLeagueKey } from '../services/sportsApiService';
import { streamingApiService } from '../services/streamingApiService';
import { competitionResolverService } from '../services/competitionResolverService';
import { teamEmblemService } from '../services/teamEmblemService';
import { getLocalCompetitionHero, resolveCompetitionHeroSource } from '../utils/teamHeroResolver';
import { isValidFixture } from '../utils/fixtureValidator';

interface CompetitionDetailsScreenProps {
  competition: DiscoverCompetition | PopularLeague;
}

type CompTab = 'overview' | 'matches';

function normalizeCompForMatchCheck(nameOrId: string, sport?: string): string {
  const res = competitionResolverService.resolveCompetition({
    rawId: nameOrId,
    competition: nameOrId,
    sport,
  });
  return res.isIdentified ? res.id : normalizeLeagueId(nameOrId);
}

function getSportLabel(sport?: string): string {
  const s = (sport || '').toLowerCase();
  if (s === 'basketball') return 'Basketball';
  if (s === 'hockey') return 'Ice Hockey';
  if (s === 'american_football') return 'American Football';
  if (s === 'tennis') return 'Tennis';
  if (s === 'cricket') return 'Cricket';
  return 'Football';
}

export const CompetitionDetailsScreen: React.FC<CompetitionDetailsScreenProps> = ({
  competition,
}) => {
  const { navigate } = useAppNavigation();
  const { isLeagueFollowed, toggleFollowLeague } = useProfile();
  const { isSaved, toggleSave } = useSavedMatches();
  const [activeTab, setActiveTab] = useState<CompTab>('overview');
  const [fixtures, setFixtures] = useState<DiscoverMatchup[]>([]);
  const [isLoadingFixtures, setIsLoadingFixtures] = useState(true);
  const scrollY = useRef(new Animated.Value(0)).current;

  const compSport = useMemo(() => {
    if ('sport' in competition && competition.sport) return competition.sport;
    const lower = competition.name.toLowerCase();
    const idLower = competition.id.toLowerCase();
    if (idLower.includes('nba') || idLower.includes('fiba') || idLower.includes('nz_basketball') || lower.includes('nba') || lower.includes('fiba') || lower.includes('euroleague') || lower.includes('basketball')) return 'basketball';
    if (idLower.includes('nhl') || idLower.includes('aihl') || idLower.includes('russia_mhl') || lower.includes('nhl') || lower.includes('hockey') || lower.includes('allsvenskan') || idLower === 'del' || idLower === 'icehl' || lower.includes('mhl') || lower.includes('aihl')) return 'hockey';
    if (idLower.includes('nfl') || lower.includes('nfl')) return 'american_football';
    return 'soccer';
  }, [competition]);

  const [heroSource, setHeroSource] = useState<ImageSourcePropType | null>(() =>
    getLocalCompetitionHero(competition.id, competition.name, compSport)
  );

  useEffect(() => {
    let mounted = true;
    const localSync = getLocalCompetitionHero(competition.id, competition.name, compSport);
    if (localSync) {
      setHeroSource(localSync);
      return;
    }

    setHeroSource(null);
    resolveCompetitionHeroSource({
      competitionId: competition.id,
      competitionName: competition.name,
      sport: compSport,
    })
      .then(src => {
        if (mounted && src) {
          setHeroSource(src);
        }
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, [competition.id, competition.name, compSport]);

  const isBasketball = compSport === 'basketball';
  const isHockey = compSport === 'hockey';
  const sportLabel = getSportLabel(compSport);

  const region = 'region' in competition ? competition.region : competition.country;
  const reliableCountry =
    competition.country && competition.country !== 'Global' && competition.country !== 'International'
      ? competition.country
      : region && region !== 'Global' && region !== 'International'
      ? region
      : undefined;
  const teamsCount =
    'teamsCount' in competition && competition.teamsCount && competition.teamsCount > 0
      ? competition.teamsCount
      : undefined;

  const isFollowed = isLeagueFollowed(competition);

  const targetCanonId = useMemo(
    () => normalizeCompForMatchCheck(competition.id || competition.name, compSport),
    [competition.id, competition.name, compSport]
  );

  useEffect(() => {
    let isMounted = true;
    setIsLoadingFixtures(true);

    const loadAllMatches = async () => {
      try {
        const leagueKey = resolveLeagueKey(competition.id) || resolveLeagueKey(competition.name) || competition.id;
        const [apiRows, liveCatalog] = await Promise.all([
          sportsApiService
            .getCompetitionFixtures(leagueKey, {
              name: competition.name,
              sport: compSport,
              espnLeague: 'espnLeague' in competition ? (competition as any).espnLeague : undefined,
            })
            .catch(() => [] as DiscoverMatchup[]),
          Promise.resolve(streamingApiService.getCachedLiveMatches()).then(cached =>
            cached.length > 0 ? cached : streamingApiService.getLiveMatches().catch(() => [])
          ),
        ]);

        const merged: DiscoverMatchup[] = [];
        const seen = new Set<string>();

        const addUnique = (m: DiscoverMatchup) => {
          if (!isValidFixture(m)) return;
          const datePart = (m.rawDate || m.kickoffDate || '').slice(0, 10);
          const k1 = `${m.homeTeam.name.toLowerCase().trim()}_${m.awayTeam.name.toLowerCase().trim()}_${datePart}`;
          const k2 = `${m.awayTeam.name.toLowerCase().trim()}_${m.homeTeam.name.toLowerCase().trim()}_${datePart}`;
          if (seen.has(m.id) || seen.has(k1) || seen.has(k2)) return;
          seen.add(m.id);
          seen.add(k1);
          seen.add(k2);
          merged.push(m);
        };

        (liveCatalog || []).forEach(lm => {
          if (!isValidFixture(lm)) return;
          const matchCompCanon = normalizeCompForMatchCheck(lm.competition || lm.id, lm.sport);
          const normMatchLeague = normalizeLeagueId(lm.competition || '');
          const normTargetLeague = normalizeLeagueId(competition.id);
          const nameLower = (lm.competition || '').toLowerCase().trim();
          const compLower = competition.name.toLowerCase().trim();
          const isMatch =
            matchCompCanon === targetCanonId ||
            (normMatchLeague && normTargetLeague && normMatchLeague === normTargetLeague) ||
            (targetCanonId === 'football' && lm.sport === 'soccer') ||
            targetCanonId === 'all' ||
            (Boolean(nameLower) && Boolean(compLower) && nameLower === compLower);

          if (isMatch) {
            addUnique(streamingApiService.convertLiveMatchToMatchup(lm));
          }
        });

        (apiRows || []).forEach(addUnique);

        if (isMounted) {
          setFixtures(merged);
          const crestItems: Array<{ teamId?: string; teamName?: string; crestUrl?: string; priority?: 1 }> = [];
          merged.slice(0, 10).forEach(fx => {
            crestItems.push({
              teamId: fx.homeTeam.id,
              teamName: fx.homeTeam.name,
              crestUrl: fx.homeTeam.crestUrl,
              priority: 1,
            });
            crestItems.push({
              teamId: fx.awayTeam.id,
              teamName: fx.awayTeam.name,
              crestUrl: fx.awayTeam.crestUrl,
              priority: 1,
            });
          });
          teamEmblemService.preloadEmblems(crestItems);
        }
      } finally {
        if (isMounted) {
          setIsLoadingFixtures(false);
        }
      }
    };

    loadAllMatches();
    return () => {
      isMounted = false;
    };
  }, [competition.id, competition.name, compSport, targetCanonId]);

  const { liveAndUpcoming, recentResults, featuredMatch } = useMemo(() => {
    const liveUp = fixtures
      .filter(f => f.status === 'LIVE' || f.status === 'UPCOMING')
      .sort((a, b) => {
        if (a.status === 'LIVE' && b.status !== 'LIVE') return -1;
        if (b.status === 'LIVE' && a.status !== 'LIVE') return 1;
        return (a.kickoffTimestamp || 0) - (b.kickoffTimestamp || 0);
      });

    const finished = fixtures
      .filter(f => f.status === 'FT')
      .sort((a, b) => (b.kickoffTimestamp || 0) - (a.kickoffTimestamp || 0));

    return {
      liveAndUpcoming: liveUp,
      recentResults: finished,
      featuredMatch: liveUp[0] || finished[0] || null,
    };
  }, [fixtures]);

  const headerSubtitle = reliableCountry
    ? `${reliableCountry} · ${sportLabel}`
    : `${region || 'International'} · ${sportLabel}`;

  const heroMetaParts = [
    competition.country || region,
    teamsCount ? `${teamsCount} ${isBasketball || isHockey ? 'Franchises' : 'Clubs'}` : sportLabel,
  ].filter(Boolean);

  const openTeam = (teamSide: { id?: string; name: string; crestUrl?: string }) => {
    if (!teamSide?.name) return;
    const resolved = findTeamById(teamSide.id || teamSide.name, {
      name: teamSide.name,
      crestUrl: teamSide.crestUrl,
      sport: compSport as any,
      country: reliableCountry,
      competitionId: normalizeLeagueId(competition.id),
      competitionName: competition.name,
    });
    navigate({ name: 'TeamDetails', params: { team: resolved } });
  };

  const renderFeaturedMatchCard = (m: DiscoverMatchup) => {
    const isLive = m.status === 'LIVE' || Boolean(m.isLive);
    const isFinished = m.status === 'FT';
    const timeText = (m.kickoffTime || 'Today').replace(/\s*\(EAT\)/i, '').replace(/\s*Live/i, '').trim();
    const bookmarked = isSaved(m.id);

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.featuredCard}
        onPress={() => navigateToMatch(navigate, m)}
      >
        <View style={styles.featuredTopRow}>
          <Text style={styles.cardHeaderTitleNoMargin}>Featured Match</Text>
          <TouchableOpacity
            activeOpacity={0.75}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={e => {
              e.stopPropagation();
              toggleSave(m);
            }}
            accessibilityRole="button"
            accessibilityLabel={bookmarked ? 'Remove match bookmark' : 'Bookmark match'}
          >
            <Bookmark
              size={19}
              color={bookmarked ? '#7952FC' : '#A098B5'}
              fill={bookmarked ? '#7952FC' : 'transparent'}
              strokeWidth={2}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.featuredMatchupRow}>
          {/* Home Team */}
          <TouchableOpacity
            activeOpacity={0.75}
            style={styles.featuredTeamCol}
            onPress={e => {
              e.stopPropagation();
              openTeam(m.homeTeam);
            }}
          >
            <TeamCrest
              uri={m.homeTeam.crestUrl}
              teamId={m.homeTeam.id}
              teamName={m.homeTeam.name}
              sport={compSport}
              size={44}
              containerStyle={{ marginBottom: 8 }}
            />
            <Text style={styles.featuredTeamName} numberOfLines={2}>
              {m.homeTeam.name}
            </Text>
          </TouchableOpacity>

          {/* Center Score / Time Pill */}
          <View style={styles.featuredCenterCol}>
            {isLive ? (
              <>
                <Text style={styles.matchScoreRed}>
                  {m.homeTeam.score ?? 0} - {m.awayTeam.score ?? 0}
                </Text>
                <View style={styles.livePill}>
                  <View style={styles.liveDot} />
                  <Text style={styles.livePillText}>
                    LIVE{m.playTime ? ` ${m.playTime.replace(/live/i, '').trim()}` : ''}
                  </Text>
                </View>
                <Text style={styles.featuredDateText}>{m.kickoffDate || 'Today'}</Text>
              </>
            ) : isFinished ? (
              <>
                <Text style={styles.matchScoreWhite}>
                  {m.homeTeam.score ?? 0} - {m.awayTeam.score ?? 0}
                </Text>
                <View style={styles.ftPill}>
                  <Text style={styles.ftPillText}>FT</Text>
                </View>
                <Text style={styles.featuredDateText}>{m.kickoffDate || 'Recent'}</Text>
              </>
            ) : (
              <>
                <View style={styles.upcomingTimePill}>
                  <Text style={styles.upcomingTimeText}>{timeText}</Text>
                </View>
                <Text style={styles.featuredDateText}>{m.kickoffDate || 'Today'}</Text>
              </>
            )}
          </View>

          {/* Away Team */}
          <TouchableOpacity
            activeOpacity={0.75}
            style={styles.featuredTeamCol}
            onPress={e => {
              e.stopPropagation();
              openTeam(m.awayTeam);
            }}
          >
            <TeamCrest
              uri={m.awayTeam.crestUrl}
              teamId={m.awayTeam.id}
              teamName={m.awayTeam.name}
              sport={compSport}
              size={44}
              containerStyle={{ marginBottom: 8 }}
            />
            <Text style={styles.featuredTeamName} numberOfLines={2}>
              {m.awayTeam.name}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderMatchRow = (m: DiscoverMatchup) => {
    const isLive = m.status === 'LIVE' || Boolean(m.isLive);
    const isFinished = m.status === 'FT';
    const timeText = (m.kickoffTime || 'TBD').replace(/\s*\(EAT\)/i, '').replace(/\s*Live/i, '').trim();

    return (
      <TouchableOpacity
        key={m.id}
        activeOpacity={0.82}
        style={styles.matchRowCard}
        onPress={() => navigateToMatch(navigate, m)}
      >
        <View style={styles.matchRowTeams}>
          {/* Home Side */}
          <TouchableOpacity
            activeOpacity={0.75}
            style={styles.matchTeamLeft}
            onPress={e => {
              e.stopPropagation();
              openTeam(m.homeTeam);
            }}
          >
            <TeamCrest
              uri={m.homeTeam.crestUrl}
              teamId={m.homeTeam.id}
              teamName={m.homeTeam.name}
              sport={compSport}
              size={30}
              containerStyle={{ marginRight: 8 }}
            />
            <Text style={styles.matchTeamNameLeft} numberOfLines={2}>
              {m.homeTeam.name}
            </Text>
          </TouchableOpacity>

          {/* Center Status */}
          <View style={styles.matchRowCenter}>
            {isLive ? (
              <>
                <Text style={styles.matchScoreRed}>
                  {m.homeTeam.score ?? 0} - {m.awayTeam.score ?? 0}
                </Text>
                <View style={styles.livePill}>
                  <View style={styles.liveDot} />
                  <Text style={styles.livePillText}>
                    LIVE {m.playTime ? m.playTime.replace(/live/i, '').trim() : ''}
                  </Text>
                </View>
                <Text style={styles.matchRowDateText}>{m.kickoffDate || 'Today'}</Text>
              </>
            ) : isFinished ? (
              <>
                <Text style={styles.matchScoreWhite}>
                  {m.homeTeam.score ?? 0} - {m.awayTeam.score ?? 0}
                </Text>
                <View style={styles.ftPill}>
                  <Text style={styles.ftPillText}>Full Time</Text>
                </View>
                <Text style={styles.matchRowDateText}>{m.kickoffDate || 'Final'}</Text>
              </>
            ) : (
              <>
                <Text style={styles.vsLabel}>vs</Text>
                <View style={styles.rowTimePill}>
                  <Text style={styles.rowTimeText} numberOfLines={1}>{timeText}</Text>
                </View>
                <Text style={styles.matchRowDateText}>{m.kickoffDate || 'Upcoming'}</Text>
              </>
            )}
          </View>

          {/* Away Side */}
          <TouchableOpacity
            activeOpacity={0.75}
            style={styles.matchTeamRight}
            onPress={e => {
              e.stopPropagation();
              openTeam(m.awayTeam);
            }}
          >
            <Text style={styles.matchTeamNameRight} numberOfLines={2}>
              {m.awayTeam.name}
            </Text>
            <TeamCrest
              uri={m.awayTeam.crestUrl}
              teamId={m.awayTeam.id}
              teamName={m.awayTeam.name}
              sport={compSport}
              size={30}
              containerStyle={{ marginLeft: 8 }}
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />

      {/* Pinned Transparent-to-Solid Navigation Row over Hero */}
      <HeroStickyTopBar
        overlineTitle={competition.name.toUpperCase()}
        subtitle={headerSubtitle}
        scrollY={scrollY}
        rightAction={{
          icon: isFollowed ? Check : Plus,
          onPress: () => toggleFollowLeague(competition),
          active: isFollowed,
          activeColor: '#A58BFC',
          accessibilityLabel: isFollowed ? 'Unfollow competition' : 'Follow competition',
        }}
      />

      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
      >
        {/* Continuous Extended Curved Hero Header */}
        <ExtendedHeroHeader
          heroSource={heroSource}
          emblemComponent={
            <CompetitionLogo
              uri={competition.logoUrl}
              competitionId={competition.id}
              sport={compSport}
              size={76}
              flat={true}
            />
          }
          identityTitle={competition.name}
          identitySubtitle={heroMetaParts.join(' · ')}
          followButtonComponent={
            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.heroFollowBtn, isFollowed && styles.heroFollowBtnActive]}
              onPress={() => toggleFollowLeague(competition)}
            >
              {isFollowed ? (
                <>
                  <Check size={15} color="#FFFFFF" strokeWidth={2.5} />
                  <Text style={styles.heroFollowText}>Following</Text>
                </>
              ) : (
                <>
                  <Plus size={15} color="#FFFFFF" strokeWidth={2.5} />
                  <Text style={styles.heroFollowText}>Follow Competition</Text>
                </>
              )}
            </TouchableOpacity>
          }
        />

        {/* Modern Compact Segmented Control (Overview | Matches) */}
        <SegmentedControl
          tabs={[
            { key: 'overview', label: 'Overview' },
            { key: 'matches', label: `Matches (${fixtures.length})` },
          ]}
          activeKey={activeTab}
          onChange={setActiveTab}
        />

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <View style={styles.tabSection}>
            {isLoadingFixtures && fixtures.length === 0 ? (
              <View style={styles.loadingCard}>
                <ActivityIndicator size="small" color="#7650F6" />
                <Text style={styles.loadingText}>Loading competition schedule...</Text>
              </View>
            ) : featuredMatch ? (
              renderFeaturedMatchCard(featuredMatch)
            ) : null}

            {/* Redesigned Tournament Information Card (No repetitive title row; borderless flag + compact icons) */}
            <InfoRowCard
              title="Tournament Information"
              rows={(() => {
                const territoryValue = competition.country || region || 'International';
                const SportIconComp =
                  compSport === 'basketball'
                    ? Dribbble
                    : compSport === 'soccer'
                    ? Trophy
                    : Activity;

                const items: InfoRowItem[] = [
                  {
                    key: 'territory',
                    label: 'Territory / Country',
                    value: territoryValue,
                    icon: Globe,
                    iconBg: 'rgba(56, 189, 248, 0.14)',
                    iconColor: '#38BDF8',
                    customValueLeading: <CircularCountryFlag country={territoryValue} size={20} />,
                  },
                ];

                if (
                  region &&
                  region !== territoryValue &&
                  region !== 'Global' &&
                  region !== 'International'
                ) {
                  items.push({
                    key: 'region',
                    label: 'Region',
                    value: region,
                    icon: Globe,
                    iconBg: 'rgba(165, 139, 252, 0.14)',
                    iconColor: '#A58BFC',
                  });
                }

                if (teamsCount) {
                  items.push({
                    key: 'clubs',
                    label: isBasketball || isHockey ? 'Participating Franchises' : 'Active Clubs',
                    value: `${teamsCount} ${isBasketball || isHockey ? 'Franchises' : 'Clubs'}`,
                    icon: Users,
                    iconBg: 'rgba(34, 197, 94, 0.14)',
                    iconColor: '#22C55E',
                  });
                }

                items.push({
                  key: 'sport',
                  label: 'Sport',
                  value: sportLabel,
                  icon: SportIconComp,
                  iconBg: 'rgba(118, 80, 246, 0.16)',
                  iconColor: '#A58BFC',
                });

                return items;
              })()}
            />
          </View>
        )}

        {/* TAB 2: MATCHES */}
        {activeTab === 'matches' && (
          <View style={styles.tabSection}>
            {isLoadingFixtures && fixtures.length === 0 ? (
              <View style={styles.loadingCard}>
                <ActivityIndicator size="small" color="#7952FC" />
                <Text style={styles.loadingText}>Fetching competition matches...</Text>
              </View>
            ) : fixtures.length === 0 ? (
              <View style={styles.sectionCard}>
                <Text style={styles.emptyStateTitle}>No scheduled matches right now</Text>
                <Text style={styles.emptyStateDesc}>
                  Live fixtures, upcoming rounds, and recent results for {competition.name} will appear here automatically.
                </Text>
              </View>
            ) : (
              <>
                {liveAndUpcoming.length > 0 && (
                  <View style={styles.matchesGroup}>
                    <Text style={styles.groupHeading}>Live & Upcoming</Text>
                    {liveAndUpcoming.map(renderMatchRow)}
                  </View>
                )}

                {recentResults.length > 0 && (
                  <View style={styles.matchesGroup}>
                    <Text style={styles.groupHeading}>Recent Results</Text>
                    {recentResults.map(renderMatchRow)}
                  </View>
                )}
              </>
            )}
          </View>
        )}
      </Animated.ScrollView>
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
  heroFollowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderRadius: 24,
    backgroundColor: '#7650F6',
    minWidth: 170,
  },
  heroFollowBtnActive: {
    backgroundColor: '#352558',
  },
  heroFollowText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  tabSection: {
    paddingHorizontal: 16,
    gap: 14,
  },
  featuredCard: {
    backgroundColor: '#161224',
    borderRadius: 18,
    padding: 16,
  },
  featuredTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardHeaderTitleNoMargin: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  featuredMatchupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  featuredTeamCol: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  featuredTeamName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  featuredCenterCol: {
    width: 96,
    alignItems: 'center',
    justifyContent: 'center',
  },
  upcomingTimePill: {
    backgroundColor: '#2A2146',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    marginBottom: 6,
  },
  upcomingTimeText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#A58BFC',
  },
  featuredDateText: {
    fontSize: 11.5,
    color: '#8E86A8',
    fontWeight: '500',
  },
  sectionCard: {
    backgroundColor: '#161224',
    borderRadius: 18,
    padding: 16,
  },
  matchesGroup: {
    marginBottom: 8,
  },
  groupHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  matchRowCard: {
    backgroundColor: '#161224',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 10,
  },
  matchRowTeams: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  matchTeamLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 6,
  },
  matchTeamRight: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingLeft: 6,
  },
  matchTeamNameLeft: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  matchTeamNameRight: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'right',
  },
  matchRowCenter: {
    width: 92,
    alignItems: 'center',
    justifyContent: 'center',
  },
  matchScoreRed: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#EF4444',
    marginBottom: 4,
  },
  matchScoreWhite: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.16)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
    marginBottom: 4,
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#EF4444',
  },
  livePillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#EF4444',
  },
  ftPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 4,
  },
  ftPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#CBD5E1',
  },
  vsLabel: {
    fontSize: 11,
    color: '#8E86A8',
    fontWeight: '600',
    marginBottom: 4,
  },
  rowTimePill: {
    backgroundColor: '#221C35',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    marginBottom: 4,
  },
  rowTimeText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#B8B0CF',
  },
  matchRowDateText: {
    fontSize: 11,
    color: '#8E86A8',
    fontWeight: '500',
  },
  loadingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#161224',
    borderRadius: 16,
    paddingVertical: 22,
    gap: 10,
  },
  loadingText: {
    fontSize: 13,
    color: '#A098B5',
    fontWeight: '600',
  },
  emptyStateTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 6,
  },
  emptyStateDesc: {
    fontSize: 12.5,
    color: '#8E86A8',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default CompetitionDetailsScreen;
