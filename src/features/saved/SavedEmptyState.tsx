import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Rect, Path, Circle, Line } from 'react-native-svg';
import { Compass } from 'lucide-react-native';
import Colors from '../../theme/colors';
import { SavedTab } from './SavedHeader';

interface SavedEmptyStateProps {
  tab: SavedTab;
  onNavigateToDiscover: () => void;
}

const MatchesEmptySvg: React.FC = () => (
  <Svg width={132} height={98} viewBox="0 0 132 98" fill="none">
    <Rect x="10" y="16" width="112" height="66" rx="16" fill="#181426" />
    <Rect x="22" y="28" width="28" height="30" rx="8" fill="#231B38" />
    <Rect x="82" y="28" width="28" height="30" rx="8" fill="#231B38" />
    <Circle cx="36" cy="43" r="8" fill="#322752" />
    <Circle cx="96" cy="43" r="8" fill="#322752" />
    <Rect x="54" y="34" width="24" height="14" rx="7" fill="#7650F6" />
    <Circle cx="66" cy="41" r="2.5" fill="#ECE9FA" />
    <Path
      d="M57 59 H75 V76 L66 71 L57 76 Z"
      fill="#A58BFC"
      opacity={0.9}
    />
    <Line x1="26" y1="68" x2="46" y2="68" stroke="#2F254A" strokeWidth="3" strokeLinecap="round" />
    <Line x1="86" y1="68" x2="106" y2="68" stroke="#2F254A" strokeWidth="3" strokeLinecap="round" />
  </Svg>
);

const TeamsEmptySvg: React.FC = () => (
  <Svg width={132} height={98} viewBox="0 0 132 98" fill="none">
    <Path
      d="M28 24 L46 24 L46 49 C46 61 37 68 37 68 C37 68 28 61 28 49 Z"
      fill="#1A152B"
    />
    <Path
      d="M86 24 L104 24 L104 49 C104 61 95 68 95 68 C95 68 86 61 86 49 Z"
      fill="#1A152B"
    />
    <Path
      d="M44 12 L88 12 L88 49 C88 67 66 80 66 83 C66 80 44 67 44 49 Z"
      fill="#221A39"
    />
    <Path
      d="M52 24 L80 24 L80 46 C80 58 66 67 66 69 C66 67 52 58 52 46 Z"
      fill="#2D224D"
    />
    <Circle cx="66" cy="44" r="10" fill="#7650F6" />
    <Line x1="66" y1="39.5" x2="66" y2="48.5" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" />
    <Line x1="61.5" y1="44" x2="70.5" y2="44" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" />
  </Svg>
);

const CompetitionsEmptySvg: React.FC = () => (
  <Svg width={132} height={98} viewBox="0 0 132 98" fill="none">
    <Rect x="22" y="18" width="88" height="62" rx="16" fill="#181426" />
    <Path
      d="M47 26 H85 V43 C85 55 77 63 66 63 C55 63 47 55 47 43 Z"
      fill="#2B2148"
    />
    <Path
      d="M47 31 H38 C36 31 35 33 35 35 V40 C35 45 40 49 47 49"
      stroke="#5C44A8"
      strokeWidth="3.5"
      strokeLinecap="round"
    />
    <Path
      d="M85 31 H94 C96 31 97 33 97 35 V40 C97 45 92 49 85 49"
      stroke="#5C44A8"
      strokeWidth="3.5"
      strokeLinecap="round"
    />
    <Rect x="62" y="61" width="8" height="10" fill="#5C44A8" />
    <Rect x="50" y="71" width="32" height="6" rx="3" fill="#7650F6" />
    <Circle cx="66" cy="41" r="6" fill="#A58BFC" />
  </Svg>
);

const TAB_EMPTY_CONFIG: Record<
  SavedTab,
  {
    title: string;
    subtitle: string;
    buttonLabel: string;
    Illustration: React.FC;
  }
> = {
  matches: {
    title: 'No saved matches yet',
    subtitle: 'Bookmark live fixtures or upcoming kickoffs from Discover.',
    buttonLabel: 'Discover matches',
    Illustration: MatchesEmptySvg,
  },
  teams: {
    title: 'No followed teams yet',
    subtitle: 'Follow clubs across leagues to track scores and schedules.',
    buttonLabel: 'Explore teams',
    Illustration: TeamsEmptySvg,
  },
  competitions: {
    title: 'No followed competitions yet',
    subtitle: 'Follow tournaments to keep tables and fixtures close.',
    buttonLabel: 'Explore competitions',
    Illustration: CompetitionsEmptySvg,
  },
};

export const SavedEmptyState: React.FC<SavedEmptyStateProps> = ({
  tab,
  onNavigateToDiscover,
}) => {
  const { title, subtitle, buttonLabel, Illustration } = TAB_EMPTY_CONFIG[tab];

  return (
    <View style={styles.container}>
      <View style={styles.illustrationWrap}>
        <Illustration />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      <TouchableOpacity
        style={styles.actionBtn}
        activeOpacity={0.82}
        onPress={onNavigateToDiscover}
        accessibilityRole="button"
        accessibilityLabel={buttonLabel}
      >
        <Compass size={15} color="#FFFFFF" strokeWidth={2.3} />
        <Text style={styles.actionBtnText}>{buttonLabel}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 54,
    paddingBottom: 36,
  },
  illustrationWrap: {
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13.5,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 22,
    maxWidth: 270,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7650F6',
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 13,
    gap: 7,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
  },
});

export default SavedEmptyState;
