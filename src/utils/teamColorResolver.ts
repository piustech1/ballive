/**
 * BALLIVE Team Brand Color & Perceptual Collision Engine
 * 
 * Provides authentic, verified primary, secondary, and tertiary brand colors for sports clubs
 * and franchises across Association Football (Soccer), Basketball (NBA), American Football (NFL),
 * Hockey (NHL), and College Sports.
 * 
 * Includes scientific perceptual color-collision detection:
 * - Uses CIELAB Delta E (CIE76 color difference formula in Lab color space)
 * - Measures relative luminance and WCAG contrast ratio
 * - Evaluates hue angle proximity in HSL space
 * 
 * Multi-Stage Priority Collision Pipeline:
 * 1. Team A Primary vs Team B Primary
 * 2. If clashing -> Team A Primary vs Team B Secondary (if contrast Delta E >= 26)
 * 3. If still clashing -> Team A Primary vs Team B Tertiary / Alternate
 * 4. If still clashing -> Team A Secondary vs Team B Primary
 * 5. If no verified alternate exists -> Restrained athletic neutral tone (#1E1B2E or #F4F5F7)
 *    ensuring distinct, non-random, and broadcast-quality presentation.
 */

export interface TeamColorDefinition {
  primary: string;
  secondary: string;
  tertiary?: string;
}

