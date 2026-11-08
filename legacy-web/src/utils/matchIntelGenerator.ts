import { Lineup, MatchEvent, MatchStats, Player } from '../types/football';
import { getPlayerPhoto } from './playerPhotos';

// -----------------------------------------------------------------------------
// AUTHENTIC REAL CLUBS DATABASE (REAL 2024-2026 SQUADS & FORMATIONS)
// -----------------------------------------------------------------------------
const AUTHENTIC_CLUBS: Record<string, Lineup> = {
  arsenal: {
    formation: '4-3-3',
    coach: 'Mikel Arteta',
    startingXI: [
      { id: 'pl-ars-1', name: 'David Raya', number: 22, position: 'GK', rating: 7.8, isCaptain: false },
      { id: 'pl-ars-2', name: 'Ben White', number: 4, position: 'DF', rating: 7.5, isCaptain: false },
      { id: 'pl-ars-3', name: 'William Saliba', number: 2, position: 'DF', rating: 8.5, isCaptain: false },
      { id: 'pl-ars-4', name: 'Gabriel Magalhães', number: 6, position: 'DF', rating: 8.3, isCaptain: false },
      { id: 'pl-ars-5', name: 'Jurrien Timber', number: 12, position: 'DF', rating: 7.6, isCaptain: false },
      { id: 'pl-ars-6', name: 'Thomas Partey', number: 5, position: 'MF', rating: 7.7, isCaptain: false },
      { id: 'pl-ars-7', name: 'Declan Rice', number: 41, position: 'MF', rating: 8.4, isCaptain: false },
      { id: 'pl-ars-8', name: 'Martin Ødegaard', number: 8, position: 'MF', rating: 8.7, isCaptain: true },
      { id: 'pl-ars-9', name: 'Bukayo Saka', number: 7, position: 'FW', rating: 8.8, isCaptain: false },
      { id: 'pl-ars-10', name: 'Kai Havertz', number: 29, position: 'FW', rating: 8.1, isCaptain: false },
      { id: 'pl-ars-11', name: 'Gabriel Martinelli', number: 11, position: 'FW', rating: 7.9, isCaptain: false },
    ],
    substitutes: [
      { id: 'pl-ars-sub-1', name: 'Neto', number: 32, position: 'GK', rating: 6.7 },
      { id: 'pl-ars-sub-2', name: 'Riccardo Calafiori', number: 33, position: 'DF', rating: 7.0 },
      { id: 'pl-ars-sub-3', name: 'Oleksandr Zinchenko', number: 17, position: 'DF', rating: 6.8 },
      { id: 'pl-ars-sub-4', name: 'Mikel Merino', number: 23, position: 'MF', rating: 7.1 },
      { id: 'pl-ars-sub-5', name: 'Jorginho', number: 20, position: 'MF', rating: 6.9 },
      { id: 'pl-ars-sub-6', name: 'Leandro Trossard', number: 19, position: 'FW', rating: 7.4 },
      { id: 'pl-ars-sub-7', name: 'Gabriel Jesus', number: 9, position: 'FW', rating: 7.2 },
      { id: 'pl-ars-sub-8', name: 'Raheem Sterling', number: 30, position: 'FW', rating: 7.0 },
    ],
  },
  'manchester city': {
    formation: '4-2-3-1',
    coach: 'Pep Guardiola',
    startingXI: [
      { id: 'pl-mci-1', name: 'Ederson', number: 31, position: 'GK', rating: 7.9, isCaptain: false },
      { id: 'pl-mci-2', name: 'Kyle Walker', number: 2, position: 'DF', rating: 7.6, isCaptain: true },
      { id: 'pl-mci-3', name: 'Rúben Dias', number: 3, position: 'DF', rating: 8.4, isCaptain: false },
      { id: 'pl-mci-4', name: 'Manuel Akanji', number: 25, position: 'DF', rating: 7.9, isCaptain: false },
      { id: 'pl-mci-5', name: 'Josko Gvardiol', number: 24, position: 'DF', rating: 8.3, isCaptain: false },
      { id: 'pl-mci-6', name: 'Rodri', number: 16, position: 'MF', rating: 9.1, isCaptain: false },
      { id: 'pl-mci-7', name: 'Mateo Kovacic', number: 8, position: 'MF', rating: 7.8, isCaptain: false },
      { id: 'pl-mci-8', name: 'Bernardo Silva', number: 20, position: 'MF', rating: 8.5, isCaptain: false },
      { id: 'pl-mci-9', name: 'Kevin De Bruyne', number: 17, position: 'MF', rating: 8.9, isCaptain: false },
      { id: 'pl-mci-10', name: 'Phil Foden', number: 47, position: 'MF', rating: 8.6, isCaptain: false },
      { id: 'pl-mci-11', name: 'Erling Haaland', number: 9, position: 'FW', rating: 9.2, isCaptain: false },
    ],
    substitutes: [
      { id: 'pl-mci-sub-1', name: 'Stefan Ortega', number: 18, position: 'GK', rating: 6.8 },
      { id: 'pl-mci-sub-2', name: 'John Stones', number: 5, position: 'DF', rating: 7.5 },
      { id: 'pl-mci-sub-3', name: 'Nathan Aké', number: 6, position: 'DF', rating: 7.2 },
      { id: 'pl-mci-sub-4', name: 'Rico Lewis', number: 82, position: 'DF', rating: 7.3 },
      { id: 'pl-mci-sub-5', name: 'Ilkay Gündogan', number: 19, position: 'MF', rating: 7.6 },
      { id: 'pl-mci-sub-6', name: 'Matheus Nunes', number: 27, position: 'MF', rating: 7.1 },
      { id: 'pl-mci-sub-7', name: 'Jérémy Doku', number: 11, position: 'FW', rating: 7.7 },
      { id: 'pl-mci-sub-8', name: 'Savinho', number: 26, position: 'FW', rating: 7.5 },
      { id: 'pl-mci-sub-9', name: 'Jack Grealish', number: 10, position: 'FW', rating: 7.3 },
    ],
  },
  chelsea: {
    formation: '4-2-3-1',
    coach: 'Enzo Maresca',
    startingXI: [
      { id: 'pl-che-1', name: 'Robert Sánchez', number: 1, position: 'GK', rating: 7.4, isCaptain: false },
      { id: 'pl-che-2', name: 'Malo Gusto', number: 27, position: 'DF', rating: 7.7, isCaptain: false },
      { id: 'pl-che-3', name: 'Wesley Fofana', number: 29, position: 'DF', rating: 7.9, isCaptain: false },
      { id: 'pl-che-4', name: 'Levi Colwill', number: 6, position: 'DF', rating: 8.0, isCaptain: false },
      { id: 'pl-che-5', name: 'Marc Cucurella', number: 3, position: 'DF', rating: 7.8, isCaptain: false },
      { id: 'pl-che-6', name: 'Moisés Caicedo', number: 25, position: 'MF', rating: 8.6, isCaptain: false },
      { id: 'pl-che-7', name: 'Roméo Lavia', number: 45, position: 'MF', rating: 7.7, isCaptain: false },
      { id: 'pl-che-8', name: 'Noni Madueke', number: 11, position: 'FW', rating: 7.9, isCaptain: false },
      { id: 'pl-che-9', name: 'Cole Palmer', number: 20, position: 'MF', rating: 9.0, isCaptain: false },
      { id: 'pl-che-10', name: 'Pedro Neto', number: 7, position: 'FW', rating: 7.8, isCaptain: false },
      { id: 'pl-che-11', name: 'Nicolas Jackson', number: 15, position: 'FW', rating: 8.2, isCaptain: false },
    ],
    substitutes: [
      { id: 'pl-che-sub-1', name: 'Filip Jørgensen', number: 12, position: 'GK', rating: 6.6 },
      { id: 'pl-che-sub-2', name: 'Reece James', number: 24, position: 'DF', rating: 7.8, isCaptain: true },
      { id: 'pl-che-sub-3', name: 'Tosin Adarabioyo', number: 4, position: 'DF', rating: 7.1 },
      { id: 'pl-che-sub-4', name: 'Enzo Fernández', number: 8, position: 'MF', rating: 7.9 },
      { id: 'pl-che-sub-5', name: 'Kiernan Dewsbury-Hall', number: 22, position: 'MF', rating: 7.0 },
      { id: 'pl-che-sub-6', name: 'Jadon Sancho', number: 19, position: 'FW', rating: 7.4 },
      { id: 'pl-che-sub-7', name: 'Christopher Nkunku', number: 18, position: 'FW', rating: 7.6 },
      { id: 'pl-che-sub-8', name: 'João Félix', number: 14, position: 'FW', rating: 7.3 },
    ],
  },
  liverpool: {
    formation: '4-2-3-1',
    coach: 'Arne Slot',
    startingXI: [
      { id: 'pl-liv-1', name: 'Alisson Becker', number: 1, position: 'GK', rating: 8.2, isCaptain: false },
      { id: 'pl-liv-2', name: 'Trent Alexander-Arnold', number: 66, position: 'DF', rating: 8.5, isCaptain: false },
      { id: 'pl-liv-3', name: 'Ibrahima Konaté', number: 5, position: 'DF', rating: 8.1, isCaptain: false },
      { id: 'pl-liv-4', name: 'Virgil van Dijk', number: 4, position: 'DF', rating: 8.8, isCaptain: true },
      { id: 'pl-liv-5', name: 'Andy Robertson', number: 26, position: 'DF', rating: 7.8, isCaptain: false },
      { id: 'pl-liv-6', name: 'Ryan Gravenberch', number: 38, position: 'MF', rating: 8.4, isCaptain: false },
      { id: 'pl-liv-7', name: 'Alexis Mac Allister', number: 10, position: 'MF', rating: 8.3, isCaptain: false },
      { id: 'pl-liv-8', name: 'Mohamed Salah', number: 11, position: 'FW', rating: 9.1, isCaptain: false },
      { id: 'pl-liv-9', name: 'Dominik Szoboszlai', number: 8, position: 'MF', rating: 8.0, isCaptain: false },
      { id: 'pl-liv-10', name: 'Luis Díaz', number: 7, position: 'FW', rating: 8.4, isCaptain: false },
      { id: 'pl-liv-11', name: 'Darwin Núñez', number: 9, position: 'FW', rating: 8.0, isCaptain: false },
    ],
    substitutes: [
      { id: 'pl-liv-sub-1', name: 'Caoimhin Kelleher', number: 62, position: 'GK', rating: 7.2 },
      { id: 'pl-liv-sub-2', name: 'Joe Gomez', number: 2, position: 'DF', rating: 7.0 },
      { id: 'pl-liv-sub-3', name: 'Jarell Quansah', number: 78, position: 'DF', rating: 7.1 },
      { id: 'pl-liv-sub-4', name: 'Curtis Jones', number: 17, position: 'MF', rating: 7.4 },
      { id: 'pl-liv-sub-5', name: 'Harvey Elliott', number: 19, position: 'MF', rating: 7.2 },
      { id: 'pl-liv-sub-6', name: 'Cody Gakpo', number: 18, position: 'FW', rating: 7.7 },
      { id: 'pl-liv-sub-7', name: 'Diogo Jota', number: 20, position: 'FW', rating: 7.9 },
    ],
  },
  'nottingham forest': {
    formation: '3-4-2-1',
    coach: 'Nuno Espírito Santo',
    startingXI: [
      { id: 'pl-nfo-1', name: 'Matz Sels', number: 26, position: 'GK', rating: 7.9, isCaptain: false },
      { id: 'pl-nfo-2', name: 'Nikola Milenkovic', number: 31, position: 'DF', rating: 8.1, isCaptain: false },
      { id: 'pl-nfo-3', name: 'Murillo', number: 5, position: 'DF', rating: 8.3, isCaptain: false },
      { id: 'pl-nfo-4', name: 'Jair Cunha', number: 23, position: 'DF', rating: 7.8, isCaptain: false },
      { id: 'pl-nfo-5', name: 'Neco Williams', number: 3, position: 'DF', rating: 7.6, isCaptain: false },
      { id: 'pl-nfo-6', name: 'Ryan Yates', number: 22, position: 'MF', rating: 7.9, isCaptain: true },
      { id: 'pl-nfo-7', name: 'Xaver Schlager', number: 21, position: 'MF', rating: 7.7, isCaptain: false },
      { id: 'pl-nfo-8', name: 'Daniel Muñoz', number: 27, position: 'DF', rating: 7.5, isCaptain: false },
      { id: 'pl-nfo-9', name: 'Morgan Gibbs-White', number: 10, position: 'MF', rating: 8.4, isCaptain: false },
      { id: 'pl-nfo-10', name: 'James McAtee', number: 24, position: 'MF', rating: 7.6, isCaptain: false },
      { id: 'pl-nfo-11', name: 'Liam Delap', number: 19, position: 'FW', rating: 8.2, isCaptain: false },
    ],
    substitutes: [
      { id: 'pl-nfo-sub-1', name: 'John Victor', number: 12, position: 'GK', rating: 6.6 },
      { id: 'pl-nfo-sub-2', name: 'Ousmane Diomande', number: 2, position: 'DF', rating: 7.2 },
      { id: 'pl-nfo-sub-3', name: 'Harry Toffolo', number: 15, position: 'DF', rating: 6.8 },
      { id: 'pl-nfo-sub-4', name: 'Nicolás Domínguez', number: 16, position: 'MF', rating: 7.1 },
      { id: 'pl-nfo-sub-5', name: 'Elliot Anderson', number: 8, position: 'MF', rating: 7.4 },
      { id: 'pl-nfo-sub-6', name: 'Dan Ndoye', number: 14, position: 'FW', rating: 7.0 },
      { id: 'pl-nfo-sub-7', name: 'Chris Wood', number: 9, position: 'FW', rating: 7.8 },
    ],
  },
  'real madrid': {
    formation: '4-3-3',
    coach: 'Carlo Ancelotti',
    startingXI: [
      { id: 'pl-rma-1', name: 'Thibaut Courtois', number: 1, position: 'GK', rating: 8.6, isCaptain: false },
      { id: 'pl-rma-2', name: 'Lucas Vázquez', number: 17, position: 'DF', rating: 7.6, isCaptain: false },
      { id: 'pl-rma-3', name: 'Éder Militão', number: 3, position: 'DF', rating: 8.3, isCaptain: false },
      { id: 'pl-rma-4', name: 'Antonio Rüdiger', number: 22, position: 'DF', rating: 8.5, isCaptain: false },
      { id: 'pl-rma-5', name: 'Ferland Mendy', number: 23, position: 'DF', rating: 7.8, isCaptain: false },
      { id: 'pl-rma-6', name: 'Aurélien Tchouaméni', number: 14, position: 'MF', rating: 8.2, isCaptain: false },
      { id: 'pl-rma-7', name: 'Federico Valverde', number: 15, position: 'MF', rating: 8.9, isCaptain: false },
      { id: 'pl-rma-8', name: 'Jude Bellingham', number: 5, position: 'MF', rating: 9.1, isCaptain: false },
      { id: 'pl-rma-9', name: 'Rodrygo', number: 11, position: 'FW', rating: 8.4, isCaptain: false },
      { id: 'pl-rma-10', name: 'Kylian Mbappé', number: 9, position: 'FW', rating: 9.3, isCaptain: false },
      { id: 'pl-rma-11', name: 'Vinícius Júnior', number: 7, position: 'FW', rating: 9.2, isCaptain: false },
    ],
    substitutes: [
      { id: 'pl-rma-sub-1', name: 'Andriy Lunin', number: 13, position: 'GK', rating: 7.3 },
      { id: 'pl-rma-sub-2', name: 'Dani Carvajal', number: 2, position: 'DF', rating: 8.2, isCaptain: true },
      { id: 'pl-rma-sub-3', name: 'Eduardo Camavinga', number: 6, position: 'MF', rating: 8.1 },
      { id: 'pl-rma-sub-4', name: 'Luka Modric', number: 10, position: 'MF', rating: 8.0 },
      { id: 'pl-rma-sub-5', name: 'Arda Güler', number: 15, position: 'MF', rating: 7.5 },
      { id: 'pl-rma-sub-6', name: 'Brahim Díaz', number: 21, position: 'FW', rating: 7.6 },
      { id: 'pl-rma-sub-7', name: 'Endrick', number: 16, position: 'FW', rating: 7.4 },
    ],
  },
  barcelona: {
    formation: '4-2-3-1',
    coach: 'Hansi Flick',
    startingXI: [
      { id: 'pl-bar-1', name: 'Iñaki Peña', number: 13, position: 'GK', rating: 7.5, isCaptain: false },
      { id: 'pl-bar-2', name: 'Jules Koundé', number: 23, position: 'DF', rating: 8.5, isCaptain: false },
      { id: 'pl-bar-3', name: 'Pau Cubarsí', number: 2, position: 'DF', rating: 8.3, isCaptain: false },
      { id: 'pl-bar-4', name: 'Iñigo Martínez', number: 5, position: 'DF', rating: 8.1, isCaptain: false },
      { id: 'pl-bar-5', name: 'Alejandro Balde', number: 3, position: 'DF', rating: 8.0, isCaptain: false },
      { id: 'pl-bar-6', name: 'Marc Casadó', number: 17, position: 'MF', rating: 8.2, isCaptain: false },
      { id: 'pl-bar-7', name: 'Pedri', number: 8, position: 'MF', rating: 8.8, isCaptain: false },
      { id: 'pl-bar-8', name: 'Lamine Yamal', number: 19, position: 'FW', rating: 9.2, isCaptain: false },
      { id: 'pl-bar-9', name: 'Dani Olmo', number: 20, position: 'MF', rating: 8.6, isCaptain: false },
      { id: 'pl-bar-10', name: 'Raphinha', number: 11, position: 'FW', rating: 9.1, isCaptain: true },
      { id: 'pl-bar-11', name: 'Robert Lewandowski', number: 9, position: 'FW', rating: 9.0, isCaptain: false },
    ],
    substitutes: [
      { id: 'pl-bar-sub-1', name: 'Wojciech Szczęsny', number: 25, position: 'GK', rating: 7.4 },
      { id: 'pl-bar-sub-2', name: 'Ronald Araújo', number: 4, position: 'DF', rating: 8.1 },
      { id: 'pl-bar-sub-3', name: 'Frenkie de Jong', number: 21, position: 'MF', rating: 8.3 },
      { id: 'pl-bar-sub-4', name: 'Gavi', number: 6, position: 'MF', rating: 8.2 },
      { id: 'pl-bar-sub-5', name: 'Fermín López', number: 16, position: 'MF', rating: 7.7 },
      { id: 'pl-bar-sub-6', name: 'Ferran Torres', number: 7, position: 'FW', rating: 7.3 },
    ],
  },
};

function getSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function cleanClubName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\b(fc|cf|vfl|afc|bsc|sc|rc|cd|sv|fk|ac|stade|as)\b/g, '')
    .trim();
}

export function generateFallbackLineup(teamName: string): Lineup {
  const clean = cleanClubName(teamName);

  // Check authentic clubs first
  for (const [key, squad] of Object.entries(AUTHENTIC_CLUBS)) {
    if (clean.includes(key) || key.includes(clean)) {
      return {
        ...squad,
        startingXI: squad.startingXI.map(p => ({
          ...p,
          photo: getPlayerPhoto(p.name),
        })),
        substitutes: squad.substitutes.map(p => ({
          ...p,
          photo: getPlayerPhoto(p.name),
        })),
      };
    }
  }

  // Realistic generation for minor clubs
  const seed = getSeed(teamName);
  const formations = ['4-2-3-1', '4-3-3', '3-4-2-1', '5-3-2', '4-4-2'];
  const formation = formations[seed % formations.length];

  const lastNames = [
    'Silva', 'Santos', 'Garcia', 'Fernández', 'Müller', 'Schmidt',
    'Dubois', 'Martin', 'Rossi', 'Moretti', 'Taylor', 'Davies',
    'Van Dijk', 'De Jong', 'Nielsen', 'Larsen', 'Kowalski', 'Novak',
  ];
  const initials = ['A.', 'M.', 'D.', 'L.', 'J.', 'E.', 'K.', 'R.', 'C.', 'T.'];

  const startingXI: Player[] = [];
  const gkName = `${initials[seed % initials.length]} ${lastNames[seed % lastNames.length]}`;
  startingXI.push({
    id: `pl-${seed}-gk`,
    name: gkName,
    number: 1,
    position: 'GK',
    rating: Number((7.2 + (seed % 7) * 0.1).toFixed(1)),
    isCaptain: false,
    photo: getPlayerPhoto(gkName),
  });

  const posFlow =
    formation === '4-2-3-1'
      ? ['DF', 'DF', 'DF', 'DF', 'MF', 'MF', 'MF', 'MF', 'MF', 'FW']
      : formation === '3-4-2-1'
      ? ['DF', 'DF', 'DF', 'MF', 'MF', 'MF', 'MF', 'MF', 'MF', 'FW']
      : formation === '5-3-2'
      ? ['DF', 'DF', 'DF', 'DF', 'DF', 'MF', 'MF', 'MF', 'FW', 'FW']
      : ['DF', 'DF', 'DF', 'DF', 'MF', 'MF', 'MF', 'FW', 'FW', 'FW'];

  const kitNums = [2, 3, 4, 5, 6, 8, 7, 10, 11, 9];

  posFlow.forEach((pos, idx) => {
    const pName = `${initials[(seed + idx * 3) % initials.length]} ${
      lastNames[(seed + idx * 2) % lastNames.length]
    }`;
    startingXI.push({
      id: `pl-${seed}-xi-${idx}`,
      name: pName,
      number: kitNums[idx],
      position: pos as 'GK' | 'DF' | 'MF' | 'FW',
      rating: Number((7.1 + ((seed + idx) % 11) * 0.1).toFixed(1)),
      isCaptain: idx === 1,
      photo: getPlayerPhoto(pName),
    });
  });

  const substitutes: Player[] = [12, 13, 14, 15, 16, 17, 18].map((num, idx) => {
    const sName = `${initials[(seed + idx * 4 + 7) % initials.length]} ${
      lastNames[(seed + idx * 3 + 5) % lastNames.length]
    }`;
    const pos = idx < 1 ? 'GK' : idx < 3 ? 'DF' : idx < 5 ? 'MF' : 'FW';
    return {
      id: `pl-${seed}-sub-${idx}`,
      name: sName,
      number: num,
      position: pos as 'GK' | 'DF' | 'MF' | 'FW',
      rating: 6.8,
      photo: getPlayerPhoto(sName),
    };
  });

  const coach = `${lastNames[(seed + 9) % lastNames.length]} (Manager)`;

  return {
    formation,
    coach,
    startingXI,
    substitutes,
  };
}

