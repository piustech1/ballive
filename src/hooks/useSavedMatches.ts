import { useState, useEffect, useCallback, useMemo } from 'react';
import { DiscoverMatchup } from '../constants/discoverData';
import { LiveMatch } from '../constants/mockData';
import { savedMatchesService } from '../services/savedMatchesService';

export function useSavedMatches() {
  const [savedMatches, setSavedMatches] = useState<DiscoverMatchup[]>(() =>
    savedMatchesService.getCachedSavedMatchesSync()
  );
  const [isReady, setIsReady] = useState<boolean>(() => savedMatchesService.isReady());

  useEffect(() => {
    const unsubscribe = savedMatchesService.subscribe(matches => {
      setSavedMatches(matches);
      if (savedMatchesService.isReady()) {
        setIsReady(true);
      }
    });
    return unsubscribe;
  }, []);

  const savedMatchIds = useMemo(() => {
    return new Set(savedMatches.map(m => m.id));
  }, [savedMatches]);

  const isSaved = useCallback((id: string) => {
    return savedMatchesService.isMatchSaved(id);
  }, [savedMatches]);

  const toggleSave = useCallback(async (match: DiscoverMatchup | LiveMatch) => {
    return await savedMatchesService.toggleSaveMatch(match);
  }, []);

  const removeSave = useCallback(async (id: string) => {
    await savedMatchesService.removeSavedMatch(id);
  }, []);

  const refreshSaved = useCallback(async (liveMatches?: LiveMatch[]) => {
    return await savedMatchesService.purgeFinishedMatches(liveMatches);
  }, []);

  return {
    savedMatches,
    savedMatchIds,
    isReady,
    isSaved,
    toggleSave,
    removeSave,
    refreshSaved,
  };
}
