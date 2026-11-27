import React, { useState, useEffect, useMemo } from 'react';
import { View, Image, StyleSheet, ViewStyle } from 'react-native';
import { Trophy, Dribbble, Shield, Award } from 'lucide-react-native';
import { LEAGUE_EMBLEMS } from '../../constants/crests';
import { imageCacheService, ImagePriority, normalizeImageUrl } from '../../services/imageCacheService';
import { normalizeLeagueId } from '../../services/profileStorage';

export interface CompetitionLogoProps {
  uri?: string;
  competitionId?: string;
  sport?: string;
  size?: number;
  priority?: ImagePriority;
  containerStyle?: ViewStyle;
  flat?: boolean;
}

const DARK_COMPATIBLE_ESPN_IDS = new Set([
  '1', '2', '4', '9', '10', '11', '12', '14', '15', '18', '19', '22', '23', '24',
  '58', '85', '106', '2199', '2200', '2288', '2310', '2334', '2350', '2359', '2488', '20296',
  'nba', 'nhl', 'nfl',
]);

const NON_ENGLISH_PREMIER_MARKERS = [
  'ukrain', 'egypt', 'kenya', 'fkf', 'ugand', 'turk', 'israel', 'azerbaijan',
  'russian', 'russia', 'belarus', 'scottish', 'scotland', 'welsh', 'wales',
  'canadian', 'canada', 'kazakh', 'irish', 'northern-irish', 'cambodia',
  'singapore', 'bahrain', 'kuwait', 'oman', 'ghana', 'nigeria', 'tanzania',
  'ethiopia', 'bosnia', 'malta', 'faroe', 'armen', 'georgia', 'thailand',
  'india', 'bangladesh', 'hong-kong', 'south-africa', 'premiership',
  'ukr-1', 'egy-1', 'ken-1', 'uga-1', 'rus-1', 'tur-1', 'rsa-1', 'sco-1',
];

/**
 * Converts known ESPN 500 light-mode competition URLs to their 500-dark equivalent
 * for crisp contrast against dark card/header surfaces.
 */
export function upgradeToDarkLogoUrl(url?: string): string | undefined {
  if (!url || typeof url !== 'string') return undefined;
  const trimmed = url.trim();
  if (!trimmed) return undefined;

  const soccerMatch = trimmed.match(/^(https?:\/\/a\.espncdn\.com\/i\/leaguelogos\/soccer)\/500\/([^/.]+)\.png$/i);
  if (soccerMatch && DARK_COMPATIBLE_ESPN_IDS.has(soccerMatch[2].toLowerCase())) {
    return `${soccerMatch[1].replace(/^http:/i, 'https:')}/500-dark/${soccerMatch[2]}.png`;
  }

  const leagueMatch = trimmed.match(/^(https?:\/\/a\.espncdn\.com\/i\/teamlogos\/leagues)\/500\/([^/.]+)\.png$/i);
  if (leagueMatch && DARK_COMPATIBLE_ESPN_IDS.has(leagueMatch[2].toLowerCase())) {
    return `${leagueMatch[1].replace(/^http:/i, 'https:')}/500-dark/${leagueMatch[2]}.png`;
  }

  return normalizeImageUrl(trimmed) || undefined;
}

/**
 * Strict competition emblem resolver:
 * 1. Verified exact/canonical league logo only.
 * 2. Disambiguates FIBA Basketball World Cup vs FIFA World Cup and English vs regional Premier Leagues.
 * 3. Returns empty string (`''`) when no verified logo exists — NEVER substitutes FIFA World Cup 26.
 */
