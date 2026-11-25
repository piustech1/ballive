/**
 * BALLIVE Team & Competition Extended Hero Photography Resolver
 *
 * Maps canonical team IDs and competition IDs to verified, open-license local landscape
 * photographs, and resolves + persistently caches dynamic club/stadium/competition photos
 * for other entities supported by BALLIVE.
 *
 * Strict Integrity Rules:
 * - Zero generic stadium stock photos.
 * - Zero cross-club mismatches.
 * - Returns null cleanly when no photo can be verified so the UI renders
 *   BALLIVE's dark hero surface (#1E1730) rather than wrong imagery.
 */

import { ImageSourcePropType } from 'react-native';
import { normalizeTeamId, normalizeLeagueId } from '../services/profileStorage';
import { competitionResolverService } from '../services/competitionResolverService';
import { imageCacheService, normalizeImageUrl } from '../services/imageCacheService';

export const LOCAL_TEAM_HEROES: Record<string, ImageSourcePropType> = {
  'team-barcelona': require('../../assets/images/heroes/teams/barcelona.jpg'),
  'team-real-madrid': require('../../assets/images/heroes/teams/real_madrid.jpg'),
  'team-liverpool': require('../../assets/images/heroes/teams/liverpool.jpg'),
  'team-man-city': require('../../assets/images/heroes/teams/man_city.jpg'),
  'team-arsenal': require('../../assets/images/heroes/teams/arsenal.jpg'),
  'team-chelsea': require('../../assets/images/heroes/teams/chelsea.jpg'),
  'team-man-utd': require('../../assets/images/heroes/teams/man_utd.jpg'),
  'team-tottenham': require('../../assets/images/heroes/teams/tottenham.jpg'),
  'team-bayern': require('../../assets/images/heroes/teams/bayern.jpg'),
  'team-dortmund': require('../../assets/images/heroes/teams/dortmund.jpg'),
  'team-psg': require('../../assets/images/heroes/teams/psg.jpg'),
  'team-inter': require('../../assets/images/heroes/teams/inter.jpg'),
  'team-milan': require('../../assets/images/heroes/teams/milan.jpg'),
  'team-juventus': require('../../assets/images/heroes/teams/juventus.jpg'),
  'team-atletico-madrid': require('../../assets/images/heroes/teams/atletico_madrid.jpg'),
  'team-porto': require('../../assets/images/heroes/teams/porto.jpg'),
  'team-braga': require('../../assets/images/heroes/teams/braga.jpg'),
  'team-benfica': require('../../assets/images/heroes/teams/benfica.jpg'),
  'team-sporting-cp': require('../../assets/images/heroes/teams/sporting_cp.jpg'),
  'team-al-nassr': require('../../assets/images/heroes/teams/al_nassr.jpg'),
  'team-lakers': require('../../assets/images/heroes/teams/lakers.jpg'),
  'team-warriors': require('../../assets/images/heroes/teams/warriors.jpg'),
  'team-celtics': require('../../assets/images/heroes/teams/celtics.jpg'),
  'team-rangers-nhl': require('../../assets/images/heroes/teams/ny_rangers.jpg'),
};

export const LOCAL_COMPETITION_HEROES: Record<string, ImageSourcePropType> = {
  ucl: require('../../assets/images/heroes/competitions/ucl.jpg'),
  uel: require('../../assets/images/heroes/competitions/uel.jpg'),
  uecl: require('../../assets/images/heroes/competitions/uecl.jpg'),
  pl: require('../../assets/images/heroes/competitions/pl.jpg'),
  laliga: require('../../assets/images/heroes/competitions/laliga.jpg'),
  bundesliga: require('../../assets/images/heroes/competitions/bundesliga.jpg'),
  seriea: require('../../assets/images/heroes/competitions/seriea.jpg'),
  ligue1: require('../../assets/images/heroes/competitions/ligue1.jpg'),
  nba: require('../../assets/images/heroes/competitions/nba.jpg'),
  nhl: require('../../assets/images/heroes/competitions/nhl.jpg'),
  nfl: require('../../assets/images/heroes/competitions/nfl.jpg'),
  f1: require('../../assets/images/heroes/competitions/f1.jpg'),
  euroleague: require('../../assets/images/heroes/competitions/euroleague.jpg'),
  liga_mx: require('../../assets/images/heroes/competitions/liga_mx.jpg'),
  argentina_primera: require('../../assets/images/heroes/competitions/argentina_primera.jpg'),
  afc_champions_league: require('../../assets/images/heroes/competitions/afc_champions_league.jpg'),
  saudi_pro: require('../../assets/images/heroes/competitions/saudi_pro.jpg'),
  mls: require('../../assets/images/heroes/competitions/mls.jpg'),
};

