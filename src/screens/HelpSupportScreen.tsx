import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import {
  HelpCircle,
  ChevronDown,
  ChevronRight,
  MessageCircle,
} from 'lucide-react-native';
import Colors from '../theme/colors';
import { SecondaryScreenHeader } from '../components/common/SecondaryScreenHeader';
import { WhatsAppOfficialIcon, TikTokOfficialIcon } from '../components/common/BrandIcons';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface FaqItem {
  id: string;
  q: string;
  a: string;
}

const FAQS: FaqItem[] = [
  {
    id: 'fullscreen',
    q: 'How do I watch matches in Fullscreen?',
    a: 'Tap the maximize icon in the video player controls to enter immersive landscape viewing.',
  },
  {
    id: 'reminders',
    q: 'How do match kickoff reminders work?',
    a: 'Tap the Bell icon on any fixture. BALLIVE alerts your device 15 minutes before the match begins.',
  },
  {
    id: 'buffering',
    q: 'What should I do if a stream buffers?',
    a: 'Switch stream sources or adjust resolution (720p/1080p) using the player quality pill.',
  },
];

export const HelpSupportScreen: React.FC = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleFaq = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(prev => (prev === id ? null : id));
  };

  const handleOpenWhatsApp = () => {
    Linking.openURL('https://whatsapp.com').catch(() => {});
  };

  const handleOpenTikTok = () => {
    Linking.openURL('https://tiktok.com').catch(() => {});
  };

  return (
    <View style={styles.container}>
      <SecondaryScreenHeader
        title="HELP & SUPPORT"
        subtitle="We're here to help"
      />

      <View style={styles.content}>
        {/* ── 1. COMPACT INTRO ── */}
        <View style={styles.introBox}>
          <View style={styles.introHeader}>
            <View style={styles.helpIconBadge}>
              <HelpCircle size={16} color="#7952FC" strokeWidth={2.4} />
            </View>
            <Text style={styles.introTitle}>Need assistance?</Text>
          </View>
          <Text style={styles.introText}>
            Find quick answers below or reach our community support desks anytime.
          </Text>
        </View>

        {/* ── 2. COMMUNITY HELP DESKS ── */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionLabel}>DIRECT COMMUNITY SUPPORT</Text>
          <View style={styles.deskGroup}>
            {/* WhatsApp Support Desk (Primary Action) */}
            <TouchableOpacity
              style={styles.deskRow}
              activeOpacity={0.75}
              onPress={handleOpenWhatsApp}
              accessibilityRole="button"
              accessibilityLabel="Open WhatsApp Support Desk"
            >
              <View style={[styles.deskIconBox, { backgroundColor: '#182C20' }]}>
                <WhatsAppOfficialIcon size={20} color="#25D366" />
              </View>
              <View style={styles.deskTextCol}>
                <Text style={styles.deskPrimary}>WhatsApp Support Desk</Text>
                <Text style={styles.deskSecondary}>Direct chat with our matchday team</Text>
              </View>
              <View style={styles.chatActionPill}>
                <Text style={styles.chatActionText}>Chat</Text>
                <ChevronRight size={14} color="#25D366" />
              </View>
            </TouchableOpacity>

            <View style={styles.divider} />

            {/* TikTok Community (Secondary Action) */}
            <TouchableOpacity
              style={styles.deskRow}
              activeOpacity={0.75}
              onPress={handleOpenTikTok}
              accessibilityRole="button"
              accessibilityLabel="Follow TikTok Community"
            >
              <View style={[styles.deskIconBox, { backgroundColor: '#261726' }]}>
                <TikTokOfficialIcon size={18} color="#FE2C55" />
              </View>
              <View style={styles.deskTextCol}>
                <Text style={styles.deskPrimary}>BALLIVE Community</Text>
                <Text style={styles.deskSecondary}>Matchday updates, reels & clips</Text>
              </View>
              <View style={[styles.chatActionPill, { backgroundColor: '#24141F' }]}>
                <Text style={[styles.chatActionText, { color: '#FE2C55' }]}>Follow</Text>
                <ChevronRight size={14} color="#FE2C55" />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── 3. QUICK FAQS (EXPANDABLE) ── */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionLabel}>FREQUENTLY ASKED QUESTIONS</Text>
          <View style={styles.faqCard}>
            {FAQS.map((faq, index) => {
              const isExpanded = expandedId === faq.id;
              return (
                <View key={faq.id}>
                  {index > 0 && <View style={styles.divider} />}
                  <TouchableOpacity
                    style={styles.faqRow}
                    activeOpacity={0.7}
                    onPress={() => toggleFaq(faq.id)}
                    accessibilityRole="button"
                    accessibilityState={{ expanded: isExpanded }}
                  >
                    <Text style={styles.faqQuestion}>{faq.q}</Text>
                    <View style={[styles.faqChevron, isExpanded && styles.faqChevronRotated]}>
                      <ChevronDown
                        size={16}
                        color={isExpanded ? '#7952FC' : Colors.textMuted}
                        strokeWidth={2.2}
                      />
                    </View>
                  </TouchableOpacity>
                  {isExpanded && (
                    <View style={styles.faqAnswerContainer}>
                      <Text style={styles.faqAnswerText}>{faq.a}</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* ── 4. BOTTOM NOTICE ── */}
        <TouchableOpacity
          style={styles.bottomNotice}
          activeOpacity={0.8}
          onPress={handleOpenWhatsApp}
        >
          <MessageCircle size={14} color="#A58BFC" />
          <Text style={styles.bottomNoticeText}>
            Have more questions? Chat with us on WhatsApp
          </Text>
        </TouchableOpacity>
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
  // Intro Box
  introBox: {
    backgroundColor: '#161224',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  introHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  helpIconBadge: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#261D42',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  introTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  introText: {
    fontSize: 11,
    lineHeight: 16,
    color: Colors.textSecondary,
  },
  // Section Block
  sectionBlock: {
    marginVertical: 2,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 1.1,
    marginBottom: 6,
    paddingHorizontal: 2,
  },
  deskGroup: {
    backgroundColor: '#1E1730',
    borderRadius: 14,
    paddingVertical: 2,
    paddingHorizontal: 12,
  },
  deskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  deskIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  deskTextCol: {
    flex: 1,
  },
  deskPrimary: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  deskSecondary: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  chatActionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#142A1D',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    gap: 2,
  },
  chatActionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#25D366',
  },
  // FAQ Card
  faqCard: {
    backgroundColor: '#1E1730',
    borderRadius: 14,
    paddingVertical: 2,
    paddingHorizontal: 12,
  },
  faqRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 11,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
    paddingRight: 10,
  },
  faqChevron: {
    transform: [{ rotate: '0deg' }],
  },
  faqChevronRotated: {
    transform: [{ rotate: '180deg' }],
  },
  faqAnswerContainer: {
    paddingBottom: 10,
    paddingTop: 2,
    paddingHorizontal: 2,
  },
  faqAnswerText: {
    fontSize: 11,
    lineHeight: 16,
    color: '#B2AFD1',
  },
  divider: {
    height: 1,
    backgroundColor: '#28203E',
  },
  // Bottom Notice
  bottomNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#161224',
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 12,
    gap: 8,
  },
  bottomNoticeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#A58BFC',
  },
});
