/**
 * BALLIVE Universal Match Artwork Background Component
 * 
 * Strict Artwork Priority Engine:
 * 1. Valid original event-specific thumbnail (TheSportsDB, ESPN, broadcaster CDNs)
 *    -> Renders and preserves genuine match artwork.
 * 2. Original thumbnail missing, null, empty, invalid, or failed to load
 *    -> Renders dedicated league fallback background artwork (Premier League, LaLiga,
 *       Bundesliga, Champions League, Europa League, Conference League, General Football).
 *    -> Overlays transparent home emblem on the left and away emblem on the right directly
 *       without circular discs, white backgrounds, or typography overlays.
 * 3. Failure fallback: Clean neutral dark container (#161224).
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Image,
  StyleSheet,
  StyleProp,
  ViewStyle,
  ImageStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { isGenuineEventArtwork } from '../../utils/sportBackgroundResolver';
import { DEFAULT_CREST } from '../../utils/teamCrestResolver';
import { resolveThumbnailBackground } from '../../utils/thumbnailBackgroundResolver';
import { teamEmblemService } from '../../services/teamEmblemService';
import { TeamCrest } from './TeamCrest';

export interface MatchArtworkBackgroundProps {
  matchId?: string;
  homeTeamName: string;
  awayTeamName: string;
  homeTeamId?: string;
  awayTeamId?: string;
  sport?: string;
  homeCrest?: string;
  awayCrest?: string;
  homeColor?: string;
  awayColor?: string;
  competition?: string;
  competitionLogo?: string;
  originalArtworkUrl?: string | null;
  featured?: boolean;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
  children?: React.ReactNode;
}

export const MatchArtworkBackground: React.FC<MatchArtworkBackgroundProps> = ({
  matchId,
  homeTeamName,
  awayTeamName,
  homeTeamId,
  awayTeamId,
  sport,
  homeCrest,
  awayCrest,
  competition,
  competitionLogo,
  originalArtworkUrl,
  featured = false,
  style,
  imageStyle,
  children,
}) => {
  // 1. Check if original artwork URL is genuine event artwork
  const isOriginalGenuine = Boolean(
    originalArtworkUrl && isGenuineEventArtwork(originalArtworkUrl)
  );

  const [imageLoadFailed, setImageLoadFailed] = useState(false);

  // Reset load states when original artwork URL changes
  useEffect(() => {
    setImageLoadFailed(false);
  }, [originalArtworkUrl]);

  // Determine whether to show overlay genuine artwork
  const shouldUseOriginal = isOriginalGenuine && !imageLoadFailed;

  // 2. Resolve league-specific fallback background artwork
  const fallbackSource = useMemo(() => {
    return resolveThumbnailBackground(competition, sport);
  }, [competition, sport]);

  // 3. Resolve team crests with stable IDs and names
  const resolvedHomeCrest = useMemo(() => {
    return teamEmblemService.resolveRemoteUrl(homeTeamId, homeCrest, homeTeamName) || DEFAULT_CREST;
  }, [homeCrest, homeTeamId, homeTeamName]);

  const resolvedAwayCrest = useMemo(() => {
    return teamEmblemService.resolveRemoteUrl(awayTeamId, awayCrest, awayTeamName) || DEFAULT_CREST;
  }, [awayCrest, awayTeamId, awayTeamName]);

  // Enlarge fallback emblems from 52 to 68-72 (and 76 on featured cards)
  const emblemSize = featured ? 76 : 68;

  return (
    <View style={[styles.container, style]}>
      {/* ── BASE LAYER: DEDICATED LEAGUE / SPORT FALLBACK ARTWORK ── */}
      <Image
        source={fallbackSource}
        style={[StyleSheet.absoluteFillObject, styles.fallbackImage]}
        resizeMode="cover"
      />

      {/* ── EMBLEMS OVERLAY ON FALLBACK THUMBNAIL (Home Left, Away Right) ── */}
      {!shouldUseOriginal ? (
        <View style={[StyleSheet.absoluteFillObject, styles.emblemsContainer]} pointerEvents="none">
          {/* Left Slot: Home Team Emblem */}
          <View style={styles.leftEmblemSlot}>
            <TeamCrest
              uri={resolvedHomeCrest}
              teamId={homeTeamId}
              teamName={homeTeamName}
              size={emblemSize}
            />
          </View>

          {/* Right Slot: Away Team Emblem */}
          <View style={styles.rightEmblemSlot}>
            <TeamCrest
              uri={resolvedAwayCrest}
              teamId={awayTeamId}
              teamName={awayTeamName}
              size={emblemSize}
            />
          </View>
        </View>
      ) : null}

      {/* ── OVERLAY LAYER: ORIGINAL GENUINE EVENT ARTWORK (When available & loaded) ── */}
      {shouldUseOriginal && originalArtworkUrl ? (
        <Image
          source={{ uri: originalArtworkUrl }}
          style={[
            StyleSheet.absoluteFillObject,
            styles.originalImage,
            imageStyle,
          ]}
          resizeMode="cover"
          onError={() => setImageLoadFailed(true)}
        />
      ) : null}

      {/* Subtle bottom vignette to ensure card text and live scores remain razor-sharp */}
      <LinearGradient
        colors={['transparent', 'rgba(14, 10, 22, 0.62)']}
        start={{ x: 0, y: 0.55 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />

      {/* Overlay Children: Top competition row, status pills, bookmark */}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
    overflow: 'hidden',
    justifyContent: 'space-between',
    backgroundColor: '#161224',
  },
  fallbackImage: {
    width: '100%',
    height: '100%',
  },
  originalImage: {
    width: '100%',
    height: '100%',
  },
  emblemsContainer: {
    flexDirection: 'row',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  leftEmblemSlot: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  rightEmblemSlot: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
});

export default MatchArtworkBackground;
