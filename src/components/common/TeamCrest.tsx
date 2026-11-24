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

export interface TeamCrestProps {
  uri?: string | null;
  teamId?: string;
  teamName?: string;
  size?: number;
  width?: number;
  height?: number;
  style?: StyleProp<ImageStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  resizeMode?: ImageResizeMode;
}

/**
 * Clean, neutral sports club shield rendered via SVG.
 * Resolution-independent, styled to complement BALLIVE's dark visual identity.
 * Does not suggest any specific club while maintaining an authentic sports crest silhouette.
 */
export const NeutralSportsShield: React.FC<{ size: number }> = React.memo(({ size }) => {
  const width = size;
  const height = Math.round(size * 1.15); // Authentic heraldic shield proportion (1 : 1.15)

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

      {/* Outer Shield Boundary */}
      <Path
        d="M 14 8 L 86 8 Q 92 8 92 14 L 92 56 C 92 86 54 105 50 108 C 46 105 8 86 8 56 L 8 14 Q 8 8 14 8 Z"
        fill="url(#shieldGrad)"
        stroke="url(#shieldBorderGrad)"
        strokeWidth="3.5"
      />

      {/* Inner Inset Accent Shield */}
      <Path
        d="M 20 16 L 80 16 Q 84 16 84 20 L 84 55 C 84 79 53 95 50 98 C 47 95 16 79 16 55 L 16 20 Q 16 16 20 16 Z"
        stroke="#4C3B78"
        strokeWidth="1.5"
        strokeOpacity="0.5"
        fill="none"
      />

      {/* Subtle Central Sports Chevron */}
      <Path
        d="M 24 38 L 50 56 L 76 38 L 76 48 L 50 66 L 24 48 Z"
        fill="url(#chevronGrad)"
      />

      {/* Minimalist Geometric Football / Sports Pentagram Core */}
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
 * Displays team badges completely flat on card/screen surfaces without circular discs,
 * outlines, depressed containers, or decorative shadows.
 * Utilizes TeamEmblemService for persistent caching and request deduplication.
 * Gracefully falls back to a neutral sports shield on error or missing source.
 */
export const TeamCrest: React.FC<TeamCrestProps> = React.memo(({
  uri,
  teamId,
  teamName,
  size = 28,
  width,
  height,
  style,
  containerStyle,
  resizeMode = 'contain',
}) => {
  const [hasError, setHasError] = useState(false);
  const cacheKey = useMemo(() => {
    return teamEmblemService.getCacheKey(teamId, teamName, uri);
  }, [teamId, teamName, uri]);

  const [activeUri, setActiveUri] = useState<string | null>(() => {
    return teamEmblemService.getCachedUri(cacheKey) || uri || null;
  });

  const effectiveWidth = width ?? size;
  const effectiveHeight = height ?? size;

  // Background fetch/persist with TeamEmblemService
  useEffect(() => {
    let isMounted = true;
    setHasError(false);

    const cached = teamEmblemService.getCachedUri(cacheKey);
    if (cached) {
      setActiveUri(cached);
      return;
    }

    teamEmblemService
      .getOrFetchEmblem(teamId, teamName, uri)
      .then((resolved) => {
        if (isMounted && resolved) {
          setActiveUri(resolved);
        }
      })
      .catch(() => {
        if (isMounted) {
          setHasError(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [cacheKey, teamId, teamName, uri]);

  // Determine if URL is invalid, unmapped, broken, or placeholder
  const isInvalid = useMemo(() => {
    if (!activeUri || typeof activeUri !== 'string') return true;
    const trimmed = activeUri.trim();
    if (!trimmed || trimmed === DEFAULT_CREST) return true;
    if (trimmed.includes('ui-avatars.com') || trimmed.includes('default-team-logo')) return true;
    return teamEmblemService.isBroken(trimmed);
  }, [activeUri]);

  const handleError = () => {
    if (activeUri) {
      teamEmblemService.markBroken(activeUri);
    }
    setHasError(true);
  };

  const shouldShowFallback = isInvalid || hasError;

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
      {shouldShowFallback ? (
        <NeutralSportsShield size={Math.min(effectiveWidth, effectiveHeight)} />
      ) : (
        <Image
          source={{ uri: activeUri!.trim() }}
          style={[styles.image, style]}
          resizeMode={resizeMode}
          onError={handleError}
        />
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
