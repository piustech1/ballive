/**
 * High-definition vector SVG club crests and competition emblems.
 * Provides clean, sharp rendering at any scale without external network latency or missing asset risks.
 */

export const CLUB_CRESTS: Record<string, string> = {
  // Real Madrid
  'real-madrid': `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <circle cx="50" cy="54" r="38" fill="%23FFFFFF" stroke="%23EAB308" stroke-width="4"/>
    <circle cx="50" cy="54" r="32" fill="none" stroke="%233B82F6" stroke-width="2"/>
    <path d="M22 36 L78 72" stroke="%236366F1" stroke-width="8" stroke-linecap="round"/>
    <path d="M40 42 Q50 32 60 42 Q65 55 50 64 Q35 55 40 42" fill="%23EAB308"/>
    <text x="50" y="58" font-family="sans-serif" font-weight="900" font-size="16" fill="%231E3A8A" text-anchor="middle">MCF</text>
    <!-- Crown -->
    <path d="M30 24 L36 12 L50 20 L64 12 L70 24 Z" fill="%23EAB308" stroke="%23B45309" stroke-width="1.5"/>
    <circle cx="50" cy="10" r="3" fill="%23EF4444"/>
    <circle cx="36" cy="12" r="2.5" fill="%233B82F6"/>
    <circle cx="64" cy="12" r="2.5" fill="%233B82F6"/>
  </svg>`,

  // Manchester City
  'man-city': `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="46" fill="%236CABDD" stroke="%2300285E" stroke-width="4"/>
    <circle cx="50" cy="50" r="36" fill="%23FFFFFF" stroke="%2300285E" stroke-width="3"/>
    <!-- Ship -->
    <path d="M35 44 L65 44 L58 34 L42 34 Z" fill="%23EAB308" stroke="%2300285E" stroke-width="1.5"/>
    <!-- Rose and stripes -->
    <rect x="42" y="48" width="16" height="18" rx="2" fill="%23EF4444"/>
    <path d="M50 49 L50 65" stroke="%23FFFFFF" stroke-width="2"/>
    <!-- Ring text indication -->
    <text x="50" y="24" font-family="sans-serif" font-weight="bold" font-size="7" fill="%2300285E" text-anchor="middle">MANCHESTER</text>
    <text x="50" y="86" font-family="sans-serif" font-weight="bold" font-size="8" fill="%2300285E" text-anchor="middle">CITY</text>
  </svg>`,

  // Tottenham Hotspur
  'tottenham': `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="46" fill="%23FFFFFF" stroke="%23132257" stroke-width="2"/>
    <!-- Football base -->
    <circle cx="50" cy="74" r="14" fill="%23F8FAFC" stroke="%23132257" stroke-width="2.5"/>
    <path d="M43 72 L47 67 L53 67 L57 72 L54 78 L46 78 Z" fill="%23132257"/>
    <!-- Cockerel silhouette -->
    <path d="M48 30 Q54 22 58 26 Q60 28 58 32 Q62 36 61 46 Q58 58 54 62 L52 64 L50 61 Q46 54 44 46 Q43 36 48 30 Z" fill="%23132257"/>
    <path d="M59 28 L64 27 L60 31 Z" fill="%23132257"/>
    <!-- Tail feathers -->
    <path d="M44 42 Q36 34 37 46 Q38 52 46 54 Z" fill="%23132257"/>
  </svg>`,

  // Paris Saint-Germain (PSG)
  'psg': `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="46" fill="%23004170" stroke="%23DA291C" stroke-width="3"/>
    <circle cx="50" cy="50" r="32" fill="%23FFFFFF"/>
    <!-- Eiffel tower motif -->
    <path d="M46 32 L54 32 L53 45 L58 64 L52 64 L50 56 L48 64 L42 64 L47 45 Z" fill="%23DA291C"/>
    <circle cx="50" cy="30" r="3" fill="%23DA291C"/>
    <!-- Fleur de lis -->
    <path d="M50 63 Q52 60 54 62 Q52 66 50 69 Q48 66 46 62 Q48 60 50 63 Z" fill="%23EAB308"/>
    <text x="50" y="22" font-family="sans-serif" font-weight="900" font-size="7" fill="%23FFFFFF" text-anchor="middle" letter-spacing="1">PARIS</text>
    <text x="50" y="87" font-family="sans-serif" font-weight="700" font-size="5" fill="%23FFFFFF" text-anchor="middle" letter-spacing="0.5">SAINT-GERMAIN</text>
  </svg>`,

  // Liverpool
  'liverpool': `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <!-- Shield -->
    <path d="M22 22 L78 22 L76 60 Q72 82 50 92 Q28 82 24 60 Z" fill="%23C8102E" stroke="%2300B2A9" stroke-width="2.5"/>
    <!-- Shankly gates crown indication -->
    <path d="M30 18 L50 10 L70 18 L64 22 L36 22 Z" fill="%2300B2A9"/>
    <!-- Liver bird silhouette -->
    <path d="M50 36 Q55 30 60 34 Q57 40 52 45 Q56 52 57 68 L53 68 Q51 58 48 56 Q45 62 44 68 L41 68 Q41 52 47 44 Q43 39 50 36 Z" fill="%23FFFFFF"/>
    <path d="M60 34 L66 33 L62 37 Z" fill="%23FFFFFF"/>
    <text x="50" y="80" font-family="sans-serif" font-weight="bold" font-size="7" fill="%23FFFFFF" text-anchor="middle">L.F.C.</text>
  </svg>`,

  // Chelsea
  'chelsea': `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="46" fill="%23034694" stroke="%23DBA111" stroke-width="3"/>
    <circle cx="50" cy="50" r="35" fill="%23FFFFFF" stroke="%23DBA111" stroke-width="1.5"/>
    <!-- Lion rampant -->
    <path d="M46 34 Q52 28 56 32 Q54 38 58 42 Q62 45 60 52 Q58 58 54 64 L52 68 L48 64 Q44 60 45 54 Q40 50 43 42 Q42 36 46 34 Z" fill="%23034694"/>
    <!-- Staff / Crozier -->
    <path d="M58 32 L60 68" stroke="%23DBA111" stroke-width="2" stroke-linecap="round"/>
    <circle cx="60" cy="30" r="3" fill="%23DBA111"/>
    <!-- Roses -->
    <circle cx="28" cy="50" r="3" fill="%23ED1C24"/>
    <circle cx="72" cy="50" r="3" fill="%23ED1C24"/>
  </svg>`,

  // Arsenal
  'arsenal': `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <path d="M22 20 L78 20 L74 65 Q70 86 50 94 Q30 86 26 65 Z" fill="%23EF0107" stroke="%239C824A" stroke-width="3"/>
    <path d="M26 23 L74 23 L71 63 Q67 82 50 89 Q33 82 29 63 Z" fill="%23DB0007"/>
    <!-- Cannon -->
    <path d="M30 52 L68 47 L68 53 L30 58 Z" fill="%239C824A"/>
    <circle cx="44" cy="58" r="9" fill="%239C824A" stroke="%23FFFFFF" stroke-width="1.5"/>
    <circle cx="44" cy="58" r="4" fill="%23023474"/>
    <text x="50" y="36" font-family="sans-serif" font-weight="900" font-size="8" fill="%23FFFFFF" text-anchor="middle" letter-spacing="1">ARSENAL</text>
  </svg>`,

  // Barcelona
  'barcelona': `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <path d="M20 25 Q50 20 80 25 L75 66 Q70 88 50 94 Q30 88 25 66 Z" fill="%23004D98" stroke="%23EDBB00" stroke-width="3"/>
    <!-- St George Cross Top Left -->
    <rect x="26" y="27" width="22" height="18" fill="%23FFFFFF"/>
    <rect x="35" y="27" width="4" height="18" fill="%23DB0030"/>
    <rect x="26" y="34" width="22" height="4" fill="%23DB0030"/>
    <!-- Catalan flag Top Right -->
    <rect x="52" y="27" width="22" height="18" fill="%23EDBB00"/>
    <line x1="57" y1="27" x2="57" y2="45" stroke="%23DB0030" stroke-width="2.5"/>
    <line x1="63" y1="27" x2="63" y2="45" stroke="%23DB0030" stroke-width="2.5"/>
    <line x1="69" y1="27" x2="69" y2="45" stroke="%23DB0030" stroke-width="2.5"/>
    <!-- Middle bar -->
    <rect x="25" y="47" width="50" height="7" fill="%23EDBB00"/>
    <text x="50" y="53" font-family="sans-serif" font-weight="900" font-size="6" fill="%23004D98" text-anchor="middle">FCB</text>
    <!-- Bottom stripes -->
    <path d="M30 56 L30 80 L38 84 L38 56 Z" fill="%23DB0030"/>
    <path d="M44 56 L44 87 L56 87 L56 56 Z" fill="%23004D98"/>
    <path d="M62 56 L62 84 L70 80 L70 56 Z" fill="%23DB0030"/>
    <!-- Ball -->
    <circle cx="50" cy="72" r="7" fill="%23EDBB00" stroke="%23854D0E" stroke-width="1"/>
  </svg>`,

  // Bayern Munich
  'bayern': `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="46" fill="%23DC052D" stroke="%23FFFFFF" stroke-width="2"/>
    <circle cx="50" cy="50" r="32" fill="%230066B2"/>
    <!-- Bavarian diamonds -->
    <path d="M42 36 L50 26 L58 36 L50 46 Z" fill="%23FFFFFF"/>
    <path d="M34 46 L42 36 L50 46 L42 56 Z" fill="%23FFFFFF"/>
    <path d="M50 46 L58 36 L66 46 L58 56 Z" fill="%23FFFFFF"/>
    <path d="M42 56 L50 46 L58 56 L50 66 Z" fill="%23FFFFFF"/>
    <text x="50" y="20" font-family="sans-serif" font-weight="900" font-size="7" fill="%23FFFFFF" text-anchor="middle">FC BAYERN</text>
    <text x="50" y="88" font-family="sans-serif" font-weight="bold" font-size="7" fill="%23FFFFFF" text-anchor="middle">MÜNCHEN</text>
  </svg>`,

  // Juventus
  'juventus': `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <rect width="100" height="100" rx="20" fill="%23000000"/>
    <!-- Iconic Double J -->
    <path d="M36 28 L36 62 Q36 72 44 72 L44 64 Q42 64 42 60 L42 28 Z" fill="%23FFFFFF"/>
    <path d="M52 28 L52 62 Q52 78 68 78 L68 70 Q60 70 58 64 L58 28 Z" fill="%23FFFFFF"/>
    <text x="50" y="22" font-family="sans-serif" font-weight="900" font-size="8" fill="%23FFFFFF" text-anchor="middle" letter-spacing="1">JUVENTUS</text>
  </svg>`,

  // Borussia Dortmund
  'dortmund': `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="46" fill="%23FDE100" stroke="%23000000" stroke-width="4"/>
    <circle cx="50" cy="50" r="38" fill="%23FDE100" stroke="%23000000" stroke-width="1.5"/>
    <text x="50" y="44" font-family="sans-serif" font-weight="900" font-size="16" fill="%23000000" text-anchor="middle">BVB</text>
    <text x="50" y="68" font-family="sans-serif" font-weight="900" font-size="18" fill="%23000000" text-anchor="middle">09</text>
  </svg>`,

  // Brest
  'brest': `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <path d="M25 20 L75 20 L75 62 Q75 84 50 94 Q25 84 25 62 Z" fill="%23E2001A" stroke="%23FFFFFF" stroke-width="3"/>
    <text x="50" y="38" font-family="sans-serif" font-weight="900" font-size="10" fill="%23FFFFFF" text-anchor="middle">SB29</text>
    <path d="M50 48 L46 64 L54 64 Z" fill="%23FFFFFF"/>
    <circle cx="50" cy="46" r="3" fill="%23FFFFFF"/>
    <text x="50" y="78" font-family="sans-serif" font-weight="bold" font-size="7" fill="%23FFFFFF" text-anchor="middle">BREST</text>
  </svg>`,

  // AS Monaco
  'monaco': `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <path d="M25 24 L75 24 L75 62 Q75 82 50 92 Q25 82 25 62 Z" fill="%23FFFFFF" stroke="%23E2001A" stroke-width="3"/>
    <!-- Diagonal split red & white -->
    <path d="M25 24 L75 24 L25 74 Z" fill="%23E2001A"/>
    <circle cx="50" cy="52" r="16" fill="%23FFFFFF" stroke="%23E2001A" stroke-width="2"/>
    <text x="50" y="56" font-family="sans-serif" font-weight="900" font-size="10" fill="%23E2001A" text-anchor="middle">ASM</text>
    <path d="M38 18 L44 8 L50 14 L56 8 L62 18 Z" fill="%23EAB308"/>
  </svg>`,

  // Inter Milan
  'inter': `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="46" fill="%23001EA0" stroke="%23000000" stroke-width="4"/>
    <circle cx="50" cy="50" r="38" fill="%23000000"/>
    <circle cx="50" cy="50" r="30" fill="%23001EA0"/>
    <text x="50" y="60" font-family="sans-serif" font-weight="900" font-size="28" fill="%23FFFFFF" text-anchor="middle">IM</text>
  </svg>`,

  // AC Milan
  'milan': `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <ellipse cx="50" cy="50" rx="36" ry="46" fill="%23FFFFFF" stroke="%23000000" stroke-width="3"/>
    <!-- Red and Black Stripes -->
    <rect x="24" y="24" width="7" height="40" fill="%23E30613"/>
    <rect x="31" y="20" width="7" height="48" fill="%23000000"/>
    <rect x="38" y="16" width="7" height="56" fill="%23E30613"/>
    <!-- St George cross right -->
    <rect x="47" y="14" width="27" height="58" fill="%23FFFFFF"/>
    <rect x="58" y="14" width="6" height="58" fill="%23E30613"/>
    <rect x="47" y="40" width="27" height="6" fill="%23E30613"/>
    <text x="50" y="84" font-family="sans-serif" font-weight="900" font-size="8" fill="%23000000" text-anchor="middle">ACM</text>
  </svg>`,

  // Atletico Madrid
  'atletico': `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <path d="M22 20 L78 20 L75 64 Q70 86 50 94 Q30 86 25 64 Z" fill="%23FFFFFF" stroke="%23272E61" stroke-width="3"/>
    <path d="M24 22 L76 22 L76 46 L24 46 Z" fill="%23272E61"/>
    <!-- Red stripes -->
    <rect x="32" y="46" width="8" height="40" fill="%23CB3524"/>
    <rect x="46" y="46" width="8" height="44" fill="%23CB3524"/>
    <rect x="60" y="46" width="8" height="40" fill="%23CB3524"/>
    <!-- Bear & Strawberry tree hint -->
    <circle cx="50" cy="34" r="7" fill="%23FFFFFF"/>
  </svg>`,

  // Generic football fallback crest
  'default-team': `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="46" fill="%231E293B" stroke="%2338BDF8" stroke-width="3"/>
    <circle cx="50" cy="50" r="24" fill="%230F172A" stroke="%23FFFFFF" stroke-width="2"/>
    <polygon points="50,34 60,42 56,54 44,54 40,42" fill="%2338BDF8"/>
  </svg>`
};

