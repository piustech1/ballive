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
import { ArrowLeft, Check, Plus, Shield } from 'lucide-react-native';
import Colors from '../../../theme/colors';
import { SecondaryScreenHeader } from '../../../components/common/SecondaryScreenHeader';
import { POPULAR_TEAMS } from '../../../constants/discoverData';

interface FollowedTeamsModalProps {
  visible: boolean;
  followedTeamIds: string[];
  onToggleTeam: (teamId: string) => void;
  onClose: () => void;
}

export const FollowedTeamsModal: React.FC<FollowedTeamsModalProps> = ({
  visible,
  followedTeamIds,
  onToggleTeam,
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
        <SecondaryScreenHeader
          title="Followed Teams"
          subtitle={`${followedTeamIds.length} ${followedTeamIds.length === 1 ? 'club' : 'clubs'} followed`}
          onBack={onClose}
        />

        {/* Content List */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionHeading}>CLUBS IN YOUR RADAR</Text>

          {POPULAR_TEAMS.map(team => {
            const isFollowed = followedTeamIds.includes(team.id);

            return (
              <View key={team.id} style={styles.teamCard}>
                <View style={styles.crestWrapper}>
                  <Image
                    source={{ uri: team.crestUrl }}
                    style={styles.crestImage}
                    resizeMode="contain"
                  />
                </View>

                <View style={styles.infoCol}>
                  <Text style={styles.teamName}>{team.name}</Text>
                  <Text style={styles.teamMeta}>
                    {team.country} • {team.stadium}
                  </Text>
                  <Text style={styles.teamHonors}>{team.domesticTitle}</Text>
                </View>

                <TouchableOpacity
                  style={[styles.followBtn, isFollowed && styles.followBtnActive]}
                  onPress={() => onToggleTeam(team.id)}
                  activeOpacity={0.75}
                  accessibilityRole="button"
                  accessibilityLabel={isFollowed ? `Unfollow ${team.name}` : `Follow ${team.name}`}
                >
                  {isFollowed ? (
                    <>
                      <Check size={14} color="#A58BFC" strokeWidth={2.6} />
                      <Text style={styles.followBtnTextActive}>Following</Text>
                    </>
                  ) : (
                    <>
                      <Plus size={14} color="#FFFFFF" strokeWidth={2.6} />
                      <Text style={styles.followBtnText}>Follow</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            );
          })}

          {followedTeamIds.length === 0 && (
            <View style={styles.emptyBox}>
              <Shield size={36} color={Colors.textMuted} strokeWidth={1.8} />
              <Text style={styles.emptyTitle}>No clubs followed yet</Text>
              <Text style={styles.emptySubtitle}>
                Tap Follow on any club above to receive personalized match streams and updates.
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
    gap: 12,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  teamCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceCard,
    borderRadius: 18,
    padding: 14,
  },
  crestWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
    marginRight: 14,
  },
  crestImage: {
    width: '100%',
    height: '100%',
  },
  infoCol: {
    flex: 1,
    marginRight: 10,
  },
  teamName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  teamMeta: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  teamHonors: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  followBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7952FC',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    gap: 4,
  },
  followBtnActive: {
    backgroundColor: 'rgba(121, 82, 252, 0.16)',
  },
  followBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  followBtnTextActive: {
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
