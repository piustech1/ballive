import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, LucideIcon } from 'lucide-react-native';
import Colors from '../../theme/colors';
import { useAppNavigation } from '../../navigation/NavigationContext';

export interface HeaderAction {
  icon: LucideIcon;
  onPress: () => void;
  active?: boolean;
  activeColor?: string;
  badge?: number;
  accessibilityLabel?: string;
}

interface SecondaryScreenHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightAction?: HeaderAction;
  secondaryRightAction?: HeaderAction;
  rightCustomComponent?: React.ReactNode;
}

export const SecondaryScreenHeader: React.FC<SecondaryScreenHeaderProps> = ({
  title,
  subtitle,
  onBack,
  rightAction,
  secondaryRightAction,
  rightCustomComponent,
}) => {
  const insets = useSafeAreaInsets();
  const { goBack } = useAppNavigation();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      goBack();
    }
  };

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) + 4 }]}>
      <View style={styles.contentRow}>
        {/* Left Native Back Action */}
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.backButton}
          onPress={handleBack}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel="Go back"
        >
          <ArrowLeft size={20} color="#FFFFFF" strokeWidth={2.4} />
        </TouchableOpacity>

        {/* Center / Left-aligned Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.titleText} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.subtitleText} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        {/* Right Actions Cluster */}
        <View style={styles.rightActionsRow}>
          {rightCustomComponent ? (
            rightCustomComponent
          ) : (
            <>
              {secondaryRightAction && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={[
                    styles.actionButton,
                    secondaryRightAction.active && styles.actionButtonActive,
                  ]}
                  onPress={secondaryRightAction.onPress}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  accessibilityLabel={secondaryRightAction.accessibilityLabel || 'Action'}
                >
                  <secondaryRightAction.icon
                    size={19}
                    color={
                      secondaryRightAction.active
                        ? secondaryRightAction.activeColor || '#7952FC'
                        : '#A098B5'
                    }
                    strokeWidth={2.2}
                  />
                </TouchableOpacity>
              )}

              {rightAction && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={[
                    styles.actionButton,
                    rightAction.active && styles.actionButtonActive,
                  ]}
                  onPress={rightAction.onPress}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  accessibilityLabel={rightAction.accessibilityLabel || 'Action'}
                >
                  <rightAction.icon
                    size={19}
                    color={
                      rightAction.active
                        ? rightAction.activeColor || '#7952FC'
                        : '#FFFFFF'
                    }
                    strokeWidth={2.2}
                  />
                  {rightAction.badge !== undefined && rightAction.badge > 0 && (
                    <View style={styles.badgePill}>
                      <Text style={styles.badgeText}>{rightAction.badge}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.headerPurple,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  contentRow: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
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
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  subtitleText: {
    fontSize: 11.5,
    color: '#A098B5',
    fontWeight: '500',
    marginTop: 1,
  },
  rightActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2A2045',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonActive: {
    backgroundColor: '#352558',
  },
  badgePill: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: '#7952FC',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
