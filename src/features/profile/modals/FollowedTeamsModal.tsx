import React, { useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Check, Plus, Shield } from 'lucide-react-native';
import Colors from '../../../theme/colors';
import { SecondaryScreenHeader } from '../../../components/common/SecondaryScreenHeader';
import { POPULAR_TEAMS, PopularTeam } from '../../../constants/discoverData';
import { TeamCrest } from '../../../components/common/TeamCrest';
import { popularTeamsService } from '../../../services/popularTeamsService';
import { normalizeTeamId } from '../../../services/profileStorage';
import { findTeamById } from '../../../navigation/navHelpers';

interface FollowedTeamsModalProps {
  visible: boolean;
  followedTeamIds: string[];
  followedTeamsMeta?: Record<string, PopularTeam>;
  onToggleTeam: (team: PopularTeam) => void;
  onSelectTeam?: (team: PopularTeam) => void;
  onClose: () => void;
}

export const FollowedTeamsModal: React.FC<FollowedTeamsModalProps> = ({
  visible,
  followedTeamIds,
  followedTeamsMeta,
  onToggleTeam,
  onSelectTeam,
  onClose,
}) => {
  const { normalizedSet, teamRows } = useMemo(() => {
    const normIds = followedTeamIds.map(normalizeTeamId).filter(Boolean);
    const set = new Set(normIds);
    const seen = new Set<string>();
    const list: PopularTeam[] = [];

    const addUnique = (t: PopularTeam) => {
      const nid = normalizeTeamId(t.id);
      if (seen.has(nid)) return;
      seen.add(nid);
      list.push({ ...t, id: nid });
    };

    // 1. Followed teams first (including dynamically discovered clubs)
    followedTeamIds.forEach(rawId => {
      const nid = normalizeTeamId(rawId);
      const snap = followedTeamsMeta?.[nid] || followedTeamsMeta?.[rawId] || findTeamById(rawId);
      addUnique(snap);
    });

    // 2. Remaining dynamic & popular clubs to discover
    [...popularTeamsService.getCachedPopularTeams(), ...POPULAR_TEAMS].forEach(addUnique);

    return { normalizedSet: set, teamRows: list };
  }, [followedTeamIds, followedTeamsMeta]);

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
          subtitle={`${normalizedSet.size} ${normalizedSet.size === 1 ? 'club' : 'clubs'} followed`}
          onBack={onClose}
        />

        {/* Content List */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionHeading}>TEAMS & CLUBS</Text>

          {teamRows.map(team => {
            const isFollowed = normalizedSet.has(normalizeTeamId(team.id));
            const sub1 = [team.country, team.stadium].filter(Boolean).join(' • ');
            const sub2 = team.competitionName || team.domesticTitle;

            return (
              <TouchableOpacity
                key={team.id}
                activeOpacity={onSelectTeam ? 0.8 : 1}
                onPress={() => {
                  if (onSelectTeam) {
                    onClose();
                    onSelectTeam(team);
                  }
                }}
                style={styles.teamCard}
              >
                <TeamCrest
                  uri={team.crestUrl}
                  teamId={team.id}
                  teamName={team.name}
                  size={44}
                  containerStyle={styles.crestFlatContainer}
                />

                <View style={styles.infoCol}>
                  <Text style={styles.teamName} numberOfLines={1}>{team.name}</Text>
                  <Text style={styles.teamMeta} numberOfLines={1}>{sub1}</Text>
                  {sub2 ? <Text style={styles.teamHonors} numberOfLines={1}>{sub2}</Text> : null}
                </View>

                <TouchableOpacity
                  style={[styles.followBtn, isFollowed && styles.followBtnActive]}
                  onPress={e => {
                    e.stopPropagation();
                    onToggleTeam(team);
                  }}
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
              </TouchableOpacity>
            );
          })}

          {normalizedSet.size === 0 && (
            <View style={styles.emptyBox}>
              <Shield size={36} color={Colors.textMuted} strokeWidth={1.8} />
              <Text style={styles.emptyTitle}>No teams followed yet</Text>
              <Text style={styles.emptySubtitle}>
                Tap Follow on any team above to keep quick access in your Saved tab.
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
  crestFlatContainer: {
    width: 44,
    height: 44,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
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
