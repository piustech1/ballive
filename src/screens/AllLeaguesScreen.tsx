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
import { Search, ChevronRight } from 'lucide-react-native';
import Colors from '../theme/colors';
import { SecondaryScreenHeader } from '../components/common/SecondaryScreenHeader';
import { POPULAR_LEAGUES, PopularLeague } from '../constants/discoverData';
import { useAppNavigation } from '../navigation/NavigationContext';

export const AllLeaguesScreen: React.FC = () => {
  const { navigate } = useAppNavigation();
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = POPULAR_LEAGUES.filter(
    l =>
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.root}>
      {/* Top App Bar */}
      <SecondaryScreenHeader
        title="Popular Leagues"
        subtitle={`${POPULAR_LEAGUES.length} Domestic Competitions`}
      />

      {/* Search Input Box */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Search size={16} color="#A098B5" strokeWidth={2.2} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search domestic leagues..."
            placeholderTextColor="#6D6582"
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
        </View>
      </View>

      {/* Leagues List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.resultsCount}>
          {filtered.length} Top Flight {filtered.length === 1 ? 'League' : 'Leagues'}
        </Text>

        {filtered.map(league => (
          <TouchableOpacity
            key={league.id}
            activeOpacity={0.8}
            style={styles.leagueCard}
            onPress={() => {
              navigate({
                name: 'CompetitionDetails',
                params: { competition: league },
              });
            }}
          >
            <View style={styles.emblemWrapper}>
              <Image source={{ uri: league.logoUrl }} style={styles.emblemImage} />
            </View>

            <View style={styles.infoWrapper}>
              <Text style={styles.leagueName} numberOfLines={1}>
                {league.name}
              </Text>
              <Text style={styles.leagueCountry}>
                {league.country} • {league.currentMatchweek}
              </Text>
              <Text style={styles.leagueDesc} numberOfLines={1}>
                {league.description}
              </Text>
            </View>

            <View style={styles.chevronBox}>
              <ChevronRight size={18} color="#7952FC" strokeWidth={2.4} />
            </View>
          </TouchableOpacity>
        ))}
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
  leagueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1730',
    borderRadius: 16,
    padding: 14,
  },
  emblemWrapper: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#181524',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  emblemImage: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
  },
  infoWrapper: {
    flex: 1,
  },
  leagueName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  leagueCountry: {
    fontSize: 11.5,
    color: '#7952FC',
    fontWeight: '600',
    marginBottom: 2,
  },
  leagueDesc: {
    fontSize: 11,
    color: '#A098B5',
  },
  chevronBox: {
    paddingLeft: 8,
  },
});
