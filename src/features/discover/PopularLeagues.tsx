import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import Colors from '../../theme/colors';
import { PopularLeague } from '../../constants/discoverData';

interface PopularLeaguesProps {
  leagues: PopularLeague[];
  onViewAllPress?: () => void;
  onLeaguePress: (league: PopularLeague) => void;
}

export const PopularLeagues: React.FC<PopularLeaguesProps> = ({
  leagues,
  onViewAllPress,
  onLeaguePress,
}) => {
  return (
    <View style={styles.sectionContainer}>
      {/* ── SECTION HEADER ── */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Popular leagues</Text>
        <TouchableOpacity
          onPress={onViewAllPress}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.viewAllText}>View all</Text>
        </TouchableOpacity>
      </View>

      {/* ── VERTICAL LEAGUES LIST ── */}
      <View style={styles.listContainer}>
        {leagues.map((league, index) => {
          const isLast = index === leagues.length - 1;

          return (
            <TouchableOpacity
              key={league.id}
              style={[styles.row, !isLast && styles.rowBorder]}
              activeOpacity={0.75}
              onPress={() => onLeaguePress(league)}
              accessibilityRole="button"
              accessibilityLabel={`${league.name}, ${league.country}`}
            >
              {/* League Crest Icon */}
              <View style={styles.iconWrapper}>
                <Image
                  source={{ uri: league.logoUrl }}
                  style={styles.leagueIcon}
                  resizeMode="contain"
                />
              </View>

              {/* League Info */}
              <View style={styles.infoCol}>
                <View style={styles.titleRow}>
                  <Text style={styles.leagueName}>{league.name}</Text>
                  <Text style={styles.countryBadge}>• {league.country}</Text>
                </View>
                <Text style={styles.descriptionText} numberOfLines={1}>
                  {league.description}
                </Text>
              </View>

              {/* Navigation Chevron */}
              <View style={styles.chevronWrapper}>
                <ChevronRight size={18} color={Colors.textMuted} strokeWidth={2.2} />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 26,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  viewAllText: {
    fontSize: 14,
    color: Colors.categoryPremierLeague,
    fontWeight: '600',
  },
  listContainer: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: 20,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  iconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
    marginRight: 14,
  },
  leagueIcon: {
    width: '100%',
    height: '100%',
  },
  infoCol: {
    flex: 1,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  leagueName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  countryBadge: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  descriptionText: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  chevronWrapper: {
    marginLeft: 8,
  },
});
