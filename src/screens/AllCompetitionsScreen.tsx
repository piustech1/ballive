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
import { Search, ChevronRight, Trophy } from 'lucide-react-native';
import Colors from '../theme/colors';
import { SecondaryScreenHeader } from '../components/common/SecondaryScreenHeader';
import { CompetitionLogo } from '../components/common/CompetitionLogo';
import { EXPLORE_COMPETITIONS, DiscoverCompetition } from '../constants/discoverData';
import { FEATURED_COMPETITIONS } from '../constants/mockData';
import { useAppNavigation } from '../navigation/NavigationContext';

export const AllCompetitionsScreen: React.FC = () => {
  const { navigate } = useAppNavigation();
  const [searchQuery, setSearchQuery] = useState('');

  // Combine explore and featured competitions
  const allCompetitions: DiscoverCompetition[] = [
    ...EXPLORE_COMPETITIONS,
    ...FEATURED_COMPETITIONS.filter(
      fc => !EXPLORE_COMPETITIONS.some(ec => ec.id === fc.id || ec.name.toLowerCase() === fc.name.toLowerCase())
    ).map(fc => ({
      id: fc.id,
      name: fc.name,
      shortName: fc.name.split(' ')[0],
      country: fc.country,
      region: 'Europe',
      logoUrl: fc.crestUrl,
      accentColor: '#7952FC',
      season: fc.season,
      teamsCount: fc.matchesCount * 2,
    })),
  ];

  const filtered = allCompetitions.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.region.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.root}>
      {/* Top App Bar */}
      <SecondaryScreenHeader
        title="All Competitions"
        subtitle={`${allCompetitions.length} Global Tournaments`}
      />

      {/* Search Input Box */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Search size={16} color="#A098B5" strokeWidth={2.2} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search competitions or regions..."
            placeholderTextColor="#6D6582"
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
        </View>
      </View>

      {/* Competitions List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.resultsCount}>
          {filtered.length} {filtered.length === 1 ? 'Competition' : 'Competitions'} Available
        </Text>

        {filtered.map(comp => (
          <TouchableOpacity
            key={comp.id}
            activeOpacity={0.8}
            style={styles.compCard}
            onPress={() => {
              navigate({
                name: 'CompetitionDetails',
                params: { competition: comp },
              });
            }}
          >
            <CompetitionLogo
              uri={comp.logoUrl}
              competitionId={comp.id}
              size={48}
              containerStyle={{ marginRight: 14 }}
            />

            <View style={styles.infoWrapper}>
              <Text style={styles.compName} numberOfLines={1}>
                {comp.name}
              </Text>
              <Text style={styles.compSub}>
                {comp.region} • {comp.season}
              </Text>
              <Text style={styles.compTeams}>{comp.teamsCount} Teams competing</Text>
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
  compCard: {
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
  compName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  compSub: {
    fontSize: 11.5,
    color: '#A098B5',
    marginBottom: 2,
  },
  compTeams: {
    fontSize: 11,
    color: '#7952FC',
    fontWeight: '600',
  },
  chevronBox: {
    paddingLeft: 8,
  },
});
