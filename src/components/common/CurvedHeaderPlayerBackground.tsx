import React, { useState, useMemo } from 'react';
import { View, Image, StyleSheet, StyleProp, ViewStyle, ImageSourcePropType } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../../theme/colors';
import { playerAssetService, AthleteKey } from '../../services/playerAssetService';

export interface CurvedHeaderPlayerBackgroundProps {
  sport?: string;
  athlete?: AthleteKey;
  screen?: 'home' | 'discover' | 'saved' | 'details';
  teamName?: string;
  homeTeam?: string;
  awayTeam?: string;
  sectionId?: string;
  playerImageUrl?: string | null;
  opacity?: number;
  style?: StyleProp<ViewStyle>;
}

export const CurvedHeaderPlayerBackground: React.FC<CurvedHeaderPlayerBackgroundProps> = ({
  sport = 'soccer',
  athlete,
  screen,
  teamName,
  homeTeam,
  awayTeam,
  sectionId,
  playerImageUrl,
  opacity = 0.72,
  style,
}) => {
  const [imageFailed, setImageFailed] = useState(false);

  const resolvedSource: ImageSourcePropType = useMemo(() => {
    // 1. Custom remote URL passed
    if (playerImageUrl && playerImageUrl.trim().length > 10) {
      return { uri: playerImageUrl.trim() };
    }

    // 2. Select authentic athlete via PlayerAssetService
    const selected = playerAssetService.selectAthlete({
      screen,
      sport,
      teamName,
      homeTeam,
      awayTeam,
      athleteKey: athlete,
      sectionId,
    });

    return selected.source;
  }, [athlete, playerImageUrl, sport, screen, teamName, homeTeam, awayTeam, sectionId]);

  if (imageFailed) {
    return null;
  }

  const headerBgColor = Colors.headerPurple || '#1E1730';

  return (
    <View style={[styles.container, style]} pointerEvents="none">
      {/* 1. Underlying authentic sports athlete photo, positioned on the right for face prominence */}
      <Image
        source={resolvedSource}
        style={[styles.playerImage, { opacity }]}
        resizeMode="cover"
        onError={() => setImageFailed(true)}
      />

      {/* 2. Horizontal Linear Gradient: Left-to-right fade protecting title, search & navigation */}
      <LinearGradient
        colors={[
          headerBgColor,
          'rgba(30, 23, 48, 0.85)',
          'rgba(30, 23, 48, 0.35)',
          'transparent',
        ]}
        locations={[0, 0.38, 0.62, 0.88]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* 3. Multi-stop Vertical Linear Gradient: Soft bottom blend without obscuring the face */}
      <LinearGradient
        colors={[
          'transparent',
          'rgba(30, 23, 48, 0.1)',
          'rgba(30, 23, 48, 0.7)',
          headerBgColor,
        ]}
        locations={[0, 0.62, 0.88, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* 4. Diagonal Corner Vignette: Softens the bottom-right corner into the curved contour */}
      <LinearGradient
        colors={['transparent', 'rgba(30, 23, 48, 0.5)', headerBgColor]}
        locations={[0, 0.8, 1]}
        start={{ x: 0.3, y: 0.3 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  playerImage: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '68%',
    height: '100%',
  },
});

export default CurvedHeaderPlayerBackground;
