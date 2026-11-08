import React from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Platform,
} from 'react-native';
import { ArrowLeft, Bell, BellRing, Calendar } from 'lucide-react-native';
import Colors from '../../../theme/colors';
import { UPCOMING_HIGHLIGHTS } from '../../../constants/discoverData';

interface MatchRemindersModalProps {
  visible: boolean;
  matchReminderIds: string[];
  onToggleReminder: (matchId: string) => void;
  onClose: () => void;
}

export const MatchRemindersModal: React.FC<MatchRemindersModalProps> = ({
  visible,
  matchReminderIds,
  onToggleReminder,
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={onClose}
            style={styles.backBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel="Back"
          >
            <ArrowLeft size={22} color={Colors.textPrimary} strokeWidth={2.2} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Match Reminders</Text>
            <Text style={styles.headerSubtitle}>
              {matchReminderIds.length} {matchReminderIds.length === 1 ? 'alert' : 'alerts'} scheduled
            </Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* Content List */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionHeading}>UPCOMING FIXTURES</Text>

          {UPCOMING_HIGHLIGHTS.map(matchup => {
            const isReminderSet = matchReminderIds.includes(matchup.id);

            return (
              <View key={matchup.id} style={styles.matchCard}>
                {/* Tournament Tag & Kickoff */}
                <View style={styles.cardTopRow}>
                  <Text style={styles.compName}>{matchup.competition}</Text>
                  <Text style={styles.kickoffTag}>
                    {matchup.kickoffDate} • {matchup.kickoffTime}
                  </Text>
                </View>

                {/* Matchup Teams Row */}
                <View style={styles.teamsRow}>
                  {/* Home */}
                  <View style={styles.teamSide}>
                    <View style={styles.crestCircle}>
                      <Image
                        source={{ uri: matchup.homeTeam.crestUrl }}
                        style={styles.crestImage}
                        resizeMode="contain"
                      />
                    </View>
                    <Text style={styles.teamName} numberOfLines={1}>
                      {matchup.homeTeam.name}
                    </Text>
                  </View>

                  {/* VS */}
                  <View style={styles.vsBox}>
                    <Text style={styles.vsText}>VS</Text>
                  </View>

                  {/* Away */}
                  <View style={styles.teamSide}>
                    <View style={styles.crestCircle}>
                      <Image
                        source={{ uri: matchup.awayTeam.crestUrl }}
                        style={styles.crestImage}
                        resizeMode="contain"
                      />
                    </View>
                    <Text style={styles.teamName} numberOfLines={1}>
                      {matchup.awayTeam.name}
                    </Text>
                  </View>
                </View>

                {/* Card Footer: Venue & Reminder Action */}
                <View style={styles.cardFooter}>
                  <Text style={styles.venueText} numberOfLines={1}>
                    📍 {matchup.venue}
                  </Text>

                  <TouchableOpacity
                    style={[styles.reminderBtn, isReminderSet && styles.reminderBtnActive]}
                    onPress={() => onToggleReminder(matchup.id)}
                    activeOpacity={0.75}
                    accessibilityRole="button"
                    accessibilityLabel={isReminderSet ? 'Cancel reminder' : 'Set reminder'}
                  >
                    {isReminderSet ? (
                      <>
                        <BellRing size={14} color="#A58BFC" strokeWidth={2.4} />
                        <Text style={styles.reminderBtnTextActive}>Reminded</Text>
                      </>
                    ) : (
                      <>
                        <Bell size={14} color={Colors.textSecondary} strokeWidth={2} />
                        <Text style={styles.reminderBtnText}>Remind Me</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}

          {matchReminderIds.length === 0 && (
            <View style={styles.emptyBox}>
              <Calendar size={36} color={Colors.textMuted} strokeWidth={1.8} />
              <Text style={styles.emptyTitle}>No match reminders set</Text>
              <Text style={styles.emptySubtitle}>
                Tap Remind Me on any fixture to get notified 15 minutes before kickoff.
              </Text>
            </View>
          )}
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
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 14,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  matchCard: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: 18,
    padding: 16,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  compName: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  kickoffTag: {
    fontSize: 11,
    color: '#A58BFC',
    fontWeight: '700',
  },
  teamsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  teamSide: {
    flex: 1,
    alignItems: 'center',
  },
  crestCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
    marginBottom: 6,
  },
  crestImage: {
    width: '100%',
    height: '100%',
  },
  teamName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  vsBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  vsText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textMuted,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.04)',
  },
  venueText: {
    fontSize: 11,
    color: Colors.textMuted,
    flex: 1,
    marginRight: 10,
  },
  reminderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    gap: 6,
  },
  reminderBtnActive: {
    backgroundColor: 'rgba(121, 82, 252, 0.16)',
  },
  reminderBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  reminderBtnTextActive: {
    fontSize: 12,
    fontWeight: '700',
    color: '#A58BFC',
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: Colors.surfaceCard,
    borderRadius: 18,
    marginTop: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 12,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
