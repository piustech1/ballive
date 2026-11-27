import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Animated,
  StyleSheet,
  StyleProp,
  ViewStyle,
  ImageSourcePropType,
  AppState,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../../theme/colors';
import { playerAssetService, AthleteKey, AthleteInfo } from '../../services/playerAssetService';

export interface CurvedHeaderPlayerBackgroundProps {
  sport?: string;
  athlete?: AthleteKey;
  screen?: 'home' | 'discover' | 'saved' | 'profile' | 'details';
  teamName?: string;
  homeTeam?: string;
  awayTeam?: string;
  sectionId?: string;
  playerImageUrl?: string | null;
  opacity?: number;
  scrimVariant?: 'standard' | 'extendedProfile';
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
  opacity = 0.8,
  scrimVariant = 'standard',
  style,
}) => {
  const [imageFailed, setImageFailed] = useState(false);

  // 1. Resolve athlete pool for smooth crossfade rotation
  const athletePool: AthleteInfo[] = useMemo(() => {
    if (playerImageUrl && playerImageUrl.trim().length > 10) {
      return [];
    }
    return playerAssetService.getAthletePool({
      screen,
      sport,
      teamName,
      homeTeam,
      awayTeam,
      athleteKey: athlete,
      sectionId,
    });
  }, [screen, sport, teamName, homeTeam, awayTeam, athlete, sectionId, playerImageUrl]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const currentIndexRef = useRef(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // 2. Automatic rotating player selection with smooth crossfade (8-second interval)
  useEffect(() => {
    if (athletePool.length <= 1 || playerImageUrl) return;

    let intervalId: NodeJS.Timeout | null = null;

    const startRotationTimer = () => {
      if (intervalId) clearInterval(intervalId);
      intervalId = setInterval(() => {
        const fromIdx = currentIndexRef.current;
        const toIdx = (fromIdx + 1) % athletePool.length;
        currentIndexRef.current = toIdx;

        setPrevIndex(fromIdx);
        setCurrentIndex(toIdx);
        fadeAnim.setValue(0);

        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 750,
          useNativeDriver: true,
        }).start(() => {
          setPrevIndex(null);
        });
      }, 8000);
    };

    startRotationTimer();

    // Pause timer when app is backgrounded, resume when active
    const subscription = AppState.addEventListener('change', nextState => {
      if (nextState === 'active') {
        startRotationTimer();
      } else {
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
      }
    });

    return () => {
      if (intervalId) clearInterval(intervalId);
      subscription.remove();
    };
  }, [athletePool.length, playerImageUrl]);

  if (imageFailed) {
    return null;
  }

  const headerBgColor = Colors.headerPurple || '#1E1730';
  const isExtendedProfile = scrimVariant === 'extendedProfile';

  // Handle custom URL fallback
  const isCustomUrl = Boolean(playerImageUrl && playerImageUrl.trim().length > 10);
  const currentSource: ImageSourcePropType = isCustomUrl
    ? { uri: (playerImageUrl as string).trim() }
    : (athletePool[currentIndex]?.source || athletePool[0]?.source);

  const prevSource: ImageSourcePropType | null =
    prevIndex !== null && athletePool[prevIndex] ? athletePool[prevIndex].source : null;

  const topOpacity = fadeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, opacity],
  });

  return (
    <View style={[styles.container, style]} pointerEvents="none">
      {/* Underlying Previous Athlete during Crossfade */}
      {prevSource && (
        <Animated.Image
          source={prevSource}
          style={[styles.playerImage, { opacity }]}
          resizeMode="cover"
        />
      )}

      {/* Active Athlete Photo (Fills entire cavity naturally) */}
      <Animated.Image
        source={currentSource}
        style={[
          styles.playerImage,
          { opacity: prevSource ? topOpacity : opacity },
        ]}
        resizeMode="cover"
        onError={() => setImageFailed(true)}
      />

      {isExtendedProfile ? (
        <>
          {/* Left-to-right readability scrim for enlarged profile identity without obscuring right athlete */}
          <LinearGradient
            colors={[
              'rgba(18, 14, 30, 0.94)',
              'rgba(21, 16, 36, 0.72)',
              'rgba(21, 16, 36, 0.24)',
              'rgba(18, 14, 30, 0.08)',
            ]}
            locations={[0, 0.34, 0.65, 1]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={StyleSheet.absoluteFillObject}
          />

          {/* Subtle top & bottom atmospheric feather so athlete photo extends seamlessly down to the curved clip */}
          <LinearGradient
            colors={[
              'rgba(18, 14, 30, 0.42)',
              'transparent',
              'rgba(18, 14, 30, 0.08)',
              'rgba(18, 14, 30, 0.42)',
            ]}
            locations={[0, 0.22, 0.7, 1.0]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
        </>
      ) : (
        <>
          {/* Horizontal Linear Gradient: Left-to-right fade protecting title & search, opening to full athlete view */}
          <LinearGradient
            colors={[
              headerBgColor,
              'rgba(30, 23, 48, 0.75)',
              'rgba(30, 23, 48, 0.20)',
              'transparent',
            ]}
            locations={[0, 0.28, 0.58, 0.88]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={StyleSheet.absoluteFillObject}
          />

          {/* Vertical Linear Gradient: Soft bottom blend without dimming athlete faces */}
          <LinearGradient
            colors={[
              'transparent',
              'rgba(30, 23, 48, 0.05)',
              'rgba(30, 23, 48, 0.65)',
              headerBgColor,
            ]}
            locations={[0, 0.65, 0.88, 1.0]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />

          {/* Diagonal Corner Vignette: Softens the bottom-right corner into the curved contour */}
          <LinearGradient
            colors={['transparent', 'rgba(30, 23, 48, 0.35)', headerBgColor]}
            locations={[0, 0.82, 1.0]}
            start={{ x: 0.4, y: 0.4 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
        </>
      )}
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
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
});

export default CurvedHeaderPlayerBackground;
