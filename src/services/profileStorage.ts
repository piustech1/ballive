import * as FileSystem from 'expo-file-system';
import type { DiscoverCompetition, PopularLeague, PopularTeam } from '../constants/discoverData';
import type { SportType } from '../constants/mockData';

export interface UserProfileData {
  displayName: string;
  avatarId: string;
  avatarBg: string;
  membership: string;
  followedTeamIds: string[];
  followedLeagueIds: string[];
  followedTeamsMeta?: Record<string, PopularTeam>;
  followedLeaguesMeta?: Record<string, DiscoverCompetition>;
  matchReminderIds: string[];
  savedMatchIds: string[];
  timeFormat: '12h' | '24h';
  timeZone: string;
  language: string;
  notifications: {
    matchKickoffs: boolean;
    liveGoals: boolean;
    breakingNews: boolean;
  };
}

const LEAGUE_ID_ALIASES: Record<string, string> = {
  pl: 'pl',
  epl: 'pl',
  premier: 'pl',
  'premier-league': 'pl',
  premier_league: 'pl',
  'english-premier-league': 'pl',
  'eng.1': 'pl',
  ucl: 'ucl',
  'champions-league': 'ucl',
  champions_league: 'ucl',
  'uefa-champions-league': 'ucl',
  'uefa.champions': 'ucl',
  uel: 'uel',
  'europa-league': 'uel',
  europa_league: 'uel',
  'uefa-europa-league': 'uel',
  'uefa.europa': 'uel',
  uecl: 'uecl',
  'conference-league': 'uecl',
  conference_league: 'uecl',
  'uefa-conference-league': 'uecl',
  'uefa.europa.conf': 'uecl',
  laliga: 'laliga',
  'la-liga': 'laliga',
  'laliga-ea-sports': 'laliga',
  'esp.1': 'laliga',
  seriea: 'seriea',
  'serie-a': 'seriea',
  serie_a: 'seriea',
  'serie-a-enilive': 'seriea',
  'ita.1': 'seriea',
  bundesliga: 'bundesliga',
  'ger.1': 'bundesliga',
  ligue1: 'ligue1',
  'ligue-1': 'ligue1',
  ligue_1: 'ligue1',
  'fra.1': 'ligue1',
  nba: 'nba',
  'nba-basketball': 'nba',
  'national-basketball-association': 'nba',
  euroleague: 'euroleague',
  'euroleague-basketball': 'euroleague',
  nhl: 'nhl',
  'nhl-hockey': 'nhl',
  'national-hockey-league': 'nhl',
  nfl: 'nfl',
  'nfl-football': 'nfl',
  'national-football-league': 'nfl',
  f1: 'f1',
  motorsport: 'f1',
  'formula-1': 'f1',
  'formula-1-world-championship': 'f1',
  'liga-mx': 'liga_mx',
  liga_mx: 'liga_mx',
  'mex.1': 'liga_mx',
  'argentina-primera': 'argentina_primera',
  argentina_primera: 'argentina_primera',
  'liga-profesional-argentina': 'argentina_primera',
  'arg.1': 'argentina_primera',
  'afc-champions-league': 'afc_champions_league',
  afc_champions_league: 'afc_champions_league',
  'afc-champions-league-elite': 'afc_champions_league',
  'afc.champions': 'afc_champions_league',
  'ukrainian-premier': 'ukrainian_premier',
  'ukrainian-premier-league': 'ukrainian_premier',
  ukrainian_premier: 'ukrainian_premier',
  'ukr.1': 'ukrainian_premier',
  del: 'del',
  'germany-del': 'del',
  icehl: 'icehl',
  'austrian-ice-hockey-league': 'icehl',
  'hockey-allsvenskan': 'hockey_allsvenskan',
  hockey_allsvenskan: 'hockey_allsvenskan',
  'russia-mhl': 'russia_mhl',
  russia_mhl: 'russia_mhl',
  j1: 'j1_league',
  'j1-league': 'j1_league',
  j1_league: 'j1_league',
  'meiji-yasuda-j1-league': 'j1_league',
  'jpn.1': 'j1_league',
  'saudi-pro': 'saudi_pro',
  'saudi-pro-league': 'saudi_pro',
  saudi_pro: 'saudi_pro',
  'ksa.1': 'saudi_pro',
  'saudi-first': 'saudi_first_division',
  'saudi-first-division': 'saudi_first_division',
  saudi_first_division: 'saudi_first_division',
  'ksa.2': 'saudi_first_division',
  'fifa-u17': 'fifa_u17',
  'fifa-u-17': 'fifa_u17',
  fifa_u17: 'fifa_u17',
  'fifa.world.u17': 'fifa_u17',
  csl: 'csl',
  'chinese-super-league': 'csl',
  'chn.1': 'csl',
  'egyptian-premier': 'egyptian_premier',
  'egyptian-premier-league': 'egyptian_premier',
  egyptian_premier: 'egyptian_premier',
  'egy.1': 'egyptian_premier',
  isl: 'isl',
  'indian-super-league': 'isl',
  'ind.1': 'isl',
  'kenyan-premier': 'kenyan_premier',
  'kenyan-premier-league': 'kenyan_premier',
  kenyan_premier: 'kenyan_premier',
  'ken.1': 'kenyan_premier',
  wc: 'wc',
  'world-cup': 'wc',
  'fifa-world-cup': 'wc',
  world_cup: 'wc',
  tennis: 'tennis',
  cricket: 'cricket',
};

