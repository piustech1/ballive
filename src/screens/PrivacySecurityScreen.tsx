import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  ShieldCheck,
  Database,
  Lock,
  Smartphone,
  EyeOff,
  CheckCircle2,
} from 'lucide-react-native';
import Colors from '../theme/colors';
import { SecondaryScreenHeader } from '../components/common/SecondaryScreenHeader';

export const PrivacySecurityScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <SecondaryScreenHeader
        title="PRIVACY & SECURITY"
        subtitle="Your privacy matters"
      />

      <View style={styles.content}>
        {/* ── 1. SECURITY HERO BANNER ── */}
        <View style={styles.heroBox}>
          <View style={styles.heroIconBadge}>
            <ShieldCheck size={24} color="#38BDF8" strokeWidth={2.4} />
          </View>
          <View style={styles.heroTextCol}>
            <Text style={styles.heroTitle}>Your experience. Your control.</Text>
            <Text style={styles.heroSubtitle}>
              BALLIVE is engineered with local-first privacy. Zero tracking cookies, zero cloud profiling.
            </Text>
          </View>
        </View>

        {/* ── 2. FOUR VERIFIED COMMITMENTS (2x2 GRID) ── */}
        <View style={styles.gridContainer}>
          {/* Row 1 */}
          <View style={styles.gridRow}>
            {/* Commitment 1: Local Preferences */}
            <View style={styles.gridCard}>
              <View style={[styles.cardIconBox, { backgroundColor: '#23183D' }]}>
                <Database size={16} color="#7952FC" strokeWidth={2.4} />
              </View>
              <Text style={styles.cardTitle}>Local Preferences</Text>
              <Text style={styles.cardBody}>
                Followed clubs, reminders & settings reside strictly in your phone's sandbox.
              </Text>
            </View>

            {/* Commitment 2: Stream Protection */}
            <View style={styles.gridCard}>
              <View style={[styles.cardIconBox, { backgroundColor: '#132820' }]}>
                <Lock size={16} color="#10B981" strokeWidth={2.4} />
              </View>
              <Text style={styles.cardTitle}>Stream Access</Text>
              <Text style={styles.cardBody}>
                Encrypted, direct HLS video delivery with no third-party ad interceptors.
              </Text>
            </View>
          </View>

          {/* Row 2 */}
          <View style={styles.gridRow}>
            {/* Commitment 3: Device Control */}
            <View style={styles.gridCard}>
              <View style={[styles.cardIconBox, { backgroundColor: '#2E2015' }]}>
                <Smartphone size={16} color="#F59E0B" strokeWidth={2.4} />
              </View>
              <Text style={styles.cardTitle}>Device Control</Text>
              <Text style={styles.cardBody}>
                Only standard alert permissions for match kickoffs. No invasive device tracking.
              </Text>
            </View>

            {/* Commitment 4: Data Transparency */}
            <View style={styles.gridCard}>
              <View style={[styles.cardIconBox, { backgroundColor: '#142738' }]}>
                <EyeOff size={16} color="#38BDF8" strokeWidth={2.4} />
              </View>
              <Text style={styles.cardTitle}>Data Transparency</Text>
              <Text style={styles.cardBody}>
                No accounts needed, no behavioral tracking, and no data sales. Ever.
              </Text>
            </View>
          </View>
        </View>

        {/* ── 3. VERIFIED FOOTNOTE ASSURANCE ── */}
        <View style={styles.footnoteBox}>
          <CheckCircle2 size={16} color="#10B981" strokeWidth={2.4} />
          <Text style={styles.footnoteText}>
            Verified Local Architecture • 100% On-Device Data
          </Text>
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
    paddingBottom: 14,
    justifyContent: 'space-between',
  },
  // Hero Banner
  heroBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1730',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  heroIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#142738',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  heroTextCol: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 3,
  },
  heroSubtitle: {
    fontSize: 11,
    lineHeight: 15,
    color: Colors.textSecondary,
  },
  // 2x2 Grid
  gridContainer: {
    gap: 10,
    marginVertical: 4,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 10,
  },
  gridCard: {
    flex: 1,
    backgroundColor: '#1E1730',
    borderRadius: 14,
    padding: 12,
  },
  cardIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  cardBody: {
    fontSize: 10.5,
    lineHeight: 14.5,
    color: Colors.textSecondary,
  },
  // Footnote
  footnoteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#161224',
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 14,
    gap: 8,
  },
  footnoteText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D4CEF2',
    letterSpacing: 0.4,
  },
});