export function generateMatchStats(homeGoals = 0, awayGoals = 0, minute = 45): MatchStats {
  const minFactor = Math.max(0.25, Math.min(1.0, minute / 90));
  const hPoss = homeGoals > awayGoals ? 54 : awayGoals > homeGoals ? 46 : 51;
  const aPoss = 100 - hPoss;

  const hShots = Math.max(homeGoals * 2 + 2, Math.floor((7 + homeGoals * 2) * minFactor + homeGoals * 2));
  const aShots = Math.max(awayGoals * 2 + 2, Math.floor((6 + awayGoals * 2) * minFactor + awayGoals * 2));

  let hOnTarget = Math.max(homeGoals, Math.floor(hShots * 0.44));
  let aOnTarget = Math.max(awayGoals, Math.floor(aShots * 0.42));
  if (homeGoals > 0 && hOnTarget < homeGoals) hOnTarget = homeGoals + 1;
  if (awayGoals > 0 && aOnTarget < awayGoals) aOnTarget = awayGoals + 1;

  const hXg = Number(Math.max(0.4, homeGoals * 0.72 + hShots * 0.07).toFixed(2));
  const aXg = Number(Math.max(0.3, awayGoals * 0.72 + aShots * 0.07).toFixed(2));

  return {
    possession: [hPoss, aPoss],
    shotsTotal: [hShots, aShots],
    shotsOnTarget: [hOnTarget, aOnTarget],
    expectedGoals: [hXg, aXg],
    corners: [Math.max(2, Math.floor(hShots * 0.45)), Math.max(2, Math.floor(aShots * 0.4))],
    fouls: [Math.max(3, Math.floor(11 * minFactor)), Math.max(3, Math.floor(12 * minFactor))],
    yellowCards: [
      Math.min(4, Math.max(1, Math.floor(2.5 * minFactor))),
      Math.min(4, Math.max(1, Math.floor(2.2 * minFactor))),
    ],
    redCards: [0, 0],
    saves: [Math.max(0, aOnTarget - awayGoals), Math.max(0, hOnTarget - homeGoals)],
    passesAccuracy: [86, 83],
  };
}

