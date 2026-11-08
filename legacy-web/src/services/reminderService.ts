/**
 * Service to manage match reminder notifications via Web Notification API & LocalStorage.
 */

export interface MatchReminder {
  matchId: string;
  matchTitle: string;
  kickoffTime: string;
  competitionName: string;
  createdAt: number;
}

const STORAGE_KEY_REMINDERS = 'sport2_match_reminders';

class ReminderService {
  private getRemindersMap(): Record<string, MatchReminder> {
    try {
      const data = localStorage.getItem(STORAGE_KEY_REMINDERS);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  private saveRemindersMap(map: Record<string, MatchReminder>): void {
    try {
      localStorage.setItem(STORAGE_KEY_REMINDERS, JSON.stringify(map));
      window.dispatchEvent(new CustomEvent('sport2_reminders_changed'));
    } catch (e) {
      console.error('Failed to save reminders to localStorage:', e);
    }
  }

  hasReminder(matchId: string): boolean {
    const map = this.getRemindersMap();
    return Boolean(map[matchId]);
  }

  getReminders(): MatchReminder[] {
    const map = this.getRemindersMap();
    return Object.values(map);
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied';
    }
    try {
      return await Notification.requestPermission();
    } catch {
      return 'denied';
    }
  }

  async toggleReminder(
    matchId: string,
    matchTitle: string,
    kickoffTime: string,
    competitionName: string
  ): Promise<{ active: boolean; message: string }> {
    const map = this.getRemindersMap();

    if (map[matchId]) {
      // Remove reminder
      delete map[matchId];
      this.saveRemindersMap(map);
      return { active: false, message: `Reminder removed for ${matchTitle}` };
    }

    // Add reminder
    // Check or request browser notification permission
    let perm: NotificationPermission = 'default';
    if ('Notification' in window) {
      perm = Notification.permission;
      if (perm === 'default') {
        perm = await this.requestPermission();
      }
    }

    map[matchId] = {
      matchId,
      matchTitle,
      kickoffTime,
      competitionName,
      createdAt: Date.now(),
    };
    this.saveRemindersMap(map);

    if (perm === 'granted') {
      try {
        new Notification('SPORT2 Match Reminder Set', {
          body: `You will be notified before kickoff for ${matchTitle} (${competitionName})`,
          icon: '/logo.svg',
        });
      } catch {
        // Fallback for mobile browsers that do not allow immediate synchronous Notification
      }
    }

    return {
      active: true,
      message: `Reminder set! You'll be alerted before kickoff for ${matchTitle}`,
    };
  }
}

export const reminderService = new ReminderService();