// Normalized lookup table for verified club brand colors
const TEAM_COLORS: Record<string, TeamColorDefinition> = {
  // ── PREMIER LEAGUE ──
  'arsenal': { primary: '#EF0107', secondary: '#063672', tertiary: '#9C824A' },
  'aston-villa': { primary: '#670E36', secondary: '#95BFE5', tertiary: '#FEE100' },
  'aston villa': { primary: '#670E36', secondary: '#95BFE5', tertiary: '#FEE100' },
  'bournemouth': { primary: '#DA291C', secondary: '#1D1D1B', tertiary: '#B5985A' },
  'afc-bournemouth': { primary: '#DA291C', secondary: '#1D1D1B', tertiary: '#B5985A' },
  'afc bournemouth': { primary: '#DA291C', secondary: '#1D1D1B', tertiary: '#B5985A' },
  'brentford': { primary: '#E30613', secondary: '#000000', tertiary: '#F9D616' },
  'brighton': { primary: '#0057B8', secondary: '#FFCD00', tertiary: '#FFFFFF' },
  'brighton-and-hove-albion': { primary: '#0057B8', secondary: '#FFCD00', tertiary: '#FFFFFF' },
  'brighton & hove albion': { primary: '#0057B8', secondary: '#FFCD00', tertiary: '#FFFFFF' },
  'chelsea': { primary: '#034694', secondary: '#EE242C', tertiary: '#DBA111' },
  'crystal-palace': { primary: '#1B458F', secondary: '#C4122E', tertiary: '#FFCD00' },
  'crystal palace': { primary: '#1B458F', secondary: '#C4122E', tertiary: '#FFCD00' },
  'everton': { primary: '#003399', secondary: '#FFFFFF', tertiary: '#F2A900' },
  'fulham': { primary: '#1D1D1B', secondary: '#CC0000', tertiary: '#FFFFFF' },
  'ipswich': { primary: '#00447C', secondary: '#E30613', tertiary: '#FFFFFF' },
  'ipswich-town': { primary: '#00447C', secondary: '#E30613', tertiary: '#FFFFFF' },
  'ipswich town': { primary: '#00447C', secondary: '#E30613', tertiary: '#FFFFFF' },
  'leicester': { primary: '#003090', secondary: '#FDBE11', tertiary: '#FFFFFF' },
  'leicester-city': { primary: '#003090', secondary: '#FDBE11', tertiary: '#FFFFFF' },
  'leicester city': { primary: '#003090', secondary: '#FDBE11', tertiary: '#FFFFFF' },
  'liverpool': { primary: '#C8102E', secondary: '#00B2A9', tertiary: '#F6EB61' },
  'man-city': { primary: '#6CABDD', secondary: '#1C2C5B', tertiary: '#99C5EA' },
  'manchester-city': { primary: '#6CABDD', secondary: '#1C2C5B', tertiary: '#99C5EA' },
  'manchester city': { primary: '#6CABDD', secondary: '#1C2C5B', tertiary: '#99C5EA' },
  'man-utd': { primary: '#DA291C', secondary: '#FBE122', tertiary: '#000000' },
  'manchester-united': { primary: '#DA291C', secondary: '#FBE122', tertiary: '#000000' },
  'manchester united': { primary: '#DA291C', secondary: '#FBE122', tertiary: '#000000' },
  'newcastle': { primary: '#241F20', secondary: '#41B6E6', tertiary: '#F1F2F2' },
  'newcastle-united': { primary: '#241F20', secondary: '#41B6E6', tertiary: '#F1F2F2' },
  'newcastle united': { primary: '#241F20', secondary: '#41B6E6', tertiary: '#F1F2F2' },
  'nottingham-forest': { primary: '#DD0000', secondary: '#FFFFFF', tertiary: '#E5A823' },
  'nottingham forest': { primary: '#DD0000', secondary: '#FFFFFF', tertiary: '#E5A823' },
  'southampton': { primary: '#D71920', secondary: '#131112', tertiary: '#FFCD00' },
  'tottenham': { primary: '#132257', secondary: '#FFFFFF', tertiary: '#101B3A' },
  'tottenham-hotspur': { primary: '#132257', secondary: '#FFFFFF', tertiary: '#101B3A' },
  'tottenham hotspur': { primary: '#132257', secondary: '#FFFFFF', tertiary: '#101B3A' },
  'spurs': { primary: '#132257', secondary: '#FFFFFF', tertiary: '#101B3A' },
  'west-ham': { primary: '#7A263A', secondary: '#1BB1E7', tertiary: '#F3D44D' },
  'west-ham-united': { primary: '#7A263A', secondary: '#1BB1E7', tertiary: '#F3D44D' },
  'west ham': { primary: '#7A263A', secondary: '#1BB1E7', tertiary: '#F3D44D' },
  'west ham united': { primary: '#7A263A', secondary: '#1BB1E7', tertiary: '#F3D44D' },
  'wolves': { primary: '#FDB913', secondary: '#231F20', tertiary: '#FFFFFF' },
  'wolverhampton': { primary: '#FDB913', secondary: '#231F20', tertiary: '#FFFFFF' },
  'wolverhampton-wanderers': { primary: '#FDB913', secondary: '#231F20', tertiary: '#FFFFFF' },
  'wolverhampton wanderers': { primary: '#FDB913', secondary: '#231F20', tertiary: '#FFFFFF' },

  // ── ENGLISH CHAMPIONSHIP / OTHER UK ──
  'leeds-united': { primary: '#1D428A', secondary: '#FFCD00', tertiary: '#FFFFFF' },
  'leeds united': { primary: '#1D428A', secondary: '#FFCD00', tertiary: '#FFFFFF' },
  'burnley': { primary: '#6C1D45', secondary: '#99D6EA', tertiary: '#FEE100' },
  'sunderland': { primary: '#EB172B', secondary: '#FFFFFF', tertiary: '#000000' },
  'sheffield-united': { primary: '#EE2737', secondary: '#000000', tertiary: '#FFCD00' },
  'sheffield united': { primary: '#EE2737', secondary: '#000000', tertiary: '#FFCD00' },
  'norwich-city': { primary: '#FFF200', secondary: '#00A651', tertiary: '#000000' },
  'norwich city': { primary: '#FFF200', secondary: '#00A651', tertiary: '#000000' },
  'watford': { primary: '#FBEE23', secondary: '#ED2127', tertiary: '#231F20' },
  'celtic': { primary: '#018749', secondary: '#FFFFFF', tertiary: '#FFCD00' },
  'rangers': { primary: '#1B458F', secondary: '#DA291C', tertiary: '#FFFFFF' },

  // ── SPANISH LA LIGA ──
  'real-madrid': { primary: '#0C2340', secondary: '#FEBE10', tertiary: '#FFFFFF' },
  'real madrid': { primary: '#0C2340', secondary: '#FEBE10', tertiary: '#FFFFFF' },
  'barcelona': { primary: '#A50044', secondary: '#004D98', tertiary: '#EDBB00' },
  'fc-barcelona': { primary: '#A50044', secondary: '#004D98', tertiary: '#EDBB00' },
  'fc barcelona': { primary: '#A50044', secondary: '#004D98', tertiary: '#EDBB00' },
  'atletico-madrid': { primary: '#CB3524', secondary: '#272E61', tertiary: '#FFFFFF' },
  'atletico madrid': { primary: '#CB3524', secondary: '#272E61', tertiary: '#FFFFFF' },
  'athletic-club': { primary: '#EE2524', secondary: '#000000', tertiary: '#FFFFFF' },
  'athletic club': { primary: '#EE2524', secondary: '#000000', tertiary: '#FFFFFF' },
  'athletic-bilbao': { primary: '#EE2524', secondary: '#000000', tertiary: '#FFFFFF' },
  'athletic bilbao': { primary: '#EE2524', secondary: '#000000', tertiary: '#FFFFFF' },
  'sevilla': { primary: '#F43333', secondary: '#FFFFFF', tertiary: '#1A1A1A' },
  'sevilla-fc': { primary: '#F43333', secondary: '#FFFFFF', tertiary: '#1A1A1A' },
  'sevilla fc': { primary: '#F43333', secondary: '#FFFFFF', tertiary: '#1A1A1A' },
  'real-betis': { primary: '#00954C', secondary: '#FFFFFF', tertiary: '#FFB81C' },
  'real betis': { primary: '#00954C', secondary: '#FFFFFF', tertiary: '#FFB81C' },
  'real-sociedad': { primary: '#0067B1', secondary: '#FFFFFF', tertiary: '#E30613' },
  'real sociedad': { primary: '#0067B1', secondary: '#FFFFFF', tertiary: '#E30613' },
  'villarreal': { primary: '#FFE600', secondary: '#005DAA', tertiary: '#002B49' },
  'valencia': { primary: '#EE3524', secondary: '#000000', tertiary: '#FF8300' },
  'girona': { primary: '#CD1318', secondary: '#FFFFFF', tertiary: '#002F6C' },
  'celta-vigo': { primary: '#8AC3EE', secondary: '#C8102E', tertiary: '#FFFFFF' },
  'celta vigo': { primary: '#8AC3EE', secondary: '#C8102E', tertiary: '#FFFFFF' },
  'osasuna': { primary: '#0A1E40', secondary: '#BA0C2F', tertiary: '#FFFFFF' },
  'getafe': { primary: '#00529F', secondary: '#FFFFFF', tertiary: '#E30613' },
  'mallorca': { primary: '#E30613', secondary: '#000000', tertiary: '#FFE600' },
  'rayo-vallecano': { primary: '#E30613', secondary: '#FFFFFF', tertiary: '#000000' },
  'rayo vallecano': { primary: '#E30613', secondary: '#FFFFFF', tertiary: '#000000' },
  'alaves': { primary: '#0055A5', secondary: '#FFFFFF', tertiary: '#000000' },
  'deportivo-alaves': { primary: '#0055A5', secondary: '#FFFFFF', tertiary: '#000000' },
  'las-palmas': { primary: '#FFD700', secondary: '#005BA6', tertiary: '#FFFFFF' },
  'espanyol': { primary: '#0070B8', secondary: '#FFFFFF', tertiary: '#DA291C' },
  'leganes': { primary: '#005BA6', secondary: '#FFFFFF', tertiary: '#002B49' },
  'valladolid': { primary: '#5E2750', secondary: '#FFFFFF', tertiary: '#FEBE10' },

  // ── GERMAN BUNDESLIGA ──
  'bayern-munich': { primary: '#DC052D', secondary: '#0066B2', tertiary: '#FFFFFF' },
  'bayern munich': { primary: '#DC052D', secondary: '#0066B2', tertiary: '#FFFFFF' },
  'fc-bayern': { primary: '#DC052D', secondary: '#0066B2', tertiary: '#FFFFFF' },
  'borussia-dortmund': { primary: '#FDE100', secondary: '#000000', tertiary: '#FFFFFF' },
  'borussia dortmund': { primary: '#FDE100', secondary: '#000000', tertiary: '#FFFFFF' },
  'dortmund': { primary: '#FDE100', secondary: '#000000', tertiary: '#FFFFFF' },
  'bvb': { primary: '#FDE100', secondary: '#000000', tertiary: '#FFFFFF' },
  'bayer-leverkusen': { primary: '#E32221', secondary: '#000000', tertiary: '#FFCC00' },
  'bayer leverkusen': { primary: '#E32221', secondary: '#000000', tertiary: '#FFCC00' },
  'leverkusen': { primary: '#E32221', secondary: '#000000', tertiary: '#FFCC00' },
  'rb-leipzig': { primary: '#DA020E', secondary: '#0C2340', tertiary: '#FFCC00' },
  'rb leipzig': { primary: '#DA020E', secondary: '#0C2340', tertiary: '#FFCC00' },
  'eintracht-frankfurt': { primary: '#E1000F', secondary: '#000000', tertiary: '#FFFFFF' },
  'eintracht frankfurt': { primary: '#E1000F', secondary: '#000000', tertiary: '#FFFFFF' },
  'stuttgart': { primary: '#E30613', secondary: '#FFFFFF', tertiary: '#FDB913' },
  'vfb-stuttgart': { primary: '#E30613', secondary: '#FFFFFF', tertiary: '#FDB913' },
  'vfb stuttgart': { primary: '#E30613', secondary: '#FFFFFF', tertiary: '#FDB913' },
  'wolfsburg': { primary: '#65B32E', secondary: '#FFFFFF', tertiary: '#002B49' },
  'vfl-wolfsburg': { primary: '#65B32E', secondary: '#FFFFFF', tertiary: '#002B49' },
  'borussia-monchengladbach': { primary: '#000000', secondary: '#19A347', tertiary: '#FFFFFF' },
  'borussia monchengladbach': { primary: '#000000', secondary: '#19A347', tertiary: '#FFFFFF' },
  'mgladbach': { primary: '#000000', secondary: '#19A347', tertiary: '#FFFFFF' },
  'freiburg': { primary: '#000000', secondary: '#D11218', tertiary: '#FFFFFF' },
  'sc-freiburg': { primary: '#000000', secondary: '#D11218', tertiary: '#FFFFFF' },
  'werder-bremen': { primary: '#1D9053', secondary: '#FFFFFF', tertiary: '#E35205' },
  'werder bremen': { primary: '#1D9053', secondary: '#FFFFFF', tertiary: '#E35205' },
  'augsburg': { primary: '#BA122B', secondary: '#006538', tertiary: '#FFFFFF' },
  'fc-augsburg': { primary: '#BA122B', secondary: '#006538', tertiary: '#FFFFFF' },
  'mainz': { primary: '#C8102E', secondary: '#FFFFFF', tertiary: '#FFCD00' },
  'mainz-05': { primary: '#C8102E', secondary: '#FFFFFF', tertiary: '#FFCD00' },
  'fsv-mainz-05': { primary: '#C8102E', secondary: '#FFFFFF', tertiary: '#FFCD00' },
  'union-berlin': { primary: '#D4001F', secondary: '#FFCC00', tertiary: '#FFFFFF' },
  'union berlin': { primary: '#D4001F', secondary: '#FFCC00', tertiary: '#FFFFFF' },
  'heidenheim': { primary: '#004B93', secondary: '#E30613', tertiary: '#FFFFFF' },
  'bochum': { primary: '#005CA9', secondary: '#FFFFFF', tertiary: '#002B49' },
  'st-pauli': { primary: '#654321', secondary: '#FFFFFF', tertiary: '#E30613' },
  'holstein-kiel': { primary: '#004B93', secondary: '#E30613', tertiary: '#FFFFFF' },
  'cologne': { primary: '#D81E05', secondary: '#FFFFFF', tertiary: '#000000' },
  'fc-cologne': { primary: '#D81E05', secondary: '#FFFFFF', tertiary: '#000000' },
  'fc cologne': { primary: '#D81E05', secondary: '#FFFFFF', tertiary: '#000000' },
  'koln': { primary: '#D81E05', secondary: '#FFFFFF', tertiary: '#000000' },
  'köln': { primary: '#D81E05', secondary: '#FFFFFF', tertiary: '#000000' },
  '1-fc-koln': { primary: '#D81E05', secondary: '#FFFFFF', tertiary: '#000000' },
  '1. fc köln': { primary: '#D81E05', secondary: '#FFFFFF', tertiary: '#000000' },

  // ── ITALIAN SERIE A ──
  'juventus': { primary: '#000000', secondary: '#FFFFFF', tertiary: '#FEE100' },
  'inter': { primary: '#010E80', secondary: '#000000', tertiary: '#F9B233' },
  'inter-milan': { primary: '#010E80', secondary: '#000000', tertiary: '#F9B233' },
  'inter milan': { primary: '#010E80', secondary: '#000000', tertiary: '#F9B233' },
  'milan': { primary: '#FB090B', secondary: '#000000', tertiary: '#FFFFFF' },
  'ac-milan': { primary: '#FB090B', secondary: '#000000', tertiary: '#FFFFFF' },
  'ac milan': { primary: '#FB090B', secondary: '#000000', tertiary: '#FFFFFF' },
  'napoli': { primary: '#008FD5', secondary: '#FFFFFF', tertiary: '#002B49' },
  'roma': { primary: '#8E1F2F', secondary: '#F0BC42', tertiary: '#FFFFFF' },
  'as-roma': { primary: '#8E1F2F', secondary: '#F0BC42', tertiary: '#FFFFFF' },
  'as roma': { primary: '#8E1F2F', secondary: '#F0BC42', tertiary: '#FFFFFF' },
  'lazio': { primary: '#87D8F7', secondary: '#FFFFFF', tertiary: '#002F6C' },
  'ss-lazio': { primary: '#87D8F7', secondary: '#FFFFFF', tertiary: '#002F6C' },
  'ss lazio': { primary: '#87D8F7', secondary: '#FFFFFF', tertiary: '#002F6C' },
  'atalanta': { primary: '#1E71B8', secondary: '#000000', tertiary: '#FFFFFF' },
  'fiorentina': { primary: '#4F2683', secondary: '#FFFFFF', tertiary: '#E30613' },
  'bologna': { primary: '#1B2C55', secondary: '#9B111E', tertiary: '#FFFFFF' },
  'torino': { primary: '#8B0000', secondary: '#FFFFFF', tertiary: '#1B2C55' },
  'udinese': { primary: '#000000', secondary: '#FFFFFF', tertiary: '#FDB913' },
  'genoa': { primary: '#9B1B30', secondary: '#0A2240', tertiary: '#FFFFFF' },
  'parma': { primary: '#003399', secondary: '#FFCC00', tertiary: '#FFFFFF' },
  'cagliari': { primary: '#990000', secondary: '#002B49', tertiary: '#FFFFFF' },
  'empoli': { primary: '#005BA6', secondary: '#FFFFFF', tertiary: '#002B49' },
  'monza': { primary: '#E30613', secondary: '#FFFFFF', tertiary: '#000000' },
  'como': { primary: '#004B93', secondary: '#FFFFFF', tertiary: '#002B49' },
  'lecce': { primary: '#FECC00', secondary: '#C8102E', tertiary: '#003399' },
  'verona': { primary: '#002B49', secondary: '#FFCC00', tertiary: '#FFFFFF' },
  'hellas-verona': { primary: '#002B49', secondary: '#FFCC00', tertiary: '#FFFFFF' },
  'venezia': { primary: '#E35205', secondary: '#007A3D', tertiary: '#000000' },

  // ── FRENCH LIGUE 1 ──
  'psg': { primary: '#004170', secondary: '#DA291C', tertiary: '#FFFFFF' },
  'paris-saint-germain': { primary: '#004170', secondary: '#DA291C', tertiary: '#FFFFFF' },
  'paris saint-germain': { primary: '#004170', secondary: '#DA291C', tertiary: '#FFFFFF' },
  'paris saint germain': { primary: '#004170', secondary: '#DA291C', tertiary: '#FFFFFF' },
  'marseille': { primary: '#00A3E0', secondary: '#FFFFFF', tertiary: '#C9920E' },
  'olympique-marseille': { primary: '#00A3E0', secondary: '#FFFFFF', tertiary: '#C9920E' },
  'monaco': { primary: '#E51B24', secondary: '#FFFFFF', tertiary: '#D4AF37' },
  'as-monaco': { primary: '#E51B24', secondary: '#FFFFFF', tertiary: '#D4AF37' },
  'lyon': { primary: '#1B458F', secondary: '#DA291C', tertiary: '#D4AF37' },
  'olympique-lyonnais': { primary: '#1B458F', secondary: '#DA291C', tertiary: '#D4AF37' },
  'lille': { primary: '#E01E2B', secondary: '#1B2C55', tertiary: '#FFFFFF' },
  'losc': { primary: '#E01E2B', secondary: '#1B2C55', tertiary: '#FFFFFF' },
  'losc-lille': { primary: '#E01E2B', secondary: '#1B2C55', tertiary: '#FFFFFF' },
  'nice': { primary: '#E30613', secondary: '#000000', tertiary: '#D4AF37' },
  'ogc-nice': { primary: '#E30613', secondary: '#000000', tertiary: '#D4AF37' },
  'lens': { primary: '#ED1B24', secondary: '#FFCC00', tertiary: '#000000' },
  'rc-lens': { primary: '#ED1B24', secondary: '#FFCC00', tertiary: '#000000' },
  'rennes': { primary: '#E30613', secondary: '#000000', tertiary: '#FFFFFF' },
  'stade-rennais': { primary: '#E30613', secondary: '#000000', tertiary: '#FFFFFF' },
  'strasbourg': { primary: '#005BA6', secondary: '#FFFFFF', tertiary: '#E30613' },
  'rc-strasbourg': { primary: '#005BA6', secondary: '#FFFFFF', tertiary: '#E30613' },
  'toulouse': { primary: '#4F2683', secondary: '#FFFFFF', tertiary: '#FDB913' },
  'toulouse-fc': { primary: '#4F2683', secondary: '#FFFFFF', tertiary: '#FDB913' },
  'nantes': { primary: '#FFF200', secondary: '#00954C', tertiary: '#000000' },
  'fc-nantes': { primary: '#FFF200', secondary: '#00954C', tertiary: '#000000' },
  'brest': { primary: '#E30613', secondary: '#FFFFFF', tertiary: '#002B49' },
  'stade-brestois': { primary: '#E30613', secondary: '#FFFFFF', tertiary: '#002B49' },
  'reims': { primary: '#E30613', secondary: '#FFFFFF', tertiary: '#D4AF37' },
  'stade-de-reims': { primary: '#E30613', secondary: '#FFFFFF', tertiary: '#D4AF37' },
  'montpellier': { primary: '#FF4D00', secondary: '#00205B', tertiary: '#FFFFFF' },
  'auxerre': { primary: '#005BA6', secondary: '#FFFFFF', tertiary: '#002B49' },
  'saint-etienne': { primary: '#008744', secondary: '#FFFFFF', tertiary: '#002B49' },
  'le-havre': { primary: '#004B93', secondary: '#87D8F7', tertiary: '#FFFFFF' },

  // ── OTHER EUROPEAN POWERHOUSES ──
  'ajax': { primary: '#D2122E', secondary: '#FFFFFF', tertiary: '#000000' },
  'afc-ajax': { primary: '#D2122E', secondary: '#FFFFFF', tertiary: '#000000' },
  'psv': { primary: '#EE1C25', secondary: '#FFFFFF', tertiary: '#000000' },
  'psv-eindhoven': { primary: '#EE1C25', secondary: '#FFFFFF', tertiary: '#000000' },
  'feyenoord': { primary: '#E30613', secondary: '#FFFFFF', tertiary: '#000000' },
  'benfica': { primary: '#E30613', secondary: '#FFFFFF', tertiary: '#FFCD00' },
  'sl-benfica': { primary: '#E30613', secondary: '#FFFFFF', tertiary: '#FFCD00' },
  'porto': { primary: '#003399', secondary: '#FFFFFF', tertiary: '#E30613' },
  'fc-porto': { primary: '#003399', secondary: '#FFFFFF', tertiary: '#E30613' },
  'sporting': { primary: '#008057', secondary: '#FFFFFF', tertiary: '#FFCC00' },
  'sporting-cp': { primary: '#008057', secondary: '#FFFFFF', tertiary: '#FFCC00' },
  'sporting cp': { primary: '#008057', secondary: '#FFFFFF', tertiary: '#FFCC00' },
  'galatasaray': { primary: '#A90432', secondary: '#FDB912', tertiary: '#000000' },
  'fenerbahce': { primary: '#002D72', secondary: '#FFF200', tertiary: '#FFFFFF' },
  'besiktas': { primary: '#000000', secondary: '#FFFFFF', tertiary: '#E30613' },

  // ── INTERNATIONAL & OTHER LEAGUES ──
  'al-nassr': { primary: '#FEE100', secondary: '#003399', tertiary: '#FFFFFF' },
  'al nassr': { primary: '#FEE100', secondary: '#003399', tertiary: '#FFFFFF' },
  'al-hilal': { primary: '#00529F', secondary: '#FFFFFF', tertiary: '#002244' },
  'al hilal': { primary: '#00529F', secondary: '#FFFFFF', tertiary: '#002244' },
  'al-ittihad': { primary: '#FEE100', secondary: '#000000', tertiary: '#FFFFFF' },
  'inter-miami': { primary: '#F7B5CD', secondary: '#231F20', tertiary: '#FFFFFF' },
  'inter miami': { primary: '#F7B5CD', secondary: '#231F20', tertiary: '#FFFFFF' },
  'lafc': { primary: '#000000', secondary: '#C39E66', tertiary: '#FFFFFF' },
  'la-galaxy': { primary: '#00245D', secondary: '#FFD200', tertiary: '#FFFFFF' },

  // ── NATIONAL TEAMS ──
  'england': { primary: '#002B49', secondary: '#CF0820', tertiary: '#FFFFFF' },
  'france': { primary: '#002654', secondary: '#ED2939', tertiary: '#FFFFFF' },
  'germany': { primary: '#000000', secondary: '#DD0000', tertiary: '#FFCE00' },
  'spain': { primary: '#C60B1E', secondary: '#FFC400', tertiary: '#002B49' },
  'italy': { primary: '#0047AB', secondary: '#FFFFFF', tertiary: '#008C45' },
  'brazil': { primary: '#FFDF00', secondary: '#009739', tertiary: '#002776' },
  'argentina': { primary: '#75AADB', secondary: '#FFFFFF', tertiary: '#000000' },
  'portugal': { primary: '#DA291C', secondary: '#006600', tertiary: '#FFD700' },
  'netherlands': { primary: '#F36C21', secondary: '#FFFFFF', tertiary: '#21468B' },
  'belgium': { primary: '#E30613', secondary: '#000000', tertiary: '#FFD700' },
  'usa': { primary: '#002868', secondary: '#BF0A30', tertiary: '#FFFFFF' },

  // ── NBA BASKETBALL ──
  'lakers': { primary: '#552583', secondary: '#FDB927', tertiary: '#000000' },
  'los angeles lakers': { primary: '#552583', secondary: '#FDB927', tertiary: '#000000' },
  'warriors': { primary: '#1D428A', secondary: '#FFC72C', tertiary: '#FFFFFF' },
  'golden state warriors': { primary: '#1D428A', secondary: '#FFC72C', tertiary: '#FFFFFF' },
  'celtics': { primary: '#007A33', secondary: '#BA9653', tertiary: '#000000' },
  'boston celtics': { primary: '#007A33', secondary: '#BA9653', tertiary: '#000000' },
  'bulls': { primary: '#CE1141', secondary: '#000000', tertiary: '#FFFFFF' },
  'chicago bulls': { primary: '#CE1141', secondary: '#000000', tertiary: '#FFFFFF' },
  'heat': { primary: '#98002E', secondary: '#F9A01B', tertiary: '#000000' },
  'miami heat': { primary: '#98002E', secondary: '#F9A01B', tertiary: '#000000' },
  'knicks': { primary: '#006BB6', secondary: '#F58426', tertiary: '#000000' },
  'new york knicks': { primary: '#006BB6', secondary: '#F58426', tertiary: '#000000' },
  'mavericks': { primary: '#00538C', secondary: '#002B5E', tertiary: '#B8C4CA' },
  'dallas mavericks': { primary: '#00538C', secondary: '#002B5E', tertiary: '#B8C4CA' },
  '76ers': { primary: '#006BB6', secondary: '#ED174C', tertiary: '#002B5C' },
  'philadelphia 76ers': { primary: '#006BB6', secondary: '#ED174C', tertiary: '#002B5C' },
  'suns': { primary: '#1D1160', secondary: '#E56020', tertiary: '#63727A' },
  'phoenix suns': { primary: '#1D1160', secondary: '#E56020', tertiary: '#63727A' },
  'bucks': { primary: '#00471B', secondary: '#EEE1C6', tertiary: '#0077C0' },
  'milwaukee bucks': { primary: '#00471B', secondary: '#EEE1C6', tertiary: '#0077C0' },
  'nuggets': { primary: '#0E2240', secondary: '#FEC524', tertiary: '#8B2131' },
  'denver nuggets': { primary: '#0E2240', secondary: '#FEC524', tertiary: '#8B2131' },
  'clippers': { primary: '#C8102E', secondary: '#1D428A', tertiary: '#000000' },
  'la clippers': { primary: '#C8102E', secondary: '#1D428A', tertiary: '#000000' },
  'nets': { primary: '#000000', secondary: '#FFFFFF', tertiary: '#707271' },
  'brooklyn nets': { primary: '#000000', secondary: '#FFFFFF', tertiary: '#707271' },
  'cavaliers': { primary: '#860038', secondary: '#041E42', tertiary: '#FDBB30' },
  'cleveland cavaliers': { primary: '#860038', secondary: '#041E42', tertiary: '#FDBB30' },
  'raptors': { primary: '#CE1141', secondary: '#000000', tertiary: '#A1A1A4' },
  'toronto raptors': { primary: '#CE1141', secondary: '#000000', tertiary: '#A1A1A4' },
  'san antonio spurs': { primary: '#000000', secondary: '#8A8D8F', tertiary: '#FFFFFF' },
  'san antonio': { primary: '#000000', secondary: '#8A8D8F', tertiary: '#FFFFFF' },
  'thunder': { primary: '#007AC1', secondary: '#EF3B24', tertiary: '#FDBB30' },
  'oklahoma city thunder': { primary: '#007AC1', secondary: '#EF3B24', tertiary: '#FDBB30' },
  'pacers': { primary: '#002D62', secondary: '#FDBB30', tertiary: '#BEC0C2' },
  'indiana pacers': { primary: '#002D62', secondary: '#FDBB30', tertiary: '#BEC0C2' },
  'timberwolves': { primary: '#0C2340', secondary: '#236192', tertiary: '#78BE20' },
  'minnesota timberwolves': { primary: '#0C2340', secondary: '#236192', tertiary: '#78BE20' },
  'rockets': { primary: '#CE1141', secondary: '#000000', tertiary: '#C4CED4' },
  'houston rockets': { primary: '#CE1141', secondary: '#000000', tertiary: '#C4CED4' },
  'hawks': { primary: '#E03A3E', secondary: '#C1D32F', tertiary: '#26282A' },
  'atlanta hawks': { primary: '#E03A3E', secondary: '#C1D32F', tertiary: '#26282A' },
  'grizzlies': { primary: '#5D76A9', secondary: '#12173F', tertiary: '#F5B112' },
  'memphis grizzlies': { primary: '#5D76A9', secondary: '#12173F', tertiary: '#F5B112' },
  'pelicans': { primary: '#0C2340', secondary: '#C8102E', tertiary: '#85714D' },
  'new orleans pelicans': { primary: '#0C2340', secondary: '#C8102E', tertiary: '#85714D' },
  'kings': { primary: '#5A2D81', secondary: '#63727A', tertiary: '#000000' },
  'sacramento kings': { primary: '#5A2D81', secondary: '#63727A', tertiary: '#000000' },
  'magic': { primary: '#0077C0', secondary: '#C4CED4', tertiary: '#000000' },
  'orlando magic': { primary: '#0077C0', secondary: '#C4CED4', tertiary: '#000000' },
  'trail-blazers': { primary: '#E03A3E', secondary: '#000000', tertiary: '#BAC3C9' },
  'trail blazers': { primary: '#E03A3E', secondary: '#000000', tertiary: '#BAC3C9' },
  'portland trail blazers': { primary: '#E03A3E', secondary: '#000000', tertiary: '#BAC3C9' },
  'jazz': { primary: '#002B5C', secondary: '#00471B', tertiary: '#F9A01B' },
  'utah jazz': { primary: '#002B5C', secondary: '#00471B', tertiary: '#F9A01B' },
  'wizards': { primary: '#002B5C', secondary: '#E31837', tertiary: '#C4CED4' },
  'washington wizards': { primary: '#002B5C', secondary: '#E31837', tertiary: '#C4CED4' },
  'pistons': { primary: '#1D42BA', secondary: '#C8102E', tertiary: '#BEC0C2' },
  'detroit pistons': { primary: '#1D42BA', secondary: '#C8102E', tertiary: '#BEC0C2' },
  'hornets': { primary: '#1D1160', secondary: '#00788C', tertiary: '#A1A1A4' },
  'charlotte hornets': { primary: '#1D1160', secondary: '#00788C', tertiary: '#A1A1A4' },

  // ── NFL AMERICAN FOOTBALL ──
  'chiefs': { primary: '#E31837', secondary: '#FFB81C', tertiary: '#FFFFFF' },
  'kansas city chiefs': { primary: '#E31837', secondary: '#FFB81C', tertiary: '#FFFFFF' },
  '49ers': { primary: '#AA0000', secondary: '#B3995D', tertiary: '#FFFFFF' },
  'san francisco 49ers': { primary: '#AA0000', secondary: '#B3995D', tertiary: '#FFFFFF' },
  'eagles': { primary: '#004C54', secondary: '#A5ACAF', tertiary: '#000000' },
  'philadelphia eagles': { primary: '#004C54', secondary: '#A5ACAF', tertiary: '#000000' },
  'cowboys': { primary: '#003594', secondary: '#041E42', tertiary: '#869397' },
  'dallas cowboys': { primary: '#003594', secondary: '#041E42', tertiary: '#869397' },
  'packers': { primary: '#203731', secondary: '#FFB612', tertiary: '#FFFFFF' },
  'green bay packers': { primary: '#203731', secondary: '#FFB612', tertiary: '#FFFFFF' },
  'bills': { primary: '#00338D', secondary: '#C60C30', tertiary: '#FFFFFF' },
  'buffalo bills': { primary: '#00338D', secondary: '#C60C30', tertiary: '#FFFFFF' },
  'ravens': { primary: '#241773', secondary: '#000000', tertiary: '#9E7C0C' },
  'baltimore ravens': { primary: '#241773', secondary: '#000000', tertiary: '#9E7C0C' },
  'lions': { primary: '#0076B6', secondary: '#B0B7BC', tertiary: '#000000' },
  'detroit lions': { primary: '#0076B6', secondary: '#B0B7BC', tertiary: '#000000' },
  'bengals': { primary: '#FB4F14', secondary: '#000000', tertiary: '#FFFFFF' },
  'cincinnati bengals': { primary: '#FB4F14', secondary: '#000000', tertiary: '#FFFFFF' },
  'dolphins': { primary: '#008E97', secondary: '#FC4C02', tertiary: '#005778' },
  'miami dolphins': { primary: '#008E97', secondary: '#FC4C02', tertiary: '#005778' },
  'patriots': { primary: '#002244', secondary: '#C60C30', tertiary: '#B0B7BC' },
  'new england patriots': { primary: '#002244', secondary: '#C60C30', tertiary: '#B0B7BC' },
  'steelers': { primary: '#FFB612', secondary: '#101820', tertiary: '#FFFFFF' },
  'pittsburgh steelers': { primary: '#FFB612', secondary: '#101820', tertiary: '#FFFFFF' },
  'texans': { primary: '#03202F', secondary: '#A71930', tertiary: '#FFFFFF' },
  'houston texans': { primary: '#03202F', secondary: '#A71930', tertiary: '#FFFFFF' },
  'buccaneers': { primary: '#D50A0A', secondary: '#0A0A08', tertiary: '#FF7900' },
  'tampa bay buccaneers': { primary: '#D50A0A', secondary: '#0A0A08', tertiary: '#FF7900' },
  'broncos': { primary: '#FB4F14', secondary: '#002244', tertiary: '#FFFFFF' },
  'denver broncos': { primary: '#FB4F14', secondary: '#002244', tertiary: '#FFFFFF' },
  'chargers': { primary: '#0080C6', secondary: '#FFC20E', tertiary: '#FFFFFF' },
  'los angeles chargers': { primary: '#0080C6', secondary: '#FFC20E', tertiary: '#FFFFFF' },
  'seahawks': { primary: '#002244', secondary: '#69BE28', tertiary: '#A5ACAF' },
  'seattle seahawks': { primary: '#002244', secondary: '#69BE28', tertiary: '#A5ACAF' },
  'rams': { primary: '#003594', secondary: '#FFA300', tertiary: '#FFD100' },
  'los angeles rams': { primary: '#003594', secondary: '#FFA300', tertiary: '#FFD100' },
  'raiders': { primary: '#000000', secondary: '#A5ACAF', tertiary: '#FFFFFF' },
  'las vegas raiders': { primary: '#000000', secondary: '#A5ACAF', tertiary: '#FFFFFF' },
  'bears': { primary: '#0B162A', secondary: '#C83803', tertiary: '#FFFFFF' },
  'chicago bears': { primary: '#0B162A', secondary: '#C83803', tertiary: '#FFFFFF' },
  'vikings': { primary: '#4F2683', secondary: '#FFC62F', tertiary: '#FFFFFF' },
  'minnesota vikings': { primary: '#4F2683', secondary: '#FFC62F', tertiary: '#FFFFFF' },

  // ── NHL HOCKEY ──
  'ny rangers': { primary: '#0038A8', secondary: '#CE1126', tertiary: '#FFFFFF' },
  'new york rangers': { primary: '#0038A8', secondary: '#CE1126', tertiary: '#FFFFFF' },
  'maple-leafs': { primary: '#00205B', secondary: '#FFFFFF', tertiary: '#000000' },
  'maple leafs': { primary: '#00205B', secondary: '#FFFFFF', tertiary: '#000000' },
  'toronto maple leafs': { primary: '#00205B', secondary: '#FFFFFF', tertiary: '#000000' },
  'bruins': { primary: '#FFB81C', secondary: '#000000', tertiary: '#FFFFFF' },
  'boston bruins': { primary: '#FFB81C', secondary: '#000000', tertiary: '#FFFFFF' },
  'canadiens': { primary: '#AF1E2D', secondary: '#192168', tertiary: '#FFFFFF' },
  'montreal canadiens': { primary: '#AF1E2D', secondary: '#192168', tertiary: '#FFFFFF' },
  'blackhawks': { primary: '#CF0A2C', secondary: '#000000', tertiary: '#FFD100' },
  'chicago blackhawks': { primary: '#CF0A2C', secondary: '#000000', tertiary: '#FFD100' },
  'oilers': { primary: '#041E42', secondary: '#FF4C00', tertiary: '#FFFFFF' },
  'edmonton oilers': { primary: '#041E42', secondary: '#FF4C00', tertiary: '#FFFFFF' },

  // ── NCAA / COLLEGE ATHLETICS ──
  'usc': { primary: '#990000', secondary: '#FFC72C', tertiary: '#FFFFFF' },
  'usc trojans': { primary: '#990000', secondary: '#FFC72C', tertiary: '#FFFFFF' },
  'ucla': { primary: '#2D68C4', secondary: '#F2A900', tertiary: '#FFFFFF' },
  'ucla bruins': { primary: '#2D68C4', secondary: '#F2A900', tertiary: '#FFFFFF' },
  'michigan': { primary: '#00274C', secondary: '#FFCB05', tertiary: '#FFFFFF' },
  'alabama': { primary: '#9E1B32', secondary: '#FFFFFF', tertiary: '#828A8F' },
  'ohio-state': { primary: '#BB0000', secondary: '#666666', tertiary: '#FFFFFF' },
  'ohio state': { primary: '#BB0000', secondary: '#666666', tertiary: '#FFFFFF' },
  'texas': { primary: '#BF5700', secondary: '#FFFFFF', tertiary: '#333F48' },
  'duke': { primary: '#003087', secondary: '#FFFFFF', tertiary: '#001A4A' },
  'north-carolina': { primary: '#7BAFD4', secondary: '#FFFFFF', tertiary: '#13294B' },
  'north carolina': { primary: '#7BAFD4', secondary: '#FFFFFF', tertiary: '#13294B' },
  'unc': { primary: '#7BAFD4', secondary: '#FFFFFF', tertiary: '#13294B' },
  'kentucky': { primary: '#0033A0', secondary: '#FFFFFF', tertiary: '#000000' },
  'kansas': { primary: '#0051BA', secondary: '#E8000D', tertiary: '#FFC82D' },
  'uconn': { primary: '#000E2F', secondary: '#E03A3E', tertiary: '#798591' },
};

