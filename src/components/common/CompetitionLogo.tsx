import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, ViewStyle } from 'react-native';
import { Trophy } from 'lucide-react-native';
import { LEAGUE_EMBLEMS } from '../../constants/crests';

export interface CompetitionLogoProps {
  uri?: string;
  competitionId?: string;
  size?: number;
  containerStyle?: ViewStyle;
  flat?: boolean;
}

const DARK_COMPATIBLE_ESPN_IDS = new Set([
  '1', '2', '4', '9', '10', '11', '12', '14', '15', '18', '19', '22', '23', '24',
  '58', '85', '2199', '2200', '2288', '2310', '2334', '2350', '2488', '20296',
  'nba', 'nhl', 'nfl', 'f1',
]);

/**
 * Converts known ESPN 500 light-mode competition URLs to their 500-dark equivalent
 * for crisp contrast against dark card/header surfaces.
 */
function upgradeToDarkLogoUrl(url?: string): string | undefined {
  if (!url || typeof url !== 'string') return undefined;
  const trimmed = url.trim();
  if (!trimmed) return undefined;

  const soccerMatch = trimmed.match(/^(https:\/\/a\.espncdn\.com\/i\/leaguelogos\/soccer)\/500\/([^/.]+)\.png$/i);
  if (soccerMatch && DARK_COMPATIBLE_ESPN_IDS.has(soccerMatch[2].toLowerCase())) {
    return `${soccerMatch[1]}/500-dark/${soccerMatch[2]}.png`;
  }

  const leagueMatch = trimmed.match(/^(https:\/\/a\.espncdn\.com\/i\/teamlogos\/leagues)\/500\/([^/.]+)\.png$/i);
  if (leagueMatch && DARK_COMPATIBLE_ESPN_IDS.has(leagueMatch[2].toLowerCase())) {
    return `${leagueMatch[1]}/500-dark/${leagueMatch[2]}.png`;
  }

  return trimmed;
}

/**
 * Resolves a competition ID or name to its verified official emblem URL.
 */
