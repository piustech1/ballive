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
import Colors from '../../theme/colors';

interface CategoryTile {
  id: string;
  label: string;
  name: string;
  image: ImageSourcePropType;
}

const CATEGORY_TILES: CategoryTile[] = [
  {
    id: 'all',
    label: 'All',
    name: 'All Sports',
    image: require('../../../assets/categories/all.png'),
  },
  {
    id: 'football',
    label: 'Football',
    name: 'Football / Soccer',
    image: require('../../../assets/categories/football.png'),
  },
  {
    id: 'pl',
    label: 'EPL',
    name: 'Premier League',
    image: require('../../../assets/categories/premier_league.png'),
  },
  {
    id: 'ucl',
    label: 'UCL',
    name: 'Champions League',
    image: require('../../../assets/categories/champions_league.png'),
  },
  {
    id: 'nfl',
    label: 'NFL',
    name: 'American Football',
    image: require('../../../assets/categories/nfl.png'),
  },
  {
    id: 'nba',
    label: 'NBA',
    name: 'Basketball',
    image: require('../../../assets/categories/nba.png'),
  },
  {
    id: 'nhl',
    label: 'NHL',
    name: 'Ice Hockey',
    image: require('../../../assets/categories/nhl.png'),
  },
  {
    id: 'mma',
    label: 'UFC',
    name: 'MMA / UFC',
    image: require('../../../assets/categories/ufc.png'),
  },
  {
    id: 'motorsport',
    label: 'F1',
    name: 'Formula 1 & Motorsport',
    image: require('../../../assets/categories/f1.png'),
  },
  {
    id: 'tennis',
    label: 'Tennis',
    name: 'Tennis',
    image: require('../../../assets/categories/tennis.png'),
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

      {/* ── HORIZONTALLY SCROLLABLE LANDSCAPE TILES ── */}
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
              {/* Full Tile Branded Image Artwork */}
              <Image
                source={cat.image}
                style={styles.bannerImage}
                resizeMode="cover"
              />

              {/* Active Selection Border */}
              {isSelected && <View style={styles.activeSelectionBorder} />}

              {/* Embedded Concise Category Label */}
              <View style={styles.labelContainer}>
                <Text
                  style={[styles.labelText, isSelected && styles.labelTextSelected]}
                  numberOfLines={1}
                >
                  {cat.label}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 18,
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
    width: 152,
    height: 58,
    borderRadius: 12,
    marginRight: 10,
    overflow: 'hidden',
    backgroundColor: '#1E1730',
    position: 'relative',
    elevation: 3,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  tileWrapperSelected: {
    elevation: 6,
    shadowOpacity: 0.42,
    shadowRadius: 6,
    transform: [{ scale: 1.02 }],
  },
  tileWrapperDimmed: {
    opacity: 0.6,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  activeSelectionBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#7952FC',
  },
  labelContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.58)',
    paddingVertical: 3,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  labelText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#ECE9FA',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  labelTextSelected: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
});

export default CompetitionCategories;
