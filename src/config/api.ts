/**
 * BALLIVE Direct Cloud Network & API Configuration
 * Connects standalone mobile devices directly to high-availability cloud sports APIs.
 * Eliminates local machine / proxy dependencies.
 */

export const API_CONFIG = {
  // Upstream Sports Network Base & Anti-hotlink Referer
  DAG_SPORTS_BASE: 'https://dag.s-u.in',
  DAG_REFERER: 'https://s-u.in/',
  DAG_HEADERS: {
    'Referer': 'https://s-u.in/',
    'Origin': 'https://s-u.in',
    'User-Agent':
      'Mozilla/5.0 (Linux; Android 14; Mobile) AppleWebKit/537.36 Chrome/124.0.0.0 Mobile Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
  },

  // Official Football-Data.org API Token & Base URL
  FOOTBALL_DATA_API_KEY: 'db6d452d5dce48c88a43efdd50756687',
  FOOTBALL_DATA_BASE_URL: 'https://api.football-data.org/v4',

  // CDN Live Events
  CDNLIVE_API: 'https://api.cdnlivetv.tv/api/v1/events/sports/?user=cdnlivetv&plan=free',

  // 24/7 Verified Football & Multi-Sport Broadcast Channels on DAG
  PRIORITY_CHANNELS: {
    PL: 'moviebay_sport_cdn_ch_xx_sky-sports-premier-league-fhd-uk',
    MAIN_EVENT: 'moviebay_sport_cdn_ch_xx_sky-sports-main-event-fhd-uk',
    FOOTBALL: 'moviebay_sport_cdn_ch_xx_sky-sports-football-fhd-uk',
    UCL: 'moviebay_sport_cdn_ch_xx_tnt-sports-1-fhd-uk',
    LALIGA: 'moviebay_sport_cdn_ch_xx_laliga-tv-fhd-uk',
    DAZN: 'moviebay_sport_cdn_ch_xx_dazn-la-liga-hd',
    SUPERSPORT: 'moviebay_sport_dlv_ch_414_supersport-premier-league',
    BEIN: 'moviebay_sport_cdn_ch_xx_bein-sports-hd-us',
    GOLAZO: 'moviebay_sport_cdn_ch_xx_cbs-sports-golazo-network-fhd-us',
    SKY_DE: 'moviebay_sport_cdn_ch_xx_sky-sport-premier-league-fhd-de',
    NBA: 'moviebay_sport_cdn_ch_xx_nba-tv-fhd-us',
    NBA_BACKUP: 'moviebay_sport_dlv_ch_404_nba-tv-usa',
    NHL: 'moviebay_sport_dami_247-nhl-network-29780',
    F1: 'moviebay_sport_cdn_ch_xx_sky-sports-f1-fhd-uk',
    TENNIS: 'moviebay_sport_cdn_ch_xx_sky-sport-tennis-fhd-de',
  },

  // ESPN Open Real-time Public Sports APIs (Zero Auth, Free, Global)
  ESPN_BASE: 'https://site.api.espn.com/apis/site/v2/sports',
  ESPN_STANDINGS_BASE: 'https://site.api.espn.com/apis/v2/sports',

  // Request timeout
  REQUEST_TIMEOUT_MS: 8000,
};

/**
 * Resolves the optimal 24/7 high-availability broadcast channel ID for any competition or sport.
 */
export function getBroadcastChannelId(competition: string = '', sport: string = ''): string {
  const compLower = (competition || '').toLowerCase();
  const sportLower = (sport || '').toLowerCase();

  if (sportLower.includes('basketball') || compLower.includes('nba') || compLower.includes('nbl') || compLower.includes('fiba')) {
    return API_CONFIG.PRIORITY_CHANNELS.NBA;
  }
  if (sportLower.includes('hockey') || compLower.includes('nhl')) {
    return API_CONFIG.PRIORITY_CHANNELS.NHL;
  }
  if (sportLower.includes('f1') || sportLower.includes('motor') || compLower.includes('formula')) {
    return API_CONFIG.PRIORITY_CHANNELS.F1;
  }
  if (sportLower.includes('tennis') || compLower.includes('atp') || compLower.includes('wta')) {
    return API_CONFIG.PRIORITY_CHANNELS.TENNIS;
  }
  if (sportLower.includes('mma') || compLower.includes('ufc') || compLower.includes('wwe') || compLower.includes('combat')) {
    return API_CONFIG.PRIORITY_CHANNELS.UCL;
  }

  // Soccer / Association Football
  // International Friendlies, FIFA, AFC, CAF, World Cup Qualifiers (e.g. Iran vs Palestine)
  if (
    compLower.includes('friendly') ||
    compLower.includes('fifa') ||
    compLower.includes('afc') ||
    compLower.includes('caf') ||
    compLower.includes('conmebol') ||
    compLower.includes('concacaf') ||
    compLower.includes('qualifier') ||
    compLower.includes('international')
  ) {
    return API_CONFIG.PRIORITY_CHANNELS.BEIN;
  }

  // English Football League (EFL Championship, League One, League Two, Carabao Cup)
  if (
    compLower.includes('efl') ||
    compLower.includes('championship') ||
    compLower.includes('league one') ||
    compLower.includes('league two') ||
    compLower.includes('carabao')
  ) {
    return API_CONFIG.PRIORITY_CHANNELS.FOOTBALL;
  }

  // Spain
  if (compLower.includes('laliga') || compLower.includes('spain') || compLower.includes('copa del rey') || compLower.includes('liga f')) {
    return API_CONFIG.PRIORITY_CHANNELS.LALIGA;
  }

  // UEFA European Tournaments
  if (compLower.includes('champions') || compLower.includes('ucl') || compLower.includes('europa') || compLower.includes('conference')) {
    return API_CONFIG.PRIORITY_CHANNELS.UCL;
  }

  // France
  if (compLower.includes('france') || compLower.includes('première') || compLower.includes('premiere') || compLower.includes('ligue 1') || compLower.includes('ligue 2') || compLower.includes('coupe de france')) {
    return API_CONFIG.PRIORITY_CHANNELS.BEIN;
  }

  // Italy
  if (compLower.includes('serie a') || compLower.includes('italy') || compLower.includes('coppa italia')) {
    return API_CONFIG.PRIORITY_CHANNELS.DAZN;
  }

  // Premier League & Women's Super League
  if (compLower.includes('premier') || compLower.includes('wsl') || compLower.includes('women')) {
    return API_CONFIG.PRIORITY_CHANNELS.PL;
  }

  // General Global Football (CBS Sports Golazo 24/7 Football Network)
  return API_CONFIG.PRIORITY_CHANNELS.GOLAZO;
}

/**
 * Returns the primary cloud backend base URL.
 */
export async function getActiveBackendUrl(): Promise<string> {
  return API_CONFIG.DAG_SPORTS_BASE;
}