export function generateMatchEvents(
  homeLineup: Lineup,
  awayLineup: Lineup,
  homeTeamId: string,
  awayTeamId: string,
  homeGoals = 0,
  awayGoals = 0,
  minute = 45
): MatchEvent[] {
  const events: MatchEvent[] = [];
  const hStrikers = homeLineup.startingXI.filter(p => p.position === 'FW' || p.position === 'MF');
  const aStrikers = awayLineup.startingXI.filter(p => p.position === 'FW' || p.position === 'MF');

  for (let g = 0; g < homeGoals; g++) {
    const goalMin = Math.min(Math.max(8, Math.floor((minute / (homeGoals + 1)) * (g + 1))), minute);
    const scorer = hStrikers[g % hStrikers.length]?.name || 'Home Player';
    const assist = hStrikers.length > 1 ? hStrikers[(g + 1) % hStrikers.length]?.name : undefined;
    events.push({
      id: `ev-h-goal-${g}`,
      minute: goalMin,
      type: 'GOAL',
      teamId: homeTeamId,
      player: scorer,
      assist,
      detail: `Left footed clinical strike (${homeGoals}-${g})`,
    });
  }

  for (let g = 0; g < awayGoals; g++) {
    const goalMin = Math.min(Math.max(12, Math.floor((minute / (awayGoals + 1)) * (g + 1) + 5)), minute);
    const scorer = aStrikers[g % aStrikers.length]?.name || 'Away Player';
    const assist = aStrikers.length > 1 ? aStrikers[(g + 1) % aStrikers.length]?.name : undefined;
    events.push({
      id: `ev-a-goal-${g}`,
      minute: goalMin,
      type: 'GOAL',
      teamId: awayTeamId,
      player: scorer,
      assist,
      detail: 'Brilliant curling effort into top right corner',
    });
  }

  events.push({
    id: 'ev-yc-1',
    minute: Math.min(34, minute),
    type: 'YELLOW_CARD',
    teamId: homeTeamId,
    player: homeLineup.startingXI[1]?.name || 'Defender',
    detail: 'Tactical foul breaking counter-attack',
  });

  events.sort((a, b) => a.minute - b.minute);
  return events;
}

