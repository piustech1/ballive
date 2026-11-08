import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Platform,
} from 'react-native';
import { ArrowLeft, Check } from 'lucide-react-native';
import Colors from '../../../theme/colors';

// ── 1. NOTIFICATION SETTINGS MODAL ──
interface NotificationSettingsModalProps {
  visible: boolean;
  notifications: {
    matchKickoffs: boolean;
    liveGoals: boolean;
    breakingNews: boolean;
  };
  onUpdate: (key: 'matchKickoffs' | 'liveGoals' | 'breakingNews', value: boolean) => void;
  onClose: () => void;
}

export const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({
  visible,
  notifications,
  onUpdate,
  onClose,
}) => {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn} accessibilityLabel="Back">
            <ArrowLeft size={22} color={Colors.textPrimary} strokeWidth={2.2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.content}>
          <Text style={styles.sectionHeading}>MATCH & STREAM ALERTS</Text>

          <View style={styles.cardGroup}>
            <View style={styles.switchRow}>
              <View style={styles.switchTextCol}>
                <Text style={styles.switchTitle}>Match Kickoff Alerts</Text>
                <Text style={styles.switchSubtitle}>Receive alerts 15 minutes before followed matches begin</Text>
              </View>
              <Switch
                value={notifications.matchKickoffs}
                onValueChange={v => onUpdate('matchKickoffs', v)}
                trackColor={{ false: 'rgba(255, 255, 255, 0.1)', true: '#7952FC' }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.switchRow}>
              <View style={styles.switchTextCol}>
                <Text style={styles.switchTitle}>Live Goals & Key Events</Text>
                <Text style={styles.switchSubtitle}>Real-time push alerts when goals and red cards occur</Text>
              </View>
              <Switch
                value={notifications.liveGoals}
                onValueChange={v => onUpdate('liveGoals', v)}
                trackColor={{ false: 'rgba(255, 255, 255, 0.1)', true: '#7952FC' }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.switchRow}>
              <View style={styles.switchTextCol}>
                <Text style={styles.switchTitle}>Breaking Lineups & News</Text>
                <Text style={styles.switchSubtitle}>Confirmed Starting XI releases 60 mins before kickoff</Text>
              </View>
              <Switch
                value={notifications.breakingNews}
                onValueChange={v => onUpdate('breakingNews', v)}
                trackColor={{ false: 'rgba(255, 255, 255, 0.1)', true: '#7952FC' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ── 2. TIME FORMAT MODAL ──
interface TimeFormatModalProps {
  visible: boolean;
  currentFormat: '12h' | '24h';
  onSelect: (format: '12h' | '24h') => void;
  onClose: () => void;
}

export const TimeFormatModal: React.FC<TimeFormatModalProps> = ({
  visible,
  currentFormat,
  onSelect,
  onClose,
}) => {
  const options: Array<{ key: '12h' | '24h'; label: string; example: string }> = [
    { key: '12h', label: '12-Hour Format', example: '8:00 PM GMT' },
    { key: '24h', label: '24-Hour Format', example: '20:00 GMT' },
  ];

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn} accessibilityLabel="Back">
            <ArrowLeft size={22} color={Colors.textPrimary} strokeWidth={2.2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Time Format</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.content}>
          <Text style={styles.sectionHeading}>CHOOSE DISPLAY TIME</Text>
          <View style={styles.cardGroup}>
            {options.map((opt, idx) => {
              const isSelected = currentFormat === opt.key;
              return (
                <React.Fragment key={opt.key}>
                  {idx > 0 && <View style={styles.divider} />}
                  <TouchableOpacity
                    style={styles.selectRow}
                    activeOpacity={0.75}
                    onPress={() => {
                      onSelect(opt.key);
                      onClose();
                    }}
                  >
                    <View style={styles.selectTextCol}>
                      <Text style={styles.selectTitle}>{opt.label}</Text>
                      <Text style={styles.selectSubtitle}>Preview: {opt.example}</Text>
                    </View>
                    {isSelected && <Check size={20} color="#A58BFC" strokeWidth={2.6} />}
                  </TouchableOpacity>
                </React.Fragment>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ── 3. TIME ZONE MODAL ──
interface TimeZoneModalProps {
  visible: boolean;
  currentTimeZone: string;
  onSelect: (tz: string) => void;
  onClose: () => void;
}

export const TimeZoneModal: React.FC<TimeZoneModalProps> = ({
  visible,
  currentTimeZone,
  onSelect,
  onClose,
}) => {
  const timezones = [
    { key: 'Automatic', label: 'Automatic (Device Local)', desc: 'Synchronized with your phone clock' },
    { key: 'GMT+0', label: 'Greenwich Mean Time (GMT)', desc: 'Premier League standard reference' },
    { key: 'CET (UTC+1)', label: 'Central European Time (CET)', desc: 'LaLiga, Serie A & Bundesliga time' },
    { key: 'EST (UTC-5)', label: 'Eastern Standard Time (EST)', desc: 'North America East' },
  ];

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn} accessibilityLabel="Back">
            <ArrowLeft size={22} color={Colors.textPrimary} strokeWidth={2.2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Time Zone</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.content}>
          <Text style={styles.sectionHeading}>MATCH SCHEDULE REFERENCE</Text>
          <View style={styles.cardGroup}>
            {timezones.map((tz, idx) => {
              const isSelected = currentTimeZone === tz.key;
              return (
                <React.Fragment key={tz.key}>
                  {idx > 0 && <View style={styles.divider} />}
                  <TouchableOpacity
                    style={styles.selectRow}
                    activeOpacity={0.75}
                    onPress={() => {
                      onSelect(tz.key);
                      onClose();
                    }}
                  >
                    <View style={styles.selectTextCol}>
                      <Text style={styles.selectTitle}>{tz.label}</Text>
                      <Text style={styles.selectSubtitle}>{tz.desc}</Text>
                    </View>
                    {isSelected && <Check size={20} color="#A58BFC" strokeWidth={2.6} />}
                  </TouchableOpacity>
                </React.Fragment>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ── 4. LANGUAGE MODAL ──
interface LanguageModalProps {
  visible: boolean;
  currentLanguage: string;
  onSelect: (lang: string) => void;
  onClose: () => void;
}

export const LanguageModal: React.FC<LanguageModalProps> = ({
  visible,
  currentLanguage,
  onSelect,
  onClose,
}) => {
  const languages = [
    { key: 'English', label: 'English', desc: 'Default commentary & UI' },
    { key: 'Español', label: 'Español', desc: 'Interfaz y transmisiones en español' },
    { key: 'Français', label: 'Français', desc: 'Interface et audio en français' },
  ];

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn} accessibilityLabel="Back">
            <ArrowLeft size={22} color={Colors.textPrimary} strokeWidth={2.2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Language</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.content}>
          <Text style={styles.sectionHeading}>SUPPORTED LANGUAGES</Text>
          <View style={styles.cardGroup}>
            {languages.map((lang, idx) => {
              const isSelected = currentLanguage === lang.key;
              return (
                <React.Fragment key={lang.key}>
                  {idx > 0 && <View style={styles.divider} />}
                  <TouchableOpacity
                    style={styles.selectRow}
                    activeOpacity={0.75}
                    onPress={() => {
                      onSelect(lang.key);
                      onClose();
                    }}
                  >
                    <View style={styles.selectTextCol}>
                      <Text style={styles.selectTitle}>{lang.label}</Text>
                      <Text style={styles.selectSubtitle}>{lang.desc}</Text>
                    </View>
                    {isSelected && <Check size={20} color="#A58BFC" strokeWidth={2.6} />}
                  </TouchableOpacity>
                </React.Fragment>
              );
            })}
          </View>
        </View>
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
  content: {
    padding: 20,
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
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  switchTextCol: {
    flex: 1,
    marginRight: 16,
  },
  switchTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  switchSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 3,
    lineHeight: 16,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    marginHorizontal: 16,
  },
  selectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  selectTextCol: {
    flex: 1,
  },
  selectTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  selectSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
