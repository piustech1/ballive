/**
 * Football Tactical Pitch Formation Coordinate Engine
 * Computes exact x% and y% positions for players on a 2D football pitch
 * based on authentic tactical formations (e.g. 4-2-3-1, 3-4-2-1, 4-3-3, 5-3-2, 4-4-2, etc.).
 */

export interface PitchCoordinate {
  x: number; // 0 to 100% (horizontal)
  y: number; // 0 to 100% (vertical)
}

/**
 * Calculates coordinates for a line of N players evenly distributed horizontally.
 */
export function distributeLine(count: number, y: number, marginX = 14): PitchCoordinate[] {
  if (count <= 1) {
    return [{ x: 50, y }];
  }
  if (count === 2) {
    return [
      { x: 35, y },
      { x: 65, y },
    ];
  }
  if (count === 3) {
    return [
      { x: 22, y },
      { x: 50, y },
      { x: 78, y },
    ];
  }
  if (count === 4) {
    return [
      { x: 14, y },
      { x: 38, y },
      { x: 62, y },
      { x: 86, y },
    ];
  }
  if (count === 5) {
    return [
      { x: 12, y },
      { x: 31, y },
      { x: 50, y },
      { x: 69, y },
      { x: 88, y },
    ];
  }
  const availableWidth = 100 - marginX * 2;
  const step = availableWidth / (count - 1);
  return Array.from({ length: count }, (_, i) => ({
    x: Math.round(marginX + i * step),
    y,
  }));
}

/**
 * Parses any formation string (e.g. '4-2-3-1', '3-4-2-1', '4-3-3', '5-3-2', '4-4-2')
 * into tactical outfield row player counts that sum to 10.
 */
export function parseFormationRows(formation?: string): number[] {
  if (!formation) return [4, 3, 3];
  const parts = formation
    .split(/[-–—/]/)
    .map(p => parseInt(p.trim(), 10))
    .filter(n => !isNaN(n) && n > 0);

  const sum = parts.reduce((a, b) => a + b, 0);
  if (sum === 10) {
    return parts;
  }
  // If the formation included GK (e.g. 1-4-2-3-1)
  if (sum === 11 && parts[0] === 1) {
    return parts.slice(1);
  }
  // Default to 4-3-3 if unrecognized
  return [4, 3, 3];
}

/**
 * Generates coordinates for a Single-Team perspective (attacking upwards, GK at bottom).
 */
export function getSingleTeamFormationCoordinates(formation?: string): PitchCoordinate[] {
  const rows = parseFormationRows(formation);
  const gkCoords: PitchCoordinate[] = [{ x: 50, y: 89 }];

  const numRows = rows.length;
  const startY = 74; // Defense row
  const endY = 18; // Forward row
  const yStep = numRows > 1 ? (startY - endY) / (numRows - 1) : 0;

  const outfieldCoords: PitchCoordinate[] = [];
  rows.forEach((count, rowIndex) => {
    const y = Math.round(startY - rowIndex * yStep);
    outfieldCoords.push(...distributeLine(count, y));
  });

  return [...gkCoords, ...outfieldCoords];
}

/**
 * Generates coordinates for Dual-Team Full Pitch perspective.
 * If isAway = true: placed on top half (attacking downwards, GK at top).
 * If isAway = false: placed on bottom half (attacking upwards, GK at bottom).
 */
export function getDualTeamFormationCoordinates(
  formation: string | undefined,
  isAway: boolean
): PitchCoordinate[] {
  const rows = parseFormationRows(formation);
  const numRows = rows.length;

  if (isAway) {
    // Top half: GK at y = 6%, Rows from defense (y = 15%) to attack (y = 42%)
    const gkCoords: PitchCoordinate[] = [{ x: 50, y: 6 }];
    const startY = 15;
    const endY = 42;
    const yStep = numRows > 1 ? (endY - startY) / (numRows - 1) : 0;

    const outfieldCoords: PitchCoordinate[] = [];
    rows.forEach((count, rowIndex) => {
      const y = Math.round(startY + rowIndex * yStep);
      outfieldCoords.push(...distributeLine(count, y));
    });

    return [...gkCoords, ...outfieldCoords];
  } else {
    // Bottom half: GK at y = 94%, Rows from defense (y = 85%) to attack (y = 58%)
    const gkCoords: PitchCoordinate[] = [{ x: 50, y: 94 }];
    const startY = 85;
    const endY = 58;
    const yStep = numRows > 1 ? (startY - endY) / (numRows - 1) : 0;

    const outfieldCoords: PitchCoordinate[] = [];
    rows.forEach((count, rowIndex) => {
      const y = Math.round(startY - rowIndex * yStep);
      outfieldCoords.push(...distributeLine(count, y));
    });

    return [...gkCoords, ...outfieldCoords];
  }
}

/**
 * Maps an array of starting players to their exact pitch coordinates
 * using the team's authentic tactical formation shape.
 */
export function mapPlayersToCoordinates<T extends { position: 'GK' | 'DF' | 'MF' | 'FW' }>(
  players: T[],
  options: { isAway: boolean; isFullPitch: boolean; formation?: string }
): Array<T & { coords: PitchCoordinate }> {
  // Sort players in tactical order: GK first, then DF, MF, FW
  const gk = players.filter(p => p.position === 'GK');
  const df = players.filter(p => p.position === 'DF');
  const mf = players.filter(p => p.position === 'MF');
  const fw = players.filter(p => p.position === 'FW');

  // Ordered list of players (GK first, then outfielders)
  const ordered: T[] = [];
  if (gk.length > 0) {
    ordered.push(gk[0]);
  } else if (players.length > 0) {
    ordered.push(players[0]);
  }

  // Add outfielders
  const outfielders = players.filter(p => p !== ordered[0]);
  // Sort outfielders by position hierarchy DF -> MF -> FW
  const sortedOutfielders = [
    ...outfielders.filter(p => p.position === 'DF'),
    ...outfielders.filter(p => p.position === 'MF'),
    ...outfielders.filter(p => p.position === 'FW'),
    ...outfielders.filter(p => !['DF', 'MF', 'FW'].includes(p.position)),
  ];
  ordered.push(...sortedOutfielders);

  let coords: PitchCoordinate[];
  if (options.isFullPitch) {
    coords = getDualTeamFormationCoordinates(options.formation, options.isAway);
  } else {
    coords = getSingleTeamFormationCoordinates(options.formation);
  }

  return ordered.map((player, idx) => ({
    ...player,
    coords: coords[idx] || { x: 50, y: 50 },
  }));
}
