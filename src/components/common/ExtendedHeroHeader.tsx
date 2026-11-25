import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ImageSourcePropType,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, LucideIcon } from 'lucide-react-native';
import Colors from '../../theme/colors';
import { useAppNavigation } from '../../navigation/NavigationContext';

export interface HeroHeaderTopAction {
  icon: LucideIcon;
  onPress: () => void;
  active?: boolean;
  activeColor?: string;
  accessibilityLabel?: string;
}

interface ExtendedHeroHeaderProps {
  /** Verified real photograph (bundled require(...) or cached { uri }) or null for dark BALLIVE surface */
  heroSource: ImageSourcePropType | null;
  /** Center emblem slot (TeamCrest or CompetitionLogo rendered flat) */
  emblemComponent: React.ReactNode;
  /** Primary identity title (e.g. FC Barcelona, Premier League) */
  identityTitle: string;
  /** Contextual subtitle directly beneath identity title (e.g. Football · LaLiga EA Sports) */
  identitySubtitle?: string;
  /** Optional metadata items below subtitle (stadium/country) */
  metaComponent?: React.ReactNode;
  /** Follow pill action CTA */
  followButtonComponent?: React.ReactNode;
}

interface PinnedTopBarProps {
  overlineTitle: string;
  subtitle?: string;
  onBack?: () => void;
  onTitlePress?: () => void;
  rightAction?: HeroHeaderTopAction;
  /** Scroll Y animated value driving compact sticky bar opacity when scrolled past hero */
  scrollY: Animated.Value;
}

/**
 * Sticky transparent top bar overlay at scrollY=0 that transitions smoothly
 * to `#1E1730` as the user scrolls down through long Fixtures/Matches lists.
 * Shares exact status bar insets so there is ZERO gap or card seam at rest.
 */
export const HeroStickyTopBar: React.FC<PinnedTopBarProps> = ({
  overlineTitle,
  subtitle,
  onBack,
  onTitlePress,
  rightAction,
  scrollY,
}) => {
  const insets = useSafeAreaInsets();
  const { goBack } = useAppNavigation();

  const handleBack = () => {
    if (onBack) onBack();
    else goBack();
  };

  const backdropOpacity = scrollY.interpolate({
    inputRange: [18, 95],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <View
      style={[styles.stickyContainer, { paddingTop: Math.max(insets.top, 10) + 4 }]}
      pointerEvents="box-none"
    >
      {/* Fades in clean curved dark header fill only when scrolling past top */}
      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFillObject,
          styles.stickyScrolledBg,
          { opacity: backdropOpacity },
        ]}
      />

      <View style={styles.topRow}>
        <TouchableOpacity
          activeOpacity={0.75}
          style={styles.topIconButton}
          onPress={handleBack}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel="Go back"
        >
          <ArrowLeft size={19} color="#FFFFFF" strokeWidth={2.4} />
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          {onTitlePress ? (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onTitlePress}
              hitSlop={{ top: 6, bottom: 4, left: 4, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel={`Open ${overlineTitle}`}
            >
              <Text style={styles.overlineText} numberOfLines={1} ellipsizeMode="tail">
                {overlineTitle}
              </Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.overlineText} numberOfLines={1} ellipsizeMode="tail">
              {overlineTitle}
            </Text>
          )}
          {subtitle ? (
            <Text style={styles.subtitleText} numberOfLines={1} ellipsizeMode="tail">
              {subtitle}
            </Text>
          ) : null}
        </View>

        {rightAction ? (
          <TouchableOpacity
            activeOpacity={0.75}
            style={[
              styles.topIconButton,
              rightAction.active && styles.topIconButtonActive,
            ]}
            onPress={rightAction.onPress}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel={rightAction.accessibilityLabel || 'Action'}
          >
            <rightAction.icon
              size={18}
              color={
                rightAction.active
                  ? rightAction.activeColor || '#A58BFC'
                  : '#FFFFFF'
              }
              strokeWidth={2.3}
            />
          </TouchableOpacity>
        ) : (
          <View style={styles.topRightSpacer} />
        )}
      </View>
    </View>
  );
};

