import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import Colors from '../../theme/colors';
import { COMPETITION_CATEGORIES } from '../../constants/mockData';
import { CompetitionLogo } from '../../components/common/CompetitionLogo';
import { findCompetitionById } from '../../navigation/navHelpers';
import { useAppNavigation } from '../../navigation/NavigationContext';

interface CompetitionCategoriesProps {
  selectedCategoryId: string | null;
  onSelectCategory?: (categoryId: string | null) => void;
}

export const CompetitionCategories: React.FC<CompetitionCategoriesProps> = ({
  selectedCategoryId,
  onSelectCategory,
}) => {
  const { navigate } = useAppNavigation();

  const handleCategoryPress = (categoryId: string) => {
    if (onSelectCategory) {
      onSelectCategory(categoryId === selectedCategoryId ? null : categoryId);
    }
    const comp = findCompetitionById(categoryId);
    if (comp) {
      navigate({
        name: 'CompetitionDetails',
        params: { competition: comp },
      });
    }
  };

  return (
    <View style={styles.container}>
      {/* ── SECTION TITLE: Categories ── */}
      <Text style={styles.sectionTitle}>Categories</Text>

      {/* ── HORIZONTAL ROW OF CIRCULAR WHITE LOGO CONTAINERS ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {COMPETITION_CATEGORIES.map(category => {
          const isSelected = selectedCategoryId === category.id;

          return (
            <TouchableOpacity
              key={category.id}
              style={styles.categoryItem}
              onPress={() => handleCategoryPress(category.id)}
              activeOpacity={0.75}
              accessibilityLabel={`${category.name} category`}
              accessibilityRole="button"
            >
              {/* Circular White Emblem Container */}
              <View style={[styles.logoWrapper, isSelected && styles.logoWrapperSelected]}>
                <CompetitionLogo
                  competitionId={category.id}
                  size={52}
                />
              </View>

              {/* Label */}
              <Text
                style={[
                  styles.categoryLabel,
                  isSelected && styles.categoryLabelSelected,
                ]}
                numberOfLines={1}
              >
                {category.shortLabel}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 22,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    paddingHorizontal: 20,
    marginBottom: 14,
    letterSpacing: -0.3,
  },
  scrollContent: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minWidth: '100%',
  },
  categoryItem: {
    alignItems: 'center',
    marginHorizontal: 8,
    width: 62,
  },
  logoWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  logoWrapperSelected: {
    borderWidth: 2,
    borderColor: '#7952FC',
    borderRadius: 28,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  categoryLabelSelected: {
    color: '#ECE9FA',
    fontWeight: '700',
  },
});

export default CompetitionCategories;
