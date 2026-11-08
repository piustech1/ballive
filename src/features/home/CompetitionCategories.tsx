import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import {
  Trophy,
  Award,
  Shield,
  Flame,
  Radio,
} from 'lucide-react-native';
import Colors from '../../theme/colors';
import { COMPETITION_CATEGORIES, CompetitionCategory } from '../../constants/mockData';

interface CompetitionCategoriesProps {
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

export const CompetitionCategories: React.FC<CompetitionCategoriesProps> = ({
  selectedCategoryId,
  onSelectCategory,
}) => {
  const renderIcon = (iconName: CompetitionCategory['iconName']) => {
    const size = 26;
    const strokeWidth = 2;
    const color = '#FFFFFF';

    switch (iconName) {
      case 'trophy':
        return <Trophy size={size} color={color} strokeWidth={strokeWidth} />;
      case 'award':
        return <Award size={size} color="#1A1528" strokeWidth={strokeWidth} />;
      case 'shield':
        return <Shield size={size} color={color} strokeWidth={strokeWidth} />;
      case 'flame':
        return <Flame size={size} color={color} strokeWidth={strokeWidth} />;
      case 'radio':
        return <Radio size={size} color={color} strokeWidth={strokeWidth} />;
      default:
        return <Trophy size={size} color={color} strokeWidth={strokeWidth} />;
    }
  };

  return (
    <View style={styles.container}>
      {/* ── SECTION TITLE: Categories ── */}
      <Text style={styles.sectionTitle}>Categories</Text>

      {/* ── HORIZONTAL ROW OF CIRCULAR COLORED ICONS ── */}
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
              onPress={() => onSelectCategory(isSelected ? null : category.id)}
              activeOpacity={0.75}
              accessibilityLabel={category.name}
              accessibilityRole="button"
            >
              {/* Circular Colored Icon Badge */}
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: category.color },
                  isSelected && styles.iconCircleSelected,
                ]}
              >
                {renderIcon(category.iconName)}
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
    marginTop: 24,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    paddingHorizontal: 20,
    marginBottom: 16,
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
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  iconCircleSelected: {
    transform: [{ scale: 1.08 }],
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
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