/**
 * Unified Full-Bleed Extended Hero Header Container
 * Spans continuously from top of screen (behind status bar/notch + top nav row)
 * through the centered team/competition identity block down to BALLIVE's 28dp curved bottom corners.
 */
export const ExtendedHeroHeader: React.FC<ExtendedHeroHeaderProps> = ({
  heroSource,
  emblemComponent,
  identityTitle,
  identitySubtitle,
  metaComponent,
  followButtonComponent,
}) => {
  const insets = useSafeAreaInsets();
  const topBarClearance = Math.max(insets.top, 10) + 4 + 44 + 14;
  const [photoFailed, setPhotoFailed] = useState(false);

  useEffect(() => {
    setPhotoFailed(false);
  }, [heroSource]);

  const showPhoto = Boolean(heroSource) && !photoFailed;

  return (
    <View style={[styles.heroContainer, { paddingTop: topBarClearance }]}>
      {/* Full-bleed Context-Aware Club / Competition Background Photography */}
      {showPhoto && heroSource ? (
        <Image
          source={heroSource}
          style={styles.heroBgImage}
          resizeMode="cover"
          onError={() => setPhotoFailed(true)}
        />
      ) : null}

      {/* Top & Mid Contrast Scrim: keeps authentic photo clearly recognizable behind text */}
      <LinearGradient
        colors={
          showPhoto
            ? [
                'rgba(18, 14, 32, 0.56)',
                'rgba(22, 17, 40, 0.42)',
                'rgba(16, 13, 28, 0.72)',
                'rgba(14, 13, 20, 0.94)',
              ]
            : ['#251C3D', '#1E1730', '#161224', '#141120']
        }
        locations={[0, 0.34, 0.74, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />

      {/* Subtle radial depth tint from purple header base at top corners */}
      {showPhoto ? (
        <LinearGradient
          colors={['rgba(30, 23, 48, 0.45)', 'transparent']}
          locations={[0, 0.55]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0.8 }}
          style={StyleSheet.absoluteFillObject}
          pointerEvents="none"
        />
      ) : null}

      {/* Centered Identity Stack inside same unified canvas */}
      <View style={styles.identityContent}>
        <View style={styles.emblemSlot}>{emblemComponent}</View>

        <Text style={styles.heroTitle} numberOfLines={2}>
          {identityTitle}
        </Text>

        {identitySubtitle ? (
          <Text style={styles.heroSubtitle} numberOfLines={1}>
            {identitySubtitle}
          </Text>
        ) : null}

        {metaComponent ? <View style={styles.metaSlot}>{metaComponent}</View> : null}

        {followButtonComponent ? <View style={styles.ctaSlot}>{followButtonComponent}</View> : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  stickyContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 30,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  stickyScrolledBg: {
    backgroundColor: Colors.headerPurple || '#1E1730',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  topRow: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
  },
  topIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(28, 21, 48, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topIconButtonActive: {
    backgroundColor: 'rgba(53, 37, 88, 0.88)',
  },
  topRightSpacer: {
    width: 36,
    height: 36,
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  overlineText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D5CFE6',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    textShadowColor: 'rgba(0, 0, 0, 0.55)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  subtitleText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
    marginTop: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.55)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  heroContainer: {
    width: '100%',
    backgroundColor: Colors.headerPurple || '#1E1730',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
    paddingBottom: 24,
    marginBottom: 16,
  },
  heroBgImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  identityContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emblemSlot: {
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    fontSize: 23,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.3,
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.65)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  heroSubtitle: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#D5CFE6',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.55)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  metaSlot: {
    marginBottom: 14,
    alignItems: 'center',
  },
  ctaSlot: {
    alignItems: 'center',
  },
});

export default ExtendedHeroHeader;
