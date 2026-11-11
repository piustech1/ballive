import React from 'react';
import { View, Image, StyleSheet, ViewStyle } from 'react-native';
import { LEAGUE_EMBLEMS } from '../../constants/crests';

export interface CompetitionLogoProps {
  uri?: string;
  competitionId?: string;
  size?: number;
  containerStyle?: ViewStyle;
}

/**
 * Resolves a competition ID or name to its official emblem URL.
 */
export function resolveCompetitionLogo(competitionIdOrName?: string): string {
  if (!competitionIdOrName) return LEAGUE_EMBLEMS['premier-league'];

  const clean = competitionIdOrName.toLowerCase().trim().replace(/\s+/g, '-');

  if (LEAGUE_EMBLEMS[clean]) {
    return LEAGUE_EMBLEMS[clean];
  }

  // Common aliases
  if (clean.includes('premier') || clean === 'epl' || clean === 'pl') {
    return LEAGUE_EMBLEMS['premier-league'];
  }
  if (clean.includes('champion') || clean === 'ucl') {
    return LEAGUE_EMBLEMS['ucl'];
  }
  if (clean.includes('laliga') || clean.includes('la-liga')) {
    return LEAGUE_EMBLEMS['laliga'];
  }
  if (clean.includes('serie') || clean.includes('serie-a')) {
    return LEAGUE_EMBLEMS['serie-a'];
  }
  if (clean.includes('bundes') || clean.includes('bundesliga')) {
    return LEAGUE_EMBLEMS['bundesliga'];
  }
  if (clean.includes('ligue') || clean.includes('ligue-1')) {
    return LEAGUE_EMBLEMS['ligue-1'];
  }
  if (clean.includes('nba') || clean.includes('basketball')) {
    return 'https://a.espncdn.com/i/teamlogos/leagues/500/nba.png';
  }
  if (clean.includes('nhl') || clean.includes('hockey')) {
    return 'https://a.espncdn.com/i/teamlogos/leagues/500/nhl.png';
  }

  return LEAGUE_EMBLEMS['premier-league'];
}

/**
 * BALLIVE Official Competition Logo
 * Renders the competition emblem inside a circular white container
 * with exact aspect ratio containment and clean inner padding.
 */
export const CompetitionLogo: React.FC<CompetitionLogoProps> = ({
  uri,
  competitionId,
  size = 44,
  containerStyle,
}) => {
  const sourceUri = uri || resolveCompetitionLogo(competitionId);
  const imagePadding = Math.round(size * 0.16);

  return (
    <View
      style={[
        styles.circleContainer,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          padding: imagePadding,
        },
        containerStyle,
      ]}
    >
      <Image
        source={{ uri: sourceUri }}
        style={styles.logoImage}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  circleContainer: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
});

export default CompetitionLogo;