const TEAM_ID_ALIASES: Record<string, string> = {
  'team-fc-barcelona': 'team-barcelona',
  'barcelona': 'team-barcelona',
  'fc-barcelona': 'team-barcelona',
  'team-manchester-city': 'team-man-city',
  'manchester-city': 'team-man-city',
  'man-city': 'team-man-city',
  'team-real-madrid': 'team-real-madrid',
  'real-madrid': 'team-real-madrid',
  'team-arsenal': 'team-arsenal',
  'arsenal': 'team-arsenal',
  'team-liverpool': 'team-liverpool',
  'liverpool': 'team-liverpool',
  'team-los-angeles-lakers': 'team-lakers',
  'los-angeles-lakers': 'team-lakers',
  'team-golden-state-warriors': 'team-warriors',
  'golden-state-warriors': 'team-warriors',
  'team-boston-celtics': 'team-celtics',
  'boston-celtics': 'team-celtics',
  'team-new-york-rangers': 'team-rangers-nhl',
  'new-york-rangers': 'team-rangers-nhl',
  'team-ny-rangers': 'team-rangers-nhl',
};

export function normalizeLeagueId(rawId: string): string {
  const cleaned = (rawId || '')
    .toLowerCase()
    .trim()
    .replace(/^(league-|comp-)/, '');
  if (!cleaned) return '';
  if (LEAGUE_ID_ALIASES[cleaned]) return LEAGUE_ID_ALIASES[cleaned];
  const dashed = cleaned.replace(/[\s_]+/g, '-');
  if (LEAGUE_ID_ALIASES[dashed]) return LEAGUE_ID_ALIASES[dashed];
  return cleaned;
}

export function normalizeTeamId(rawIdOrName: string): string {
  const trimmed = (rawIdOrName || '').toLowerCase().trim();
  if (!trimmed) return '';
  if (TEAM_ID_ALIASES[trimmed]) return TEAM_ID_ALIASES[trimmed];
  const slug = trimmed.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  if (TEAM_ID_ALIASES[slug]) return TEAM_ID_ALIASES[slug];
  if (TEAM_ID_ALIASES[`team-${slug}`]) return TEAM_ID_ALIASES[`team-${slug}`];
  return trimmed;
}

function toCompetitionSnapshot(item: DiscoverCompetition | PopularLeague): DiscoverCompetition {
  const id = normalizeLeagueId(item.id) || item.id;
  if ('accentColor' in item && 'region' in item) {
    return {
      ...item,
      id,
    };
  }
  return {
    id,
    name: item.name,
    shortName: item.name.split(' ')[0] || item.name,
    country: item.country || 'International',
    region: item.country || 'International',
    logoUrl: item.logoUrl,
    accentColor: '#7952FC',
    sport: (item.sport as SportType) || 'soccer',
  };
}