export function resolveCompetitionLogo(competitionIdOrName?: string): string {
  if (!competitionIdOrName) return LEAGUE_EMBLEMS['football'];

  const clean = competitionIdOrName.toLowerCase().trim().replace(/^(comp-|league-)/, '').replace(/[\s_]+/g, '-');

  if (LEAGUE_EMBLEMS[clean]) {
    return LEAGUE_EMBLEMS[clean];
  }

  // All Sports / Category
  if (clean === 'all' || clean.includes('all-sport')) {
    return LEAGUE_EMBLEMS['all'];
  }

  // Motorsport / Formula 1
  if (clean.includes('f1') || clean.includes('formula') || clean.includes('motorsport') || clean.includes('racing')) {
    return LEAGUE_EMBLEMS['f1'];
  }

  // American Football / NFL
  if (clean.includes('nfl') || clean.includes('american-football')) {
    return LEAGUE_EMBLEMS['nfl'];
  }

  // Tennis (ATP / WTA)
  if (clean.includes('atp') && !clean.includes('wta')) {
    return LEAGUE_EMBLEMS['atp'];
  }
  if (clean.includes('wta') && !clean.includes('atp')) {
    return LEAGUE_EMBLEMS['wta'];
  }
  if (clean.includes('tennis') || clean.includes('atp') || clean.includes('wta') || clean.includes('wimbledon') || clean.includes('roland-garros')) {
    return LEAGUE_EMBLEMS['tennis'];
  }

  // Cricket
  if (clean.includes('cricket') || clean.includes('icc') || clean.includes('ipl') || clean.includes('bbl') || clean.includes('wbbl')) {
    return LEAGUE_EMBLEMS['cricket'];
  }

  // Basketball (Specific competitions before NBA)
  if (clean.includes('euroleague') || clean.includes('eurocup')) {
    return LEAGUE_EMBLEMS['euroleague'];
  }
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

  // Hockey (Specific leagues before NHL)
  if (clean.includes('hockeyallsvenskan') || clean.includes('hockey-allsvenskan')) {
    return LEAGUE_EMBLEMS['hockey-allsvenskan'];
  }
  if (clean.includes('icehl') || clean.includes('ice-hockey-league') || clean.includes('win2day') || clean.includes('austria-ice') || clean.includes('austrian-ice')) {
    return LEAGUE_EMBLEMS['icehl'];
  }
  if (clean === 'del' || clean.includes('germany-del') || clean.includes('deutsche-eishockey') || clean.includes('penny-del')) {
    return LEAGUE_EMBLEMS['del'];
  }
  if (clean.includes('mhl') || clean.includes('russia-mhl')) {
    return LEAGUE_EMBLEMS['russia-mhl'];
  }
  if (clean.includes('khl')) {
    return LEAGUE_EMBLEMS['khl'];
  }
  if (clean.includes('nhl') || clean.includes('hockey')) {
    return LEAGUE_EMBLEMS['nhl'];
  }

  // Football / Soccer Leagues & Tournaments (Most specific first)
  if (clean.includes('concacaf')) {
    return LEAGUE_EMBLEMS['concacaf-nations-league'];
  }
  if (clean.includes('uefa-nation') || clean.includes('nations-league')) {
    return LEAGUE_EMBLEMS['uefa-nations-league'];
  }
  if (clean.includes('afcon') || clean.includes('africa-cup')) {
    return LEAGUE_EMBLEMS['afcon'];
  }
  if (clean.includes('libertadores')) {
    return LEAGUE_EMBLEMS['libertadores'];
  }
  if (clean.includes('nwsl')) {
    return LEAGUE_EMBLEMS['nwsl'];
  }
  if (clean.includes('liga-mx') || clean.includes('mex-1') || clean.includes('bbva-mx')) {
    return LEAGUE_EMBLEMS['liga-mx'];
  }
  if (clean.includes('argentin') || clean.includes('liga-profesional') || clean.includes('arg-1') || clean.includes('primera-division-argentina')) {
    return LEAGUE_EMBLEMS['argentina-primera'];
  }
  if (clean.includes('ukrain') || clean.includes('ukr-1') || clean === 'upl') {
    return LEAGUE_EMBLEMS['ukrainian-premier'];
  }
  if (clean.includes('egyptian') || clean.includes('egypt-premier') || clean.includes('egy-1')) {
    return LEAGUE_EMBLEMS['egyptian-premier'];
  }
  if (clean.includes('kenyan') || clean.includes('fkf') || clean.includes('kenya-premier') || clean.includes('ken-1')) {
    return LEAGUE_EMBLEMS['kenyan-premier-league'];
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
  if (clean.includes('efl') || clean.includes('championship')) {
    return LEAGUE_EMBLEMS['efl-championship'];
  }
  if (clean.includes('afc-champion') || clean.includes('acl-elite') || clean.includes('asian-champion') || clean.includes('afc-cup')) {
    return LEAGUE_EMBLEMS['afc-champions-league'];
  }
  if (clean.includes('arab-club') || clean.includes('king-salman')) {
    return LEAGUE_EMBLEMS['arab-club-champions'];
  }
  if (clean.includes('king-cup') || clean.includes('custodian')) {
    return LEAGUE_EMBLEMS['saudi-king-cup'];
  }
  if (clean.includes('conference') || clean === 'uecl' || clean.includes('europa-conf')) {
    return LEAGUE_EMBLEMS['conference-league'];
  }
  if (clean.includes('europa') || clean === 'uel') {
    return LEAGUE_EMBLEMS['europa-league'];
  }
  if (
    !clean.includes('afc') &&
    !clean.includes('arab') &&
    !clean.includes('asian') &&
    (clean.includes('champions-league') || clean === 'ucl' || clean === 'uefa-champions')
  ) {
    return LEAGUE_EMBLEMS['ucl'];
  }
  if (clean.includes('mls') || clean.includes('major-league-soccer')) {
    return LEAGUE_EMBLEMS['mls'];
  }
  if (clean.includes('premier') || clean === 'epl' || clean === 'pl') {
    return LEAGUE_EMBLEMS['premier-league'];
  }
  if (clean.includes('laliga') || clean.includes('la-liga') || clean.includes('esp-1')) {
    return LEAGUE_EMBLEMS['laliga'];
  }
  if (clean.includes('serie') || clean.includes('ita-1')) {
    return LEAGUE_EMBLEMS['serie-a'];
  }
  if (clean.includes('bundes') || clean.includes('ger-1')) {
    return LEAGUE_EMBLEMS['bundesliga'];
  }
  if (clean.includes('ligue-1') || clean.includes('fra-1') || clean === 'ligue1') {
    return LEAGUE_EMBLEMS['ligue-1'];
  }
  if (clean.includes('j1') || clean.includes('j-league') || clean.includes('meiji-yasuda') || clean.includes('japan-j')) {
    return LEAGUE_EMBLEMS['j1-league'];
  }
  if (clean.includes('yelo') || clean.includes('first-division') || clean.includes('saudi-first') || clean.includes('division-1') || clean.includes('ksa-2')) {
    return LEAGUE_EMBLEMS['saudi-first-division'];
  }
  if (clean.includes('saudi') || clean.includes('roshn') || clean.includes('spl') || clean.includes('ksa-1')) {
    return LEAGUE_EMBLEMS['saudi-pro-league'];
  }
  if (clean.includes('u-17') || clean.includes('u17') || clean.includes('under-17')) {
    return LEAGUE_EMBLEMS['fifa-u-17'];
  }
  if (clean.includes('csl') || clean.includes('chinese-super') || clean.includes('china-super')) {
    return LEAGUE_EMBLEMS['csl'];
  }
  if (clean.includes('isl') || clean.includes('indian-super') || clean.includes('india-super')) {
    return LEAGUE_EMBLEMS['isl'];
  }
  if (clean.includes('brasileir') || clean.includes('bra-1')) {
    return LEAGUE_EMBLEMS['brasileirao'];
  }
  if (clean.includes('eredivisie') || clean.includes('ned-1')) {
    return LEAGUE_EMBLEMS['eredivisie'];
  }
  if (clean.includes('primeira-liga') || clean.includes('por-1')) {
    return LEAGUE_EMBLEMS['primeira-liga'];
  }
  if (clean.includes('super-lig') || clean.includes('tur-1')) {
    return LEAGUE_EMBLEMS['super-lig'];
  }
  if (clean.includes('world-cup') || clean === 'wc' || clean.includes('fifa')) {
    return LEAGUE_EMBLEMS['world-cup'];
  }

  return LEAGUE_EMBLEMS['football'];
}

/**
 * BALLIVE Official Competition Logo
 * Renders competition emblems cleanly and flat directly on dark UI surfaces
 * without white circular containers or artificial borders.
 */
export const CompetitionLogo: React.FC<CompetitionLogoProps> = ({
  uri,
  competitionId,
  size = 44,
  containerStyle,
  flat = true,
}) => {
  const canonicalFallback = resolveCompetitionLogo(competitionId);
  const upgradedUri = upgradeToDarkLogoUrl(uri);
  const resolvedSource = upgradedUri || canonicalFallback;

  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [resolvedSource]);

  const innerPadding = flat ? 0 : Math.round(size * 0.14);

  return (
    <View
      style={[
        flat ? styles.flatContainer : styles.pillContainer,
        {
          width: size,
          height: size,
          borderRadius: flat ? 0 : size / 2,
          padding: innerPadding,
        },
        containerStyle,
      ]}
    >
      {hasError || !resolvedSource ? (
        <Trophy size={Math.round(size * 0.6)} color="#A58BFC" strokeWidth={2} />
      ) : (
        <Image
          source={{ uri: resolvedSource }}
          style={styles.logoImage}
          resizeMode="contain"
          onError={() => setHasError(true)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  flatContainer: {
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  pillContainer: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
});

export default CompetitionLogo;
