import { useState, useEffect } from 'react';
import { reminderService, MatchReminder } from '../services/reminderService';

export function useReminders() {
  const [reminders, setReminders] = useState<MatchReminder[]>(() =>
    reminderService.getReminders()
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleRemindersChange = () => {
      setReminders(reminderService.getReminders());
    };

    window.addEventListener('sport2_reminders_changed', handleRemindersChange);
    return () => {
      window.removeEventListener('sport2_reminders_changed', handleRemindersChange);
    };
  }, []);

  const hasReminder = (matchId: string) => {
    return reminders.some(r => r.matchId === matchId);
  };

  const toggleReminder = async (
    matchId: string,
    matchTitle: string,
    kickoffTime: string,
    competitionName: string
  ) => {
    const result = await reminderService.toggleReminder(
      matchId,
      matchTitle,
      kickoffTime,
      competitionName
    );
    setToastMessage(result.message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
    return result.active;
  };

  return {
    reminders,
    hasReminder,
    toggleReminder,
    toastMessage,
  };
}
