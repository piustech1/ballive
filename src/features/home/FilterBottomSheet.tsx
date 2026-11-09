import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import { X, Check } from 'lucide-react-native';
import { CompetitionLogo } from '../../components/common/CompetitionLogo';

interface FilterBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  selectedStatus: string;
  selectedCompetition: string;
  onApply: (status: string, competition: string) => void;
}

const STATUS_OPTIONS = [
  { id: 'all', label: 'All Matches' },
  { id: 'live', label: 'Live Now', isLive: true },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'completed', label: 'Full Time' },
];

const COMPETITION_OPTIONS = [
  { id: 'all', label: 'All Competitions' },
  { id: 'pl', label: 'Premier League', compId: 'pl' },
  { id: 'ucl', label: 'Champions League', compId: 'ucl' },
  { id: 'laliga', label: 'LaLiga', compId: 'laliga' },
  { id: 'seriea', label: 'Serie A', compId: 'seriea' },
  { id: 'bundesliga', label: 'Bundesliga', compId: 'bundesliga' },
];

export const FilterBottomSheet: React.FC<FilterBottomSheetProps> = ({
  visible,
  onClose,
  selectedStatus,
  selectedCompetition,
  onApply,
}) => {
  const [localStatus, setLocalStatus] = useState(selectedStatus || 'all');
  const [localCompetition, setLocalCompetition] = useState(selectedCompetition || 'all');

  useEffect(() => {
    if (visible) {
      setLocalStatus(selectedStatus || 'all');
      setLocalCompetition(selectedCompetition || 'all');
    }
  }, [visible, selectedStatus, selectedCompetition]);

  const handleApply = () => {
    onApply(localStatus, localCompetition);
    onClose();
  };

  const handleReset = () => {
    setLocalStatus('all');
    setLocalCompetition('all');
    onApply('all', 'all');
    onClose();
  };

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
              {/* Top Drag Indicator */}
              <View style={styles.indicatorContainer}>
                <View style={styles.indicatorPill} />
              </View>

              {/* Header */}
              <View style={styles.headerRow}>
                <Text style={styles.sheetTitle}>Filter Matches</Text>
                <TouchableOpacity
                  onPress={onClose}
                  style={styles.closeBtn}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  accessibilityLabel="Close filter sheet"
                >
                  <X size={20} color="#A098B5" strokeWidth={2.2} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* 1. Match Status Section */}
                <Text style={styles.sectionLabel}>Match Status</Text>
                <View style={styles.chipsContainer}>
                  {STATUS_OPTIONS.map(opt => {
                    const isSelected = localStatus === opt.id;
                    return (
                      <TouchableOpacity
                        key={opt.id}
                        activeOpacity={0.8}
                        style={[styles.chip, isSelected && styles.chipActive]}
                        onPress={() => setLocalStatus(opt.id)}
                      >
                        {opt.isLive && <View style={styles.liveRedDot} />}
                        <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                          {opt.label}
                        </Text>
                        {isSelected && <Check size={14} color="#FFFFFF" strokeWidth={2.6} style={styles.checkIcon} />}
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* 2. Competition Section */}
                <Text style={[styles.sectionLabel, { marginTop: 18 }]}>Competition</Text>
                <View style={styles.chipsContainer}>
                  {COMPETITION_OPTIONS.map(opt => {
                    const isSelected = localCompetition === opt.id;
                    return (
                      <TouchableOpacity
                        key={opt.id}
                        activeOpacity={0.8}
                        style={[styles.chip, isSelected && styles.chipActive]}
                        onPress={() => setLocalCompetition(opt.id)}
                      >
                        {opt.compId && (
                          <CompetitionLogo
                            competitionId={opt.compId}
                            size={18}
                            containerStyle={{ marginRight: 6 }}
                          />
                        )}
                        <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                          {opt.label}
                        </Text>
                        {isSelected && <Check size={14} color="#FFFFFF" strokeWidth={2.6} style={styles.checkIcon} />}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>

              {/* Action Buttons */}
              <View style={styles.actionRow}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.resetBtn}
                  onPress={handleReset}
                >
                  <Text style={styles.resetBtnText}>Reset</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.applyBtn}
                  onPress={handleApply}
                >
                  <Text style={styles.applyBtnText}>Apply Filters</Text>
                </TouchableOpacity>
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
    paddingHorizontal: 20,
    paddingBottom: 28,
    maxHeight: '80%',
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
    borderBottomWidth: 1,
    borderBottomColor: '#281E40',
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#261C3D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingVertical: 14,
  },
  sectionLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#A098B5',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#281E40',
    paddingHorizontal: 13,
    paddingVertical: 8.5,
    borderRadius: 12,
  },
  chipActive: {
    backgroundColor: '#7952FC',
  },
  liveRedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
    marginRight: 6,
  },
  chipText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#A098B5',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  checkIcon: {
    marginLeft: 6,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#281E40',
  },
  resetBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#261C3D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#A098B5',
  },
  applyBtn: {
    flex: 2,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#7952FC',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7952FC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  applyBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

export default FilterBottomSheet;
