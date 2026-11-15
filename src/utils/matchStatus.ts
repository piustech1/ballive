/**
 * BALLIVE Authoritative Match Status & Timezone Normalization
 * 
 * Provides unified, deterministic status classification and East Africa Time (EAT, UTC+3)
 * display formatting across all fixtures, scoreboards, and screens in BALLIVE.
 */

export type MatchStatus = 'UPCOMING' | 'LIVE' | 'FT';

export interface NormalizedStatusInfo {
  status: MatchStatus;
  isLive: boolean;
  isUpcoming: boolean;
  isFinished: boolean;
  minute: number;
  playTime?: string;
  displayStatus: string;
}

export interface MatchScheduleInfo {
  timeEAT: string;
  dateLabel: string;
  fullKickoff: string;
}

/**
 * Safely parses any date input (ISO string, unix epoch ms, seconds, or Date object)
 * into an absolute epoch millisecond timestamp for deterministic sorting.
 * If invalid or absent, returns Number.MAX_SAFE_INTEGER so that undetermined matches
 * sort after known upcoming fixtures rather than displacing the nearest matches.
 */
export function parseKickoffTimestamp(dateInput?: string | number | Date | null): number {
  if (!dateInput && dateInput !== 0) return Number.MAX_SAFE_INTEGER;

  if (typeof dateInput === 'number') {
    if (isNaN(dateInput) || dateInput <= 0) return Number.MAX_SAFE_INTEGER;
    // Handle seconds timestamp (< 1e11) vs milliseconds timestamp
    return dateInput < 1e11 ? dateInput * 1000 : dateInput;
  }

  if (dateInput instanceof Date) {
    const t = dateInput.getTime();
    return isNaN(t) ? Number.MAX_SAFE_INTEGER : t;
  }

  if (typeof dateInput === 'string') {
    const trimmed = dateInput.trim();
    if (!trimmed) return Number.MAX_SAFE_INTEGER;

    // Direct ISO / standard parse
    const directParse = Date.parse(trimmed);
    if (!isNaN(directParse)) return directParse;

    // Check if numeric string
    if (/^\d{9,13}$/.test(trimmed)) {
      const num = parseInt(trimmed, 10);
      return num < 1e11 ? num * 1000 : num;
    }

    // Try parsing ISO without Z or with space
    const normalizedIso = trimmed.replace(' ', 'T');
    const isoParse = Date.parse(normalizedIso);
    if (!isNaN(isoParse)) return isoParse;
  }

  return Number.MAX_SAFE_INTEGER;
}

/**
 * Returns contextual, human-readable date & time representations strictly in
 * East Africa Time (EAT, UTC+3, Africa/Nairobi).
 * Examples:
 * - Today: "Today · 15:00 EAT"
 * - Tomorrow: "Tomorrow · 18:30 EAT"
 * - Within a week: "Sat, 22 Nov · 20:30 EAT"
 * - Beyond: "22 Nov · 20:30 EAT"
 */