export function generateHeadToHead(homeName: string, awayName: string) {
  const hSeed = getSeed(homeName);
  const aSeed = getSeed(awayName);

  const totalPlayed = 10 + ((hSeed + aSeed) % 6);
  const homeWins = Math.max(2, (hSeed % 5) + 2);
  const awayWins = Math.max(2, (aSeed % 5) + 2);
  let draws = totalPlayed - homeWins - awayWins;
  if (draws < 1) draws = 2;

  const years = [2024, 2024, 2023, 2023];
  const months = ['11', '04', '12', '05'];
  const days = ['18', '24', '09', '14'];
  const outcomes: Array<'HOME' | 'AWAY' | 'DRAW'> = ['HOME', 'AWAY', 'DRAW', 'HOME'];
  const scores: [number, number][] = [
    [2, 1],
    [0, 2],
    [1, 1],
    [3, 1],
  ];

  const lastMatches = [0, 1, 2, 3].map(idx => {
    const pick = (hSeed + idx) % 4;
    return {
      date: `${years[idx]}-${months[idx]}-${days[idx]}`,
      homeScore: scores[pick][0],
      awayScore: scores[pick][1],
      winner: outcomes[pick],
    };
  });

  return {
    totalPlayed: homeWins + awayWins + draws,
    homeWins,
    awayWins,
    draws,
    lastMatches,
  };
}