export const COMPETITION_EMBLEMS: Record<string, string> = {
  // UEFA Champions League Starball
  'ucl': `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="46" fill="%23081434" stroke="%233B82F6" stroke-width="1.5"/>
    <g fill="%23FFFFFF">
      <polygon points="50,22 53,30 61,31 55,36 57,44 50,40 43,44 45,36 39,31 47,30"/>
      <polygon points="68,36 71,44 79,45 73,50 75,58 68,54 61,58 63,50 57,45 65,44"/>
      <polygon points="62,64 65,72 73,73 67,78 69,86 62,82 55,86 57,78 51,73 59,72"/>
      <polygon points="38,64 41,72 49,73 43,78 45,86 38,82 31,86 33,78 27,73 35,72"/>
      <polygon points="32,36 35,44 43,45 37,50 39,58 32,54 25,58 27,50 21,45 29,44"/>
    </g>
  </svg>`,

  // Premier League Lion
  'pl': `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <rect width="100" height="100" rx="20" fill="%233D195B"/>
    <!-- Lion head crown -->
    <path d="M50 24 L56 32 L66 28 L62 38 L72 40 L64 48 L70 58 L58 56 L50 72 L42 56 L30 58 L36 48 L28 40 L38 38 L34 28 L44 32 Z" fill="%2300FF87"/>
    <circle cx="45" cy="45" r="2.5" fill="%233D195B"/>
    <circle cx="55" cy="45" r="2.5" fill="%233D195B"/>
  </svg>`,

  // La Liga
  'laliga': `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="46" fill="%230F172A"/>
    <!-- Multicolored wheel blades -->
    <path d="M50 50 L50 18 A32 32 0 0 1 78 34 Z" fill="%23FF004B"/>
    <path d="M50 50 L78 34 A32 32 0 0 1 78 66 Z" fill="%23FF9100"/>
    <path d="M50 50 L78 66 A32 32 0 0 1 50 82 Z" fill="%23FFEA00"/>
    <path d="M50 50 L50 82 A32 32 0 0 1 22 66 Z" fill="%2300E676"/>
    <path d="M50 50 L22 66 A32 32 0 0 1 22 34 Z" fill="%2300B0FF"/>
    <path d="M50 50 L22 34 A32 32 0 0 1 50 18 Z" fill="%23D500F9"/>
    <circle cx="50" cy="50" r="16" fill="%23FFFFFF"/>
  </svg>`,

  // Serie A
  'seriea': `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <rect width="100" height="100" rx="20" fill="%23002D72"/>
    <path d="M50 20 L74 74 L58 74 L50 54 L42 74 L26 74 Z" fill="%23008DF2"/>
    <polygon points="50,38 54,48 46,48" fill="%23FFFFFF"/>
  </svg>`,

  // Bundesliga
  'bundesliga': `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <rect width="100" height="100" rx="20" fill="%23D20515"/>
    <!-- Kicking player silhouette -->
    <path d="M38 34 Q42 26 48 30 Q44 38 40 44 L48 54 L68 46 L62 40 L52 46 Z" fill="%23FFFFFF"/>
    <circle cx="68" cy="36" r="6" fill="%23FFFFFF"/>
    <path d="M40 44 L32 60 L38 64 L46 54 Z" fill="%23FFFFFF"/>
  </svg>`,

  // Ligue 1
  'ligue1': `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="46" fill="%23091C3E" stroke="%23DAE71D" stroke-width="2"/>
    <text x="50" y="62" font-family="sans-serif" font-weight="900" font-size="34" fill="%23DAE71D" text-anchor="middle">L1</text>
  </svg>`,
};

export function getCrest(key: string): string {
  return CLUB_CRESTS[key] || CLUB_CRESTS['default-team'];
}

export function getCompetitionEmblem(key: string): string {
  return COMPETITION_EMBLEMS[key] || COMPETITION_EMBLEMS['ucl'];
}