export function formatMatchSchedule(dateInput?: string | number | Date | null): MatchScheduleInfo {
  if (!dateInput && dateInput !== 0) {
    return { timeEAT: 'Upcoming', dateLabel: 'Upcoming', fullKickoff: 'Upcoming' };
  }

  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) {
      if (typeof dateInput === 'string') {
        const clean = dateInput.replace(/^(⏱️|🔴|LIVE:|\s)+/g, '').trim();
        const display = clean.includes('EAT') ? clean : `${clean} EAT`;
        return { timeEAT: display, dateLabel: 'Upcoming', fullKickoff: display };
      }
      return { timeEAT: 'Upcoming', dateLabel: 'Upcoming', fullKickoff: 'Upcoming' };
    }

    // Format time in Africa/Nairobi (UTC+3)
    const timeFormatter = new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Africa/Nairobi',
    });
    const timeStr = `${timeFormatter.format(d)} EAT`;

    // Calculate relative day boundary in Africa/Nairobi
    const now = new Date();
    const dateFormatter = new Intl.DateTimeFormat('en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: 'Africa/Nairobi',
    });

    const matchParts = dateFormatter.formatToParts(d);
    const nowParts = dateFormatter.formatToParts(now);

    const getPart = (parts: Intl.DateTimeFormatPart[], type: string) =>
      parseInt(parts.find(p => p.type === type)?.value || '0', 10);

    const matchY = getPart(matchParts, 'year');
    const matchM = getPart(matchParts, 'month');
    const matchD = getPart(matchParts, 'day');

    const nowY = getPart(nowParts, 'year');
    const nowM = getPart(nowParts, 'month');
    const nowD = getPart(nowParts, 'day');

    // Canonical midnight timestamps in UTC for calendar day diff
    const matchMidnight = Date.UTC(matchY, matchM - 1, matchD);
    const nowMidnight = Date.UTC(nowY, nowM - 1, nowD);
    const dayDiff = Math.round((matchMidnight - nowMidnight) / (24 * 60 * 60 * 1000));

    let dateLabel = '';
    if (dayDiff === 0) {
      dateLabel = 'Today';
    } else if (dayDiff === 1) {
      dateLabel = 'Tomorrow';
    } else if (dayDiff > 1 && dayDiff < 7) {
      const weekdayFormat = new Intl.DateTimeFormat('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        timeZone: 'Africa/Nairobi',
      });
      dateLabel = weekdayFormat.format(d); // e.g. "Sat, 22 Nov"
    } else {
      const standardFormat = new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'short',
        timeZone: 'Africa/Nairobi',
      });
      dateLabel = standardFormat.format(d); // e.g. "22 Nov"
    }

    const fullKickoff = `${dateLabel} · ${timeStr}`;

    return { timeEAT: timeStr, dateLabel, fullKickoff };
  } catch {
    const fallback = typeof dateInput === 'string' ? dateInput : 'Upcoming';
    return { timeEAT: fallback, dateLabel: 'Upcoming', fullKickoff: fallback };
  }
}

/**
 * Formats any UTC/ISO date string or timestamp into East Africa Time (EAT, UTC+3).
 * Example: '2026-11-13T16:00:00Z' -> '19:00 EAT' or 'Fri 13 Nov, 19:00 EAT'.
 */
export function formatKickoffEAT(
  dateInput?: string | number | Date | null,
  includeDate = false
): string {
  if (!dateInput) return 'Upcoming';
  const sched = formatMatchSchedule(dateInput);
  if (includeDate) {
    return sched.fullKickoff;
  }
  return sched.timeEAT;
}

/**
 * Authoritatively resolves match status from server fields.
 * Strictly prevents upcoming or completed fixtures from being mislabeled as LIVE.
 */
