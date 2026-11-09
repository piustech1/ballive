import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import { Search, Plus, Check } from 'lucide-react-native';
import Colors from '../theme/colors';
import { SecondaryScreenHeader } from '../components/common/SecondaryScreenHeader';
import { POPULAR_TEAMS, PopularTeam } from '../constants/discoverData';
import { useProfile } from '../hooks/useProfile';
import { useAppNavigation } from '../navigation/NavigationContext';

export const AllTeamsScreen: React.FC = () => {
  const { navigate } = useAppNavigation();
  const { profile, toggleFollowTeam } = useProfile();
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = POPULAR_TEAMS.filter(
    t =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.stadium.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.domesticTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.root}>
      {/* Top App Bar */}
      <SecondaryScreenHeader
        title="Popular Clubs"
        subtitle={`${POPULAR_TEAMS.length} Elite Football Teams`}
      />

      {/* Search Input Box */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Search size={16} color="#A098B5" strokeWidth={2.2} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search football clubs..."
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
          {filtered.length} World-Class {filtered.length === 1 ? 'Club' : 'Clubs'}
        </Text>

        {filtered.map(team => {
          const isFollowed = profile.followedTeamIds.includes(team.id);

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
              <View style={styles.crestWrapper}>
                <Image source={{ uri: team.crestUrl }} style={styles.crestImage} />
              </View>

              <View style={styles.infoWrapper}>
                <Text style={styles.teamName} numberOfLines={1}>
                  {team.name}
                </Text>
                <Text style={styles.teamStadium} numberOfLines={1}>
                  {team.stadium} • {team.country}
                </Text>
                <Text style={styles.teamTitle} numberOfLines={1}>
                  {team.domesticTitle}
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.75}
                style={[styles.followBtn, isFollowed && styles.followBtnActive]}
                onPress={e => {
                  e.stopPropagation();
                  toggleFollowTeam(team.id);
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
  crestWrapper: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#181524',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  crestImage: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
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
