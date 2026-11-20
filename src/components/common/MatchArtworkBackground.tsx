/**
 * BALLIVE Universal Match Artwork Background Component
 * 
 * Strict Artwork Priority Engine:
 * 1. Valid original event-specific thumbnail (TheSportsDB, ESPN, broadcaster CDNs)
 *    -> Renders and preserves original event artwork.
 * 2. Original thumbnail missing, null, empty, invalid, or failed to load
 *    -> Renders the authentic solid team-color match versus artwork matching reference geometry.
 * 
 * Continuous Background Presence:
 * - Solid team-color artwork is always mounted as the reliable base canvas.
 * - When remote genuine artwork is fetching, users immediately see the authentic versus artwork
 *   instead of a black or blank void.
 * - Once genuine artwork successfully decodes, it cleanly overlays the canvas without layout shifts.
 * 
 * Proportional Geometry (Reference Image: media_1794769783467.png):
 * - Sharp 50/50 vertical division between home and away team brand colors.
 * - Home team's official crest centered horizontally & vertically in left 50%.
 * - Away team's official crest centered horizontally & vertically in right 50%.
 * - Official competition emblem badge centered on the dividing line seam.
 * - Subtle bottom contrast vignette ensures card text and live scores remain razor-sharp.
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
import { getTeamCrest, DEFAULT_CREST } from '../../utils/teamCrestResolver';
import { getMatchupColors } from '../../utils/teamColorResolver';
import { CompetitionLogo, resolveCompetitionLogo } from './CompetitionLogo';

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
  homeColor: propHomeColor,
  awayColor: propAwayColor,
  competition,
  competitionLogo,
  originalArtworkUrl,
  style,
  imageStyle,
  children,
}) => {
  // 1. Check if original artwork URL is genuine event artwork
  const isOriginalGenuine = Boolean(
    originalArtworkUrl && isGenuineEventArtwork(originalArtworkUrl)
  );

  const [imageLoadFailed, setImageLoadFailed] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Reset load states when original artwork URL changes
  useEffect(() => {
    setImageLoadFailed(false);
    setImageLoaded(false);
  }, [originalArtworkUrl]);

  // Determine whether to show overlay genuine artwork
  const shouldUseOriginal = isOriginalGenuine && !imageLoadFailed;

  // 2. Resolve team brand colors with scientific collision avoidance
  const { homeColor, awayColor } = useMemo(() => {
    if (propHomeColor && propAwayColor) {
      return { homeColor: propHomeColor, awayColor: propAwayColor };
    }
    const resolved = getMatchupColors(homeTeamName, awayTeamName, homeTeamId, awayTeamId);
    return {
      homeColor: propHomeColor || resolved.homeColor,
      awayColor: propAwayColor || resolved.awayColor,
    };
  }, [homeTeamName, awayTeamName, homeTeamId, awayTeamId, propHomeColor, propAwayColor]);

  // 3. Resolve team crests
  const resolvedHomeCrest = useMemo(() => {
    return homeCrest || getTeamCrest(homeTeamName) || DEFAULT_CREST;
  }, [homeCrest, homeTeamName]);

  const resolvedAwayCrest = useMemo(() => {
    return awayCrest || getTeamCrest(awayTeamName) || DEFAULT_CREST;
  }, [awayCrest, awayTeamName]);

  const resolvedCompLogo = useMemo(() => {
    return competitionLogo || resolveCompetitionLogo(competition);
  }, [competitionLogo, competition]);

  return (
    <View style={[styles.container, style]}>
      {/* ── BASE LAYER: SOLID TEAM-COLOR MATCH VERSUS ARTWORK (Always present underneath) ── */}
      <View style={[StyleSheet.absoluteFillObject, styles.splitCanvas]}>
        {/* Left Half: Home Team Primary Solid Brand Color */}
        <View style={[styles.halfSection, { backgroundColor: homeColor }]}>
          <View style={styles.crestWrapper}>
            <Image
              source={{ uri: resolvedHomeCrest }}
              style={styles.crestImage}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Right Half: Away Team Primary Solid Brand Color */}
        <View style={[styles.halfSection, { backgroundColor: awayColor }]}>
          <View style={styles.crestWrapper}>
            <Image
              source={{ uri: resolvedAwayCrest }}
              style={styles.crestImage}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Center Seam: Official Competition Emblem Badge */}
        <View style={styles.centerBadgeContainer}>
          <CompetitionLogo
            competitionId={competition}
            uri={resolvedCompLogo}
            size={20}
          />
        </View>
      </View>

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

      {/* Subtle bottom vignette to ensure team crests, scores, and text remain sharp */}
      <LinearGradient
        colors={['transparent', 'rgba(12, 9, 18, 0.65)']}
        start={{ x: 0, y: 0.55 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />

      {/* Overlay Children: Top competition row, bottom matchup scores & crests */}
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
  originalImage: {
    width: '100%',
    height: '100%',
  },
  splitCanvas: {
    flexDirection: 'row',
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  halfSection: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  crestWrapper: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  crestImage: {
    width: '58%',
    height: '58%',
    maxWidth: 68,
    maxHeight: 68,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
  },
  centerBadgeContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -15 }, { translateY: -15 }],
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(20, 15, 30, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10,
  },
});

export default MatchArtworkBackground;
