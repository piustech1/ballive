import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import Colors from '../../theme/colors';
import { DiscoverMatchup } from '../../constants/discoverData';
import { useAppNavigation } from '../../navigation/NavigationContext';
import { UniversalMatchCard } from '../../components/common/UniversalMatchCard';

interface MatchOfTheDayTickerProps {
  match?: DiscoverMatchup | null;
}

export const MatchOfTheDayTicker: React.FC<MatchOfTheDayTickerProps> = ({ match }) => {
  const { navigate } = useAppNavigation();

  if (!match) return null;

  return (
    <View style={styles.container}>
      {/* ── SECTION HEADER ── */}
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <Sparkles size={15} color="#7952FC" strokeWidth={2.4} style={{ marginRight: 6 }} />
          <Text style={styles.sectionTitle}>Match of the day</Text>
        </View>
        <View style={styles.featuredBadge}>
          <Text style={styles.featuredBadgeText}>FEATURED</Text>
        </View>
      </View>

      {/* ── UNIVERSAL FEATURED MATCH CARD (SPORT ARTWORK, SOLID SURFACE) ── */}
      <UniversalMatchCard
        match={match}
        layout="featured"
        onPress={() => {
          navigate({
            name: 'LiveStreamDetails',
            params: { match },
          });
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  featuredBadge: {
    backgroundColor: 'rgba(121, 82, 252, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(121, 82, 252, 0.3)',
  },
  featuredBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#A5B4FC',
    letterSpacing: 0.5,
  },
});

export default MatchOfTheDayTicker;
