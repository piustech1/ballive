import React, { useState, useMemo } from 'react';
import { View, Image, StyleSheet, StyleProp, ViewStyle, ImageSourcePropType } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../../theme/colors';

export type AthleteKey =
  | 'nico_paz'
  | 'michael_olise'
  | 'raphinha'
  | 'cristiano_ronaldo'
  | 'erling_haaland'
  | 'mohamed_salah'
  | 'leon_goretzka'
  | 'max_verstappen'
  | 'lewis_hamilton';

// Genuine, legally verified Creative Commons athlete photography stored locally for offline playback
const LOCAL_ATHLETE_PHOTOS: Record<AthleteKey, ImageSourcePropType> = {
  // Football Marquee Athletes
  nico_paz: require('../../../assets/images/players/football/nico_paz.jpg'),
  michael_olise: require('../../../assets/images/players/football/michael_olise.jpg'),
  raphinha: require('../../../assets/images/players/football/raphinha.jpg'),
  cristiano_ronaldo: require('../../../assets/images/players/football/cristiano_ronaldo.jpg'),
  erling_haaland: require('../../../assets/images/players/football/erling_haaland.jpg'),
  mohamed_salah: require('../../../assets/images/players/football/mohamed_salah.jpg'),
  leon_goretzka: require('../../../assets/images/players/football/leon_goretzka.jpg'),

  // Motorsport Marquee Drivers
  max_verstappen: require('../../../assets/images/players/motorsport/max_verstappen.jpg'),
  lewis_hamilton: require('../../../assets/images/players/motorsport/lewis_hamilton.jpg'),
};

const FOOTBALL_ROTATION: AthleteKey[] = [
  'erling_haaland',
  'cristiano_ronaldo',
  'mohamed_salah',
  'nico_paz',
  'michael_olise',
  'raphinha',
  'leon_goretzka',
];

export interface CurvedHeaderPlayerBackgroundProps {
  sport?: string;
  athlete?: AthleteKey;
  screen?: 'home' | 'discover' | 'saved' | 'details';
  playerImageUrl?: string | null;
  opacity?: number;
  style?: StyleProp<ViewStyle>;
}

export const CurvedHeaderPlayerBackground: React.FC<CurvedHeaderPlayerBackgroundProps> = ({
  sport = 'soccer',
  athlete,
  screen,
  playerImageUrl,
  opacity = 0.22,
  style,
}) => {
  const [imageFailed, setImageFailed] = useState(false);

  const resolvedSource: ImageSourcePropType = useMemo(() => {
    // 1. Explicit athlete key passed
    if (athlete && LOCAL_ATHLETE_PHOTOS[athlete]) {
      return LOCAL_ATHLETE_PHOTOS[athlete];
    }

    // 2. Custom remote URL passed
    if (playerImageUrl && playerImageUrl.trim().length > 10) {
      return { uri: playerImageUrl.trim() };
    }

    const normSport = (sport || '').toLowerCase();
    const dayOfMonth = new Date().getDate();

    // 3. Motorsport / Racing / Formula 1
    if (normSport.includes('motor') || normSport.includes('f1') || normSport.includes('racing') || normSport.includes('formula')) {
      return dayOfMonth % 2 === 0
        ? LOCAL_ATHLETE_PHOTOS.max_verstappen
        : LOCAL_ATHLETE_PHOTOS.lewis_hamilton;
    }

    // 4. Screen-specific curated assignments
    if (screen === 'discover') {
      // Discover screen highlights breakout & tactical stars
      const discoverKeys: AthleteKey[] = ['nico_paz', 'michael_olise', 'leon_goretzka'];
      const key = discoverKeys[dayOfMonth % discoverKeys.length];
      return LOCAL_ATHLETE_PHOTOS[key];
    }

    if (screen === 'saved') {
      // Saved screen features legendary global icons
      const savedKeys: AthleteKey[] = ['cristiano_ronaldo', 'mohamed_salah', 'erling_haaland'];
      const key = savedKeys[dayOfMonth % savedKeys.length];
      return LOCAL_ATHLETE_PHOTOS[key];
    }

    // 5. Default: Rotating daily marquee football star
    const rotationIndex = dayOfMonth % FOOTBALL_ROTATION.length;
    const selectedKey = FOOTBALL_ROTATION[rotationIndex];
    return LOCAL_ATHLETE_PHOTOS[selectedKey];
  }, [athlete, playerImageUrl, sport, screen]);

  if (imageFailed) {
    return null;
  }

  const headerBgColor = Colors.headerPurple || '#1E1730';

  return (
    <View style={[styles.container, style]} pointerEvents="none">
      {/* 1. Underlying authentic sports athlete photo */}
      <Image
        source={resolvedSource}
        style={[styles.playerImage, { opacity }]}
        resizeMode="cover"
        onError={() => setImageFailed(true)}
      />

      {/* 2. Horizontal Linear Gradient: Left-to-right fade protecting text, title & search */}
      <LinearGradient
        colors={[
          headerBgColor,
          'rgba(30, 23, 48, 0.88)',
          'rgba(30, 23, 48, 0.5)',
          'transparent',
        ]}
        locations={[0, 0.35, 0.65, 1]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* 3. Multi-stop Vertical Linear Gradient: Smooth, organic bottom fade without hard rectangular edge */}
      <LinearGradient
        colors={[
          'rgba(30, 23, 48, 0.05)',
          'rgba(30, 23, 48, 0.2)',
          'rgba(30, 23, 48, 0.6)',
          'rgba(30, 23, 48, 0.92)',
          headerBgColor,
        ]}
        locations={[0, 0.35, 0.65, 0.88, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* 4. Diagonal Corner Vignette: Softens the bottom-right corner into the curved contour */}
      <LinearGradient
        colors={['transparent', 'rgba(30, 23, 48, 0.75)', headerBgColor]}
        locations={[0, 0.7, 1]}
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
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
});

export default CurvedHeaderPlayerBackground;
