import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
  ViewStyle,
} from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export interface SegmentedTabItem<T extends string = string> {
  key: T;
  label: string;
}

interface SegmentedControlProps<T extends string = string> {
  tabs: Array<SegmentedTabItem<T>>;
  activeKey: T;
  onChange: (key: T) => void;
  style?: ViewStyle;
}

/**
 * Compact modern segmented control for Overview / Matches & Overview / Fixtures.
 * Solid `#7650F6` active fill on a borderless `#141122` deep-navy track (zero gradients/outlines).
 */
export function SegmentedControl<T extends string = string>({
  tabs,
  activeKey,
  onChange,
  style,
}: SegmentedControlProps<T>) {
  const handleSelect = (key: T) => {
    if (key === activeKey) return;
    LayoutAnimation.configureNext({
      duration: 180,
      update: { type: LayoutAnimation.Types.easeInEaseOut },
    });
    onChange(key);
  };

  return (
    <View style={[styles.track, style]} accessibilityRole="tablist">
      {tabs.map(tab => {
        const isActive = tab.key === activeKey;
        return (
          <TouchableOpacity
            key={tab.key}
            activeOpacity={0.85}
            style={[styles.segment, isActive ? styles.segmentActive : styles.segmentInactive]}
            onPress={() => handleSelect(tab.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={tab.label}
          >
            <Text
              style={[styles.label, isActive ? styles.labelActive : styles.labelInactive]}
              numberOfLines={1}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#141122',
    borderRadius: 14,
    padding: 4,
    gap: 4,
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentActive: {
    backgroundColor: '#7650F6',
  },
  segmentInactive: {
    backgroundColor: '#19152B',
  },
  label: {
    fontSize: 13.5,
    letterSpacing: -0.1,
  },
  labelActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  labelInactive: {
    color: '#9891B4',
    fontWeight: '600',
  },
});

export default SegmentedControl;