export const DEFAULT_PROFILE: UserProfileData = {
  displayName: 'Football Fan',
  avatarId: 'striker',
  avatarBg: '#7952FC',
  membership: 'BALLIVE Member',
  followedTeamIds: ['team-arsenal', 'team-real-madrid', 'team-man-city'],
  followedLeagueIds: ['pl', 'laliga'],
  followedTeamsMeta: {},
  followedLeaguesMeta: {},
  matchReminderIds: [],
  savedMatchIds: [],
  timeFormat: '12h',
  timeZone: 'Automatic',
  language: 'English',
  notifications: {
    matchKickoffs: true,
    liveGoals: true,
    breakingNews: false,
  },
};

const STORAGE_FILE = `${FileSystem.documentDirectory || ''}ballive_profile_v1.json`;

type Listener = (profile: UserProfileData) => void;

class ProfileStorageService {
  private currentData: UserProfileData = { ...DEFAULT_PROFILE };
  private listeners: Set<Listener> = new Set();
  private isLoaded: boolean = false;

  constructor() {
    this.init();
  }

  private async init() {
    try {
      const fileInfo = await FileSystem.getInfoAsync(STORAGE_FILE);
      if (fileInfo.exists) {
        const raw = await FileSystem.readAsStringAsync(STORAGE_FILE);
        const parsed = JSON.parse(raw);

        const normTeams = Array.from(
          new Set((parsed.followedTeamIds || DEFAULT_PROFILE.followedTeamIds).map(normalizeTeamId).filter(Boolean))
        );
        const normLeagues = Array.from(
          new Set((parsed.followedLeagueIds || DEFAULT_PROFILE.followedLeagueIds).map(normalizeLeagueId).filter(Boolean))
        );

        const teamsMeta: Record<string, PopularTeam> = {};
        if (parsed.followedTeamsMeta && typeof parsed.followedTeamsMeta === 'object') {
          Object.entries(parsed.followedTeamsMeta).forEach(([k, v]) => {
            if (v && typeof v === 'object') {
              const nk = normalizeTeamId(k);
              teamsMeta[nk] = { ...(v as PopularTeam), id: nk };
            }
          });
        }

        const leaguesMeta: Record<string, DiscoverCompetition> = {};
        if (parsed.followedLeaguesMeta && typeof parsed.followedLeaguesMeta === 'object') {
          Object.entries(parsed.followedLeaguesMeta).forEach(([k, v]) => {
            if (v && typeof v === 'object') {
              const nk = normalizeLeagueId(k);
              leaguesMeta[nk] = { ...(v as DiscoverCompetition), id: nk };
            }
          });
        }

        this.currentData = {
          ...DEFAULT_PROFILE,
          ...parsed,
          followedTeamIds: normTeams,
          followedLeagueIds: normLeagues,
          followedTeamsMeta: teamsMeta,
          followedLeaguesMeta: leaguesMeta,
        };
      }
    } catch {
      // Fallback to defaults gracefully
    } finally {
      this.isLoaded = true;
      this.notifyListeners();
    }
  }

  public getProfile(): UserProfileData {
    return {
      ...this.currentData,
      followedTeamsMeta: { ...(this.currentData.followedTeamsMeta || {}) },
      followedLeaguesMeta: { ...(this.currentData.followedLeaguesMeta || {}) },
    };
  }

  public isTeamFollowed(teamOrId: string | PopularTeam): boolean {
    const rawId = typeof teamOrId === 'string' ? teamOrId : teamOrId.id;
    const norm = normalizeTeamId(rawId);
    const ids = this.currentData.followedTeamIds || [];
    if (ids.includes(norm) || ids.includes(rawId)) return true;
    if (typeof teamOrId !== 'string' && teamOrId.name) {
      const nameNorm = normalizeTeamId(`team-${teamOrId.name}`);
      if (ids.includes(nameNorm)) return true;
    }
    return false;
  }

  public isLeagueFollowed(leagueOrId: string | DiscoverCompetition | PopularLeague): boolean {
    const rawId = typeof leagueOrId === 'string' ? leagueOrId : leagueOrId.id;
    const norm = normalizeLeagueId(rawId);
    const ids = this.currentData.followedLeagueIds || [];
    if (ids.includes(norm) || ids.includes(rawId)) return true;
    if (typeof leagueOrId !== 'string' && leagueOrId.name) {
      const nameNorm = normalizeLeagueId(leagueOrId.name);
      if (ids.includes(nameNorm)) return true;
    }
    return false;
  }

