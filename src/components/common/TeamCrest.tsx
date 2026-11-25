import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Image,
  StyleSheet,
  StyleProp,
  ViewStyle,
  ImageStyle,
  ImageResizeMode,
} from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { DEFAULT_CREST } from '../../utils/teamCrestResolver';
import { teamEmblemService } from '../../services/teamEmblemService';
import { imageCacheService, ImagePriority } from '../../services/imageCacheService';

export interface TeamCrestProps {
  uri?: string | null;
  teamId?: string;
  teamName?: string;
  size?: number;
  width?: number;
  height?: number;
  priority?: ImagePriority;
  style?: StyleProp<ImageStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  resizeMode?: ImageResizeMode;
}

/**
 * Clean, neutral sports club shield rendered via SVG.
 * Resolution-independent, styled to complement BALLIVE's dark visual identity.
 */
export const NeutralSportsShield: React.FC<{ size: number }> = React.memo(({ size }) => {
  const width = size;
  const height = Math.round(size * 1.15);

  return (
    <Svg width={width} height={height} viewBox="0 0 100 115" fill="none">
      <Defs>
        <LinearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#2A2045" />
          <Stop offset="100%" stopColor="#181329" />
        </LinearGradient>
        <LinearGradient id="shieldBorderGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#6C52B8" stopOpacity="0.75" />
          <Stop offset="100%" stopColor="#433273" stopOpacity="0.45" />
        </LinearGradient>
        <LinearGradient id="chevronGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="#7952FC" stopOpacity="0.4" />
          <Stop offset="50%" stopColor="#9B7BF7" stopOpacity="0.65" />
          <Stop offset="100%" stopColor="#7952FC" stopOpacity="0.4" />
        </LinearGradient>
      </Defs>

      <Path
        d="M 14 8 L 86 8 Q 92 8 92 14 L 92 56 C 92 86 54 105 50 108 C 46 105 8 86 8 56 L 8 14 Q 8 8 14 8 Z"
        fill="url(#shieldGrad)"
        stroke="url(#shieldBorderGrad)"
        strokeWidth="3.5"
      />

      <Path
        d="M 20 16 L 80 16 Q 84 16 84 20 L 84 55 C 84 79 53 95 50 98 C 47 95 16 79 16 55 L 16 20 Q 16 16 20 16 Z"
        stroke="#4C3B78"
        strokeWidth="1.5"
        strokeOpacity="0.5"
        fill="none"
      />

      <Path
        d="M 24 38 L 50 56 L 76 38 L 76 48 L 50 66 L 24 48 Z"
        fill="url(#chevronGrad)"
      />

      <Path
        d="M 50 24 L 59 31 L 55 41 L 45 41 L 41 31 Z"
        fill="#A58BFC"
        fillOpacity="0.65"
      />
    </Svg>
  );
});

/**
 * Universal BALLIVE Team Crest Component
 * Renders team emblems flat on dark surfaces without circles/outlines, backed by
 * persistent disk caching, prioritized download queueing, and candidate fallback recovery.
 */
export const TeamCrest: React.FC<TeamCrestProps> = React.memo(({
  uri,
  teamId,
  teamName,
  size = 28,
  width,
  height,
  priority = 0,
  style,
  containerStyle,
  resizeMode = 'contain',
}) => {
  const candidates = useMemo(
    () => teamEmblemService.buildCandidates(teamId, teamName, uri),
    [teamId, teamName, uri]
  );
  const entityKey = useMemo(
    () => teamEmblemService.getEntityKey(teamId, teamName),
    [teamId, teamName]
  );
  const identitySignature = `${entityKey || ''}|${candidates.join('|')}`;

  const immediateUri = useMemo(
    () => imageCacheService.getImmediateCachedUri('team', candidates, entityKey),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [identitySignature]
  );

  const [resolvedUri, setResolvedUri] = useState<string | null>(immediateUri);
  const [fallbackIdx, setFallbackIdx] = useState<number>(-1);
  const [exhausted, setExhausted] = useState(false);

  const effectiveWidth = width ?? size;
  const effectiveHeight = height ?? size;

  // Resolve cleanly from disk/priority queue whenever team or URI changes
  useEffect(() => {
    let isMounted = true;
    setFallbackIdx(-1);
    setExhausted(false);

    if (immediateUri) {
      setResolvedUri(immediateUri);
      return;
    }

    setResolvedUri(null);
    if (candidates.length === 0 && !entityKey) {
      setExhausted(true);
      return;
    }

    teamEmblemService
      .getOrFetchEmblem(teamId, teamName, uri, priority)
      .then(result => {
        if (!isMounted) return;
        if (result && result !== DEFAULT_CREST) {
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
  }, [identitySignature, immediateUri, priority, teamId, teamName, uri, candidates, entityKey]);

  const handleImageError = () => {
    if (resolvedUri) {
      imageCacheService.reportLoadError(resolvedUri, 'team').catch(() => {});
    }

    // Advance cleanly through secondary verified candidates before showing fallback shield
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

  const activeSourceUri =
    !exhausted && resolvedUri && resolvedUri !== DEFAULT_CREST ? resolvedUri : null;

  return (
    <View
      style={[
        styles.container,
        { width: effectiveWidth, height: effectiveHeight },
        containerStyle,
      ]}
      accessibilityRole="image"
      accessibilityLabel={teamName ? `${teamName} crest` : 'Team crest'}
    >
      {activeSourceUri ? (
        <Image
          source={{ uri: activeSourceUri }}
          style={[styles.image, style]}
          resizeMode={resizeMode}
          onError={handleImageError}
        />
      ) : (
        <NeutralSportsShield size={Math.min(effectiveWidth, effectiveHeight)} />
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
});

export default TeamCrest;
