import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  ImageSourcePropType,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../../theme/colors';

interface CategoryTile {
  id: string;
  label: string;
  name: string;
  image: ImageSourcePropType;
  gradient: [string, string];
}

const CATEGORY_TILES: CategoryTile[] = [
  {
    id: 'all',
    label: 'ALL',
    name: 'All Sports',
    image: require('../../../assets/categories/all.png'),
    gradient: ['#7952FC', '#4C1D95'],
  },
  {
    id: 'football',
    label: 'FOOTBALL',
    name: 'Football / Soccer',
    image: require('../../../assets/categories/football.png'),
    gradient: ['#059669', '#064E3B'],
  },
  {
    id: 'pl',
    label: 'EPL',
    name: 'Premier League',
    image: require('../../../assets/categories/premier_league.png'),
    gradient: ['#38003C', '#200022'],
  },
  {
    id: 'ucl',
    label: 'UCL',
    name: 'Champions League',
    image: require('../../../assets/categories/champions_league.png'),
    gradient: ['#0A2568', '#030E26'],
  },
  {
    id: 'nfl',
    label: 'NFL',
    name: 'American Football',
    image: require('../../../assets/categories/nfl.png'),
    gradient: ['#0D47A1', '#01214D'],
  },
  {
    id: 'nba',
    label: 'NBA',
    name: 'Basketball',
    image: require('../../../assets/categories/nba.png'),
    gradient: ['#1D428A', '#0F234B'],
  },
  {
    id: 'nhl',
    label: 'NHL',
    name: 'Ice Hockey',
    image: require('../../../assets/categories/nhl.png'),
    gradient: ['#27272A', '#09090B'],
  },
  {
    id: 'mma',
    label: 'UFC',
    name: 'MMA / UFC',
    image: require('../../../assets/categories/ufc.png'),
    gradient: ['#B91C1C', '#450A0A'],
  },
  {
    id: 'motorsport',
    label: 'F1',
    name: 'Formula 1 & Motorsport',
    image: require('../../../assets/categories/f1.png'),
    gradient: ['#DC2626', '#7F1D1D'],
  },
  {
    id: 'tennis',
    label: 'TENNIS',
    name: 'Tennis',
    image: require('../../../assets/categories/tennis.png'),
    gradient: ['#0D9488', '#115E59'],
  },
];

interface CompetitionCategoriesProps {
  selectedCategoryId: string | null;
  onSelectCategory?: (categoryId: string | null) => void;
}

export const CompetitionCategories: React.FC<CompetitionCategoriesProps> = ({
  selectedCategoryId,
  onSelectCategory,
}) => {
  const handleCategoryPress = (categoryId: string) => {
    if (!onSelectCategory) return;
    if (categoryId === 'all') {
      onSelectCategory(null);
    } else if (selectedCategoryId === categoryId) {
      onSelectCategory(null);
    } else {
      onSelectCategory(categoryId);
    }
  };

  return (
    <View style={styles.container}>
      {/* ── SECTION TITLE ── */}
      <Text style={styles.sectionTitle}>Categories</Text>

      {/* ── HORIZONTALLY SCROLLABLE RECTANGULAR TILES ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {CATEGORY_TILES.map(cat => {
          const isSelected =
            selectedCategoryId === cat.id || (!selectedCategoryId && cat.id === 'all');
          const isDimmed = Boolean(selectedCategoryId && selectedCategoryId !== cat.id);

          return (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.tileWrapper,
                isSelected && styles.tileWrapperSelected,
                isDimmed && styles.tileWrapperDimmed,
              ]}
              onPress={() => handleCategoryPress(cat.id)}
              activeOpacity={0.82}
              accessibilityLabel={`${cat.name} category`}
              accessibilityRole="button"
            >
              <LinearGradient
                colors={cat.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.gradientContainer}
              >
                {/* Active Indicator Top Strip */}
                {isSelected && <View style={styles.activeTopIndicator} />}

                {/* Centered Brand Emblem */}
                <View style={styles.emblemContainer}>
                  <Image
                    source={cat.image}
                    style={styles.emblemImage}
                    resizeMode="contain"
                  />
                </View>

                {/* Embedded Bottom Label */}
                <View style={styles.labelContainer}>
                  <Text style={styles.labelText} numberOfLines={1}>
                    {cat.label}
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    paddingHorizontal: 20,
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  scrollContent: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tileWrapper: {
    width: 56,
    height: 136,
    borderRadius: 14,
    marginRight: 10,
    overflow: 'hidden',
    backgroundColor: '#18181B',
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  tileWrapperSelected: {
    transform: [{ scale: 1.03 }],
    elevation: 6,
    shadowOpacity: 0.38,
  },
  tileWrapperDimmed: {
    opacity: 0.65,
  },
  gradientContainer: {
    flex: 1,
    borderRadius: 14,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 4,
  },
  activeTopIndicator: {
    position: 'absolute',
    top: 0,
    left: 10,
    right: 10,
    height: 3,
    backgroundColor: '#ECE9FA',
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  emblemContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  emblemImage: {
    width: 42,
    height: 54,
  },
  labelContainer: {
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.42)',
    paddingVertical: 5,
    paddingHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
  },
  labelText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.4,
  },
});

export default CompetitionCategories;