  public async updateProfile(partial: Partial<UserProfileData>): Promise<UserProfileData> {
    this.currentData = {
      ...this.currentData,
      ...partial,
      notifications: {
        ...this.currentData.notifications,
        ...(partial.notifications || {}),
      },
    };

    this.notifyListeners();

    try {
      if (FileSystem.documentDirectory) {
        await FileSystem.writeAsStringAsync(
          STORAGE_FILE,
          JSON.stringify(this.currentData)
        );
      }
    } catch {
      // Memory state persists even if filesystem writing fails
    }

    return this.getProfile();
  }

  public async toggleFollowTeam(teamOrId: string | PopularTeam, meta?: PopularTeam): Promise<boolean> {
    const teamObj = typeof teamOrId === 'string' ? meta : teamOrId;
    const rawId = typeof teamOrId === 'string' ? teamOrId : teamOrId.id;
    const normId = normalizeTeamId(rawId);

    const list = Array.from(new Set(this.currentData.followedTeamIds.map(normalizeTeamId).filter(Boolean)));
    const nextMeta = { ...(this.currentData.followedTeamsMeta || {}) };

    // Also check if matched via team name slug alias
    const nameAliasId = teamObj?.name ? normalizeTeamId(`team-${teamObj.name}`) : '';
    let index = list.indexOf(normId);
    if (index < 0 && nameAliasId) {
      index = list.indexOf(nameAliasId);
    }

    let isFollowed = false;
    if (index >= 0) {
      const removedId = list[index];
      list.splice(index, 1);
      delete nextMeta[removedId];
      delete nextMeta[normId];
    } else {
      const storeId = normId || nameAliasId || rawId;
      list.push(storeId);
      if (teamObj) {
        nextMeta[storeId] = { ...teamObj, id: storeId };
      }
      isFollowed = true;
    }

    await this.updateProfile({ followedTeamIds: list, followedTeamsMeta: nextMeta });
    return isFollowed;
  }

  public async toggleFollowLeague(
    leagueOrId: string | DiscoverCompetition | PopularLeague,
    meta?: DiscoverCompetition | PopularLeague
  ): Promise<boolean> {
    const compObj = typeof leagueOrId === 'string' ? meta : leagueOrId;
    const rawId = typeof leagueOrId === 'string' ? leagueOrId : leagueOrId.id;
    const normId = normalizeLeagueId(rawId) || (compObj?.name ? normalizeLeagueId(compObj.name) : rawId);

    const list = Array.from(new Set(this.currentData.followedLeagueIds.map(normalizeLeagueId).filter(Boolean)));
    const nextMeta = { ...(this.currentData.followedLeaguesMeta || {}) };

    const index = list.indexOf(normId);
    let isFollowed = false;

    if (index >= 0) {
      list.splice(index, 1);
      delete nextMeta[normId];
    } else {
      list.push(normId);
      if (compObj) {
        nextMeta[normId] = toCompetitionSnapshot({ ...compObj, id: normId });
      }
      isFollowed = true;
    }

    await this.updateProfile({ followedLeagueIds: list, followedLeaguesMeta: nextMeta });
    return isFollowed;
  }

  public async toggleMatchReminder(matchId: string): Promise<boolean> {
    const list = [...this.currentData.matchReminderIds];
    const index = list.indexOf(matchId);
    let isSet = false;

    if (index >= 0) {
      list.splice(index, 1);
    } else {
      list.push(matchId);
      isSet = true;
    }

    await this.updateProfile({ matchReminderIds: list });
    return isSet;
  }

  public async toggleSaveMatch(matchId: string): Promise<boolean> {
    const list = [...(this.currentData.savedMatchIds || [])];
    const index = list.indexOf(matchId);
    let isSaved = false;

    if (index >= 0) {
      list.splice(index, 1);
    } else {
      list.push(matchId);
      isSaved = true;
    }

    await this.updateProfile({ savedMatchIds: list });
    return isSaved;
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.getProfile());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    const data = this.getProfile();
    this.listeners.forEach(fn => {
      try {
        fn(data);
      } catch {}
    });
  }
}

export const ProfileStorage = new ProfileStorageService();
