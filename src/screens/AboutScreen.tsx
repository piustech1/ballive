import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Tv, Flame, BookmarkCheck } from 'lucide-react-native';
import Colors from '../theme/colors';
import { SecondaryScreenHeader } from '../components/common/SecondaryScreenHeader';
import { BalliveBrandMark } from '../components/common/BrandIcons';

export const AboutScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <SecondaryScreenHeader
        title="ABOUT BALLIVE"
        subtitle="Our story, purpose & identity"
      />

      <View style={styles.content}>
        {/* ── 1. BRAND IDENTITY HEADER ── */}
        <View style={styles.brandHeader}>
          <View style={styles.brandMarkWrapper}>
            <BalliveBrandMark size={44} primaryColor="#7952FC" />
          </View>
          <Text style={styles.brandTitle}>BALLIVE</Text>
          <Text style={styles.brandTagline}>Feel the Game • Live the Passion</Text>
          <Text style={styles.brandMission}>
            Engineered for true football supporters. High-definition live streaming, live match stats, and real terrace energy — direct to your device with zero distractions.
          </Text>
        </View>

        {/* ── 2. THREE COMPACT BRAND HIGHLIGHTS ── */}
        <View style={styles.highlightsCard}>
          {/* Highlight 1: LIVE SPORTS */}
          <View style={styles.highlightRow}>
            <View style={[styles.iconContainer, { backgroundColor: '#21183A' }]}>
              <Tv size={17} color="#7952FC" strokeWidth={2.4} />
            </View>
            <View style={styles.highlightTextContainer}>
              <Text style={styles.highlightTitle}>LIVE SPORTS</Text>
              <Text style={styles.highlightDesc} numberOfLines={2}>
                Instant high-definition live feeds with crystal-clear audio commentary.
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Highlight 2: MATCHDAY */}
          <View style={styles.highlightRow}>
            <View style={[styles.iconContainer, { backgroundColor: '#2D1F17' }]}>
              <Flame size={17} color="#F59E0B" strokeWidth={2.4} />
            </View>
            <View style={styles.highlightTextContainer}>
              <Text style={styles.highlightTitle}>MATCHDAY</Text>
              <Text style={styles.highlightDesc} numberOfLines={2}>
                Live score updates, tactical lineups, real-time match events and team stats.
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Highlight 3: YOUR GAME */}
          <View style={styles.highlightRow}>
            <View style={[styles.iconContainer, { backgroundColor: '#132820' }]}>
              <BookmarkCheck size={17} color="#10B981" strokeWidth={2.4} />
            </View>
            <View style={styles.highlightTextContainer}>
              <Text style={styles.highlightTitle}>YOUR GAME</Text>
              <Text style={styles.highlightDesc} numberOfLines={2}>
                Follow your clubs, save upcoming fixtures, and receive timely kickoff alerts.
              </Text>
            </View>
          </View>
        </View>

        {/* ── 3. UNDERSTATED BRAND STATEMENT ── */}
        <View style={styles.statementBox}>
          <View style={styles.statementAccentDot} />
          <Text style={styles.statementText}>
            Built for the moments that make sport unforgettable.
          </Text>
        </View>

        {/* ── 4. FOOTER & METADATA ── */}
        <View style={styles.footerContainer}>
          <Text style={styles.versionText}>Version 2.5.1 (Build 2026.11) • Native Android</Text>
          <Text style={styles.copyrightText}>© 2026 BALLIVE • All rights reserved.</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    justifyContent: 'space-between',
  },
  // Brand Header
  brandHeader: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  brandMarkWrapper: {
    marginBottom: 8,
    shadowColor: '#7952FC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: 2,
    marginBottom: 2,
  },
  brandTagline: {
    fontSize: 12,
    fontWeight: '700',
    color: '#A58BFC',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  brandMission: {
    fontSize: 12,
    lineHeight: 17,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  // Highlights Card Group
  highlightsCard: {
    backgroundColor: '#1E1730',
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  highlightTextContainer: {
    flex: 1,
  },
  highlightTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  highlightDesc: {
    fontSize: 11,
    lineHeight: 15,
    color: Colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: '#28203E',
  },
  // Understated Statement
  statementBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#161224',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  statementAccentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#7952FC',
    marginRight: 10,
  },
  statementText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D4CEF2',
    letterSpacing: 0.2,
  },
  // Footer
  footerContainer: {
    alignItems: 'center',
    paddingTop: 4,
  },
  versionText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
    marginBottom: 2,
  },
  copyrightText: {
    fontSize: 10,
    color: '#4E4A66',
  },
});
