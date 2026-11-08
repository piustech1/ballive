/**
 * Official Player Headshots & Avatars Directory
 * Resolves player photos using official high-resolution cut-out CDN links with automatic fallback.
 */

const KNOWN_PLAYER_PHOTOS: Record<string, string> = {
  // Arsenal
  'bukayo saka': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p223340.png',
  'martin ødegaard': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p184029.png',
  'martin odegaard': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p184029.png',
  'declan rice': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p204480.png',
  'william saliba': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p462424.png',
  'gabriel magalhães': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p226597.png',
  'gabriel magalhaes': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p226597.png',
  'kai havertz': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p219847.png',
  'gabriel martinelli': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p444145.png',
  'ben white': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p198869.png',
  'david raya': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p154561.png',
  'jurriën timber': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p462423.png',
  'jurrien timber': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p462423.png',
  'leandro trossard': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p116594.png',
  'thomas partey': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p167199.png',
  'gabriel jesus': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p205651.png',
  'kepa arrizabalaga': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p109745.png',
  'raheem sterling': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p103955.png',

  // Manchester City
  'erling haaland': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p223094.png',
  'kevin de bruyne': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p61366.png',
  'phil foden': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p209244.png',
  'rodri': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p220566.png',
  'bernardo silva': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p165809.png',
  'rúben dias': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p171314.png',
  'ruben dias': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p171314.png',
  'ederson': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p121160.png',
  'josko gvardiol': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p477424.png',
  'kyle walker': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p58621.png',
  'manuel akanji': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p211975.png',
  'john stones': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p97299.png',
  'nathan aké': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p126187.png',
  'nathan ake': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p126187.png',
  'mateo kovačić': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p91961.png',
  'mateo kovacic': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p91961.png',
  'jérémy doku': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p468002.png',
  'jeremy doku': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p468002.png',
  'jack grealish': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p114283.png',
  'savinho': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p517351.png',
  'ilkay gundogan': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p59859.png',
  'ilkay gündogan': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p59859.png',

  // Nottingham Forest
  'morgan gibbs-white': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p222531.png',
  'chris wood': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p60689.png',
  'anthony elanga': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p449434.png',
  'callum hudson-odoi': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p209046.png',
  'matz sels': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p92395.png',
  'nikola milenković': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p224951.png',
  'nikola milenkovic': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p224951.png',
  'murillo': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p569830.png',
  'ryan yates': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p223911.png',
  'ola aina': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p157668.png',
  'nicolás domínguez': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p244856.png',
  'elliot anderson': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p464205.png',
  'taivo awoniyi': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p195864.png',
  'taiwo awoniyi': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p195864.png',

  // Chelsea
  'cole palmer': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p244855.png',
  'nicolas jackson': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p531238.png',
  'noni madueke': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p438137.png',
  'enzo fernández': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p477424.png',
  'enzo fernandez': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p477424.png',
  'moisés caicedo': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p486672.png',
  'moises caicedo': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p486672.png',
  'pedro neto': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p241159.png',
  'jadon sancho': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p209244.png',
  'joão félix': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p436700.png',
  'joao felix': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p436700.png',
  'reece james': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p225796.png',
  'malu gusto': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p493106.png',
  'leví colwill': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p462425.png',
  'levi colwill': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p462425.png',
  'marc cucurella': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p214590.png',
  'robert sánchez': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p215059.png',
  'robert sanchez': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p215059.png',
  'wesley fofana': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p244723.png',

  // Liverpool
  'mohamed salah': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p118748.png',
  'virgil van dijk': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p97032.png',
  'alisson becker': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p116535.png',
  'alisson': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p116535.png',
  'trent alexander-arnold': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p169187.png',
  'luis díaz': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p244731.png',
  'luis diaz': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p244731.png',
  'darwin núñez': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p447209.png',
  'darwin nunez': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p447209.png',
  'alexis mac allister': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p243016.png',
  'dominik szoboszlai': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p243572.png',
  'ryan gravenberch': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p462426.png',
  'ibrahima konaté': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p204716.png',
  'ibrahima konate': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p204716.png',
  'andy robertson': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p122798.png',
  'cody gakpo': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p243298.png',
  'diogo jota': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p194634.png',

  // Tottenham
  'son heung-min': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p85971.png',
  'james maddison': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p172780.png',
  'dominic solanke': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p154566.png',
  'dejan kulusevski': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p445044.png',
  'cristian romero': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p221632.png',
  'micky van de ven': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p489569.png',
  'pedro porro': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p247205.png',
  'destiny udogie': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p486673.png',
  'guglielmo vicario': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p181403.png',
  'brennan johnson': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p437742.png',
  'pape matar sarr': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p489570.png',
  'yves bissouma': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p227127.png',

  // Real Madrid
  'kylian mbappé': 'https://images.fotmob.com/image_resources/playerimages/737066.png',
  'kylian mbappe': 'https://images.fotmob.com/image_resources/playerimages/737066.png',
  'vinícius júnior': 'https://images.fotmob.com/image_resources/playerimages/846044.png',
  'vinicius junior': 'https://images.fotmob.com/image_resources/playerimages/846044.png',
  'jude bellingham': 'https://images.fotmob.com/image_resources/playerimages/1077894.png',
  'rodrygo': 'https://images.fotmob.com/image_resources/playerimages/922573.png',
  'federico valverde': 'https://images.fotmob.com/image_resources/playerimages/753385.png',
  'eduardo camavinga': 'https://images.fotmob.com/image_resources/playerimages/1013774.png',
  'aurélien tchouaméni': 'https://images.fotmob.com/image_resources/playerimages/899461.png',
  'antonio rüdiger': 'https://images.fotmob.com/image_resources/playerimages/215858.png',
  'thibaut courtois': 'https://images.fotmob.com/image_resources/playerimages/192565.png',
  'dani carvajal': 'https://images.fotmob.com/image_resources/playerimages/246552.png',
  'luka modrić': 'https://images.fotmob.com/image_resources/playerimages/29744.png',
  'luka modric': 'https://images.fotmob.com/image_resources/playerimages/29744.png',

  // Barcelona
  'lamine yamal': 'https://images.fotmob.com/image_resources/playerimages/1447065.png',
  'robert lewandowski': 'https://images.fotmob.com/image_resources/playerimages/96585.png',
  'raphinha': 'https://images.fotmob.com/image_resources/playerimages/734320.png',
  'pedri': 'https://images.fotmob.com/image_resources/playerimages/1098937.png',
  'gavi': 'https://images.fotmob.com/image_resources/playerimages/1220455.png',
  'dani olmo': 'https://images.fotmob.com/image_resources/playerimages/589574.png',
  'pau cubarsí': 'https://images.fotmob.com/image_resources/playerimages/1498894.png',
  'jules koundé': 'https://images.fotmob.com/image_resources/playerimages/782298.png',
  'marc-andré ter stegen': 'https://images.fotmob.com/image_resources/playerimages/186590.png',

  // Bayern Munich
  'harry kane': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p78830.png',
  'jamal musiala': 'https://images.fotmob.com/image_resources/playerimages/1114002.png',
  'leroy sané': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p171314.png',
  'alphonso davies': 'https://images.fotmob.com/image_resources/playerimages/805805.png',
  'michael olise': 'https://resources.premierleague.com/premierleague/photos/players/110x140/p462427.png',
  'manuel neuer': 'https://images.fotmob.com/image_resources/playerimages/30907.png',
};

/**
 * Returns a high-res photo URL for a player, or an initials-based avatar.
 */
export function getPlayerPhoto(playerName: string, directUrl?: string): string {
  if (directUrl && directUrl.startsWith('http')) {
    return directUrl;
  }

  const clean = playerName.toLowerCase().trim();
  if (KNOWN_PLAYER_PHOTOS[clean]) {
    return KNOWN_PLAYER_PHOTOS[clean];
  }

  // Check partial name matches (e.g. "Saka" matches "Bukayo Saka")
  for (const [key, url] of Object.entries(KNOWN_PLAYER_PHOTOS)) {
    const parts = key.split(' ');
    const last = parts[parts.length - 1];
    if (clean === last || clean.includes(key) || key.includes(clean)) {
      return url;
    }
  }

  // Deterministic fallback avatar with distinct team styling
  const nameParam = encodeURIComponent(playerName);
  return `https://ui-avatars.com/api/?name=${nameParam}&background=1E293B&color=F8FAFC&bold=true&size=128`;
}
