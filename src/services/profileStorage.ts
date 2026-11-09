import * as FileSystem from 'expo-file-system';

export interface UserProfileData {
  displayName: string;
  avatarId: string;
  avatarBg: string;
  membership: string;
  followedTeamIds: string[];
  followedLeagueIds: string[];
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

export const DEFAULT_PROFILE: UserProfileData = {
  displayName: 'Football Fan',
  avatarId: 'striker',
  avatarBg: '#7952FC',
  membership: 'BALLIVE Member',
  followedTeamIds: ['team-arsenal', 'team-real-madrid', 'team-man-city'],
  followedLeagueIds: ['league-premier-league', 'league-laliga'],
  matchReminderIds: ['matchup-2'],
  savedMatchIds: ['matchup-1', 'matchup-2'],
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
        this.currentData = { ...DEFAULT_PROFILE, ...parsed };
      }
    } catch {
      // Fallback to defaults gracefully
    } finally {
      this.isLoaded = true;
      this.notifyListeners();
    }
  }

  public getProfile(): UserProfileData {
    return { ...this.currentData };
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

    return { ...this.currentData };
  }

  public async toggleFollowTeam(teamId: string): Promise<boolean> {
    const list = [...this.currentData.followedTeamIds];
    const index = list.indexOf(teamId);
    let isFollowed = false;

    if (index >= 0) {
      list.splice(index, 1);
    } else {
      list.push(teamId);
      isFollowed = true;
    }

    await this.updateProfile({ followedTeamIds: list });
    return isFollowed;
  }

  public async toggleFollowLeague(leagueId: string): Promise<boolean> {
    const list = [...this.currentData.followedLeagueIds];
    const index = list.indexOf(leagueId);
    let isFollowed = false;

    if (index >= 0) {
      list.splice(index, 1);
    } else {
      list.push(leagueId);
      isFollowed = true;
    }

    await this.updateProfile({ followedLeagueIds: list });
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
