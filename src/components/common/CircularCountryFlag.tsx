import React, { useEffect, useMemo, useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Globe } from 'lucide-react-native';
import { imageCacheService } from '../../services/imageCacheService';

export const COUNTRY_ISO2_MAP: Record<string, string> = {
  england: 'gb-eng',
  'united kingdom': 'gb',
  uk: 'gb',
  scotland: 'gb-sct',
  wales: 'gb-wls',
  'northern ireland': 'gb-nir',
  ireland: 'ie',
  'republic of ireland': 'ie',
  spain: 'es',
  germany: 'de',
  italy: 'it',
  france: 'fr',
  portugal: 'pt',
  netherlands: 'nl',
  holland: 'nl',
  belgium: 'be',
  switzerland: 'ch',
  austria: 'at',
  sweden: 'se',
  norway: 'no',
  denmark: 'dk',
  finland: 'fi',
  iceland: 'is',
  poland: 'pl',
  ukraine: 'ua',
  russia: 'ru',
  turkey: 'tr',
  turkiye: 'tr',
  greece: 'gr',
  croatia: 'hr',
  serbia: 'rs',
  czechia: 'cz',
  'czech republic': 'cz',
  slovakia: 'sk',
  slovenia: 'si',
  hungary: 'hu',
  romania: 'ro',
  albania: 'al',
  georgia: 'ge',
  kosovo: 'xk',
  usa: 'us',
  'united states': 'us',
  'united states of america': 'us',
  canada: 'ca',
  mexico: 'mx',
  brazil: 'br',
  argentina: 'ar',
  colombia: 'co',
  uruguay: 'uy',
  chile: 'cl',
  peru: 'pe',
  ecuador: 'ec',
  paraguay: 'py',
  venezuela: 've',
  bolivia: 'bo',
  jamaica: 'jm',
  haiti: 'ht',
  'saudi arabia': 'sa',
  qatar: 'qa',
  uae: 'ae',
  'united arab emirates': 'ae',
  iran: 'ir',
  bahrain: 'bh',
  yemen: 'ye',
  palestine: 'ps',
  israel: 'il',
  japan: 'jp',
  china: 'cn',
  'china pr': 'cn',
  'south korea': 'kr',
  korea: 'kr',
  india: 'in',
  malaysia: 'my',
  australia: 'au',
  'new zealand': 'nz',
  egypt: 'eg',
  kenya: 'ke',
  nigeria: 'ng',
  morocco: 'ma',
  senegal: 'sn',
  ghana: 'gh',
  cameroon: 'cm',
  algeria: 'dz',
  tunisia: 'tn',
  'south africa': 'za',
  'ivory coast': 'ci',
  "cote d'ivoire": 'ci',
  mali: 'ml',
  'dr congo': 'cd',
  somalia: 'so',
};

const MULTI_COUNTRY_REGIONS = new Set([
  'europe',
  'north america',
  'south america',
  'asia',
  'africa',
  'global',
  'international',
  'world',
]);

export function resolveCountryFlagUrl(country?: string | null): string | null {
  if (!country) return null;
  const clean = country.trim().toLowerCase().replace(/\s+/g, ' ');
  if (!clean || MULTI_COUNTRY_REGIONS.has(clean)) return null;
  const iso2 = COUNTRY_ISO2_MAP[clean];
  if (!iso2) return null;
  return `https://flagcdn.com/w80/${iso2}.png`;
}

interface CircularCountryFlagProps {
  country?: string | null;
  size?: number;
}

/**
 * Displays a crisp borderless circular flag clipped cleanly via overflow: 'hidden',
 * falling back to a neutral Globe icon for continental/global territories.
 */
export const CircularCountryFlag: React.FC<CircularCountryFlagProps> = React.memo(({
  country,
  size = 20,
}) => {
  const remoteUrl = useMemo(() => resolveCountryFlagUrl(country), [country]);
  const entityKey = useMemo(
    () => (country ? `flag:${country.trim().toLowerCase()}` : null),
    [country]
  );

  const [displayUri, setDisplayUri] = useState<string | null>(() => {
    if (!remoteUrl) return null;
    return imageCacheService.getImmediateCachedUri('flag', [remoteUrl], entityKey) || remoteUrl;
  });
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
    if (!remoteUrl) {
      setDisplayUri(null);
      return;
    }

    const immediate = imageCacheService.getImmediateCachedUri('flag', [remoteUrl], entityKey);
    setDisplayUri(immediate || remoteUrl);

    let mounted = true;
    imageCacheService
      .resolveImage({
        entityKey,
        category: 'flag',
        candidates: [remoteUrl],
        priority: 1,
      })
      .then(cachedUri => {
        if (mounted && cachedUri) {
          setDisplayUri(cachedUri);
        }
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, [remoteUrl, entityKey]);

  const radiusStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  if (!displayUri || hasError) {
    return (
      <View style={[styles.fallbackCircle, radiusStyle]}>
        <Globe size={Math.round(size * 0.65)} color="#A58BFC" strokeWidth={2} />
      </View>
    );
  }

  return (
    <View style={[styles.circleClip, radiusStyle]}>
      <Image
        source={{ uri: displayUri }}
        style={styles.flagImage}
        resizeMode="cover"
        fadeDuration={0}
        onError={() => {
          if (displayUri) {
            imageCacheService.reportLoadError(displayUri, 'flag').catch(() => {});
          }
          setHasError(true);
        }}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  circleClip: {
    overflow: 'hidden',
    backgroundColor: '#251F3A',
  },
  flagImage: {
    width: '100%',
    height: '100%',
  },
  fallbackCircle: {
    backgroundColor: 'rgba(165, 139, 252, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CircularCountryFlag;