// Restrained neutral tones for visual collision separation
export const NEUTRAL_LIGHT = '#F4F5F7';
export const NEUTRAL_DARK = '#1E1B2E';

/**
 * Normalizes a team name or ID for consistent dictionary lookup.
 */
export function normalizeTeamKey(nameOrId?: string): string {
  if (!nameOrId) return '';
  return nameOrId
    .toLowerCase()
    .replace(/^team-/, '')
    .replace(/^(fc|cf|sc|afc|ss|as|ac|rcd|rc|cd|ud|sd|bsc|tsv|vfb|vfl|fsv|spvg)\s+/gi, '')
    .replace(/\s+(fc|cf|sc|afc|club|women|ladies|men|wfc)\b/gi, '')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Converts a hex color (#RRGGBB) to sRGB [0-1].
 */
function hexToRgb(hex: string): [number, number, number] {
  const c = hex.replace('#', '').trim();
  if (c.length !== 6) return [0, 0, 0];
  return [
    parseInt(c.substring(0, 2), 16) / 255,
    parseInt(c.substring(2, 4), 16) / 255,
    parseInt(c.substring(4, 6), 16) / 255,
  ];
}

/**
 * Converts sRGB channel to linear RGB.
 */
function srgbToLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/**
 * Computes standard relative luminance (WCAG formula).
 */
export function getRelativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex);
  const rLin = srgbToLinear(r);
  const gLin = srgbToLinear(g);
  const bLin = srgbToLinear(b);
  return 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin;
}

