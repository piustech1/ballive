import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import {
  X,
  Tv,
  Calendar,
  Trophy,
  Globe,
  Shield,
  Bookmark,
  BellRing,
  Bell,
} from 'lucide-react-native';
import { useAppNavigation } from '../../navigation/NavigationContext';

interface QuickAccessLauncherProps {
  visible: boolean;
  onClose: () => void;
}

export const QuickAccessLauncher: React.FC<QuickAccessLauncherProps> = ({
  visible,
  onClose,
}) => {
  const { navigate, switchTab } = useAppNavigation();

  const handleAction = (action: () => void) => {
    onClose();
    // Allow sheet to close smoothly before navigating
    setTimeout(() => {
      action();
    }, 120);
  };

  const SHORTCUTS = [
    {
      id: 'live_streams',
      label: 'Live Streams',
      subtitle: 'Watch feeds',
      icon: Tv,
      color: '#EF4444',
      action: () => navigate({ name: 'AllLiveStreams' }),
    },
    {
      id: 'all_matches',
      label: 'All Matches',
      subtitle: 'Fixtures & scores',
      icon: Calendar,
      color: '#7952FC',
      action: () => navigate({ name: 'AllLiveStreams' }),
    },
    {
      id: 'competitions',
      label: 'Competitions',
      subtitle: 'Leagues & cups',
      icon: Trophy,
      color: '#F8BE38',
      action: () => navigate({ name: 'AllCompetitions' }),
    },
    {
      id: 'leagues',
      label: 'All Leagues',
      subtitle: 'Global football',
      icon: Globe,
      color: '#38BDF8',
      action: () => navigate({ name: 'AllLeagues' }),
    },
    {
      id: 'teams',
      label: 'Clubs & Teams',
      subtitle: 'European giants',
      icon: Shield,
      color: '#A855F7',
      action: () => navigate({ name: 'AllTeams' }),
    },
    {
      id: 'saved',
      label: 'Saved Matches',
      subtitle: 'Bookmarks',
      icon: Bookmark,
      color: '#10B981',
      action: () => switchTab('Saved'),
    },
    {
      id: 'reminders',
      label: 'Reminders',
      subtitle: 'Kickoff alerts',
      icon: BellRing,
      color: '#EC4899',
      action: () => navigate({ name: 'Notifications' }),
    },
    {
      id: 'notifications',
      label: 'Notifications',
      subtitle: 'Recent updates',
      icon: Bell,
      color: '#6366F1',
      action: () => navigate({ name: 'Notifications' }),
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback onPress={e => e.stopPropagation()}>
            <View style={styles.sheetContainer}>
              {/* Drag Handle */}
              <View style={styles.indicatorContainer}>
                <View style={styles.indicatorPill} />
              </View>

              {/* Header */}
              <View style={styles.headerRow}>
                <View>
                  <Text style={styles.sheetTitle}>Quick Access</Text>
                  <Text style={styles.sheetSubtitle}>BALLIVE Hub & Shortcuts</Text>
                </View>
                <TouchableOpacity
                  onPress={onClose}
                  style={styles.closeBtn}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  accessibilityLabel="Close quick access"
                >
                  <X size={20} color="#A098B5" strokeWidth={2.2} />
                </TouchableOpacity>
              </View>

              {/* 4x2 Shortcuts Grid */}
              <View style={styles.gridContainer}>
                {SHORTCUTS.map(item => {
                  const IconComponent = item.icon;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      activeOpacity={0.75}
                      style={styles.gridItem}
                      onPress={() => handleAction(item.action)}
                    >
                      <View style={[styles.iconBox, { backgroundColor: `${item.color}20` }]}>
                        <IconComponent size={22} color={item.color} strokeWidth={2.2} />
                      </View>
                      <Text style={styles.itemLabel} numberOfLines={1}>
                        {item.label}
                      </Text>
                      <Text style={styles.itemSubtitle} numberOfLines={1}>
                        {item.subtitle}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(5, 4, 10, 0.65)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#1E1730',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 18,
    paddingBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 12,
  },
  indicatorContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  indicatorPill: {
    width: 40,
    height: 4.5,
    borderRadius: 2.25,
    backgroundColor: '#3A3055',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#281E40',
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  sheetSubtitle: {
    fontSize: 11.5,
    color: '#A098B5',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#261C3D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 6,
  },
  gridItem: {
    width: '23%', // 4 per row
    backgroundColor: '#181324',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#261C3D',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  itemLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  itemSubtitle: {
    fontSize: 9.5,
    color: '#A098B5',
    textAlign: 'center',
    marginTop: 1,
  },
});
