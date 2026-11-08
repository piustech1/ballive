import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { footballService } from '../services/footballService';
import { Match } from '../types/football';

export function useLiveMatches() {
  const [liveMatches, setLiveMatches] = useState<Match[]>([]);

  // Query for initial data
  const query = useQuery({
    queryKey: ['live-matches'],
    queryFn: () => footballService.getLiveMatches(),
    staleTime: 10000,
  });

  // Real-time updates subscription
  useEffect(() => {
    if (query.data) {
      setLiveMatches(query.data);
    }

    const unsubscribe = footballService.subscribe(updatedLiveMatches => {
      setLiveMatches(updatedLiveMatches);
    });

    return unsubscribe;
  }, [query.data]);

  return {
    ...query,
    data: liveMatches.length > 0 ? liveMatches : query.data || [],
  };
}

export function useFixtures(options?: { date?: string; competitionId?: string; status?: string }) {
  return useQuery({
    queryKey: ['fixtures', options],
    queryFn: () => footballService.getFixtures(options),
    staleTime: 15000,
  });
}

export function useMatch(id: string) {
  return useQuery({
    queryKey: ['match', id],
    queryFn: () => footballService.getMatchById(id),
    staleTime: 5000,
    enabled: Boolean(id),
  });
}

export function useCompetitions() {
  return useQuery({
    queryKey: ['competitions'],
    queryFn: () => footballService.getCompetitions(),
    staleTime: 60000,
  });
}

export function useCompetition(id: string) {
  return useQuery({
    queryKey: ['competition', id],
    queryFn: () => footballService.getCompetitionById(id),
    enabled: Boolean(id),
  });
}

export function useStandings(competitionId: string) {
  return useQuery({
    queryKey: ['standings', competitionId],
    queryFn: () => footballService.getStandings(competitionId),
    staleTime: 60000,
    enabled: Boolean(competitionId),
  });
}

export function useSportsChannels(search?: string) {
  return useQuery({
    queryKey: ['sports-channels', search],
    queryFn: () => footballService.getSportsChannels(search),
    staleTime: 60000,
  });
}

export function usePremierLeagueStream() {
  return useQuery({
    queryKey: ['premier-league-stream'],
    queryFn: () => footballService.getPremierLeagueStream(),
    staleTime: 30000,
  });
}

export function useSearch(query: string) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: () => footballService.search(query),
    enabled: query.trim().length > 1,
    staleTime: 30000,
  });
}