/**
 * Computes WCAG contrast ratio between two hex colors (1 to 21).
 */
export function getContrastRatio(hexA: string, hexB: string): number {
  const l1 = getRelativeLuminance(hexA);
  const l2 = getRelativeLuminance(hexB);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Converts linear RGB to CIELAB (D65 standard illuminant).
 */
function rgbToLab(hex: string): [number, number, number] {
  const [r, g, b] = hexToRgb(hex);
  const rL = srgbToLinear(r);
  const gL = srgbToLinear(g);
  const bL = srgbToLinear(b);

  // D65 reference white
  let x = rL * 0.4124 + gL * 0.3576 + bL * 0.1805;
  let y = rL * 0.2126 + gL * 0.7152 + bL * 0.0722;
  let z = rL * 0.0193 + gL * 0.1192 + bL * 0.9505;

  x /= 0.95047;
  y /= 1.0;
  z /= 1.08883;

  const f = (t: number) => (t > 0.008856 ? Math.pow(t, 1 / 3) : 7.787 * t + 16 / 116);
  const fx = f(x);
  const fy = f(y);
  const fz = f(z);

  const L = 116 * fy - 16;
  const a = 500 * (fx - fy);
  const bStar = 200 * (fy - fz);

  return [L, a, bStar];
}

/**
 * Calculates CIE76 Delta E perceptual color difference.
 * In color science:
 * - Delta E < 2: Barely perceptible
 * - Delta E 2 to 10: Perceptible at glance
 * - Delta E 11 to 25: Similar color family
 * - Delta E >= 26: Visually distinct, contrasting colors
 */
export function calculateDeltaE(hexA: string, hexB: string): number {
  if (hexA.toLowerCase() === hexB.toLowerCase()) return 0;
  const [l1, a1, b1] = rgbToLab(hexA);
  const [l2, a2, b2] = rgbToLab(hexB);
  return Math.sqrt(Math.pow(l1 - l2, 2) + Math.pow(a1 - a2, 2) + Math.pow(b1 - b2, 2));
}

/**
 * Computes hue angle in degrees [0, 360).
 */
function getHueAngle(hex: string): number {
  const [r, g, b] = hexToRgb(hex);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === min) return 0;
  let h = 0;
  const d = max - min;
  if (max === r) {
    h = (g - b) / d + (g < b ? 6 : 0);
  } else if (max === g) {
    h = (b - r) / d + 2;
  } else {
    h = (r - g) / d + 4;
  }
  return h * 60;
}

