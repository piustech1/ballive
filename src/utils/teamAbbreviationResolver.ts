/**
 * BALLIVE Team Abbreviation Resolver
 * Resolves standard 3-4 letter uppercase ticker abbreviations for sports teams
 * across Football, Basketball, Hockey, and American Football.
 */

const KNOWN_ABBREVIATIONS: Record<string, string> = {
  // Premier League
  'arsenal': 'ARS',
  'aston villa': 'AVL',
  'bournemouth': 'BOU',
  'afc bournemouth': 'BOU',
  'brentford': 'BRE',
  'brighton': 'BHA',
  'brighton & hove albion': 'BHA',
  'chelsea': 'CHEL',
  'crystal palace': 'CRY',
  'everton': 'EVE',
  'fulham': 'FUL',
  'ipswich town': 'IPS',
  'ipswich': 'IPS',
  'leicester city': 'LEI',
  'leicester': 'LEI',
  'liverpool': 'LIV',
  'manchester city': 'MCI',
  'man city': 'MCI',
  'manchester united': 'MANU',
  'man utd': 'MANU',
  'man united': 'MANU',
  'newcastle united': 'NEW',
  'newcastle': 'NEW',
  'nottingham forest': 'NFO',
  'southampton': 'SOU',
  'tottenham hotspur': 'TOT',
  'tottenham': 'TOT',
  'spurs': 'TOT',
  'west ham united': 'WHU',
  'west ham': 'WHU',
  'wolverhampton wanderers': 'WOL',
  'wolves': 'WOL',

  // LaLiga
  'real madrid': 'RMA',
  'barcelona': 'BAR',
  'fc barcelona': 'BAR',
  'atletico madrid': 'ATM',
  'athletic club': 'ATH',
  'athletic bilbao': 'ATH',
  'real sociedad': 'RSO',
  'real betis': 'BET',
  'sevilla': 'SEV',
  'valencia': 'VAL',
  'villarreal': 'VIL',
  'girona': 'GIR',

  // Serie A
  'inter milan': 'INT',
  'inter': 'INT',
  'ac milan': 'MIL',
  'milan': 'MIL',
  'juventus': 'JUV',
  'as roma': 'ROM',
  'roma': 'ROM',
  'napoli': 'NAP',
  'lazio': 'LAZ',
  'atalanta': 'ATA',
  'fiorentina': 'FIO',
  'como': 'COM',

  // Bundesliga
  'bayern munich': 'BAY',
  'bayern': 'BAY',
  'borussia dortmund': 'BVB',
  'dortmund': 'BVB',
  'bayer leverkusen': 'B04',
  'leverkusen': 'B04',
  'rb leipzig': 'RBL',
  'leipzig': 'RBL',
  'eintracht frankfurt': 'SGE',
  'vfb stuttgart': 'VFB',

  // Ligue 1
  'paris saint-germain': 'PSG',
  'psg': 'PSG',
  'marseille': 'OM',
  'monaco': 'ASM',
  'lyon': 'OL',
  'lille': 'LOSC',

  // Saudi Pro League & 1st Div
  'al hilal': 'HIL',
  'al nassr': 'NAS',
  'al ittihad': 'ITT',
  'al ahli saudi': 'AHL',
  'al shabab': 'SHB',
  'al ettifaq': 'ETT',
  'al taawoun': 'TAA',
  'al hazem': 'HAZ',
  'al batin': 'BAT',
  'ohod': 'OHD',
  'al faisaly': 'FAI',

  // Egyptian Premier
  'al ahly': 'AHL',
  'zamalek': 'ZAM',
  'pyramids fc': 'PYR',
  'pyramids': 'PYR',

  // Kenyan Premier
  'gor mahia': 'GOR',
  'afc leopards': 'LEO',
  'tusker fc': 'TUS',
  'tusker': 'TUS',
  'kenya police': 'POL',
  'bandari': 'BAN',

  // Indian Super League
  'mohun bagan': 'MBSG',
  'mumbai city': 'MCFC',
  'kerala blasters': 'KBFC',
  'bengaluru fc': 'BFC',

  // Chinese Super League
  'shanghai port': 'SHP',
  'shandong taishan': 'SDT',
  'shanghai shenhua': 'SHS',
  'beijing guoan': 'BJG',

  // J1 League
  'vissel kobe': 'KOB',
  'yokohama f. marinos': 'YFM',
  'kawasaki frontale': 'KAW',
  'urawa red diamonds': 'URA',

  // NBA
  'boston celtics': 'BOS',
  'los angeles lakers': 'LAL',
  'golden state warriors': 'GSW',
  'new york knicks': 'NYK',
  'miami heat': 'MIA',
  'chicago bulls': 'CHI',
  'denver nuggets': 'DEN',
  'milwaukee bucks': 'MIL',
  'dallas mavericks': 'DAL',
  'cleveland cavaliers': 'CLE',

  // NHL
  'toronto maple leafs': 'TOR',
  'edmonton oilers': 'EDM',
  'boston bruins': 'BOS',
  'new york rangers': 'NYR',
  'vegas golden knights': 'VGK',

  // NFL
  'kansas city chiefs': 'KC',
  'san francisco 49ers': 'SF',
  'philadelphia eagles': 'PHI',
  'dallas cowboys': 'DAL',
  'buffalo bills': 'BUF',
  'detroit lions': 'DET',
  'baltimore ravens': 'BAL',
};

export function getTeamAbbreviation(name: string): string {
  if (!name) return 'TEAM';
  const clean = name.trim().toLowerCase().replace(/^(fc|sc|ac|afc|cd|ud)\s+/i, '').replace(/\s+(fc|sc|cf|afc)$/i, '').trim();

  // 1. Direct dictionary match
  if (KNOWN_ABBREVIATIONS[clean]) {
    return KNOWN_ABBREVIATIONS[clean];
  }
  if (KNOWN_ABBREVIATIONS[name.trim().toLowerCase()]) {
    return KNOWN_ABBREVIATIONS[name.trim().toLowerCase()];
  }

  // 2. Multi-word team name (e.g. "Real Betis" -> "RBE", "Gor Mahia" -> "GOR")
  const words = clean.split(/[\s-]+/).filter(w => w.length > 0);
  if (words.length >= 2) {
    if (words[0].length >= 3 && words.length === 2 && words[1].length <= 2) {
      return words[0].substring(0, 4).toUpperCase();
    }
    const initials = words.map(w => w[0]).join('').toUpperCase();
    if (initials.length >= 3 && initials.length <= 4) {
      return initials;
    }
    // Take first 2 of word 1 + first 2 of word 2
    return (words[0].substring(0, 2) + words[1].substring(0, 2)).toUpperCase();
  }

  // 3. Single word: take first 3-4 letters
  const upper = clean.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (upper.length >= 4) {
    return upper.substring(0, 4);
  }
  if (upper.length >= 3) {
    return upper;
  }
  return upper.padEnd(3, 'X');
}

export default getTeamAbbreviation;
