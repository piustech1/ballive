import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Search, Plus, Check } from 'lucide-react-native';
import { SecondaryScreenHeader } from '../components/common/SecondaryScreenHeader';
import { POPULAR_TEAMS, PopularTeam } from '../constants/discoverData';
import { TeamCrest } from '../components/common/TeamCrest';
import { useProfile } from '../hooks/useProfile';
import { useAppNavigation } from '../navigation/NavigationContext';
import { popularTeamsService } from '../services/popularTeamsService';

export const AllTeamsScreen: React.FC = () => {
  const { navigate } = useAppNavigation();
  const { isTeamFollowed, toggleFollowTeam } = useProfile();
  const [searchQuery, setSearchQuery] = useState('');
  const [teams, setTeams] = useState<PopularTeam[]>(() =>
    popularTeamsService.getCachedPopularTeams()
  );

  useEffect(() => {
    let mounted = true;
    popularTeamsService
      .getPopularTeams()
      .then(res => {
        if (mounted && res && res.length > 0) setTeams(res);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const pool = teams.length > 0 ? teams : POPULAR_TEAMS;
  const q = searchQuery.toLowerCase();
  const filtered = pool.filter(
    t =>
      t.name.toLowerCase().includes(q) ||
      t.country.toLowerCase().includes(q) ||
      (t.stadium || '').toLowerCase().includes(q) ||
      (t.competitionName || '').toLowerCase().includes(q) ||
      (t.domesticTitle || '').toLowerCase().includes(q)
  );

  return (
    <View style={styles.root}>
      {/* Top App Bar */}
      <SecondaryScreenHeader
        title="Popular Teams"
        subtitle={`${pool.length} Featured Teams & Clubs`}
      />

      {/* Search Input Box */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Search size={16} color="#A098B5" strokeWidth={2.2} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search teams, clubs or leagues..."
            placeholderTextColor="#6D6582"
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
        </View>
      </View>

      {/* Teams List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.resultsCount}>
          {filtered.length} {filtered.length === 1 ? 'Team' : 'Teams'}
        </Text>

        {filtered.map(team => {
          const isFollowed = isTeamFollowed(team);
          const primarySub = team.stadium
            ? `${team.stadium} • ${team.country}`
            : team.competitionName
            ? `${team.competitionName} • ${team.country}`
            : team.country;
          const secondarySub = team.competitionName && team.stadium
            ? team.competitionName
            : team.domesticTitle;

          return (
            <TouchableOpacity
              key={team.id}
              activeOpacity={0.8}
              style={styles.teamCard}
              onPress={() => {
                navigate({
                  name: 'TeamDetails',
                  params: { team },
                });
              }}
            >
              <TeamCrest
                uri={team.crestUrl}
                teamName={team.name}
                size={42}
                containerStyle={styles.crestFlatContainer}
              />

              <View style={styles.infoWrapper}>
                <Text style={styles.teamName} numberOfLines={1}>
                  {team.name}
                </Text>
                <Text style={styles.teamStadium} numberOfLines={1}>
                  {primarySub}
                </Text>
                {secondarySub ? (
                  <Text style={styles.teamTitle} numberOfLines={1}>
                    {secondarySub}
                  </Text>
                ) : null}
              </View>

              <TouchableOpacity
                activeOpacity={0.75}
                style={[styles.followBtn, isFollowed && styles.followBtnActive]}
                onPress={e => {
                  e.stopPropagation();
                  toggleFollowTeam(team);
                }}
              >
                {isFollowed ? (
                  <Check size={14} color="#FFFFFF" strokeWidth={2.5} />
                ) : (
                  <Plus size={14} color="#FFFFFF" strokeWidth={2.5} />
                )}
                <Text style={styles.followBtnText}>{isFollowed ? 'Following' : 'Follow'}</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0E0D14',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#1E1730',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2A2045',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
  },
  searchContainer: {
    height: 44,
    borderRadius: 12,
    backgroundColor: '#1E1730',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
    gap: 10,
  },
  resultsCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#A098B5',
    marginBottom: 4,
  },
  teamCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1730',
    borderRadius: 16,
    padding: 14,
  },
  crestFlatContainer: {
    width: 44,
    height: 44,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  infoWrapper: {
    flex: 1,
    marginRight: 8,
  },
  teamName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  teamStadium: {
    fontSize: 11.5,
    color: '#7952FC',
    fontWeight: '600',
    marginBottom: 2,
  },
  teamTitle: {
    fontSize: 11,
    color: '#A098B5',
  },
  followBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#7952FC',
  },
  followBtnActive: {
    backgroundColor: '#382565',
  },
  followBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
