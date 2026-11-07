/**
 * Date and time helper utilities for local timezone presentation and date selector navigation.
 */

export function formatKickoffTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat(undefined, {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  } catch {
    return 'TBD';
  }
}

export function formatShortDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat(undefined, {
      day: 'numeric',
      month: 'short',
    }).format(date);
  } catch {
    return '';
  }
}

export function formatDayOfWeek(date: Date): string {
  return new Intl.DateTimeFormat(undefined, { weekday: 'short' }).format(date);
}

export function getRelativeDateLabel(date: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const compareDate = new Date(date);
  compareDate.setHours(0, 0, 0, 0);

  const diffTime = compareDate.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays === 1) return 'Tomorrow';

  return formatDayOfWeek(date);
}

export function generateDateStrip(centerDate: Date = new Date(), pastDays = 2, futureDays = 5) {
  const dates = [];
  for (let i = -pastDays; i <= futureDays; i++) {
    const d = new Date(centerDate);
    d.setDate(d.getDate() + i);
    dates.push({
      date: d,
      iso: d.toISOString().split('T')[0],
      dayName: getRelativeDateLabel(d),
      dayNumber: d.getDate(),
      monthName: new Intl.DateTimeFormat(undefined, { month: 'short' }).format(d),
      isToday: i === 0,
    });
  }
  return dates;
}
