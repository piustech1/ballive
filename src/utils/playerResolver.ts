/**
 * BALLIVE Player Portrait Resolver
 * Centralized mapping associating football player names with authentic high-resolution CDN portraits.
 * API-ready architecture with graceful fallback handling.
 */

const CDN_PLAYERS = 'https://media.api-sports.io/football/players';

const PLAYER_PORTRAIT_MAP: Record<string, string> = {
  // Arsenal
  'b. saka': `${CDN_PLAYERS}/1467.png`,
  'bukayo saka': `${CDN_PLAYERS}/1467.png`,
  'saka': `${CDN_PLAYERS}/1467.png`,
  'm. ødegaard': `${CDN_PLAYERS}/371.png`,
  'martin ødegaard': `${CDN_PLAYERS}/371.png`,
  'martin odegaard': `${CDN_PLAYERS}/371.png`,
  'ødegaard': `${CDN_PLAYERS}/371.png`,
  'd. raya': `${CDN_PLAYERS}/18959.png`,
  'david raya': `${CDN_PLAYERS}/18959.png`,
  'raya': `${CDN_PLAYERS}/18959.png`,
  'w. saliba': `${CDN_PLAYERS}/127814.png`,
  'william saliba': `${CDN_PLAYERS}/127814.png`,
  'saliba': `${CDN_PLAYERS}/127814.png`,
  'gabriel': `${CDN_PLAYERS}/22224.png`,
  'gabriel magalhães': `${CDN_PLAYERS}/22224.png`,
  'b. white': `${CDN_PLAYERS}/18894.png`,
  'ben white': `${CDN_PLAYERS}/18894.png`,
  'j. timber': `${CDN_PLAYERS}/138817.png`,
  'jurrien timber': `${CDN_PLAYERS}/138817.png`,
  'd. rice': `${CDN_PLAYERS}/293.png`,
  'declan rice': `${CDN_PLAYERS}/293.png`,
  'rice': `${CDN_PLAYERS}/293.png`,
  't. partey': `${CDN_PLAYERS}/49.png`,
  'thomas partey': `${CDN_PLAYERS}/49.png`,
  'partey': `${CDN_PLAYERS}/49.png`,
  'm. merino': `${CDN_PLAYERS}/18882.png`,
  'mikel merino': `${CDN_PLAYERS}/18882.png`,
  'merino': `${CDN_PLAYERS}/18882.png`,
  'g. martinelli': `${CDN_PLAYERS}/127813.png`,
  'gabriel martinelli': `${CDN_PLAYERS}/127813.png`,
  'martinelli': `${CDN_PLAYERS}/127813.png`,
  'k. havertz': `${CDN_PLAYERS}/2294.png`,
  'kai havertz': `${CDN_PLAYERS}/2294.png`,
  'havertz': `${CDN_PLAYERS}/2294.png`,
  'l. trossard': `${CDN_PLAYERS}/1946.png`,
  'leandro trossard': `${CDN_PLAYERS}/1946.png`,

  // Liverpool
  'm. salah': `${CDN_PLAYERS}/306.png`,
  'mohamed salah': `${CDN_PLAYERS}/306.png`,
  'salah': `${CDN_PLAYERS}/306.png`,
  'v. van dijk': `${CDN_PLAYERS}/280.png`,
  'virgil van dijk': `${CDN_PLAYERS}/280.png`,
  'van dijk': `${CDN_PLAYERS}/280.png`,
  'alisson': `${CDN_PLAYERS}/282.png`,
  'alisson becker': `${CDN_PLAYERS}/282.png`,
  't. alexander-arnold': `${CDN_PLAYERS}/283.png`,
  'trent alexander-arnold': `${CDN_PLAYERS}/283.png`,
  'alexander-arnold': `${CDN_PLAYERS}/283.png`,
  'i. konaté': `${CDN_PLAYERS}/1146.png`,
  'ibrahima konaté': `${CDN_PLAYERS}/1146.png`,
  'a. robertson': `${CDN_PLAYERS}/289.png`,
  'andy robertson': `${CDN_PLAYERS}/289.png`,
  'r. gravenberch': `${CDN_PLAYERS}/127812.png`,
  'ryan gravenberch': `${CDN_PLAYERS}/127812.png`,
  'a. mac allister': `${CDN_PLAYERS}/6716.png`,
  'alexis mac allister': `${CDN_PLAYERS}/6716.png`,
  'd. szoboszlai': `${CDN_PLAYERS}/1099.png`,
  'dominik szoboszlai': `${CDN_PLAYERS}/1099.png`,
  'l. díaz': `${CDN_PLAYERS}/566.png`,
  'luis díaz': `${CDN_PLAYERS}/566.png`,
  'luis diaz': `${CDN_PLAYERS}/566.png`,
  'c. gakpo': `${CDN_PLAYERS}/2476.png`,
  'cody gakpo': `${CDN_PLAYERS}/2476.png`,
  'gakpo': `${CDN_PLAYERS}/2476.png`,
  'd. núñez': `${CDN_PLAYERS}/51617.png`,
  'darwin núñez': `${CDN_PLAYERS}/51617.png`,
  'darwin nunez': `${CDN_PLAYERS}/51617.png`,

  // Real Madrid
  'vinicius jr': `${CDN_PLAYERS}/754.png`,
  'vinícius júnior': `${CDN_PLAYERS}/754.png`,
  'k. mbappé': `${CDN_PLAYERS}/278.png`,
  'kylian mbappé': `${CDN_PLAYERS}/278.png`,
  'j. bellingham': `${CDN_PLAYERS}/152982.png`,
  'jude bellingham': `${CDN_PLAYERS}/152982.png`,
  'rodrygo': `${CDN_PLAYERS}/759.png`,
  't. courtois': `${CDN_PLAYERS}/730.png`,
  'thibaut courtois': `${CDN_PLAYERS}/730.png`,
  'f. valverde': `${CDN_PLAYERS}/757.png`,
  'federico valverde': `${CDN_PLAYERS}/757.png`,
  'l. modrić': `${CDN_PLAYERS}/753.png`,
  'luka modrić': `${CDN_PLAYERS}/753.png`,
  'a. rüdiger': `${CDN_PLAYERS}/2280.png`,
  'antonio rüdiger': `${CDN_PLAYERS}/2280.png`,

  // Manchester City
  'e. haaland': `${CDN_PLAYERS}/1100.png`,
  'erling haaland': `${CDN_PLAYERS}/1100.png`,
  'k. de bruyne': `${CDN_PLAYERS}/629.png`,
  'kevin de bruyne': `${CDN_PLAYERS}/629.png`,
  'rodri': `${CDN_PLAYERS}/643.png`,
  'b. silva': `${CDN_PLAYERS}/635.png`,
  'bernardo silva': `${CDN_PLAYERS}/635.png`,
  'ederson': `${CDN_PLAYERS}/617.png`,
  'p. foden': `${CDN_PLAYERS}/645.png`,
  'phil foden': `${CDN_PLAYERS}/645.png`,
  'r. dias': `${CDN_PLAYERS}/567.png`,
  'rúben dias': `${CDN_PLAYERS}/567.png`,
  'j. gvardiol': `${CDN_PLAYERS}/127815.png`,
  'joško gvardiol': `${CDN_PLAYERS}/127815.png`,
};

// High quality generic avatar fallback
const FALLBACK_AVATAR = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

/**
 * Resolves a player's natural name to their authentic CDN headshot photo URL.
 */
export function getPlayerPhoto(playerName?: string | null): string {
  if (!playerName) return FALLBACK_AVATAR;

  const clean = playerName.toLowerCase().trim();
  if (PLAYER_PORTRAIT_MAP[clean]) {
    return PLAYER_PORTRAIT_MAP[clean];
  }

  // Substring match
  for (const [key, url] of Object.entries(PLAYER_PORTRAIT_MAP)) {
    if (clean.includes(key) || key.includes(clean)) {
      return url;
    }
  }

  return FALLBACK_AVATAR;
}

export default getPlayerPhoto;
