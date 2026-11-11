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
    UCL: 'moviebay_sport_cdn_ch_xx_tnt-sports-1-fhd-uk',
    LALIGA: 'moviebay_sport_cdn_ch_xx_laliga-tv-fhd-uk',
    DAZN: 'moviebay_sport_cdn_ch_xx_dazn-la-liga-hd',
    SUPERSPORT: 'moviebay_sport_dlv_ch_414_supersport-premier-league',
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
 * Returns the primary cloud backend base URL.
 */
export async function getActiveBackendUrl(): Promise<string> {
  return API_CONFIG.DAG_SPORTS_BASE;
}