export function normalizeMatchStatus(options: {
  rawStatus?: string | null;
  state?: string | null; // ESPN state: 'in' | 'pre' | 'post'
  shortDetail?: string | null;
  detail?: string | null;
  completed?: boolean;
  minute?: number;
  playTime?: string;
  kickoffDate?: string;
  sport?: string;
}): NormalizedStatusInfo {
  const {
    rawStatus,
    state,
    shortDetail,
    detail,
    completed,
    minute: rawMinute,
    playTime: rawPlayTime,
    sport,
  } = options;

  const rawUpper = (rawStatus || '').toUpperCase().trim();
  const detailCombined = `${detail || ''} ${shortDetail || ''} ${rawPlayTime || ''}`.toUpperCase().trim();

  // 1. Authoritative Finished / Full Time State
  // Strictly requires authoritative server post-state or explicit completed indicators.
  // Never triggered solely by minute === 90 since stoppage time (90'+1', 90'+3') is actively in-play.
  const isPost =
    state === 'post' ||
    completed === true ||
    rawUpper === 'FT' ||
    rawUpper === 'FINAL' ||
    rawUpper === 'STATUS_FULL_TIME' ||
    rawUpper === 'AET' ||
    (rawUpper === 'PEN' && detailCombined.includes('FINAL')) ||
    (detailCombined.includes('FINAL') && !detailCombined.includes('QUARTER') && !detailCombined.includes('Q')) ||
    detailCombined === 'FT' ||
    detailCombined.includes('FULL TIME') ||
    detailCombined.includes('POSTPONED') ||
    detailCombined.includes('CANCELED') ||
    detailCombined.includes('CANCELLED');

  if (isPost) {
    let displayStatus = 'FULL TIME';
    if (detailCombined.includes('POSTPONED')) displayStatus = 'POSTPONED';
    else if (detailCombined.includes('CANCELED') || detailCombined.includes('CANCELLED')) displayStatus = 'CANCELLED';
    else if (detailCombined.includes('FINAL/OT') || detailCombined.includes('FINAL/2OT')) displayStatus = shortDetail || 'FINAL/OT';

    return {
      status: 'FT',
      isLive: false,
      isUpcoming: false,
      isFinished: true,
      minute: 90,
      playTime: 'FT',
      displayStatus,
    };
  }

  // 2. Authoritative Live State
  // A match is LIVE if the authoritative server confirms in-progress state ('in'),
  // or explicit in-play status/period/minute tags (e.g. 1H, 2H, HT, Halftime, STATUS_IN_PROGRESS, Q1, Q2, P1, P2),
  // or active minute > 0.
  const isExplicitLive =
    state === 'in' ||
    rawUpper === 'LIVE' ||
    rawUpper === 'IN_PLAY' ||
    rawUpper === 'PAUSED' ||
    rawUpper === 'HT' ||
    rawUpper === 'HALFTIME' ||
    rawUpper === 'STATUS_HALFTIME' ||
    rawUpper === 'STATUS_FIRST_HALF' ||
    rawUpper === 'STATUS_SECOND_HALF' ||
    rawUpper === 'STATUS_IN_PROGRESS' ||
    (rawUpper.startsWith('STATUS_') && !rawUpper.includes('SCHEDULED') && !rawUpper.includes('FINAL') && !rawUpper.includes('POST') && !rawUpper.includes('FULL')) ||
    /^(1H|2H|HT|ET|Q1|Q2|Q3|Q4|P1|P2|P3|OT)\b/i.test(detailCombined) ||
    /halftime|half-time|\bht\b/i.test(detailCombined) ||
    (rawMinute !== undefined && rawMinute > 0);

  // Guard against pre-game or scheduled games tagged erroneously
  // Overridden if the match is actively confirmed in-play by state ('in'), minute > 0, or explicit live periods.
  const isPreScheduled =
    (state === 'pre' ||
      rawUpper === 'UPCOMING' ||
      rawUpper === 'SCHEDULED' ||
      rawUpper === 'NS' ||
      rawUpper === 'NOT_STARTED' ||
      detailCombined.includes('SCHEDULED') ||
      detailCombined.includes('DELAYED')) &&
    state !== 'in' &&
    !(rawMinute !== undefined && rawMinute > 0) &&
    !/^(1H|2H|HT|ET|Q1|Q2|Q3|Q4|P1|P2|P3|OT)\b/i.test(detailCombined) &&
    !/halftime|half-time|\bht\b/i.test(detailCombined) &&
    rawUpper !== 'STATUS_HALFTIME' &&
    rawUpper !== 'STATUS_FIRST_HALF' &&
    rawUpper !== 'STATUS_SECOND_HALF' &&
    rawUpper !== 'STATUS_IN_PROGRESS';

  if (isExplicitLive && !isPreScheduled) {
    let minute = rawMinute && rawMinute > 0 ? rawMinute : 1;
    let playTime = rawPlayTime;

    if (!playTime) {
      if (/half|ht/i.test(detailCombined) || rawUpper === 'HT' || rawUpper === 'HALFTIME' || rawUpper === 'STATUS_HALFTIME') {
        playTime = 'HT';
        minute = 45;
      } else if (shortDetail && shortDetail.length > 0) {
        playTime = shortDetail;
      } else if (minute > 0) {
        playTime = `${minute}'`;
      } else {
        playTime = 'LIVE';
      }
    } else if (/half|ht/i.test(playTime) || rawUpper === 'HT' || rawUpper === 'HALFTIME' || rawUpper === 'STATUS_HALFTIME') {
      playTime = 'HT';
      minute = 45;
    }

    return {
      status: 'LIVE',
      isLive: true,
      isUpcoming: false,
      isFinished: false,
      minute,
      playTime,
      displayStatus: playTime.includes('LIVE') ? playTime : `${playTime} LIVE`,
    };
  }

  // 3. Default to UPCOMING for not-started or scheduled games
  return {
    status: 'UPCOMING',
    isLive: false,
    isUpcoming: true,
    isFinished: false,
    minute: 0,
    playTime: undefined,
    displayStatus: 'UPCOMING',
  };
}