/**
 * Determines whether two colors collide visually.
 * Evaluates both CIELAB Delta E and hue-contrast relationship:
 * - High collision if Delta E < 26
 * - Or if colors share close hue (< 30 deg) with low luminance contrast (< 1.8)
 */
export function areColorsColliding(colorA: string, colorB: string): boolean {
  if (!colorA || !colorB) return false;
  if (colorA.toLowerCase() === colorB.toLowerCase()) return true;

  const deltaE = calculateDeltaE(colorA, colorB);
  if (deltaE < 26) {
    return true;
  }

  // Hue family check (e.g. two reds or two blues with low contrast)
  const h1 = getHueAngle(colorA);
  const h2 = getHueAngle(colorB);
  const hueDiff = Math.abs(h1 - h2);
  const circularHueDiff = Math.min(hueDiff, 360 - hueDiff);

  if (circularHueDiff < 28) {
    const contrast = getContrastRatio(colorA, colorB);
    if (contrast < 1.85) {
      return true;
    }
  }

  return false;
}

/**
 * Generates a stable numeric hash from a string.
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Restrained athletic palette for unmapped teams
const ATHLETIC_PALETTE = [
  '#003399', '#DA291C', '#007A33', '#1D428A', '#552583',
  '#CE1141', '#002B49', '#0057B8', '#E30613', '#670E36',
  '#FFB612', '#008FD5', '#0E2240', '#041E42', '#241F20',
];

/**
 * Resolves verified primary, secondary, and tertiary colors for a single team.
 * Supports team ID or name. Never returns null or undefined.
 */
