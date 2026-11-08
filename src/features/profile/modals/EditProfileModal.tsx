import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { X, Check, User } from 'lucide-react-native';
import Colors from '../../../theme/colors';

interface EditProfileModalProps {
  visible: boolean;
  currentName: string;
  currentAvatarBg: string;
  onClose: () => void;
  onSave: (name: string, avatarBg: string) => void;
}

const AVATAR_PALETTE = [
  '#7952FC', // Purple (Premier League)
  '#FF2E56', // Red (Live / Striker)
  '#08B3E5', // Cyan (LaLiga)
  '#22C55E', // Green (Bundesliga)
  '#F8BE38', // Gold (Champions League)
];

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  visible,
  currentName,
  currentAvatarBg,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState(currentName);
  const [selectedBg, setSelectedBg] = useState(currentAvatarBg);

  // Sync state when opened
  React.useEffect(() => {
    if (visible) {
      setName(currentName);
      setSelectedBg(currentAvatarBg);
    }
  }, [visible, currentName, currentAvatarBg]);

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      Alert.alert('Invalid Name', 'Please enter a valid display name.');
      return;
    }
    onSave(trimmed, selectedBg);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Edit Profile</Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <X size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Avatar Preview & Color Selector */}
          <View style={styles.avatarSection}>
            <View style={[styles.avatarPreview, { backgroundColor: selectedBg }]}>
              <User size={40} color="#FFFFFF" strokeWidth={2.2} />
            </View>
            <Text style={styles.paletteLabel}>Choose Avatar Theme</Text>
            <View style={styles.paletteRow}>
              {AVATAR_PALETTE.map(color => {
                const isSelected = selectedBg === color;
                return (
                  <TouchableOpacity
                    key={color}
                    style={[styles.colorCircle, { backgroundColor: color }]}
                    onPress={() => setSelectedBg(color)}
                    activeOpacity={0.8}
                  >
                    {isSelected && <Check size={16} color="#FFFFFF" strokeWidth={3} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Display Name Input */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Display Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor={Colors.textPlaceholder}
              style={styles.input}
              maxLength={32}
              autoCorrect={false}
            />
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              activeOpacity={0.75}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleSave}
              activeOpacity={0.8}
            >
              <Text style={styles.saveBtnText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#161324',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'android' ? 28 : 36,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 18,
  },
  avatarPreview: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  paletteLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 10,
    fontWeight: '500',
  },
  paletteRow: {
    flexDirection: 'row',
    gap: 12,
  },
  colorCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputSection: {
    marginTop: 10,
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    backgroundColor: Colors.surfaceSearch,
    borderRadius: 14,
    height: 48,
    paddingHorizontal: 16,
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    color: Colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
  saveBtn: {
    flex: 2,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#7952FC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
