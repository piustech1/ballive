import { useState, useEffect } from 'react';
import { ProfileStorage, UserProfileData } from '../services/profileStorage';

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
    toggleFollowTeam: (teamId: string) => ProfileStorage.toggleFollowTeam(teamId),
    toggleFollowLeague: (leagueId: string) => ProfileStorage.toggleFollowLeague(leagueId),
    toggleMatchReminder: (matchId: string) => ProfileStorage.toggleMatchReminder(matchId),
  };
};
