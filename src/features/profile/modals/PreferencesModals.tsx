import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Switch,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import {
  Check,
  Clock,
  Tv,
  Volume2,
  Trash2,
  Bell,
  CheckCircle2,
} from 'lucide-react-native';
import Colors from '../../../theme/colors';
import { SecondaryScreenHeader } from '../../../components/common/SecondaryScreenHeader';

// ── 1. COMPREHENSIVE SETTINGS MODAL ──
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
  const [streamQuality, setStreamQuality] = useState<'Auto' | '1080p' | '720p'>('Auto');
  const [stadiumAudioOnly, setStadiumAudioOnly] = useState(false);
  const [dataSaver, setDataSaver] = useState(false);
  const [cacheCleared, setCacheCleared] = useState(false);

  const handleClearCache = () => {
    setCacheCleared(true);
    setTimeout(() => setCacheCleared(false), 3000);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.container}>
        <SecondaryScreenHeader
          title="App Settings"
          subtitle="Playback, alerts & storage"
          onBack={onClose}
        />

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* STREAM QUALITY & PLAYBACK */}
          <Text style={styles.sectionHeading}>STREAMING & PLAYBACK</Text>
          <View style={styles.cardGroup}>
            <View style={styles.settingItemRow}>
              <View style={styles.switchTextCol}>
                <Text style={styles.settingTitle}>Default Video Quality</Text>
                <Text style={styles.settingSubtitle}>Target bitrate for live match broadcasts</Text>
              </View>
              <View style={styles.qualityPillsGroup}>
                {(['Auto', '1080p', '720p'] as const).map(q => (
                  <TouchableOpacity
                    key={q}
                    style={[styles.qualityPillBtn, streamQuality === q && styles.qualityPillBtnActive]}
                    onPress={() => setStreamQuality(q)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.qualityPillText, streamQuality === q && styles.qualityPillTextActive]}>
                      {q}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.switchRow}>
              <View style={styles.switchTextCol}>
                <Text style={styles.switchTitle}>Stadium Atmosphere Audio</Text>
                <Text style={styles.switchSubtitle}>Favor pure crowd chant feeds over commentary</Text>
              </View>
              <Switch
                value={stadiumAudioOnly}
                onValueChange={setStadiumAudioOnly}
                trackColor={{ false: 'rgba(255, 255, 255, 0.1)', true: '#7952FC' }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.switchRow}>
              <View style={styles.switchTextCol}>
                <Text style={styles.switchTitle}>Data Saver Mode</Text>
                <Text style={styles.switchSubtitle}>Caps streaming resolution when on mobile data</Text>
              </View>
              <Switch
                value={dataSaver}
                onValueChange={setDataSaver}
                trackColor={{ false: 'rgba(255, 255, 255, 0.1)', true: '#7952FC' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>

          {/* MATCH NOTIFICATIONS */}
          <Text style={styles.sectionHeading}>MATCH & NOTIFICATION ALERTS</Text>
          <View style={styles.cardGroup}>
            <View style={styles.switchRow}>
              <View style={styles.switchTextCol}>
                <Text style={styles.switchTitle}>Match Kickoff Alerts</Text>
                <Text style={styles.switchSubtitle}>Notify 15 minutes before followed matches kick off</Text>
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
                <Text style={styles.switchTitle}>Live Goals & Red Cards</Text>
                <Text style={styles.switchSubtitle}>Instant push alerts when decisive moments occur</Text>
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
                <Text style={styles.switchTitle}>Official Starting XI Alerts</Text>
                <Text style={styles.switchSubtitle}>Confirmed team sheets 60 minutes before kickoff</Text>
              </View>
              <Switch
                value={notifications.breakingNews}
                onValueChange={v => onUpdate('breakingNews', v)}
                trackColor={{ false: 'rgba(255, 255, 255, 0.1)', true: '#7952FC' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>

          {/* CACHE & STORAGE */}
          <Text style={styles.sectionHeading}>DEVICE STORAGE & CACHE</Text>
          <View style={styles.cardGroup}>
            <View style={styles.cacheRow}>
              <View style={styles.switchTextCol}>
                <Text style={styles.settingTitle}>Cached Thumbnails & Assets</Text>
                <Text style={styles.settingSubtitle}>
                  {cacheCleared ? 'Cache is currently empty' : 'Approx. 44.8 MB of club logos & previews'}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.clearCacheBtn, cacheCleared && styles.clearCacheBtnDone]}
                activeOpacity={0.8}
                onPress={handleClearCache}
              >
                {cacheCleared ? (
                  <CheckCircle2 size={15} color="#10B981" strokeWidth={2.4} />
                ) : (
                  <Trash2 size={15} color="#EF4444" strokeWidth={2.2} />
                )}
                <Text style={[styles.clearCacheText, cacheCleared && { color: '#10B981' }]}>
                  {cacheCleared ? 'Cleared' : 'Clear Cache'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

// ── 2. IN-PLACE CENTERED TIME FORMAT MODAL ──
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
    { key: '12h', label: '12-Hour (AM/PM)', example: '8:00 PM GMT' },
    { key: '24h', label: '24-Hour (17:30)', example: '20:00 GMT' },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.dialogBackdrop}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.dialogCard}
          onPress={e => e.stopPropagation?.()}
        >
          <View style={styles.dialogHeader}>
            <Clock size={20} color="#7952FC" strokeWidth={2.4} />
            <Text style={styles.dialogTitle}>Choose Time Format</Text>
          </View>
          <Text style={styles.dialogSubtitle}>
            Select how match kickoff times and countdown timers appear across BALLIVE.
          </Text>

          <View style={styles.dialogOptionsList}>
            {options.map(opt => {
              const isSelected = currentFormat === opt.key;
              return (
                <TouchableOpacity
                  key={opt.key}
                  style={[styles.dialogOptionRow, isSelected && styles.dialogOptionSelected]}
                  activeOpacity={0.75}
                  onPress={() => {
                    onSelect(opt.key);
                    onClose();
                  }}
                >
                  <View style={styles.dialogOptionTextCol}>
                    <Text style={[styles.dialogOptionTitle, isSelected && styles.dialogOptionTitleSelected]}>
                      {opt.label}
                    </Text>
                    <Text style={styles.dialogOptionExample}>e.g. {opt.example}</Text>
                  </View>
                  <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                    {isSelected && <View style={styles.radioInnerDot} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={styles.dialogCloseBtn}
            activeOpacity={0.8}
            onPress={onClose}
          >
            <Text style={styles.dialogCloseText}>Cancel</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

// ── 3. TIME ZONE MODAL (Compatibility export) ──
interface TimeZoneModalProps {
  visible: boolean;
  currentTimeZone: string;
  onSelect: (tz: string) => void;
  onClose: () => void;
}

export const TimeZoneModal: React.FC<TimeZoneModalProps> = ({
  visible,
  onClose,
}) => {
  return (
    <Modal visible={visible} transparent onRequestClose={onClose}>
      <View />
    </Modal>
  );
};

// ── 4. LANGUAGE MODAL (Compatibility export) ──
interface LanguageModalProps {
  visible: boolean;
  currentLanguage: string;
  onSelect: (lang: string) => void;
  onClose: () => void;
}

export const LanguageModal: React.FC<LanguageModalProps> = ({
  visible,
  onClose,
}) => {
  return (
    <Modal visible={visible} transparent onRequestClose={onClose}>
      <View />
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
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: '#A098B5',
    letterSpacing: 0.8,
    marginTop: 14,
    marginBottom: 8,
    marginLeft: 4,
  },
  cardGroup: {
    backgroundColor: '#1E1730',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  settingItemRow: {
    padding: 16,
  },
  settingTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  settingSubtitle: {
    fontSize: 12,
    color: '#A098B5',
    marginTop: 2,
    lineHeight: 16,
  },
  qualityPillsGroup: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  qualityPillBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#2A2045',
  },
  qualityPillBtnActive: {
    backgroundColor: '#7952FC',
  },
  qualityPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#A098B5',
  },
  qualityPillTextActive: {
    color: '#FFFFFF',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  switchTextCol: {
    flex: 1,
    marginRight: 14,
  },
  switchTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  switchSubtitle: {
    fontSize: 12,
    color: '#A098B5',
    marginTop: 2,
    lineHeight: 16,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 16,
  },
  cacheRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  clearCacheBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  clearCacheBtnDone: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
  },
  clearCacheText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EF4444',
  },

  // Centered Modal Dialog styles
  dialogBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(5, 4, 10, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  dialogCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#1E1730',
    borderRadius: 20,
    padding: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  dialogHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  dialogTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  dialogSubtitle: {
    fontSize: 12.5,
    color: '#A098B5',
    lineHeight: 18,
    marginBottom: 16,
  },
  dialogOptionsList: {
    gap: 10,
    marginBottom: 16,
  },
  dialogOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#261C3D',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  dialogOptionSelected: {
    backgroundColor: '#382565',
  },
  dialogOptionTextCol: {
    flex: 1,
    marginRight: 10,
  },
  dialogOptionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  dialogOptionTitleSelected: {
    color: '#FFFFFF',
  },
  dialogOptionExample: {
    fontSize: 11.5,
    color: '#A098B5',
    marginTop: 2,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#7952FC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: '#7952FC',
    backgroundColor: 'rgba(121, 82, 252, 0.2)',
  },
  radioInnerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#7952FC',
  },
  dialogCloseBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  dialogCloseText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#ECE9FA',
  },
});
