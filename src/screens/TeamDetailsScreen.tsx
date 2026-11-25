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
  ChevronRight,
} from 'lucide-react-native';
import { ExtendedHeroHeader, HeroStickyTopBar } from '../components/common/ExtendedHeroHeader';
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
          metaComponent={
            venue || country ? (
              <View style={styles.metaRow}>
                {venue ? (
                  <View style={styles.metaItem}>
                    <MapPin size={13} color="#D5CFE6" strokeWidth={2} />
                    <Text style={styles.metaText} numberOfLines={1}>{venue}</Text>
                  </View>
                ) : null}
                {venue && country ? <View style={styles.metaSpacer} /> : null}
                {country ? (
                  <View style={styles.metaItem}>
                    <Trophy size={13} color="#D5CFE6" strokeWidth={2} />
                    <Text style={styles.metaText} numberOfLines={1}>{country}</Text>
                  </View>
                ) : null}
              </View>
            ) : null
          }
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

        {/* Two-Tab Segmented Control (Overview | Fixtures) */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.tabButton, activeTab === 'overview' && styles.tabButtonActive]}
            onPress={() => setActiveTab('overview')}
          >
            <Text style={[styles.tabText, activeTab === 'overview' && styles.tabTextActive]}>
              Overview
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.tabButton, activeTab === 'fixtures' && styles.tabButtonActive]}
            onPress={() => setActiveTab('fixtures')}
          >
            <Text style={[styles.tabText, activeTab === 'fixtures' && styles.tabTextActive]}>
              Fixtures ({totalFixtures})
            </Text>
          </TouchableOpacity>
        </View>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <View style={styles.tabSection}>
            {isLoading && recentForm.length === 0 && totalFixtures === 0 ? (
              <View style={styles.loadingCard}>
                <ActivityIndicator size="small" color="#7952FC" />
                <Text style={styles.loadingText}>Loading live team profile & schedule...</Text>
              </View>
            ) : null}

            {/* Recent Form (Genuine completed results only) */}
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
                      <Text
                        style={[
                          styles.formCircleText,
                          result === 'W' && styles.formTextWin,
                          result === 'D' && styles.formTextDraw,
                          result === 'L' && styles.formTextLoss,
                        ]}
                      >
                        {result}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Next Match Quick Card (When an upcoming or live fixture is available) */}
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

            {/* Club / Franchise Information (Real metadata only) */}
            <View style={styles.sectionCard}>
              <Text style={styles.cardHeaderTitle}>Club Information</Text>

              {venue ? (
                <View style={styles.infoLine}>
                  <Text style={styles.infoKey}>Home Stadium</Text>
                  <Text style={styles.infoVal} numberOfLines={1}>{venue}</Text>
                </View>
              ) : null}

              {country ? (
                <View style={styles.infoLine}>
                  <Text style={styles.infoKey}>Country / Federation</Text>
                  <Text style={styles.infoVal} numberOfLines={1}>{country}</Text>
                </View>
              ) : null}

              {competitionName ? (
                <TouchableOpacity
                  activeOpacity={0.75}
                  style={styles.infoLine}
                  onPress={handleOpenCompetition}
                >
                  <Text style={styles.infoKey}>Competition</Text>
                  <View style={styles.infoLinkWrap}>
                    <Text style={[styles.infoVal, { color: '#A58BFC' }]} numberOfLines={1}>
                      {competitionName}
                    </Text>
                    <ChevronRight size={14} color="#A58BFC" />
                  </View>
                </TouchableOpacity>
              ) : null}

              {details?.standingSummary ? (
                <View style={styles.infoLine}>
                  <Text style={styles.infoKey}>League Standing</Text>
                  <Text style={styles.infoVal} numberOfLines={1}>{details.standingSummary}</Text>
                </View>
              ) : null}

              {details?.recordSummary ? (
                <View style={styles.infoLine}>
                  <Text style={styles.infoKey}>Record</Text>
                  <Text style={styles.infoVal} numberOfLines={1}>{details.recordSummary}</Text>
                </View>
              ) : null}

              <View style={[styles.infoLine, styles.infoLineLast]}>
                <Text style={styles.infoKey}>Sport</Text>
                <Text style={styles.infoVal}>{sportLabel}</Text>
              </View>
            </View>
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
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    maxWidth: 180,
  },
  metaText: {
    fontSize: 12.5,
    color: '#E2DDF2',
    fontWeight: '600',
  },
  metaSpacer: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#9E92C2',
  },
  heroFollowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderRadius: 24,
    backgroundColor: '#7952FC',
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
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#161224',
    borderRadius: 16,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 11,
    alignItems: 'center',
    borderRadius: 12,
  },
  tabButtonActive: {
    backgroundColor: '#251E38',
  },
  tabText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#8E86A8',
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
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
  cardHeaderTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
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
  formTextWin: {
    color: '#FFFFFF',
  },
  formTextDraw: {
    color: '#FFFFFF',
  },
  formTextLoss: {
    color: '#FFFFFF',
  },
  infoLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    gap: 12,
  },
  infoLineLast: {
    borderBottomWidth: 0,
    paddingBottom: 2,
  },
  infoKey: {
    fontSize: 13,
    color: '#8E86A8',
    fontWeight: '500',
  },
  infoVal: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'right',
    flexShrink: 1,
  },
  infoLinkWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 1,
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
