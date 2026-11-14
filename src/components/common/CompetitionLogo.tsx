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
  if (!competitionIdOrName) return LEAGUE_EMBLEMS['all'];

  const clean = competitionIdOrName.toLowerCase().trim().replace(/\s+/g, '-');

  if (LEAGUE_EMBLEMS[clean]) {
    return LEAGUE_EMBLEMS[clean];
  }

  // All Sports / Category
  if (clean === 'all' || clean.includes('all-sport')) {
    return LEAGUE_EMBLEMS['all'];
  }

  // Combat Sports (UFC, MMA, Boxing, WWE)
  if (clean.includes('ufc') || clean.includes('mma') || clean.includes('combat') || clean.includes('wwe') || clean.includes('wrestling')) {
    return LEAGUE_EMBLEMS['ufc'];
  }
  if (clean.includes('boxing') || clean.includes('wbc')) {
    return LEAGUE_EMBLEMS['boxing'];
  }

  // Motorsport / Formula 1
  if (clean.includes('f1') || clean.includes('formula') || clean.includes('motorsport') || clean.includes('racing')) {
    return LEAGUE_EMBLEMS['f1'];
  }

  // American Football / NFL
  if (clean.includes('nfl') || clean.includes('american-football') || clean.includes('american_football')) {
    return LEAGUE_EMBLEMS['nfl'];
  }

  // Tennis
  if (clean.includes('tennis') || clean.includes('atp') || clean.includes('wta') || clean.includes('wimbledon')) {
    return LEAGUE_EMBLEMS['tennis'];
  }

  // Cricket
  if (clean.includes('cricket') || clean.includes('icc') || clean.includes('ipl')) {
    return LEAGUE_EMBLEMS['cricket'];
  }

  // Basketball
  if (clean.includes('nbl')) {
    return LEAGUE_EMBLEMS['nbl'];
  }
  if (clean.includes('ncaa') || clean.includes('college-basketball')) {
    return LEAGUE_EMBLEMS['ncaa'];
  }
  if (clean.includes('wnba')) {
    return LEAGUE_EMBLEMS['wnba'];
  }
  if (clean.includes('fiba')) {
    return LEAGUE_EMBLEMS['fiba'];
  }
  if (clean.includes('nba') || clean.includes('basketball')) {
    return LEAGUE_EMBLEMS['nba'];
  }

  // Hockey / NHL
  if (clean.includes('nhl') || clean.includes('hockey')) {
    return LEAGUE_EMBLEMS['nhl'];
  }

  // Football / Soccer Leagues & Tournaments
  if (clean.includes('concacaf')) {
    return LEAGUE_EMBLEMS['concacaf-nations-league'];
  }
  if (clean.includes('uefa-nation') || clean.includes('nations-league')) {
    return LEAGUE_EMBLEMS['uefa-nations-league'];
  }
  if (clean.includes('afcon') || clean.includes('africa-cup')) {
    return LEAGUE_EMBLEMS['afcon'];
  }
  if (clean.includes('nwsl')) {
    return LEAGUE_EMBLEMS['nwsl'];
  }
  if (clean.includes('liga-mx') || clean.includes('mex-1')) {
    return LEAGUE_EMBLEMS['liga-mx'];
  }
  if (clean.includes('super-league') && (clean.includes('women') || clean.includes('wsl'))) {
    return LEAGUE_EMBLEMS['womens-super-league'];
  }
  if (clean.includes('coupe-de-france')) {
    return LEAGUE_EMBLEMS['coupe-de-france'];
  }
  if (clean.includes('fa-cup')) {
    return LEAGUE_EMBLEMS['fa-cup'];
  }
  if (clean.includes('copa-del-rey')) {
    return LEAGUE_EMBLEMS['copa-del-rey'];
  }
  if (clean.includes('europa') || clean === 'uel') {
    return LEAGUE_EMBLEMS['europa-league'];
  }
  if (clean.includes('mls') || clean.includes('major-league-soccer')) {
    return LEAGUE_EMBLEMS['mls'];
  }
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
  if (clean.includes('world-cup') || clean === 'wc' || clean.includes('fifa')) {
    return LEAGUE_EMBLEMS['world-cup'];
  }
  if (clean === 'football' || clean === 'soccer') {
    return LEAGUE_EMBLEMS['football'];
  }

  return LEAGUE_EMBLEMS['all'];
}

const LOCAL_CATEGORY_BADGES: Record<string, any> = {
  'all': require('../../../assets/badges/all.png'),
  'football': require('../../../assets/badges/football.png'),
  'soccer': require('../../../assets/badges/football.png'),
  'ufc': require('../../../assets/badges/ufc.png'),
  'mma': require('../../../assets/badges/ufc.png'),
  'combat': require('../../../assets/badges/ufc.png'),
  'wwe': require('../../../assets/badges/wwe.png'),
  'tennis': require('../../../assets/badges/tennis.png'),
};

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
  const cleanKey = (competitionId || '').toLowerCase().trim().replace(/\s+/g, '-');
  const localSource = !uri && LOCAL_CATEGORY_BADGES[cleanKey] ? LOCAL_CATEGORY_BADGES[cleanKey] : null;
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
        source={localSource || { uri: sourceUri }}
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
