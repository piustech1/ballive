import { useState, useEffect } from 'react';
import { ProfileStorage, UserProfileData } from '../services/profileStorage';
import type { DiscoverCompetition, PopularLeague, PopularTeam } from '../constants/discoverData';

export const useProfile = () => {
  const [profile, setProfile] = useState<UserProfileData>(ProfileStorage.getProfile());

  useEffect(() => {
    const unsubscribe = ProfileStorage.subscribe(updated => {
      setProfile(updated);
    });
    return unsubscribe;
  }, []);

  return {
    profile,
    updateProfile: (partial: Partial<UserProfileData>) => ProfileStorage.updateProfile(partial),
    toggleFollowTeam: (teamOrId: string | PopularTeam, meta?: PopularTeam) =>
      ProfileStorage.toggleFollowTeam(teamOrId, meta),
    toggleFollowLeague: (leagueOrId: string | DiscoverCompetition | PopularLeague, meta?: DiscoverCompetition | PopularLeague) =>
      ProfileStorage.toggleFollowLeague(leagueOrId, meta),
    isTeamFollowed: (teamOrId: string | PopularTeam) => ProfileStorage.isTeamFollowed(teamOrId),
    isLeagueFollowed: (leagueOrId: string | DiscoverCompetition | PopularLeague) =>
      ProfileStorage.isLeagueFollowed(leagueOrId),
    toggleMatchReminder: (matchId: string) => ProfileStorage.toggleMatchReminder(matchId),
    toggleSaveMatch: (matchId: string) => ProfileStorage.toggleSaveMatch(matchId),
  };
};
