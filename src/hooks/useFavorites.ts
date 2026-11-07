import { useState, useEffect } from 'react';
import { favoritesService } from '../services/favoritesService';

export function useFavorites() {
  const [favoriteTeamIds, setFavoriteTeamIds] = useState<string[]>(() =>
    favoritesService.getFavoriteTeamIds()
  );
  const [favoriteCompIds, setFavoriteCompIds] = useState<string[]>(() =>
    favoritesService.getFavoriteCompetitionIds()
  );

  useEffect(() => {
    const handleFavoritesChange = () => {
      setFavoriteTeamIds(favoritesService.getFavoriteTeamIds());
      setFavoriteCompIds(favoritesService.getFavoriteCompetitionIds());
    };

    window.addEventListener('sport2_favorites_changed', handleFavoritesChange);
    return () => {
      window.removeEventListener('sport2_favorites_changed', handleFavoritesChange);
    };
  }, []);

  const toggleTeamFavorite = (teamId: string) => {
    return favoritesService.toggleTeamFavorite(teamId);
  };

  const toggleCompetitionFavorite = (compId: string) => {
    return favoritesService.toggleCompetitionFavorite(compId);
  };

  const isTeamFavorite = (teamId: string) => {
    return favoriteTeamIds.includes(teamId);
  };

  const isCompetitionFavorite = (compId: string) => {
    return favoriteCompIds.includes(compId);
  };

  return {
    favoriteTeamIds,
    favoriteCompIds,
    toggleTeamFavorite,
    toggleCompetitionFavorite,
    isTeamFavorite,
    isCompetitionFavorite,
  };
}
