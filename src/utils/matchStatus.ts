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

/**
 * Builds a canonical event identity string across diverse provider formats
 * (ESPN, Football-Data, DAG Sports, etc.).
 */
export function getCanonicalEventId(options: {
  id?: string;
  sport?: string;
  competition?: string;
  homeTeam?: string;
  awayTeam?: string;
  kickoffTimestamp?: number;
  rawDate?: string;
  kickoffDate?: string;
}): string {
  const {
    id,
    sport = 'soccer',
    homeTeam = '',
    awayTeam = '',
    kickoffTimestamp,
    rawDate,
    kickoffDate,
  } = options;

  const clean = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9]/g, ' ')
      .replace(/\b(fc|cf|sc|afc|club|united|city|women|ladies|men)\b/g, '')
      .trim();

  const cleanH = clean(homeTeam);
  const cleanA = clean(awayTeam);

  // Normalize date down to calendar day YYYY-MM-DD
  let dateKey = 'upcoming';
  if (kickoffTimestamp && kickoffTimestamp < Number.MAX_SAFE_INTEGER) {
    const d = new Date(kickoffTimestamp);
    if (!isNaN(d.getTime())) {
      dateKey = d.toISOString().split('T')[0];
    }
  } else if (rawDate) {
    const d = new Date(rawDate);
    if (!isNaN(d.getTime())) {
      dateKey = d.toISOString().split('T')[0];
    } else {
      dateKey = rawDate.replace(/\s+/g, '_');
    }
  } else if (kickoffDate) {
    dateKey = kickoffDate.replace(/\s+/g, '_');
  }

  // Canonical pair representation: sort team keys so reverse pairings and cross-provider entries match
  if (cleanH && cleanA) {
    const pairKey = [cleanH, cleanA].sort().join('_vs_');
    return `${sport}_${pairKey}_${dateKey}`;
  }

  // Fallback to provider id if teams are not available
  const cleanProviderId = (id || 'unknown').replace(/^(sched-espn-|espn-|sched-fd-|fd-)/, '');
  return `${sport}_${cleanProviderId}_${dateKey}`;
}

/**
 * Checks whether two match objects represent the exact same real-world fixture.
 */
export function isSameFixture(
  matchA: {
    id?: string;
    homeTeam?: any;
    awayTeam?: any;
    kickoffTimestamp?: number;
    rawDate?: string;
  },
  matchB: {
    id?: string;
    homeTeam?: any;
    awayTeam?: any;
    kickoffTimestamp?: number;
    rawDate?: string;
  }
): boolean {
  if (!matchA || !matchB) return false;
  if (matchA.id && matchB.id && matchA.id === matchB.id) return true;

  const hA = typeof matchA.homeTeam === 'string' ? matchA.homeTeam : matchA.homeTeam?.name || '';
  const aA = typeof matchA.awayTeam === 'string' ? matchA.awayTeam : matchA.awayTeam?.name || '';
  const hB = typeof matchB.homeTeam === 'string' ? matchB.homeTeam : matchB.homeTeam?.name || '';
  const aB = typeof matchB.awayTeam === 'string' ? matchB.awayTeam : matchB.awayTeam?.name || '';

  const clean = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9]/g, ' ')
      .replace(/\b(fc|cf|sc|afc|club|united|city|women|ladies|men)\b/g, '')
      .trim();

  const chA = clean(hA);
  const caA = clean(aA);
  const chB = clean(hB);
  const caB = clean(aB);

  if (!chA || !caA || !chB || !caB) return false;

  const directMatch = chA === chB && caA === caB;
  const reverseMatch = chA === caB && caA === chB;

  if (!directMatch && !reverseMatch) return false;

  // If both have timestamps, verify they are within 18 hours of each other
  if (matchA.kickoffTimestamp && matchB.kickoffTimestamp) {
    const diffHours = Math.abs(matchA.kickoffTimestamp - matchB.kickoffTimestamp) / (1000 * 60 * 60);
    return diffHours < 18;
  }

  return true;
}

/**
 * Deduplicates fixture collections by canonical event identity and unique IDs.
 */
export function deduplicateMatchups<T extends {
  id?: string;
  sport?: string;
  competition?: string;
  homeTeam?: string | { name?: string; id?: string };
  awayTeam?: string | { name?: string; id?: string };
  kickoffTimestamp?: number;
  rawDate?: string;
  kickoffDate?: string;
  time?: string;
}>(matchups: T[]): T[] {
  if (!Array.isArray(matchups)) return [];
  const seenCanonical = new Set<string>();
  const seenIds = new Set<string>();
  const result: T[] = [];

  for (const m of matchups) {
    if (!m) continue;
    const homeName = typeof m.homeTeam === 'string' ? m.homeTeam : m.homeTeam?.name || '';
    const awayName = typeof m.awayTeam === 'string' ? m.awayTeam : m.awayTeam?.name || '';

    // If both teams are missing, skip
    if (!homeName && !awayName) continue;

    const canonicalKey = getCanonicalEventId({
      id: m.id,
      sport: m.sport,
      competition: m.competition,
      homeTeam: homeName,
      awayTeam: awayName,
      kickoffTimestamp: m.kickoffTimestamp,
      rawDate: m.rawDate,
      kickoffDate: m.kickoffDate || m.time,
    });

    if (m.id && seenIds.has(m.id)) continue;
    if (seenCanonical.has(canonicalKey)) continue;

    if (m.id) seenIds.add(m.id);
    seenCanonical.add(canonicalKey);
    result.push(m);
  }

  return result;
}

export default {
  parseKickoffTimestamp,
  formatMatchSchedule,
  formatKickoffEAT,
  normalizeMatchStatus,
  sortUpcomingChronologically,
  sortMatchesWithLiveFirst,
  getCanonicalEventId,
  isSameFixture,
  deduplicateMatchups,
};
