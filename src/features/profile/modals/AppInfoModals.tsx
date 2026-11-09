import React from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from 'react-native';
import {
  ShieldCheck,
  HelpCircle,
  Info,
  Sparkles,
  Lock,
  EyeOff,
  Database,
  Smartphone,
  MessageCircle,
  Video,
  ChevronRight,
} from 'lucide-react-native';
import Colors from '../../../theme/colors';
import { SecondaryScreenHeader } from '../../../components/common/SecondaryScreenHeader';

// ── 1. ABOUT BALLIVE MODAL ──
interface AboutModalProps {
  visible: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ visible, onClose }) => {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.container}>
        <SecondaryScreenHeader
          title="About BALLIVE"
          subtitle="Our football story & mission"
          onBack={onClose}
        />

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Logo & Headline */}
          <View style={styles.brandingBox}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoBadgeText}>⚽</Text>
            </View>
            <Text style={styles.appName}>BALLIVE</Text>
            <Text style={styles.appTagline}>Feel the Game • Live the Passion</Text>
            <View style={styles.versionPill}>
              <Text style={styles.versionText}>Version 1.8.0 • Native Release</Text>
            </View>
          </View>

          {/* Inspiring Football Novel Narrative */}
          <Text style={styles.sectionHeading}>OUR FOOTBALL STORY</Text>
          <View style={styles.narrativeCard}>
            <Text style={styles.narrativeLead}>
              A Passion Born from the Beautiful Game
            </Text>
            <Text style={styles.narrativeParagraph}>
              Every football supporter knows the electric heartbeat of the final five minutes — the collective breath held before a penalty, the roar that sweeps across the terraces, and the impossible brilliance of a curling strike in extra time.
            </Text>
            <Text style={styles.narrativeParagraph}>
              BALLIVE was created with one single, unwavering purpose: to bring that raw matchday intensity directly to you. We built an experience free from noisy clutter, bloated ads, and invasive trackers. Here, every pixel is calibrated for the fan: pristine high-definition live streams, lightning-fast scoreboards, authentic club crests, and intuitive controls designed for real supporters.
            </Text>
            <Text style={styles.narrativeHighlight}>
              Welcome to BALLIVE — where football lives.
            </Text>
          </View>

          {/* Community Desk Footnote */}
          <View style={styles.cardGroup}>
            <View style={styles.specRow}>
              <Sparkles size={18} color="#7952FC" strokeWidth={2.4} />
              <View style={styles.specCol}>
                <Text style={styles.specTitle}>Crafted with Football Spirit</Text>
                <Text style={styles.specDesc}>Engineered for passionate fans across all leagues worldwide</Text>
              </View>
            </View>
          </View>

          <Text style={styles.copyrightText}>
            © 2026 BALLIVE. All rights reserved.
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
        <SecondaryScreenHeader
          title="Privacy & Security"
          subtitle="Safe, encrypted & transparent"
          onBack={onClose}
        />

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header Banner */}
          <View style={styles.privacyHeroBox}>
            <View style={styles.privacyHeroIcon}>
              <ShieldCheck size={28} color="#38BDF8" strokeWidth={2.4} />
            </View>
            <Text style={styles.privacyHeroTitle}>Privacy By Design</Text>
            <Text style={styles.privacyHeroDesc}>
              BALLIVE is engineered to protect your football journey with zero invasive trackers and strict broadcast encryption.
            </Text>
          </View>

          {/* Privacy Principles */}
          <Text style={styles.sectionHeading}>DATA PROTECTION COMMITMENTS</Text>
          <View style={styles.cardGroup}>
            <View style={styles.principleRow}>
              <View style={styles.principleIconBox}>
                <Lock size={18} color="#7952FC" strokeWidth={2.2} />
              </View>
              <View style={styles.principleCol}>
                <Text style={styles.principleTitle}>1. End-to-End Stream Security</Text>
                <Text style={styles.principleDesc}>
                  Live video streams utilize encrypted low-latency delivery protocols with anti-tamper authentication to safeguard broadcast feeds.
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.principleRow}>
              <View style={styles.principleIconBox}>
                <EyeOff size={18} color="#10B981" strokeWidth={2.2} />
              </View>
              <View style={styles.principleCol}>
                <Text style={styles.principleTitle}>2. Zero Ad Trackers & Fingerprinting</Text>
                <Text style={styles.principleDesc}>
                  We do not embed third-party advertising SDKs, cross-app profiling cookies, or device identity beacons. Your viewing stays private.
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.principleRow}>
              <View style={styles.principleIconBox}>
                <Database size={18} color="#38BDF8" strokeWidth={2.2} />
              </View>
              <View style={styles.principleCol}>
                <Text style={styles.principleTitle}>3. 100% Local Device Storage</Text>
                <Text style={styles.principleDesc}>
                  Your followed clubs, favorite leagues, and match reminders reside exclusively in your phone's sandbox. No cloud servers track your favorites.
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.principleRow}>
              <View style={styles.principleIconBox}>
                <Smartphone size={18} color="#F59E0B" strokeWidth={2.2} />
              </View>
              <View style={styles.principleCol}>
                <Text style={styles.principleTitle}>4. Total User Data Control</Text>
                <Text style={styles.principleDesc}>
                  You hold full control. Clear cached thumbnails, reset reminders, or purge offline assets at any moment from App Settings.
                </Text>
              </View>
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
      q: 'How do I watch matches in Fullscreen mode?',
      a: 'Tap the maximize icon in the bottom right corner of the video player to expand into an immersive, edge-to-edge landscape view.',
    },
    {
      q: 'How do match kickoff reminders work?',
      a: 'Tap the Bell icon on any match or ticker card. BALLIVE will notify you 15 minutes before the match begins so you never miss a kickoff.',
    },
    {
      q: 'Can I switch between Commentary and Stadium Audio?',
      a: 'Yes! Navigate to App Settings to enable Stadium Atmosphere Audio for pure live terrace chants without commentary.',
    },
    {
      q: 'What should I do if a stream buffers?',
      a: 'Check your connection or toggle the video quality from 1080p to 720p using the quality pill directly in the player controls.',
    },
  ];

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.container}>
        <SecondaryScreenHeader
          title="Help & Support"
          subtitle="FAQs & community help"
          onBack={onClose}
        />

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* COMMUNITY HELP DESKS */}
          <Text style={styles.sectionHeading}>DIRECT COMMUNITY ASSISTANCE</Text>
          <View style={styles.communityGrid}>
            {/* WhatsApp */}
            <TouchableOpacity
              style={styles.whatsAppCard}
              activeOpacity={0.85}
              onPress={() => Linking.openURL('https://whatsapp.com').catch(() => {})}
            >
              <View style={styles.socialIconBoxWhatsApp}>
                <MessageCircle size={22} color="#FFFFFF" strokeWidth={2.4} />
              </View>
              <View style={styles.socialCol}>
                <Text style={styles.socialTitle}>WhatsApp Support Desk</Text>
                <Text style={styles.socialSubtitle}>Chat directly with our matchday team</Text>
              </View>
              <ChevronRight size={18} color="#25D366" />
            </TouchableOpacity>

            {/* TikTok */}
            <TouchableOpacity
              style={styles.tikTokCard}
              activeOpacity={0.85}
              onPress={() => Linking.openURL('https://tiktok.com').catch(() => {})}
            >
              <View style={styles.socialIconBoxTikTok}>
                <Video size={22} color="#FFFFFF" strokeWidth={2.4} />
              </View>
              <View style={styles.socialCol}>
                <Text style={styles.socialTitle}>TikTok Community</Text>
                <Text style={styles.socialSubtitle}>Follow match updates & skill reels</Text>
              </View>
              <ChevronRight size={18} color="#FE2C55" />
            </TouchableOpacity>
          </View>

          {/* FAQS */}
          <Text style={styles.sectionHeading}>FREQUENTLY ASKED QUESTIONS</Text>
          <View style={styles.cardGroup}>
            {faqs.map((faq, idx) => (
              <React.Fragment key={faq.q}>
                {idx > 0 && <View style={styles.divider} />}
                <View style={styles.faqBlock}>
                  <Text style={styles.faqQuestion}>{faq.q}</Text>
                  <Text style={styles.faqAnswer}>{faq.a}</Text>
                </View>
              </React.Fragment>
            ))}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0E0D14',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 36,
  },
  brandingBox: {
    alignItems: 'center',
    paddingVertical: 18,
  },
  logoBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#7952FC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  logoBadgeText: {
    fontSize: 28,
  },
  appName: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  appTagline: {
    fontSize: 13,
    fontWeight: '600',
    color: '#A098B5',
    marginTop: 3,
  },
  versionPill: {
    marginTop: 8,
    backgroundColor: '#1E1730',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  versionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7952FC',
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: '#A098B5',
    letterSpacing: 0.8,
    marginTop: 14,
    marginBottom: 8,
    marginLeft: 4,
  },
  narrativeCard: {
    backgroundColor: '#1E1730',
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  narrativeLead: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  narrativeParagraph: {
    fontSize: 13,
    color: '#D4CEE8',
    lineHeight: 19,
  },
  narrativeHighlight: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#7952FC',
    marginTop: 2,
  },
  cardGroup: {
    backgroundColor: '#1E1730',
    borderRadius: 16,
    overflow: 'hidden',
  },
  specRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  specCol: {
    flex: 1,
  },
  specTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  specDesc: {
    fontSize: 11.5,
    color: '#A098B5',
    marginTop: 2,
  },
  copyrightText: {
    textAlign: 'center',
    fontSize: 11,
    color: '#6B6282',
    marginTop: 20,
  },

  // Privacy Styles
  privacyHeroBox: {
    backgroundColor: '#1E1730',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 10,
  },
  privacyHeroIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  privacyHeroTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  privacyHeroDesc: {
    fontSize: 12.5,
    color: '#A098B5',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 4,
  },
  principleRow: {
    flexDirection: 'row',
    padding: 14,
    gap: 12,
  },
  principleIconBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#261C3D',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  principleCol: {
    flex: 1,
  },
  principleTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  principleDesc: {
    fontSize: 12,
    color: '#A098B5',
    lineHeight: 17,
    marginTop: 3,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 16,
  },

  // Help & Support Styles
  communityGrid: {
    gap: 10,
    marginBottom: 8,
  },
  whatsAppCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1730',
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  socialIconBoxWhatsApp: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#25D366',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tikTokCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1730',
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  socialIconBoxTikTok: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#010101',
    borderWidth: 1.5,
    borderColor: '#FE2C55',
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialCol: {
    flex: 1,
  },
  socialTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  socialSubtitle: {
    fontSize: 11.5,
    color: '#A098B5',
    marginTop: 2,
  },
  faqBlock: {
    padding: 14,
  },
  faqQuestion: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  faqAnswer: {
    fontSize: 12,
    color: '#A098B5',
    lineHeight: 17,
  },
});
