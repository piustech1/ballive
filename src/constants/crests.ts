/**
 * BALLIVE Official Club Crests and League Emblems CDN mappings
 * Uses reliable high-speed CDN assets for authentic presentation
 */

const CDN_TEAM = 'https://media.api-sports.io/football/teams';
const CDN_LEAGUE = 'https://media.api-sports.io/football/leagues';

export const CLUB_CRESTS: Record<string, string> = {
  // Top European Clubs
  'real-madrid': `${CDN_TEAM}/541.png`,
  'barcelona': `${CDN_TEAM}/529.png`,
  'man-city': `${CDN_TEAM}/50.png`,
  'manchester-city': `${CDN_TEAM}/50.png`,
  'arsenal': `${CDN_TEAM}/42.png`,
  'liverpool': `${CDN_TEAM}/40.png`,
  'man-utd': `${CDN_TEAM}/33.png`,
  'manchester-united': `${CDN_TEAM}/33.png`,
  'chelsea': `${CDN_TEAM}/49.png`,
  'tottenham': `${CDN_TEAM}/47.png`,
  'bayern': `${CDN_TEAM}/157.png`,
  'bayern-munich': `${CDN_TEAM}/157.png`,
  'dortmund': `${CDN_TEAM}/165.png`,
  'bayer-leverkusen': `${CDN_TEAM}/168.png`,
  'psg': `${CDN_TEAM}/85.png`,
  'paris-saint-germain': `${CDN_TEAM}/85.png`,
  'inter': `${CDN_TEAM}/505.png`,
  'inter-milan': `${CDN_TEAM}/505.png`,
  'milan': `${CDN_TEAM}/489.png`,
  'ac-milan': `${CDN_TEAM}/489.png`,
  'juventus': `${CDN_TEAM}/496.png`,
  'atletico-madrid': `${CDN_TEAM}/530.png`,
};

export const LEAGUE_EMBLEMS: Record<string, string> = {
  'ucl': `${CDN_LEAGUE}/2.png`,
  'champions-league': `${CDN_LEAGUE}/2.png`,
  'premier-league': `${CDN_LEAGUE}/39.png`,
  'pl': `${CDN_LEAGUE}/39.png`,
  'laliga': `${CDN_LEAGUE}/140.png`,
  'serie-a': `${CDN_LEAGUE}/135.png`,
  'bundesliga': `${CDN_LEAGUE}/78.png`,
  'ligue-1': `${CDN_LEAGUE}/61.png`,
};

export default { CLUB_CRESTS, LEAGUE_EMBLEMS };
