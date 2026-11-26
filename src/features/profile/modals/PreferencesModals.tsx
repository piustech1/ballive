import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Clock } from 'lucide-react-native';

// ── IN-PLACE CENTERED TIME FORMAT MODAL ──
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
            <Clock size={20} color="#7650F6" strokeWidth={2.4} />
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

// ── COMPATIBILITY EXPORTS ──
interface TimeZoneModalProps {
  visible: boolean;
  currentTimeZone: string;
  onSelect: (tz: string) => void;
  onClose: () => void;
}

export const TimeZoneModal: React.FC<TimeZoneModalProps> = ({
  visible,
  onClose,
}) => (
  <Modal visible={visible} transparent onRequestClose={onClose}>
    <View />
  </Modal>
);

interface LanguageModalProps {
  visible: boolean;
  currentLanguage: string;
  onSelect: (lang: string) => void;
  onClose: () => void;
}

export const LanguageModal: React.FC<LanguageModalProps> = ({
  visible,
  onClose,
}) => (
  <Modal visible={visible} transparent onRequestClose={onClose}>
    <View />
  </Modal>
);

const styles = StyleSheet.create({
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
    borderColor: '#7650F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: '#7650F6',
    backgroundColor: 'rgba(118, 80, 246, 0.2)',
  },
  radioInnerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#7650F6',
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