export function getTeamColorDefinition(teamNameOrId?: string): TeamColorDefinition {
  if (!teamNameOrId) {
    return { primary: '#1E1730', secondary: '#7952FC', tertiary: '#FFFFFF' };
  }

  const rawKey = teamNameOrId.toLowerCase().trim();
  const slug = normalizeTeamKey(teamNameOrId);

  // 1. Direct dictionary match
  if (TEAM_COLORS[slug]) return TEAM_COLORS[slug];
  if (TEAM_COLORS[rawKey]) return TEAM_COLORS[rawKey];

  // 2. Tokenized search for composite names (e.g. "FC Bayern München")
  const sortedKeys = Object.keys(TEAM_COLORS).sort((a, b) => b.length - a.length);
  for (const k of sortedKeys) {
    if (k.length >= 4 && (slug.includes(k) || rawKey.includes(k))) {
      return TEAM_COLORS[k];
    }
  }

  // 3. Deterministic athletic fallback based on team string hash
  const h = hashString(slug || rawKey);
  const primary = ATHLETIC_PALETTE[h % ATHLETIC_PALETTE.length];
  const secondary = ATHLETIC_PALETTE[(h + 5) % ATHLETIC_PALETTE.length];
  const tertiary = '#FFFFFF';

  return { primary, secondary, tertiary };
}