export function resolveCompetitionLogo(competitionIdOrName?: string, sport?: string): string {
  if (!competitionIdOrName) return '';

  const clean = competitionIdOrName
    .toLowerCase()
    .trim()
    .replace(/^(comp-|league-)/, '')
    .replace(/[\s_]+/g, '-');
  const sp = (sport || '').toLowerCase().trim();

  // Direct verified mapping (excluding generic sport keys & ambiguous World Cup key)
  if (
    clean !== 'football' &&
    clean !== 'soccer' &&
    clean !== 'basketball' &&
    clean !== 'hockey' &&
    clean !== 'world-cup' &&
    LEAGUE_EMBLEMS[clean]
  ) {
    return LEAGUE_EMBLEMS[clean];
  }

  // All Sports Category
  if (clean === 'all' || clean.includes('all-sport')) {
    return LEAGUE_EMBLEMS['all'];
  }

  // Exclude motorsport / F1 completely
  if (clean === 'f1' || clean.includes('formula-1') || clean.includes('motorsport') || clean === 'racing') {
    return '';
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

  // Basketball (Specific competitions STRICTLY before generic NBA; FIBA World Cup separated from FIFA World Cup)
  const isBasketballContext =
    sp === 'basketball' ||
    clean.includes('fiba') ||
    clean.includes('basketball') ||
    clean.includes('euroleague') ||
    clean.includes('eurocup') ||
    clean.includes('wnba');

  if (clean.includes('euroleague') || clean.includes('eurocup')) {
    return LEAGUE_EMBLEMS['euroleague'];
  }
  if (clean.includes('fiba') || (isBasketballContext && clean.includes('world-cup'))) {
    return LEAGUE_EMBLEMS['fiba'];
  }
  if (clean.includes('new-zealand') || clean.includes('nz-nbl') || clean.includes('rapid-league')) {
    return '';
  }
  if (clean === 'nbl' || clean.includes('national-basketball-league')) {
    return LEAGUE_EMBLEMS['nbl'];
  }
  if (clean.includes('ncaa') || clean.includes('college-basketball')) {
    return LEAGUE_EMBLEMS['ncaa'];
  }
  if (clean.includes('wnba')) {
    return LEAGUE_EMBLEMS['wnba'];
  }
  if (clean === 'nba' || clean.includes('nba-basketball') || clean.includes('national-basketball-association')) {
    return LEAGUE_EMBLEMS['nba'];
  }
  // Do NOT fall back generic 'basketball' competitions like NZ Basketball to NBA logo!
  if (isBasketballContext) {
    return '';
  }

  // Hockey (Specific leagues strictly before NHL)
  if (clean.includes('hockeyallsvenskan') || clean.includes('hockey-allsvenskan')) {
    return LEAGUE_EMBLEMS['hockey-allsvenskan'];
  }
  if (clean.includes('icehl') || clean.includes('austria-ice') || clean.includes('austrian-ice') || clean.includes('win2day')) {
    return LEAGUE_EMBLEMS['icehl'];
  }
  if (clean === 'del' || clean.includes('germany-del') || clean.includes('deutsche-eishockey') || clean.includes('penny-del')) {
    return LEAGUE_EMBLEMS['del'];
  }
  if (clean.includes('russia-mhl') || clean.includes('russian-mhl') || clean === 'mhl') {
    return LEAGUE_EMBLEMS['russia-mhl'];
  }
  if (clean.includes('khl')) {
    return LEAGUE_EMBLEMS['khl'];
  }
  if (clean.includes('australian-ice') || clean === 'aihl') {
    return '';
  }
  if (clean === 'nhl' || clean.includes('nhl-hockey') || clean.includes('national-hockey-league')) {
    return LEAGUE_EMBLEMS['nhl'];
  }
  if (sp === 'hockey' || sp === 'ice_hockey' || clean.includes('hockey')) {
    return '';
  }

  // Football / Soccer Specific Tournaments (Never substitute WC26 on miss!)
  if (clean.includes('concacaf')) return LEAGUE_EMBLEMS['concacaf-nations-league'];
  if (clean.includes('uefa-nation') || clean.includes('nations-league')) return LEAGUE_EMBLEMS['uefa-nations-league'];
  if (clean.includes('afcon') || clean.includes('africa-cup')) return LEAGUE_EMBLEMS['afcon'];
  if (clean.includes('libertadores')) return LEAGUE_EMBLEMS['libertadores'];
  if (clean.includes('nwsl')) return LEAGUE_EMBLEMS['nwsl'];
  if (clean.includes('liga-mx') || clean.includes('mex-1') || clean.includes('bbva-mx')) return LEAGUE_EMBLEMS['liga-mx'];
  if (clean.includes('argentin') || clean.includes('liga-profesional') || clean.includes('arg-1') || clean.includes('primera-division-argentina')) {
    return LEAGUE_EMBLEMS['argentina-primera'];
  }
  if (clean.includes('paraguay') || clean.includes('par-1')) return LEAGUE_EMBLEMS['paraguayan-primera'];
  if (clean.includes('ukrain') || clean.includes('ukr-1') || clean === 'upl') return LEAGUE_EMBLEMS['ukrainian-premier'];
  if (clean.includes('egyptian') || clean.includes('egypt-premier') || clean.includes('egy-1')) return LEAGUE_EMBLEMS['egyptian-premier'];
  if (clean.includes('kenyan') || clean.includes('fkf') || clean.includes('kenya-premier') || clean.includes('ken-1')) {
    return LEAGUE_EMBLEMS['kenyan-premier-league'];
  }
  if (clean.includes('ugand') || clean.includes('uga-1')) return '';
  if (clean.includes('scottish-premier') || clean.includes('sco-1')) return LEAGUE_EMBLEMS['scottish-premiership'];
  if (clean.includes('south-africa') || clean.includes('dstv-premiership') || clean.includes('betway-premiership') || clean.includes('rsa-1')) {
    return LEAGUE_EMBLEMS['south-african-psl'];
  }
  if (clean.includes('russian-premier') || clean.includes('rus-1') || clean === 'premier-liga') {
    return LEAGUE_EMBLEMS['russian-premier-league'];
  }
  if (clean.includes('super-league') && (clean.includes('women') || clean.includes('wsl'))) {
    return LEAGUE_EMBLEMS['womens-super-league'];
  }
  if (clean.includes('coupe-de-france')) return LEAGUE_EMBLEMS['coupe-de-france'];
  if (clean.includes('fa-cup')) return LEAGUE_EMBLEMS['fa-cup'];
  if (clean.includes('copa-del-rey')) return LEAGUE_EMBLEMS['copa-del-rey'];
  if (clean.includes('efl') || clean === 'championship') return LEAGUE_EMBLEMS['efl-championship'];
  if (clean.includes('afc-champion') || clean.includes('acl-elite') || clean.includes('asian-champion') || clean.includes('afc-cup')) {
    return LEAGUE_EMBLEMS['afc-champions-league'];
  }
  if (clean.includes('arab-club') || clean.includes('king-salman')) return LEAGUE_EMBLEMS['arab-club-champions'];
  if (clean.includes('king-cup') || clean.includes('custodian')) return LEAGUE_EMBLEMS['saudi-king-cup'];
  if (clean.includes('conference') || clean === 'uecl' || clean.includes('europa-conf')) return LEAGUE_EMBLEMS['conference-league'];
  if (clean.includes('europa') || clean === 'uel') return LEAGUE_EMBLEMS['europa-league'];
  if (
    !clean.includes('afc') &&
    !clean.includes('arab') &&
    !clean.includes('asian') &&
    !clean.includes('champions-super') &&
    (clean.includes('uefa-champions') || clean === 'champions-league' || clean === 'ucl')
  ) {
    return LEAGUE_EMBLEMS['ucl'];
  }
  if (clean.includes('mls') || clean.includes('major-league-soccer')) return LEAGUE_EMBLEMS['mls'];

  // Turkish Süper Lig / Turkish Premier League
  if (clean.includes('turk') || clean.includes('super-lig') || clean.includes('süper-lig') || clean.includes('tur-1')) {
    return LEAGUE_EMBLEMS['super-lig'];
  }

  // English Premier League (Strictly guarded against non-English Premier Leagues!)
  const hasForeignPremierMarker = NON_ENGLISH_PREMIER_MARKERS.some(m => clean.includes(m));
  if (
    !hasForeignPremierMarker &&
    (clean === 'premier-league' ||
      clean === 'english-premier-league' ||
      clean === 'barclays-premier-league' ||
      clean === 'epl' ||
      clean === 'pl' ||
      clean === 'eng-1')
  ) {
    return LEAGUE_EMBLEMS['premier-league'];
  }

  if (clean.includes('laliga') || clean.includes('la-liga') || clean.includes('esp-1')) return LEAGUE_EMBLEMS['laliga'];
  if (clean === 'serie-a' || clean.includes('serie-a-') || clean.includes('ita-1')) return LEAGUE_EMBLEMS['serie-a'];
  if (clean.includes('bundes') || clean.includes('ger-1')) return LEAGUE_EMBLEMS['bundesliga'];
  if (clean.includes('ligue-1') || clean.includes('fra-1') || clean === 'ligue1') return LEAGUE_EMBLEMS['ligue-1'];
  if (clean.includes('j1') || clean.includes('j-league') || clean.includes('meiji-yasuda') || clean.includes('japan-j')) {
    return LEAGUE_EMBLEMS['j1-league'];
  }
  if (clean.includes('yelo') || clean.includes('first-division') || clean.includes('saudi-first') || clean.includes('division-1') || clean.includes('ksa-2')) {
    return LEAGUE_EMBLEMS['saudi-first-division'];
  }
  if (clean.includes('saudi') || clean.includes('roshn') || clean.includes('spl') || clean.includes('ksa-1')) {
    return LEAGUE_EMBLEMS['saudi-pro-league'];
  }
  if (clean.includes('u-17') || clean.includes('u17') || clean.includes('under-17')) return LEAGUE_EMBLEMS['fifa-u-17'];
  if (clean.includes('champions-super')) return '';
  if (clean.includes('csl') || clean.includes('chinese-super') || clean.includes('china-super')) return LEAGUE_EMBLEMS['csl'];
  if (clean.includes('isl') || clean.includes('indian-super') || clean.includes('india-super')) return LEAGUE_EMBLEMS['isl'];
  if (clean.includes('brasileir') || clean.includes('bra-1')) return LEAGUE_EMBLEMS['brasileirao'];
  if (clean.includes('eredivisie') || clean.includes('ned-1')) return LEAGUE_EMBLEMS['eredivisie'];
  if (clean.includes('primeira-liga') || clean.includes('por-1')) return LEAGUE_EMBLEMS['primeira-liga'];

  // FIFA World Cup ONLY when explicitly World Cup / FIFA AND never on basketball/hockey
  if (
    !isBasketballContext &&
    (clean === 'world-cup' ||
      clean === 'wc' ||
      clean === 'fifa-world-cup' ||
      clean === 'fifa.world' ||
      clean.includes('fifa-world-cup'))
  ) {
    return LEAGUE_EMBLEMS['world-cup'];
  }

  return '';
}

export function buildCompetitionLogoCandidates(uri?: string, competitionId?: string, sport?: string): string[] {
  const candidates: string[] = [];
  const seen = new Set<string>();
  const add = (raw?: string) => {
    if (!raw) return;
    // Never accept generic ESPN World Cup logo (4.png) if the competition is not actually FIFA World Cup!
    const cleanId = (competitionId || '').toLowerCase();
    const isActuallyWorldCup =
      (cleanId.includes('fifa') || cleanId === 'wc' || cleanId === 'world-cup' || cleanId === 'world_cup') &&
      !cleanId.includes('fiba') &&
      !cleanId.includes('basketball') &&
      sport !== 'basketball' &&
      sport !== 'hockey';
    if (!isActuallyWorldCup && /leaguelogos\/soccer\/(?:500|500-dark)\/4\.png/i.test(raw)) {
      return;
    }

    const clean = normalizeImageUrl(raw);
    if (clean && !seen.has(clean)) {
      seen.add(clean);
      candidates.push(clean);
    }
  };

  if (competitionId) {
    const canonical = resolveCompetitionLogo(competitionId, sport);
    if (canonical) {
      add(upgradeToDarkLogoUrl(canonical));
      add(canonical);
    }
  }
  if (uri) {
    add(upgradeToDarkLogoUrl(uri));
    add(uri);
  }
  return candidates;
}

const SportFallbackIcon: React.FC<{ sport?: string; competitionId?: string; size: number }> = ({
  sport,
  competitionId,
  size,
}) => {
  const sp = (sport || '').toLowerCase();
  const idLow = (competitionId || '').toLowerCase();
  const iconSize = Math.round(size * 0.58);

  if (sp === 'basketball' || idLow.includes('fiba') || idLow.includes('basket') || idLow.includes('nba')) {
    return <Dribbble size={iconSize} color="#F59E0B" strokeWidth={2} />;
  }
  if (sp === 'hockey' || idLow.includes('hockey') || idLow.includes('mhl') || idLow.includes('aihl') || idLow.includes('nhl')) {
    return <Shield size={iconSize} color="#38BDF8" strokeWidth={2} />;
  }
  if (sp === 'american_football' || idLow.includes('nfl')) {
    return <Award size={iconSize} color="#F97316" strokeWidth={2} />;
  }
  return <Trophy size={iconSize} color="#A58BFC" strokeWidth={2} />;
};

/**
 * BALLIVE Official Competition Logo
 * Renders verified competition emblems flat directly on dark UI surfaces
 * backed by persistent disk caching, prioritized download queueing, and neutral sport-specific fallback icons.
 */
export const CompetitionLogo: React.FC<CompetitionLogoProps> = React.memo(({
  uri,
  competitionId,
  sport,
  size = 44,
  priority = 0,
  containerStyle,
  flat = true,
}) => {
  const candidates = useMemo(
    () => buildCompetitionLogoCandidates(uri, competitionId, sport),
    [uri, competitionId, sport]
  );
  const entityKey = useMemo(
    () => (competitionId ? `comp:${normalizeLeagueId(competitionId)}` : null),
    [competitionId]
  );
  const signature = `${entityKey || ''}|${candidates.join('|')}`;

  const immediateUri = useMemo(
    () => imageCacheService.getImmediateCachedUri('competition', candidates, entityKey),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [signature]
  );

  const [resolvedUri, setResolvedUri] = useState<string | null>(immediateUri);
  const [fallbackIdx, setFallbackIdx] = useState<number>(-1);
  const [exhausted, setExhausted] = useState(candidates.length === 0);

  useEffect(() => {
    let isMounted = true;
    setFallbackIdx(-1);

    if (candidates.length === 0) {
      setExhausted(true);
      setResolvedUri(null);
      return;
    }

    setExhausted(false);

    if (immediateUri) {
      setResolvedUri(immediateUri);
      return;
    }

    setResolvedUri(null);
    imageCacheService
      .resolveImage({
        entityKey,
        category: 'competition',
        candidates,
        priority,
      })
      .then(result => {
        if (!isMounted) return;
        if (result) {
          setResolvedUri(result);
        } else if (candidates.length > 0) {
          setFallbackIdx(0);
          setResolvedUri(candidates[0]);
        } else {
          setExhausted(true);
        }
      })
      .catch(() => {
        if (!isMounted) return;
        if (candidates.length > 0) {
          setFallbackIdx(0);
          setResolvedUri(candidates[0]);
        } else {
          setExhausted(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [signature, immediateUri, priority, candidates, entityKey]);

  const handleImageError = () => {
    if (resolvedUri) {
      imageCacheService.reportLoadError(resolvedUri, 'competition').catch(() => {});
    }

    const nextIdx = fallbackIdx + 1;
    if (nextIdx < candidates.length && candidates[nextIdx] !== resolvedUri) {
      setFallbackIdx(nextIdx);
      setResolvedUri(candidates[nextIdx]);
    } else if (nextIdx + 1 < candidates.length) {
      setFallbackIdx(nextIdx + 1);
      setResolvedUri(candidates[nextIdx + 1]);
    } else {
      setExhausted(true);
      setResolvedUri(null);
    }
  };

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
      {!exhausted && resolvedUri ? (
        <Image
          source={{ uri: resolvedUri }}
          style={styles.logoImage}
          resizeMode="contain"
          onError={handleImageError}
        />
      ) : (
        <SportFallbackIcon sport={sport} competitionId={competitionId} size={size} />
      )}
    </View>
  );
});

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
