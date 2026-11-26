import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { X, Check } from 'lucide-react-native';
import Colors from '../../../theme/colors';
import {
  AVATAR_COLORS,
  PROFILE_AVATARS,
  resolveProfileAvatar,
} from '../../../constants/avatars';

interface EditProfileModalProps {
  visible: boolean;
  currentName: string;
  currentAvatarId: string;
  currentAvatarBg: string;
  onClose: () => void;
  onSave: (name: string, avatarId: string, avatarBg: string) => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  visible,
  currentName,
  currentAvatarId,
  currentAvatarBg,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState(currentName);
  const [selectedAvatarId, setSelectedAvatarId] = useState(currentAvatarId);
  const [selectedBg, setSelectedBg] = useState(currentAvatarBg);

  useEffect(() => {
    if (visible) {
      setName(currentName);
      setSelectedAvatarId(currentAvatarId || PROFILE_AVATARS[0].id);
      setSelectedBg(currentAvatarBg || AVATAR_COLORS[0]);
    }
  }, [visible, currentName, currentAvatarId, currentAvatarBg]);

  const activeAvatar = resolveProfileAvatar(selectedAvatarId);
  const ActiveIcon = activeAvatar.icon;

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      Alert.alert('Invalid Name', 'Please enter a valid display name.');
      return;
    }
    onSave(trimmed, selectedAvatarId, selectedBg);
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
            <Text style={styles.headerTitle}>Edit Profile & Avatar</Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <X size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Live Avatar Preview */}
          <View style={styles.previewSection}>
            <View style={[styles.avatarPreview, { backgroundColor: selectedBg }]}>
              {activeAvatar.source ? (
                <Image
                  source={activeAvatar.source}
                  style={styles.avatarImage}
                  resizeMode="cover"
                />
              ) : (
                <ActiveIcon size={34} color="#FFFFFF" strokeWidth={2.2} />
              )}
            </View>
            <Text style={styles.avatarActiveName}>{activeAvatar.label}</Text>
          </View>

          {/* Avatar Option Grid */}
          <Text style={styles.sectionLabel}>Choose Avatar</Text>
          <View style={styles.avatarGrid}>
            {PROFILE_AVATARS.map(item => {
              const IconComp = item.icon;
              const isSelected = selectedAvatarId === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.avatarGridItem, isSelected && styles.avatarGridItemActive]}
                  activeOpacity={0.8}
                  onPress={() => {
                    setSelectedAvatarId(item.id);
                  }}
                >
                  <View
                    style={[
                      styles.gridCircle,
                      { backgroundColor: isSelected ? selectedBg : item.defaultBg },
                    ]}
                  >
                    {item.source ? (
                      <Image source={item.source} style={styles.avatarImage} resizeMode="cover" />
                    ) : (
                      <IconComp size={18} color="#FFFFFF" strokeWidth={2.2} />
                    )}
                  </View>
                  <Text
                    style={[styles.gridItemLabel, isSelected && styles.gridItemLabelActive]}
                    numberOfLines={1}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Color Theme Swatches */}
          <Text style={styles.sectionLabel}>Avatar Accent Color</Text>
          <View style={styles.paletteRow}>
            {AVATAR_COLORS.map(color => {
              const isSelected = selectedBg === color;
              return (
                <TouchableOpacity
                  key={color}
                  style={[styles.colorCircle, { backgroundColor: color }]}
                  onPress={() => setSelectedBg(color)}
                  activeOpacity={0.8}
                >
                  {isSelected && <Check size={15} color="#FFFFFF" strokeWidth={3} />}
                </TouchableOpacity>
              );
            })}
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
              activeOpacity={0.85}
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
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#161324',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: Platform.OS === 'android' ? 24 : 34,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerTitle: {
    fontSize: 17.5,
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
  previewSection: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  avatarPreview: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 6,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarActiveName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#A58BFC',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  avatarGridItem: {
    width: '23%',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 12,
    backgroundColor: '#1E1A30',
  },
  avatarGridItemActive: {
    backgroundColor: '#2B2248',
  },
  gridCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 4,
  },
  gridItemLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9891B4',
  },
  gridItemLabelActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  paletteRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputSection: {
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 6,
    fontWeight: '700',
  },
  input: {
    backgroundColor: Colors.surfaceSearch,
    borderRadius: 12,
    height: 46,
    paddingHorizontal: 14,
    color: Colors.textPrimary,
    fontSize: 14.5,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    color: Colors.textSecondary,
    fontSize: 14.5,
    fontWeight: '600',
  },
  saveBtn: {
    flex: 2,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#7650F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '700',
  },
});
