import { useState, useEffect, useCallback } from 'react';
import { DiscoverMatchup } from '../constants/discoverData';
import { LiveMatch } from '../constants/mockData';
import { matchOfTheDayService } from '../services/matchOfTheDayService';

export function useMatchOfTheDay(availableLiveMatches: LiveMatch[] = []) {
  const [motdMatch, setMotdMatch] = useState<DiscoverMatchup | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = matchOfTheDayService.subscribe(match => {
      if (isMounted) {
        setMotdMatch(match);
      }
    });

    matchOfTheDayService
      .getMatchOfTheDay(availableLiveMatches)
      .then(match => {
        if (isMounted) {
          setMotdMatch(match);
          setIsLoading(false);
        }
      })
      .catch(err => {
        console.warn('[useMatchOfTheDay] Failed to load MOTD:', err);
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [availableLiveMatches]);

  const refreshMotd = useCallback(async () => {
    setIsLoading(true);
    try {
      const match = await matchOfTheDayService.refreshMotd(availableLiveMatches);
      setMotdMatch(match);
    } finally {
      setIsLoading(false);
    }
  }, [availableLiveMatches]);

  return {
    motdMatch,
    isLoading,
    refreshMotd,
  };
}
