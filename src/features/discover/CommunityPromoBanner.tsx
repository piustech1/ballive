import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Linking,
} from 'react-native';
import { MessageSquarePlus, ArrowRight, Users } from 'lucide-react-native';
import Colors from '../../theme/colors';

interface CommunityPromoBannerProps {
  onPressAction?: () => void;
}

export const CommunityPromoBanner: React.FC<CommunityPromoBannerProps> = ({
  onPressAction,
}) => {
  const handleCreatePost = () => {
    if (onPressAction) {
      onPressAction();
      return;
    }
    // Connects to the official BALLIVE Community discussion desk / channel
    Linking.openURL('https://whatsapp.com').catch(() => {});
  };

  return (
    <View style={styles.container}>
      {/* ── 1. AUTHENTIC SUPPORTERS ILLUSTRATION ── */}
      <View style={styles.imageContainer}>
        <Image
          source={require('../../../assets/community_banner.jpg')}
          style={styles.bannerImage}
          resizeMode="cover"
        />
      </View>

      {/* ── 2. PROMOTIONAL CONTENT & CTA ── */}
      <View style={styles.contentContainer}>
        {/* Community Category Pill */}
        <View style={styles.categoryPill}>
          <Users size={12} color="#A58BFC" strokeWidth={2.4} />
          <Text style={styles.categoryPillText}>BALLIVE COMMUNITY</Text>
        </View>

        {/* Strong Headline Typography */}
        <Text style={styles.headline}>Join the Conversation</Text>

        {/* Supporting Description */}
        <Text style={styles.description}>
          Become part of the global football supporters community. Share your matchday reactions, debate tactics, and let your voice be heard.
        </Text>

        {/* Action Row */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.ctaButton}
            activeOpacity={0.85}
            onPress={handleCreatePost}
            accessibilityRole="button"
            accessibilityLabel="Create post in community"
          >
            <MessageSquarePlus size={15} color="#FFFFFF" strokeWidth={2.4} />
            <Text style={styles.ctaButtonText}>Create post</Text>
            <ArrowRight size={14} color="#FFFFFF" strokeWidth={2.4} style={styles.ctaArrow} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginTop: 18,
    marginBottom: 10,
    backgroundColor: '#1E1730',
    borderRadius: 16,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: 120,
    backgroundColor: '#140E24',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    padding: 16,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#271D3E',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 5,
    marginBottom: 8,
  },
  categoryPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#A58BFC',
    letterSpacing: 0.8,
  },
  headline: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: 0.3,
    marginBottom: 6,
  },
  description: {
    fontSize: 12,
    lineHeight: 17,
    color: Colors.textSecondary,
    marginBottom: 14,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7952FC',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 6,
  },
  ctaButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  ctaArrow: {
    marginLeft: 2,
  },
});