/**
 * Orders upcoming fixtures strictly by kickoff timestamp ascending (nearest first:
 * Today 15:00 -> Tomorrow 18:30 -> In 3 days -> In 7 days).
 * Stable secondary sorting by title/id when timestamps are equal.
 */
export function sortUpcomingChronologically<T extends {
  kickoffTimestamp?: number;
  rawDate?: string;
  kickoffTime?: string;
  time?: string;
  id?: string;
  title?: string;
}>(matches: T[]): T[] {
  return [...matches].sort((a, b) => {
    const tsA = a.kickoffTimestamp !== undefined && a.kickoffTimestamp !== null && a.kickoffTimestamp > 0
      ? a.kickoffTimestamp
      : parseKickoffTimestamp(a.rawDate || a.kickoffTime || a.time);

    const tsB = b.kickoffTimestamp !== undefined && b.kickoffTimestamp !== null && b.kickoffTimestamp > 0
      ? b.kickoffTimestamp
      : parseKickoffTimestamp(b.rawDate || b.kickoffTime || b.time);

    if (tsA !== tsB) {
      return tsA - tsB;
    }

    const nameA = (a.title || a.id || '').toLowerCase();
    const nameB = (b.title || b.id || '').toLowerCase();
    return nameA.localeCompare(nameB);
  });
}

/**
 * Universal match sorter ensuring:
 * 1. Live in-play matches appear at the top
 * 2. Upcoming matches are strictly ordered chronologically (nearest kickoff first)
 * 3. Finished / Full-Time matches appear at the bottom
 */
export function sortMatchesWithLiveFirst<T extends {
  status?: string;
  isLive?: boolean;
  minute?: number;
  kickoffTimestamp?: number;
  rawDate?: string;
  kickoffTime?: string;
  time?: string;
  id?: string;
  title?: string;
}>(matches: T[]): T[] {
  const liveMatches: T[] = [];
  const upcomingMatches: T[] = [];
  const finishedMatches: T[] = [];

  matches.forEach(m => {
    const isLive = m.status === 'LIVE' || Boolean(m.isLive) || (m.minute !== undefined && m.minute > 0 && m.minute < 90);
    const isFinished = m.status === 'FT' || (m.minute !== undefined && m.minute >= 90);

    if (isLive) {
      liveMatches.push(m);
    } else if (isFinished) {
      finishedMatches.push(m);
    } else {
      upcomingMatches.push(m);
    }
  });

  // Sort upcoming chronologically ascending (nearest kickoff first)
  const sortedUpcoming = sortUpcomingChronologically(upcomingMatches);

  return [...liveMatches, ...sortedUpcoming, ...finishedMatches];
}

export default {
  parseKickoffTimestamp,
  formatMatchSchedule,
  formatKickoffEAT,
  normalizeMatchStatus,
  sortUpcomingChronologically,
  sortMatchesWithLiveFirst,
};