/**
 * Resolves authentic colors for a matchup with scientific collision avoidance.
 * 
 * Multi-Stage Priority Collision Pipeline:
 * 1. Team A Primary vs Team B Primary
 * 2. If clashing -> Team A Primary vs Team B Secondary (if contrast Delta E >= 26)
 * 3. If still clashing -> Team A Primary vs Team B Tertiary / Alternate
 * 4. If still clashing -> Team A Secondary vs Team B Primary
 * 5. If no verified alternate exists -> Restrained athletic neutral tone (#1E1B2E or #F4F5F7)
 *    ensuring distinct, non-random, and broadcast-quality presentation.
 */
export function getMatchupColors(
  homeTeamName?: string,
  awayTeamName?: string,
  homeTeamId?: string,
  awayTeamId?: string
): { homeColor: string; awayColor: string } {
  const homeDef = getTeamColorDefinition(homeTeamId || homeTeamName);
  const awayDef = getTeamColorDefinition(awayTeamId || awayTeamName);

  let homeColor = homeDef.primary;
  let awayColor = awayDef.primary;

  // Collision detection
  if (areColorsColliding(homeColor, awayColor)) {
    // Stage 2: Try Away Secondary Color
    if (awayDef.secondary && !areColorsColliding(homeColor, awayDef.secondary)) {
      awayColor = awayDef.secondary;
    }
    // Stage 3: Try Away Tertiary Color
    else if (awayDef.tertiary && !areColorsColliding(homeColor, awayDef.tertiary)) {
      awayColor = awayDef.tertiary;
    }
    // Stage 4: Try Home Secondary Color vs Away Primary
    else if (homeDef.secondary && !areColorsColliding(homeDef.secondary, awayColor)) {
      homeColor = homeDef.secondary;
    }
    // Stage 5: Restrained neutral athletic tone
    else {
      const homeLum = getRelativeLuminance(homeColor);
      // If home is dark, give away a clean athletic light tone; otherwise dark carbon
      awayColor = homeLum < 0.35 ? NEUTRAL_LIGHT : NEUTRAL_DARK;
    }
  }

  return { homeColor, awayColor };
}

export default getMatchupColors;