const dynamicLookupCache = new Map<string, string | null>();
const inFlightHeroLookups = new Map<string, Promise<string | null>>();

function getCanonicalTeamHeroKey(teamId?: string, teamName?: string): string {
  if (teamId) {
    const norm = normalizeTeamId(teamId);
    if (LOCAL_TEAM_HEROES[norm]) return norm;
  }
  if (teamName) {
    const byName = normalizeTeamId(teamName);
    if (LOCAL_TEAM_HEROES[byName]) return byName;
  }
  return normalizeTeamId(teamName || teamId || '');
}

function getCanonicalCompHeroKey(compId?: string, compName?: string, sport?: string): string {
  if (compId) {
    const norm = normalizeLeagueId(compId);
    if (LOCAL_COMPETITION_HEROES[norm]) return norm;
  }
  const resolved = competitionResolverService.resolveCompetition({
    rawId: compId,
    competition: compName || compId,
    sport,
  });
  if (resolved.isIdentified) {
    const normResolved = normalizeLeagueId(resolved.id);
    if (LOCAL_COMPETITION_HEROES[normResolved]) return normResolved;
    if (LOCAL_COMPETITION_HEROES[resolved.id]) return resolved.id;
  }
  if (compName) {
    const byName = normalizeLeagueId(compName);
    if (LOCAL_COMPETITION_HEROES[byName]) return byName;
  }
  return normalizeLeagueId(compId || compName || '');
}

/**
 * Resolves a bundled local hero photograph synchronously for mapped flagship clubs.
 */
export function getLocalTeamHero(teamId?: string, teamName?: string): ImageSourcePropType | null {
  const key = getCanonicalTeamHeroKey(teamId, teamName);
  return (key && LOCAL_TEAM_HEROES[key]) || null;
}

/**
 * Resolves a bundled local hero photograph synchronously for major competitions.
 */
export function getLocalCompetitionHero(
  compId?: string,
  compName?: string,
  sport?: string
): ImageSourcePropType | null {
  const key = getCanonicalCompHeroKey(compId, compName, sport);
  return (key && LOCAL_COMPETITION_HEROES[key]) || null;
}

