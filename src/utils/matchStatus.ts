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

/**
 * Formats any UTC/ISO date string or timestamp into East Africa Time (EAT, UTC+3).
 * Example: '2026-11-13T16:00:00Z' -> '19:00 EAT' or 'Fri 13 Nov, 19:00 EAT'.
 */
export function formatKickoffEAT(
  dateInput?: string | number | Date | null,
  includeDate = false
): string {
  if (!dateInput) return 'Upcoming';

  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) {
      // If it's already a formatted string like '19:00 EAT' or '7:00 PM', return cleaned
      if (typeof dateInput === 'string') {
        const clean = dateInput.replace(/^(⏱️|🔴|LIVE:|\s)+/g, '').trim();
        return clean.includes('EAT') ? clean : `${clean} EAT`;
      }
      return 'Upcoming';
    }

    // East Africa Time is UTC+3 (Africa/Nairobi, Addis Ababa, Kampala, Dar es Salaam)
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Africa/Nairobi',
    };

    const timeStr = new Intl.DateTimeFormat('en-GB', timeOptions).format(d);

    if (includeDate) {
      const dateOptions: Intl.DateTimeFormatOptions = {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        timeZone: 'Africa/Nairobi',
      };
      const dateStr = new Intl.DateTimeFormat('en-GB', dateOptions).format(d);
      return `${dateStr} • ${timeStr} EAT`;
    }

    return `${timeStr} EAT`;
  } catch {
    return typeof dateInput === 'string' ? dateInput : 'Upcoming';
  }
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
  const detailUpper = `${detail || ''} ${shortDetail || ''}`.toUpperCase().trim();

  // 1. Authoritative Finished / Full Time State
  const isPost =
    state === 'post' ||
    completed === true ||
    rawUpper === 'FT' ||
    rawUpper === 'FINAL' ||
    rawUpper === 'AET' ||
    rawUpper === 'PEN' && detailUpper.includes('FINAL') ||
    detailUpper.includes('FINAL') ||
    detailUpper === 'FT' ||
    detailUpper.includes('FULL TIME') ||
    detailUpper.includes('POSTPONED') ||
    detailUpper.includes('CANCELED') ||
    detailUpper.includes('CANCELLED');

  if (isPost) {
    let displayStatus = 'FULL TIME';
    if (detailUpper.includes('POSTPONED')) displayStatus = 'POSTPONED';
    else if (detailUpper.includes('CANCELED') || detailUpper.includes('CANCELLED')) displayStatus = 'CANCELLED';
    else if (detailUpper.includes('FINAL/OT') || detailUpper.includes('FINAL/2OT')) displayStatus = shortDetail || 'FINAL/OT';

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
  // A match is LIVE ONLY if the authoritative server confirms in-progress state ('in'),
  // or explicit in-play period/minute tags (e.g. 1H, 2H, HT, Q1, Q2, P1, P2) AND not pre-game.
  const isExplicitLive =
    state === 'in' ||
    rawUpper === 'LIVE' ||
    rawUpper === 'IN_PLAY' ||
    rawUpper === 'PAUSED' ||
    /^(1H|2H|HT|ET|Q1|Q2|Q3|Q4|P1|P2|P3|OT)\b/i.test(detailUpper) ||
    /halftime|half-time|\bht\b/i.test(detailUpper);

  // Guard against pre-game or scheduled games tagged erroneously
  const isPreScheduled =
    state === 'pre' ||
    rawUpper === 'UPCOMING' ||
    rawUpper === 'SCHEDULED' ||
    rawUpper === 'NS' ||
    rawUpper === 'NOT_STARTED' ||
    detailUpper.includes('SCHEDULED') ||
    detailUpper.includes('DELAYED');

  if (isExplicitLive && !isPreScheduled) {
    let minute = rawMinute && rawMinute > 0 ? rawMinute : 1;
    let playTime = rawPlayTime;

    if (!playTime) {
      if (/half|ht/i.test(detailUpper)) {
        playTime = 'HT';
        minute = 45;
      } else if (shortDetail && shortDetail.length > 0) {
        playTime = shortDetail;
      } else if (minute > 0) {
        playTime = `${minute}'`;
      } else {
        playTime = 'LIVE';
      }
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

export default {
  formatKickoffEAT,
  normalizeMatchStatus,
};
