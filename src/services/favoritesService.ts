/**
 * Service to manage persistent user favorites (teams & competitions) via localStorage.
 */

const STORAGE_KEY_TEAMS = 'sport2_fav_teams';
const STORAGE_KEY_COMPETITIONS = 'sport2_fav_competitions';

class FavoritesService {
  private getList(key: string): string[] {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private setList(key: string, list: string[]): void {
    try {
      localStorage.setItem(key, JSON.stringify(list));
      window.dispatchEvent(new CustomEvent('sport2_favorites_changed'));
    } catch (e) {
      console.error('Error saving favorites to localStorage:', e);
    }
  }

  // Teams
  getFavoriteTeamIds(): string[] {
    const list = this.getList(STORAGE_KEY_TEAMS);
    // Default initial favorites if none set
    if (list.length === 0) {
      return ['real-madrid', 'man-city', 'arsenal'];
    }
    return list;
  }

  isTeamFavorite(teamId: string): boolean {
    return this.getFavoriteTeamIds().includes(teamId);
  }

  toggleTeamFavorite(teamId: string): boolean {
    const list = this.getFavoriteTeamIds();
    let updated: string[];
    if (list.includes(teamId)) {
      updated = list.filter(id => id !== teamId);
    } else {
      updated = [...list, teamId];
    }
    this.setList(STORAGE_KEY_TEAMS, updated);
    return updated.includes(teamId);
  }

  // Competitions
  getFavoriteCompetitionIds(): string[] {
    const list = this.getList(STORAGE_KEY_COMPETITIONS);
    if (list.length === 0) {
      return ['ucl', 'pl', 'laliga'];
    }
    return list;
  }

  isCompetitionFavorite(compId: string): boolean {
    return this.getFavoriteCompetitionIds().includes(compId);
  }

  toggleCompetitionFavorite(compId: string): boolean {
    const list = this.getFavoriteCompetitionIds();
    let updated: string[];
    if (list.includes(compId)) {
      updated = list.filter(id => id !== compId);
    } else {
      updated = [...list, compId];
    }
    this.setList(STORAGE_KEY_COMPETITIONS, updated);
    return updated.includes(compId);
  }
}

export const favoritesService = new FavoritesService();
