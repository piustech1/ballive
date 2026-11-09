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
import { ArrowLeft, Check, Plus, Trophy } from 'lucide-react-native';
import Colors from '../../../theme/colors';
import { SecondaryScreenHeader } from '../../../components/common/SecondaryScreenHeader';
import { POPULAR_LEAGUES } from '../../../constants/discoverData';

interface FollowedLeaguesModalProps {
  visible: boolean;
  followedLeagueIds: string[];
  onToggleLeague: (leagueId: string) => void;
  onClose: () => void;
}

export const FollowedLeaguesModal: React.FC<FollowedLeaguesModalProps> = ({
  visible,
  followedLeagueIds,
  onToggleLeague,
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
          title="Followed Leagues"
          subtitle={`${followedLeagueIds.length} ${followedLeagueIds.length === 1 ? 'competition' : 'competitions'} tracked`}
          onBack={onClose}
        />

        {/* Content List */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionHeading}>GLOBAL COMPETITIONS</Text>

          {POPULAR_LEAGUES.map(league => {
            const isFollowed = followedLeagueIds.includes(league.id);

            return (
              <View key={league.id} style={styles.leagueCard}>
                <View style={styles.logoWrapper}>
                  <Image
                    source={{ uri: league.logoUrl }}
                    style={styles.logoImage}
                    resizeMode="contain"
                  />
                </View>

                <View style={styles.infoCol}>
                  <Text style={styles.leagueName}>{league.name}</Text>
                  <Text style={styles.leagueMeta}>
                    {league.country} • {league.currentMatchweek}
                  </Text>
                  <Text style={styles.leagueDesc} numberOfLines={1}>
                    {league.description}
                  </Text>
                </View>

                <TouchableOpacity
                  style={[styles.followBtn, isFollowed && styles.followBtnActive]}
                  onPress={() => onToggleLeague(league.id)}
                  activeOpacity={0.75}
                  accessibilityRole="button"
                  accessibilityLabel={isFollowed ? `Unfollow ${league.name}` : `Follow ${league.name}`}
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

          {followedLeagueIds.length === 0 && (
            <View style={styles.emptyBox}>
              <Trophy size={36} color={Colors.textMuted} strokeWidth={1.8} />
              <Text style={styles.emptyTitle}>No leagues followed yet</Text>
              <Text style={styles.emptySubtitle}>
                Follow top divisions to get tournament standings and round schedules.
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
  leagueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceCard,
    borderRadius: 18,
    padding: 14,
  },
  logoWrapper: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
    marginRight: 14,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  infoCol: {
    flex: 1,
    marginRight: 10,
  },
  leagueName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  leagueMeta: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  leagueDesc: {
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
