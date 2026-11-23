import React, { useState } from 'react';
import { View, Image, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../../theme/colors';

// Verified, high-resolution authentic sports action photography
const AUTHENTIC_SPORTS_PLAYER_PHOTOS: Record<string, string> = {
  // Football / Soccer: Dynamic athletic action under stadium floodlights
  soccer: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1200&auto=format&fit=crop',
  football: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1200&auto=format&fit=crop',

  // Basketball: High-intensity aerial dunk action
  basketball: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1200&auto=format&fit=crop',

  // Motorsport: High-speed racing driver & track action
  motorsport: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=1200&auto=format&fit=crop',

  // Combat / MMA: Focused athlete in corner / fight stance
  mma: 'https://images.unsplash.com/photo-1517438322307-e67111335449?q=80&w=1200&auto=format&fit=crop',

  // American Football
  american_football: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?q=80&w=1200&auto=format&fit=crop',

  // Ice Hockey
  hockey: 'https://images.unsplash.com/photo-1580748141549-71748dbe0bdc?q=80&w=1200&auto=format&fit=crop',

  // Default fallback authentic sports action
  default: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=1200&auto=format&fit=crop',
};

export interface CurvedHeaderPlayerBackgroundProps {
  sport?: string;
  playerImageUrl?: string | null;
  opacity?: number;
  style?: StyleProp<ViewStyle>;
}

export const CurvedHeaderPlayerBackground: React.FC<CurvedHeaderPlayerBackgroundProps> = ({
  sport = 'soccer',
  playerImageUrl,
  opacity = 0.22,
  style,
}) => {
  const [imageFailed, setImageFailed] = useState(false);

  if (imageFailed) {
    return null;
  }

  const normSport = (sport || 'soccer').toLowerCase();
  const sourceUri =
    playerImageUrl && playerImageUrl.trim().length > 10
      ? playerImageUrl.trim()
      : AUTHENTIC_SPORTS_PLAYER_PHOTOS[normSport] || AUTHENTIC_SPORTS_PLAYER_PHOTOS.default;

  const headerBgColor = Colors.headerPurple || '#1E1730';

  return (
    <View style={[styles.container, style]} pointerEvents="none">
      {/* 1. Underlying authentic sports athlete photo */}
      <Image
        source={{ uri: sourceUri }}
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
