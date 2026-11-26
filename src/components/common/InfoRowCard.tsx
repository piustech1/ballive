import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronRight, LucideIcon } from 'lucide-react-native';

export interface InfoRowItem {
  key: string;
  label: string;
  value: string;
  icon?: LucideIcon;
  iconBg?: string;
  iconColor?: string;
  customValueLeading?: React.ReactNode;
  valueColor?: string;
  onPress?: () => void;
}

interface InfoRowCardProps {
  title: string;
  rows: InfoRowItem[];
}

/**
 * Refined borderless dark information card with subtle internal dividers,
 * compact icon leading indicators, and support for custom leading media (e.g. CircularCountryFlag).
 */
export const InfoRowCard: React.FC<InfoRowCardProps> = ({ title, rows }) => {
  if (!rows || rows.length === 0) return null;

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>{title}</Text>

      <View style={styles.rowsWrap}>
        {rows.map((row, idx) => {
          const isLast = idx === rows.length - 1;
          const IconComp = row.icon;
          const RowContent = (
            <View style={[styles.row, !isLast && styles.rowDivider]}>
              <View style={styles.leftCol}>
                {IconComp ? (
                  <View
                    style={[
                      styles.iconPill,
                      row.iconBg ? { backgroundColor: row.iconBg } : null,
                    ]}
                  >
                    <IconComp
                      size={14}
                      color={row.iconColor || '#A58BFC'}
                      strokeWidth={2.2}
                    />
                  </View>
                ) : null}
                <Text style={styles.labelText} numberOfLines={1}>
                  {row.label}
                </Text>
              </View>

              <View style={styles.rightCol}>
                {row.customValueLeading ? (
                  <View style={styles.customLeading}>{row.customValueLeading}</View>
                ) : null}
                <Text
                  style={[
                    styles.valueText,
                    row.valueColor ? { color: row.valueColor } : null,
                  ]}
                  numberOfLines={1}
                >
                  {row.value}
                </Text>
                {row.onPress ? (
                  <ChevronRight
                    size={15}
                    color="#A58BFC"
                    strokeWidth={2.4}
                    style={styles.chevron}
                  />
                ) : null}
              </View>
            </View>
          );

          if (row.onPress) {
            return (
              <TouchableOpacity
                key={row.key}
                activeOpacity={0.75}
                onPress={row.onPress}
                accessibilityRole="button"
                accessibilityLabel={`${row.label}: ${row.value}`}
              >
                {RowContent}
              </TouchableOpacity>
            );
          }

          return <React.Fragment key={row.key}>{RowContent}</React.Fragment>;
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#161224',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingTop: 15,
    paddingBottom: 6,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
    marginBottom: 8,
  },
  rowsWrap: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    gap: 12,
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  leftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexShrink: 0,
  },
  iconPill: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(121, 82, 252, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#9891B4',
  },
  rightCol: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
    gap: 8,
  },
  customLeading: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'right',
    flexShrink: 1,
  },
  chevron: {
    marginLeft: -2,
  },
});

export default InfoRowCard;
