import React from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { ArrowLeft, ShieldCheck, HelpCircle, Info, Sparkles, Tv, Bell, Cpu } from 'lucide-react-native';
import Colors from '../../../theme/colors';

// ── 1. ABOUT MODAL ──
interface AboutModalProps {
  visible: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ visible, onClose }) => {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn} accessibilityLabel="Back">
            <ArrowLeft size={22} color={Colors.textPrimary} strokeWidth={2.2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>About BALLIVE</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Logo / Branding */}
          <View style={styles.brandingBox}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoBadgeText}>⚽</Text>
            </View>
            <Text style={styles.appName}>BALLIVE</Text>
            <Text style={styles.appTagline}>Feel the Game</Text>
            <View style={styles.versionPill}>
              <Text style={styles.versionText}>Version 1.1.0 • Release Build</Text>
            </View>
          </View>

          {/* Technical Specs */}
          <Text style={styles.sectionHeading}>APPLICATION ARCHITECTURE</Text>
          <View style={styles.cardGroup}>
            <View style={styles.specRow}>
              <Cpu size={18} color="#A58BFC" strokeWidth={2} />
              <View style={styles.specCol}>
                <Text style={styles.specTitle}>Runtime Engine</Text>
                <Text style={styles.specDesc}>Hermes Bytecode Engine • React Native 0.76.6</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.specRow}>
              <Tv size={18} color={Colors.verifiedBlue} strokeWidth={2} />
              <View style={styles.specCol}>
                <Text style={styles.specTitle}>Target Platform</Text>
                <Text style={styles.specDesc}>Native Android 14/15 (API 34/35) Universal Build</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.specRow}>
              <Sparkles size={18} color={Colors.categoryChampionsLeague} strokeWidth={2} />
              <View style={styles.specCol}>
                <Text style={styles.specTitle}>Package Identifier</Text>
                <Text style={styles.specDesc}>com.piustech.ballive</Text>
              </View>
            </View>
          </View>

          <Text style={styles.copyrightText}>
            © 2026 BALLIVE. Crafted for passionate football fans worldwide.
          </Text>
        </ScrollView>
      </View>
    </Modal>
  );
};

// ── 2. PRIVACY & SECURITY MODAL ──
interface PrivacySecurityModalProps {
  visible: boolean;
  onClose: () => void;
}

export const PrivacySecurityModal: React.FC<PrivacySecurityModalProps> = ({ visible, onClose }) => {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn} accessibilityLabel="Back">
            <ArrowLeft size={22} color={Colors.textPrimary} strokeWidth={2.2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Privacy & Security</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.introIconBox}>
            <ShieldCheck size={42} color={Colors.verifiedBlue} strokeWidth={2} />
            <Text style={styles.introTitle}>Privacy By Design</Text>
            <Text style={styles.introDesc}>
              BALLIVE is engineered to protect your personal information with zero invasive trackers.
            </Text>
          </View>

          <Text style={styles.sectionHeading}>DATA PRINCIPLES</Text>
          <View style={styles.cardGroup}>
            <View style={styles.textBlock}>
              <Text style={styles.blockTitle}>1. 100% Local Device Storage</Text>
              <Text style={styles.blockBody}>
                Your followed clubs, favored competitions, and match reminder schedules are stored securely inside your phone's sandbox. No third-party servers monitor your browsing habits.
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.textBlock}>
              <Text style={styles.blockTitle}>2. Zero Ad Tracking</Text>
              <Text style={styles.blockBody}>
                We do not include third-party advertising SDKs, cross-app tracking identifiers, or data broker telemetry.
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.textBlock}>
              <Text style={styles.blockTitle}>3. Local Alert Notifications</Text>
              <Text style={styles.blockBody}>
                Kickoff alerts are scheduled directly using Android's system alarm manager, ensuring reliable alerts without exposing your device tokens.
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

// ── 3. HELP & SUPPORT MODAL ──
interface HelpSupportModalProps {
  visible: boolean;
  onClose: () => void;
}

export const HelpSupportModal: React.FC<HelpSupportModalProps> = ({ visible, onClose }) => {
  const faqs = [
    {
      q: 'How do I set a reminder for an upcoming match?',
      a: 'Navigate to Discover or Home, scroll to Upcoming Highlights, and tap "Remind Me". You can view and manage all active match alarms inside your Profile → Match Reminders.',
    },
    {
      q: 'Does BALLIVE support offline mode?',
      a: 'Yes! The entire application interface and your followed preferences run 100% offline via embedded Hermes bytecode.',
    },
    {
      q: 'Can I change my stream time zone?',
      a: 'Yes, head to Profile → Time Zone to switch between your local device time, GMT (UK time), or CET.',
    },
    {
      q: 'How do I report a missing league or fixture?',
      a: 'Send your suggestions directly to support@ballive.app. We constantly update fixture directories with new tournament feeds.',
    },
  ];

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn} accessibilityLabel="Back">
            <ArrowLeft size={22} color={Colors.textPrimary} strokeWidth={2.2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Help & Support</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.sectionHeading}>FREQUENTLY ASKED QUESTIONS</Text>
          <View style={styles.cardGroup}>
            {faqs.map((faq, idx) => (
              <React.Fragment key={faq.q}>
                {idx > 0 && <View style={styles.divider} />}
                <View style={styles.textBlock}>
                  <Text style={styles.blockTitle}>{faq.q}</Text>
                  <Text style={styles.blockBody}>{faq.a}</Text>
                </View>
              </React.Fragment>
            ))}
          </View>

          <View style={styles.supportContactCard}>
            <Text style={styles.supportTitle}>Need Further Assistance?</Text>
            <Text style={styles.supportDesc}>
              Our engineering team is dedicated to providing the smoothest football streaming experience.
            </Text>
            <Text style={styles.supportEmail}>Email: support@ballive.app</Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 20 : 16,
    paddingBottom: 16,
    backgroundColor: Colors.headerPurple,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  brandingBox: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#7952FC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  logoBadgeText: {
    fontSize: 32,
  },
  appName: {
    fontSize: 26,
    fontWeight: '800',
    color: '#ECE9FA',
    letterSpacing: -0.5,
  },
  appTagline: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
    fontWeight: '500',
  },
  versionPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    marginTop: 12,
  },
  versionText: {
    fontSize: 12,
    color: '#A58BFC',
    fontWeight: '700',
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  cardGroup: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: 18,
    overflow: 'hidden',
  },
  specRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
  },
  specCol: {
    flex: 1,
  },
  specTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  specDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    marginHorizontal: 16,
  },
  copyrightText: {
    textAlign: 'center',
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 24,
    marginBottom: 16,
  },
  introIconBox: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 10,
  },
  introTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 12,
    marginBottom: 6,
  },
  introDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 20,
  },
  textBlock: {
    padding: 16,
  },
  blockTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  blockBody: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  supportContactCard: {
    backgroundColor: 'rgba(121, 82, 252, 0.12)',
    borderRadius: 18,
    padding: 18,
    marginTop: 20,
    marginBottom: 20,
  },
  supportTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ECE9FA',
    marginBottom: 4,
  },
  supportDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
    marginBottom: 10,
  },
  supportEmail: {
    fontSize: 13,
    fontWeight: '700',
    color: '#A58BFC',
  },
});