async function queryWikimediaHeroUrl(query: string): Promise<string | null> {
  if (!query || query.trim().length < 4) return null;
  try {
    const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(
      query
    )}&gsrnamespace=6&gsrlimit=6&prop=imageinfo&iiprop=url|size|mime|extmetadata&iiurlwidth=1000&format=json`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'BALLIVE-Mobile/2.8 (contact@piustech.com)' },
    });
    if (!res.ok) return null;
    const json = await res.json();
    const pages = Object.values((json as any)?.query?.pages || {}) as any[];
    const match = pages
      .map(p => {
        const info = p?.imageinfo?.[0] || {};
        return {
          title: p?.title || '',
          w: info.width || 0,
          h: info.height || 0,
          mime: info.mime || '',
          lic: info.extmetadata?.LicenseShortName?.value || '',
          url: info.thumburl || info.url || '',
        };
      })
      .find(
        x =>
          x.w >= 800 &&
          x.h > 0 &&
          x.w / x.h >= 1.25 &&
          x.w / x.h <= 2.5 &&
          (x.mime === 'image/jpeg' || x.mime === 'image/png') &&
          x.lic &&
          !/fair use|non-free|copyrighted/i.test(x.lic) &&
          !/logo|crest|map|diagram|flag|icon|shirt|kit|jersey|metro|station|ticket|subway/i.test(x.title)
      );

    return match ? normalizeImageUrl(match.url) : null;
  } catch {
    return null;
  }
}

async function queryTheSportsDbStadiumOrTeamHero(
  teamName: string,
  sport?: string
): Promise<string | null> {
  if (!teamName || teamName.trim().length < 3) return null;
  try {
    const res = await fetch(
      `https://www.thesportsdb.com/api/v1/json/123/searchteams.php?t=${encodeURIComponent(teamName)}`
    );
    if (!res.ok) return null;
    const json = await res.json();
    const teams: any[] = json?.teams || [];
    const wantWomen = /women|femeni|femenino|wfc/i.test(teamName);
    const targetClean = teamName.toLowerCase().replace(/\b(fc|cf|sc|afc|ac|the)\b/g, '').trim();

    const matched = teams.find(t => {
      const tName = (t?.strTeam || '').toLowerCase();
      const isWomen = /women|femeni|femenino|\bw\b/i.test(tName);
      if (isWomen !== wantWomen) return false;
      const tSport = (t?.strSport || '').toLowerCase();
      if (sport) {
        const mapped = sport === 'soccer' ? 'soccer' : sport === 'american_football' ? 'american football' : sport;
        if (tSport && tSport !== mapped) return false;
      }
      const cleaned = tName.replace(/\b(fc|cf|sc|afc|ac|the)\b/g, '').trim();
      return cleaned === targetClean || cleaned.includes(targetClean) || targetClean.includes(cleaned);
    });

    if (!matched) return null;
    // Prefer real stadium photography first (`strStadiumThumb`) before fanart
    const candidate = normalizeImageUrl(matched.strStadiumThumb) || normalizeImageUrl(matched.strFanart1);
    return candidate;
  } catch {
    return null;
  }
}

/**
 * Resolves and persistently caches a context-aware hero image for ANY team:
 * 1. Bundled local verified hero asset (sync offline 0ms)
 * 2. Persisted disk-cached dynamic stadium/club photo
 * 3. Verified Wikimedia stadium photo / TheSportsDB stadium photo (cached for subsequent visits)
 * 4. Returns null cleanly if unverified (renders native BALLIVE dark curved hero)
 */
