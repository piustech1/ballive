import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { BookmarkCheck, Info, Play } from 'lucide-react-native';
import Colors from '../../theme/colors';
import { DiscoverMatchup } from '../../constants/discoverData';

interface SavedMatchCardProps {
  matchup: DiscoverMatchup;
  onMatchDetailsPress: (matchup: DiscoverMatchup) => void;
  onRemovePress: (matchupId: string) => void;
  onWatchPress?: (matchup: DiscoverMatchup) => void;
}

export const SavedMatchCard: React.FC<SavedMatchCardProps> = ({
  matchup,
  onMatchDetailsPress,
  onRemovePress,
  onWatchPress,
}) => {
  const isLive = matchup.status === 'LIVE';
  const isUpcoming = matchup.status === 'UPCOMING';
  const isFinished = matchup.status === 'FT';

  return (
    <View style={styles.cardContainer}>
      {/* ── 1. CARD TOP: Competition Label & Status Badge ── */}
      <View style={styles.headerRow}>
        <View style={styles.competitionBox}>
          {matchup.competitionLogo ? (
            <Image
              source={{ uri: matchup.competitionLogo }}
              style={styles.compLogo}
              resizeMode="contain"
            />
          ) : null}
          <Text style={styles.competitionText} numberOfLines={1}>
            {matchup.competition}
          </Text>
        </View>

        {/* Status Pill Badge */}
        {isLive && (
          <View style={styles.liveBadge}>
            <View style={styles.livePulseDot} />
            <Text style={styles.liveBadgeText}>LIVE {matchup.minute ? `${matchup.minute}'` : ''}</Text>
          </View>
        )}

        {isUpcoming && (
          <View style={styles.upcomingBadge}>
            <Text style={styles.upcomingBadgeText}>
              {matchup.kickoffDate} • {matchup.kickoffTime}
            </Text>
          </View>
        )}

        {isFinished && (
          <View style={styles.ftBadge}>
            <Text style={styles.ftBadgeText}>FULL TIME</Text>
          </View>
        )}
      </View>

      {/* ── 2. CENTRAL MATCH CONTENT: Home Crest - VS/Score - Away Crest ── */}
      <View style={styles.centralRow}>
        {/* Home Team */}
        <View style={styles.teamColumn}>
          <View style={styles.crestContainer}>
            <Image
              source={{ uri: matchup.homeTeam.crestUrl }}
              style={styles.crestImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.teamName} numberOfLines={2}>
            {matchup.homeTeam.name}
          </Text>
        </View>

        {/* Center: Score (if Live/FT) or VS Indicator (if Upcoming) */}
        <View style={styles.scoreColumn}>
          {isLive || isFinished ? (
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreText}>
                {matchup.homeTeam.score ?? 0}
                <Text style={styles.scoreDivider}> : </Text>
                {matchup.awayTeam.score ?? 0}
              </Text>
              {isLive && matchup.minute ? (
                <Text style={styles.minuteText}>{matchup.minute}'</Text>
              ) : null}
            </View>
          ) : (
            <View style={styles.vsContainer}>
              <View style={styles.vsCircle}>
                <Text style={styles.vsText}>VS</Text>
              </View>
              <Text style={styles.kickoffText}>{matchup.kickoffTime}</Text>
            </View>
          )}
        </View>

        {/* Away Team */}
        <View style={styles.teamColumn}>
          <View style={styles.crestContainer}>
            <Image
              source={{ uri: matchup.awayTeam.crestUrl }}
              style={styles.crestImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.teamName} numberOfLines={2}>
            {matchup.awayTeam.name}
          </Text>
        </View>
      </View>

      {/* Venue Tag */}
      <View style={styles.venueRow}>
        <Text style={styles.venueText} numberOfLines={1}>
          📍 {matchup.venue}
        </Text>
      </View>

      {/* ── 3. CARD FOOTER: Actions ── */}
      <View style={styles.footerRow}>
        {/* Match Details Button */}
        <TouchableOpacity
          style={styles.detailsBtn}
          activeOpacity={0.75}
          onPress={() => onMatchDetailsPress(matchup)}
          accessibilityRole="button"
          accessibilityLabel="Match details"
        >
          <Info size={15} color={Colors.textSecondary} strokeWidth={2.2} />
          <Text style={styles.detailsBtnText}>Details</Text>
        </TouchableOpacity>

        {/* Watch Stream Button (if Live) */}
        {isLive && matchup.hasLiveBroadcast && (
          <TouchableOpacity
            style={styles.watchBtn}
            activeOpacity={0.8}
            onPress={() => onWatchPress && onWatchPress(matchup)}
            accessibilityRole="button"
            accessibilityLabel="Watch live stream"
          >
            <Play size={14} color="#FFFFFF" fill="#FFFFFF" />
            <Text style={styles.watchBtnText}>Watch</Text>
          </TouchableOpacity>
        )}

        {/* Bookmark / Remove Action */}
        <TouchableOpacity
          style={styles.removeBtn}
          activeOpacity={0.75}
          onPress={() => onRemovePress(matchup.id)}
          accessibilityRole="button"
          accessibilityLabel="Remove from saved matches"
        >
          <BookmarkCheck size={15} color="#A58BFC" strokeWidth={2.4} />
          <Text style={styles.removeBtnText}>Saved</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  competitionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  compLogo: {
    width: 18,
    height: 18,
    marginRight: 7,
  },
  competitionText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.liveRed,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 5,
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  liveBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  upcomingBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
  },
  upcomingBadgeText: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  ftBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  ftBadgeText: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
  },
  centralRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  teamColumn: {
    flex: 1,
    alignItems: 'center',
  },
  crestContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 7,
    marginBottom: 8,
  },
  crestImage: {
    width: '100%',
    height: '100%',
  },
  teamName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  scoreColumn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  scoreDivider: {
    color: Colors.textMuted,
    fontSize: 24,
  },
  minuteText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.liveRed,
    marginTop: 2,
  },
  vsContainer: {
    alignItems: 'center',
  },
  vsCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vsText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textSecondary,
  },
  kickoffText: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 4,
    fontWeight: '500',
  },
  venueRow: {
    alignItems: 'center',
    marginBottom: 14,
  },
  venueText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    gap: 8,
  },
  detailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  detailsBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  watchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7952FC',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 5,
  },
  watchBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  removeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(121, 82, 252, 0.16)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 5,
  },
  removeBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#A58BFC',
  },
});
