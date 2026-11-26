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
  MapPin,
  Trophy,
  Globe,
  Hash,
  Award,
  Activity,
} from 'lucide-react-native';
import { ExtendedHeroHeader, HeroStickyTopBar } from '../components/common/ExtendedHeroHeader';
import { SegmentedControl } from '../components/common/SegmentedControl';
import { CircularCountryFlag } from '../components/common/CircularCountryFlag';
import { InfoRowCard, InfoRowItem } from '../components/common/InfoRowCard';
import { PopularTeam } from '../constants/discoverData';
import { TeamCrest } from '../components/common/TeamCrest';
import { useProfile } from '../hooks/useProfile';
import { useAppNavigation } from '../navigation/NavigationContext';
import { findCompetitionById, navigateToMatch } from '../navigation/navHelpers';
import { teamDetailsService, TeamDetailsPayload, TeamFixtureItem } from '../services/teamDetailsService';
import { teamEmblemService } from '../services/teamEmblemService';
import { getLocalTeamHero, resolveTeamHeroSource } from '../utils/teamHeroResolver';

interface TeamDetailsScreenProps {
  team: PopularTeam;
}

export const TeamDetailsScreen: React.FC<TeamDetailsScreenProps> = ({ team }) => {
  const { navigate } = useAppNavigation();
  const { isTeamFollowed, toggleFollowTeam } = useProfile();
  const [activeTab, setActiveTab] = useState<'overview' | 'fixtures'>('overview');
  const [details, setDetails] = useState<TeamDetailsPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    teamDetailsService
      .getTeamDetails(team)
      .then(res => {
        if (mounted) {
          setDetails(res);
          const allFixtures = [...(res.liveAndUpcoming || []), ...(res.recentResults || [])];
          teamEmblemService.preloadEmblems(
            allFixtures.slice(0, 12).map(f => ({
              teamId: f.opponentId,
              teamName: f.opponentName,
              crestUrl: f.opponentCrest,
              priority: 1,
            }))
          );
        }
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setIsLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [team.id, team.name]);

  const resolvedTeam = details?.resolvedTeam || team;
  const isFollowed = isTeamFollowed(resolvedTeam);

  const competitionName = details?.competitionName || resolvedTeam.competitionName;
  const competitionId = details?.competitionId || resolvedTeam.competitionId;
  const venue =
    details?.venue ||
    (resolvedTeam.stadium && resolvedTeam.stadium !== `${resolvedTeam.name} Stadium`
      ? resolvedTeam.stadium
      : undefined);
  const country =
    details?.country ||
    (resolvedTeam.country && resolvedTeam.country !== 'Global' && resolvedTeam.country !== 'CLUB'
      ? resolvedTeam.country
      : undefined);

  const [heroSource, setHeroSource] = useState<ImageSourcePropType | null>(() =>
    getLocalTeamHero(resolvedTeam.id, resolvedTeam.name)
  );

  useEffect(() => {
    let mounted = true;
    const localSync = getLocalTeamHero(resolvedTeam.id, resolvedTeam.name);
    if (localSync) {
      setHeroSource(localSync);
      return;
    }

    resolveTeamHeroSource({
      teamId: resolvedTeam.id,
      teamName: resolvedTeam.name,
      stadium: venue,
      sport: resolvedTeam.sport,
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
  }, [resolvedTeam.id, resolvedTeam.name, venue, resolvedTeam.sport]);

  const sportLabel = useMemo(() => {
    if (details?.sportLabel) return details.sportLabel;
    const s = (resolvedTeam.sport || '').toLowerCase();
    if (s === 'basketball') return 'Basketball';
    if (s === 'hockey') return 'Ice Hockey';
    if (s === 'american_football') return 'American Football';
    return 'Football';
  }, [details?.sportLabel, resolvedTeam.sport]);

  const liveAndUpcoming = details?.liveAndUpcoming || [];
  const recentResults = details?.recentResults || [];
  const recentForm = details?.recentForm || [];
  const totalFixtures = liveAndUpcoming.length + recentResults.length;

  const headerOverline = (competitionName || `${sportLabel} · ${resolvedTeam.shortName || resolvedTeam.name}`).toUpperCase();
  const headerSubtitle = [venue, country].filter(Boolean).join(' · ') || resolvedTeam.name;

  const heroSub = competitionName ? `${sportLabel} · ${competitionName}` : sportLabel;
  const nextMatch = liveAndUpcoming[0];

  const handleOpenCompetition = () => {
    if (!competitionName && !competitionId) return;
    const compObj = findCompetitionById(competitionId || competitionName!, {
      sport: resolvedTeam.sport,
      logoUrl: details?.competitionLogo,
      country,
    });
    navigate({ name: 'CompetitionDetails', params: { competition: compObj } });
  };

  const renderFixtureRow = (item: TeamFixtureItem) => {
    const isLive = item.status === 'LIVE';
    const isFinished = item.status === 'FT';
    const metaSub = `${item.isHome ? 'Home' : 'Away'} · ${item.competition} · ${item.dateLabel}`;

    return (
      <TouchableOpacity
        key={item.id}
        activeOpacity={0.8}
        style={styles.fixtureRowCard}
        onPress={() => navigateToMatch(navigate, item.matchup)}
      >
        <TeamCrest
          uri={item.opponentCrest}
          teamId={item.opponentId}
          teamName={item.opponentName}
          size={36}
          containerStyle={styles.fixtureCrest}
        />

        <View style={styles.fixtureInfoCol}>
          <Text style={styles.fixtureOpponentName} numberOfLines={1}>
            {item.opponentName}
          </Text>
          <Text style={styles.fixtureMetaText} numberOfLines={1}>
            {metaSub}
          </Text>
        </View>

        <View style={styles.fixtureRightCol}>
          {isLive ? (
            <>
              <Text style={styles.liveScoreText}>
                {item.teamScore} - {item.opponentScore}
              </Text>
              <View style={styles.liveStatusPill}>
                <View style={styles.liveDot} />
                <Text style={styles.liveStatusText}>
                  LIVE{item.playTime ? ` ${item.playTime.replace(/live/i, '').trim()}` : ''}
                </Text>
              </View>
            </>
          ) : isFinished ? (
            <>
              <Text style={styles.ftScoreText}>
                {item.teamScore} - {item.opponentScore}
              </Text>
              <View
                style={[
                  styles.resultTag,
                  item.resultCode === 'W'
                    ? styles.resultTagWin
                    : item.resultCode === 'D'
                    ? styles.resultTagDraw
                    : styles.resultTagLoss,
                ]}
              >
                <Text style={styles.resultTagText}>{item.resultCode || 'FT'}</Text>
              </View>
            </>
          ) : (
            <View style={styles.timeBadge}>
              <Text style={styles.timeBadgeText} numberOfLines={1}>
                {item.timeLabel}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />

      {/* Pinned Transparent-to-Solid Navigation Row over Hero */}
      <HeroStickyTopBar
        overlineTitle={headerOverline}
        subtitle={headerSubtitle}
        onTitlePress={competitionName || competitionId ? handleOpenCompetition : undefined}
        scrollY={scrollY}
        rightAction={{
          icon: isFollowed ? Check : Plus,
          onPress: () => toggleFollowTeam(resolvedTeam),
          active: isFollowed,
          activeColor: '#A58BFC',
          accessibilityLabel: isFollowed ? 'Unfollow team' : 'Follow team',
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
            <TeamCrest
              uri={resolvedTeam.crestUrl}
              teamId={resolvedTeam.id}
              teamName={resolvedTeam.name}
              size={76}
              containerStyle={styles.crestFlatContainer}
            />
          }
          identityTitle={resolvedTeam.name}
          identitySubtitle={heroSub}
          followButtonComponent={
            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.heroFollowBtn, isFollowed && styles.heroFollowBtnActive]}
              onPress={() => toggleFollowTeam(resolvedTeam)}
            >
              {isFollowed ? (
                <>
                  <Check size={15} color="#FFFFFF" strokeWidth={2.5} />
                  <Text style={styles.heroFollowText}>Following</Text>
                </>
              ) : (
                <>
                  <Plus size={15} color="#FFFFFF" strokeWidth={2.5} />
                  <Text style={styles.heroFollowText}>Follow Team</Text>
                </>
              )}
            </TouchableOpacity>
          }
        />

        {/* Modern Compact Segmented Control (Overview | Fixtures) */}
        <SegmentedControl
          tabs={[
            { key: 'overview', label: 'Overview' },
            { key: 'fixtures', label: `Fixtures (${totalFixtures})` },
          ]}
          activeKey={activeTab}
          onChange={setActiveTab}
        />

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <View style={styles.tabSection}>
            {isLoading && recentForm.length === 0 && totalFixtures === 0 ? (
              <View style={styles.loadingCard}>
                <ActivityIndicator size="small" color="#7650F6" />
                <Text style={styles.loadingText}>Loading live team profile & schedule...</Text>
              </View>
            ) : null}

            {/* Recent Form (Solid Opaque State Badges) */}
            {recentForm.length > 0 && (
              <View style={styles.sectionCard}>
                <View style={styles.formHeaderRow}>
                  <Text style={styles.cardHeaderTitleNoMargin}>Recent Form</Text>
                  <Text style={styles.formSubLabel}>
                    Last {recentForm.length} {recentForm.length === 1 ? 'match' : 'matches'}
                  </Text>
                </View>

                <View style={styles.formGuideRow}>
                  {recentForm.map((result, idx) => (
                    <View
                      key={`${result}-${idx}`}
                      style={[
                        styles.formCircle,
                        result === 'W' && styles.formCircleWin,
                        result === 'D' && styles.formCircleDraw,
                        result === 'L' && styles.formCircleLoss,
                      ]}
                    >
                      <Text style={styles.formCircleText}>{result}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Next Match Quick Card (Preserved working navigation & layout) */}
            {nextMatch && (
              <View style={styles.sectionCard}>
                <View style={styles.formHeaderRow}>
                  <Text style={styles.cardHeaderTitleNoMargin}>
                    {nextMatch.status === 'LIVE' ? 'Live Match' : 'Next Match'}
                  </Text>
                  <TouchableOpacity onPress={() => setActiveTab('fixtures')} activeOpacity={0.7}>
                    <Text style={styles.viewFixturesLink}>All fixtures</Text>
                  </TouchableOpacity>
                </View>
                {renderFixtureRow(nextMatch)}
              </View>
            )}

            {/* Redesigned Team Information Card (Zero duplicate Sport row; circular flag & abbreviation) */}
            <InfoRowCard
              title="Team Information"
              rows={(() => {
                const items: InfoRowItem[] = [];
                const teamAbbr =
                  details?.abbreviation ||
                  (resolvedTeam.shortName &&
                  resolvedTeam.shortName.length >= 2 &&
                  resolvedTeam.shortName.length <= 6 &&
                  resolvedTeam.shortName.toUpperCase() !== resolvedTeam.name.toUpperCase()
                    ? resolvedTeam.shortName.toUpperCase()
                    : undefined);

                if (venue) {
                  items.push({
                    key: 'stadium',
                    label: 'Home Stadium',
                    value: venue,
                    icon: MapPin,
                    iconBg: 'rgba(118, 80, 246, 0.16)',
                    iconColor: '#A58BFC',
                  });
                }

                if (country) {
                  items.push({
                    key: 'country',
                    label: 'Country / Federation',
                    value: country,
                    icon: Globe,
                    iconBg: 'rgba(56, 189, 248, 0.14)',
                    iconColor: '#38BDF8',
                    customValueLeading: <CircularCountryFlag country={country} size={20} />,
                  });
                }

                if (competitionName) {
                  items.push({
                    key: 'competition',
                    label: 'Competition',
                    value: competitionName,
                    icon: Trophy,
                    iconBg: 'rgba(245, 158, 11, 0.14)',
                    iconColor: '#F59E0B',
                    valueColor: '#A58BFC',
                    onPress: handleOpenCompetition,
                  });
                }

                if (teamAbbr) {
                  items.push({
                    key: 'abbr',
                    label: 'Short Abbreviation',
                    value: teamAbbr,
                    icon: Hash,
                    iconBg: 'rgba(34, 197, 94, 0.14)',
                    iconColor: '#22C55E',
                  });
                }

                if (details?.standingSummary) {
                  items.push({
                    key: 'standing',
                    label: 'League Standing',
                    value: details.standingSummary,
                    icon: Award,
                    iconBg: 'rgba(236, 72, 153, 0.14)',
                    iconColor: '#F472B6',
                  });
                }

                if (details?.recordSummary) {
                  items.push({
                    key: 'record',
                    label: 'Season Record',
                    value: details.recordSummary,
                    icon: Activity,
                    iconBg: 'rgba(165, 139, 252, 0.14)',
                    iconColor: '#A58BFC',
                  });
                }

                return items;
              })()}
            />
          </View>
        )}

        {/* TAB 2: FIXTURES */}
        {activeTab === 'fixtures' && (
          <View style={styles.tabSection}>
            {isLoading && totalFixtures === 0 ? (
              <View style={styles.loadingCard}>
                <ActivityIndicator size="small" color="#7952FC" />
                <Text style={styles.loadingText}>Fetching fixtures & results...</Text>
              </View>
            ) : totalFixtures === 0 ? (
              <View style={styles.sectionCard}>
                <Text style={styles.emptyStateTitle}>No fixtures available right now</Text>
                <Text style={styles.emptyStateDesc}>
                  Upcoming schedule entries and recent results for {resolvedTeam.name} will appear here once published.
                </Text>
              </View>
            ) : (
              <>
                {liveAndUpcoming.length > 0 && (
                  <View style={styles.fixturesGroup}>
                    <Text style={styles.groupHeading}>Live & Upcoming</Text>
                    {liveAndUpcoming.map(renderFixtureRow)}
                  </View>
                )}

                {recentResults.length > 0 && (
                  <View style={styles.fixturesGroup}>
                    <Text style={styles.groupHeading}>Recent Results</Text>
                    {recentResults.map(renderFixtureRow)}
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
  crestFlatContainer: {
    width: 76,
    height: 76,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
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
    minWidth: 154,
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
  sectionCard: {
    backgroundColor: '#161224',
    borderRadius: 18,
    padding: 16,
  },
  cardHeaderTitleNoMargin: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  formHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  formSubLabel: {
    fontSize: 12,
    color: '#8E86A8',
    fontWeight: '500',
  },
  viewFixturesLink: {
    fontSize: 12.5,
    color: '#A58BFC',
    fontWeight: '600',
  },
  formGuideRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  formCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formCircleWin: {
    backgroundColor: '#16A34A',
  },
  formCircleDraw: {
    backgroundColor: '#D97706',
  },
  formCircleLoss: {
    backgroundColor: '#DC2626',
  },
  formCircleText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  fixturesGroup: {
    marginBottom: 8,
  },
  groupHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  fixtureRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161224',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginBottom: 10,
  },
  fixtureCrest: {
    marginRight: 12,
  },
  fixtureInfoCol: {
    flex: 1,
    marginRight: 10,
  },
  fixtureOpponentName: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 3,
  },
  fixtureMetaText: {
    fontSize: 12,
    color: '#8E86A8',
    fontWeight: '500',
  },
  fixtureRightCol: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    minWidth: 62,
  },
  liveScoreText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#EF4444',
    marginBottom: 4,
  },
  liveStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.16)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#EF4444',
  },
  liveStatusText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#EF4444',
  },
  ftScoreText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  resultTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  resultTagWin: {
    backgroundColor: '#16A34A',
  },
  resultTagDraw: {
    backgroundColor: '#D97706',
  },
  resultTagLoss: {
    backgroundColor: '#DC2626',
  },
  resultTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  timeBadge: {
    backgroundColor: '#221C35',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  timeBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B8B0CF',
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

export default TeamDetailsScreen;