export async function resolveTeamHeroSource(params: {
  teamId?: string;
  teamName?: string;
  stadium?: string;
  sport?: string;
}): Promise<ImageSourcePropType | null> {
  const local = getLocalTeamHero(params.teamId, params.teamName);
  if (local) return local;

  const canonKey = getCanonicalTeamHeroKey(params.teamId, params.teamName);
  if (!canonKey) return null;
  const entityKey = `hero:team:${canonKey}`;

  // Check hydrated cache synchronously
  const cachedDisk = imageCacheService.getImmediateCachedUri('hero', [], entityKey);
  if (cachedDisk) {
    return { uri: cachedDisk };
  }

  if (dynamicLookupCache.has(entityKey)) {
    const cached = dynamicLookupCache.get(entityKey);
    return cached ? { uri: cached } : null;
  }

  if (inFlightHeroLookups.has(entityKey)) {
    const pending = await inFlightHeroLookups.get(entityKey)!;
    return pending ? { uri: pending } : null;
  }

  const lookupPromise = (async (): Promise<string | null> => {
    try {
      await imageCacheService.init();
      const postInitDisk = imageCacheService.getImmediateCachedUri('hero', [], entityKey);
      if (postInitDisk) {
        dynamicLookupCache.set(entityKey, postInitDisk);
        return postInitDisk;
      }

      const candidates: string[] = [];
      const venue = params.stadium?.trim();
      const venueLower = (venue || '').toLowerCase();
      if (
        venue &&
        venue.length >= 5 &&
        !['tbd', 'tba', 'unknown', 'stadium', 'arena'].includes(venueLower) &&
        !venueLower.startsWith((params.teamName || '').toLowerCase().slice(0, 5))
      ) {
        const wikiVenue = await queryWikimediaHeroUrl(`${venue} stadium`);
        if (wikiVenue) candidates.push(wikiVenue);
      }

      if (params.teamName && candidates.length === 0) {
        const tsdb = await queryTheSportsDbStadiumOrTeamHero(params.teamName, params.sport);
        if (tsdb) candidates.push(tsdb);
      }

      if (candidates.length === 0 && params.teamName) {
        const wikiClub = await queryWikimediaHeroUrl(`${params.teamName} stadium match`);
        if (wikiClub) candidates.push(wikiClub);
      }

      if (candidates.length === 0) {
        dynamicLookupCache.set(entityKey, null);
        return null;
      }

      const cachedLocal = await imageCacheService.resolveImage({
        entityKey,
        category: 'hero',
        candidates,
        priority: 0,
      });

      dynamicLookupCache.set(entityKey, cachedLocal || null);
      return cachedLocal || null;
    } catch {
      return null;
    } finally {
      inFlightHeroLookups.delete(entityKey);
    }
  })();

  inFlightHeroLookups.set(entityKey, lookupPromise);
  const resolved = await lookupPromise;
  return resolved ? { uri: resolved } : null;
}

/**
 * Resolves and persistently caches a context-aware hero image for ANY competition.
 */
export async function resolveCompetitionHeroSource(params: {
  competitionId?: string;
  competitionName?: string;
  sport?: string;
}): Promise<ImageSourcePropType | null> {
  const local = getLocalCompetitionHero(params.competitionId, params.competitionName, params.sport);
  if (local) return local;

  const canonKey = getCanonicalCompHeroKey(params.competitionId, params.competitionName, params.sport);
  if (!canonKey) return null;
  const entityKey = `hero:comp:${canonKey}`;

  const cachedDisk = imageCacheService.getImmediateCachedUri('hero', [], entityKey);
  if (cachedDisk) {
    return { uri: cachedDisk };
  }

  if (dynamicLookupCache.has(entityKey)) {
    const cached = dynamicLookupCache.get(entityKey);
    return cached ? { uri: cached } : null;
  }

  if (inFlightHeroLookups.has(entityKey)) {
    const pending = await inFlightHeroLookups.get(entityKey)!;
    return pending ? { uri: pending } : null;
  }

  const lookupPromise = (async (): Promise<string | null> => {
    try {
      await imageCacheService.init();
      const postInitDisk = imageCacheService.getImmediateCachedUri('hero', [], entityKey);
      if (postInitDisk) {
        dynamicLookupCache.set(entityKey, postInitDisk);
        return postInitDisk;
      }

      const qName = (params.competitionName || params.competitionId || '').trim();
      if (!qName || qName.length < 3) {
        dynamicLookupCache.set(entityKey, null);
        return null;
      }

      const sportHint = params.sport === 'basketball' ? 'basketball' : params.sport === 'hockey' ? 'hockey' : 'football stadium';
      const wikiUrl = await queryWikimediaHeroUrl(`${qName} ${sportHint}`);
      if (!wikiUrl) {
        dynamicLookupCache.set(entityKey, null);
        return null;
      }

      const cachedLocal = await imageCacheService.resolveImage({
        entityKey,
        category: 'hero',
        candidates: [wikiUrl],
        priority: 0,
      });

      dynamicLookupCache.set(entityKey, cachedLocal || null);
      return cachedLocal || null;
    } catch {
      return null;
    } finally {
      inFlightHeroLookups.delete(entityKey);
    }
  })();

  inFlightHeroLookups.set(entityKey, lookupPromise);
  const resolved = await lookupPromise;
  return resolved ? { uri: resolved } : null;
}
