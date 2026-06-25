import { getDatabase } from './database';
import type {
  Tournament,
  Participant,
  BadmintonMatch,
  BadmintonGame,
  TennisMatch,
  TennisSet,
  TableTennisMatch,
  TableTennisGame,
  SportType,
  TournamentType,
} from '@/types';

// ─── Tournaments ─────────────────────────────────────────────────────────────

export function createTournament(
  name: string,
  sport: SportType,
  type: TournamentType = 'round_robin'
): Tournament {
  const db = getDatabase();
  const result = db.runSync(
    'INSERT INTO tournaments (name, sport, type, status) VALUES (?, ?, ?, ?)',
    name,
    sport,
    type,
    'upcoming'
  );

  return {
    id: Number(result.lastInsertRowId),
    name,
    sport,
    type,
    status: 'upcoming',
    createdAt: Math.floor(Date.now() / 1000),
    updatedAt: Math.floor(Date.now() / 1000),
  };
}

export function getTournaments(): Tournament[] {
  const db = getDatabase();
  const rows = db.getAllSync<Tournament>(
    'SELECT id, name, sport, type, status, created_at as createdAt, updated_at as updatedAt FROM tournaments ORDER BY created_at DESC'
  );
  return rows;
}

export function getTournament(id: number): Tournament | null {
  const db = getDatabase();
  const row = db.getFirstSync<Tournament>(
    'SELECT id, name, sport, type, status, created_at as createdAt, updated_at as updatedAt FROM tournaments WHERE id = ?',
    id
  );
  return row ?? null;
}

export function updateTournamentStatus(id: number, status: Tournament['status']) {
  const db = getDatabase();
  db.runSync(
    "UPDATE tournaments SET status = ?, updated_at = strftime('%s', 'now') WHERE id = ?",
    status,
    id
  );
}

export function updateTournamentName(id: number, name: string) {
  const db = getDatabase();
  db.runSync(
    "UPDATE tournaments SET name = ?, updated_at = strftime('%s', 'now') WHERE id = ?",
    name,
    id
  );
}

export function deleteTournament(id: number) {
  const db = getDatabase();
  db.runSync('DELETE FROM tournaments WHERE id = ?', id);
}

// ─── Participants ────────────────────────────────────────────────────────────

export function createParticipant(tournamentId: number, name: string): Participant {
  const db = getDatabase();
  const result = db.runSync(
    'INSERT INTO participants (tournament_id, name) VALUES (?, ?)',
    tournamentId,
    name
  );

  return {
    id: Number(result.lastInsertRowId),
    tournamentId,
    name,
    createdAt: Math.floor(Date.now() / 1000),
  };
}

export function getParticipants(tournamentId: number): Participant[] {
  const db = getDatabase();
  const rows = db.getAllSync<Participant>(
    'SELECT id, tournament_id as tournamentId, name, created_at as createdAt FROM participants WHERE tournament_id = ? ORDER BY id',
    tournamentId
  );
  return rows;
}

export function getAllParticipantNames(): { name: string; lastUsedAt: number }[] {
  const db = getDatabase();
  const rows = db.getAllSync<{ name: string; createdAt: number }>(
    'SELECT name, created_at as createdAt FROM participants'
  );
  
  // Group by normalized name (case-insensitive, trimmed), keep most recent
  const byKey = new Map<string, { name: string; lastUsedAt: number }>();
  for (const row of rows) {
    const trimmed = row.name.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    const existing = byKey.get(key);
    if (!existing || row.createdAt > existing.lastUsedAt) {
      byKey.set(key, { name: trimmed, lastUsedAt: row.createdAt });
    }
  }
  
  return Array.from(byKey.values()).sort((a, b) => b.lastUsedAt - a.lastUsedAt);
}

export function updateParticipantName(id: number, name: string) {
  const db = getDatabase();
  db.runSync('UPDATE participants SET name = ? WHERE id = ?', name, id);
}

// ─── Badminton Matches ───────────────────────────────────────────────────────

export interface BadmintonMatchCreateOptions {
  round?: number;
  bracketPosition?: number;
  feedsIntoMatchId?: number | null;
  feedsIntoSlot?: 'A' | 'B' | null;
}

export function createBadmintonMatch(
  tournamentId: number,
  participantAId: number,
  participantBId: number | null,
  gamePoint: number,
  bestOfGames: number,
  options: BadmintonMatchCreateOptions = {}
): BadmintonMatch {
  const db = getDatabase();
  const {
    round = 1,
    bracketPosition = 1,
    feedsIntoMatchId = null,
    feedsIntoSlot = null,
  } = options;

  const result = db.runSync(
    `INSERT INTO badminton_matches 
     (tournament_id, participant_a_id, participant_b_id, game_point, best_of_games, 
      status, winner_id, round, bracket_position, feeds_into_match_id, feeds_into_slot) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    tournamentId,
    participantAId,
    participantBId,
    gamePoint,
    bestOfGames,
    'upcoming',
    null,
    round,
    bracketPosition,
    feedsIntoMatchId,
    feedsIntoSlot
  );

  const matchId = Number(result.lastInsertRowId);

  // Create empty games (only if both participants are known)
  if (participantBId !== null) {
    for (let i = 1; i <= bestOfGames; i++) {
      db.runSync(
        'INSERT INTO badminton_match_games (match_id, game_number) VALUES (?, ?)',
        matchId,
        i
      );
    }
  }

  return {
    id: matchId,
    tournamentId,
    participantAId,
    participantBId,
    gamePoint,
    bestOfGames,
    status: 'upcoming',
    winnerId: null,
    createdAt: Math.floor(Date.now() / 1000),
    round,
    bracketPosition,
    feedsIntoMatchId,
    feedsIntoSlot,
  };
}

export function getBadmintonMatches(tournamentId: number): BadmintonMatch[] {
  const db = getDatabase();
  const rows = db.getAllSync<BadmintonMatch>(
    `SELECT id, tournament_id as tournamentId, participant_a_id as participantAId,
            participant_b_id as participantBId, game_point as gamePoint, best_of_games as bestOfGames,
            status, winner_id as winnerId, created_at as createdAt,
            round, bracket_position as bracketPosition,
            feeds_into_match_id as feedsIntoMatchId, feeds_into_slot as feedsIntoSlot
     FROM badminton_matches WHERE tournament_id = ? ORDER BY round, bracket_position`,
    tournamentId
  );
  return rows;
}

export function getBadmintonGames(matchId: number): BadmintonGame[] {
  const db = getDatabase();
  const rows = db.getAllSync<BadmintonGame>(
    `SELECT id, match_id as matchId, game_number as gameNumber, score_a as scoreA, score_b as scoreB
     FROM badminton_match_games WHERE match_id = ? ORDER BY game_number`,
    matchId
  );
  return rows;
}

export function updateBadmintonGame(
  matchId: number,
  gameNumber: number,
  scoreA: number | null,
  scoreB: number | null
) {
  const db = getDatabase();
  db.runSync(
    'UPDATE badminton_match_games SET score_a = ?, score_b = ? WHERE match_id = ? AND game_number = ?',
    scoreA,
    scoreB,
    matchId,
    gameNumber
  );
}

export function updateBadmintonMatchStatus(
  matchId: number,
  status: BadmintonMatch['status'],
  winnerId: number | null
) {
  const db = getDatabase();
  db.runSync(
    'UPDATE badminton_matches SET status = ?, winner_id = ? WHERE id = ?',
    status,
    winnerId,
    matchId
  );
}

// ─── Tennis Matches ──────────────────────────────────────────────────────────

export interface TennisMatchCreateOptions {
  round?: number;
  bracketPosition?: number;
  feedsIntoMatchId?: number | null;
  feedsIntoSlot?: 'A' | 'B' | null;
}

export function createTennisMatch(
  tournamentId: number,
  participantAId: number,
  participantBId: number | null,
  setsToWin: number,
  gamesToWinPerSet: number,
  options: TennisMatchCreateOptions = {}
): TennisMatch {
  const db = getDatabase();
  const {
    round = 1,
    bracketPosition = 1,
    feedsIntoMatchId = null,
    feedsIntoSlot = null,
  } = options;

  const result = db.runSync(
    `INSERT INTO tennis_matches 
     (tournament_id, participant_a_id, participant_b_id, sets_to_win, games_to_win_per_set, 
      status, winner_id, round, bracket_position, feeds_into_match_id, feeds_into_slot) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    tournamentId,
    participantAId,
    participantBId,
    setsToWin,
    gamesToWinPerSet,
    'upcoming',
    null,
    round,
    bracketPosition,
    feedsIntoMatchId,
    feedsIntoSlot
  );

  const matchId = Number(result.lastInsertRowId);
  const maxSets = setsToWin * 2 - 1;

  // Create empty sets (only if both participants are known)
  if (participantBId !== null) {
    for (let i = 1; i <= maxSets; i++) {
      db.runSync(
        'INSERT INTO tennis_match_sets (match_id, set_number) VALUES (?, ?)',
        matchId,
        i
      );
    }
  }

  return {
    id: matchId,
    tournamentId,
    participantAId,
    participantBId,
    setsToWin,
    gamesToWinPerSet,
    status: 'upcoming',
    winnerId: null,
    createdAt: Math.floor(Date.now() / 1000),
    round,
    bracketPosition,
    feedsIntoMatchId,
    feedsIntoSlot,
  };
}

export function getTennisMatches(tournamentId: number): TennisMatch[] {
  const db = getDatabase();
  const rows = db.getAllSync<TennisMatch>(
    `SELECT id, tournament_id as tournamentId, participant_a_id as participantAId,
            participant_b_id as participantBId, sets_to_win as setsToWin, games_to_win_per_set as gamesToWinPerSet,
            status, winner_id as winnerId, created_at as createdAt,
            round, bracket_position as bracketPosition,
            feeds_into_match_id as feedsIntoMatchId, feeds_into_slot as feedsIntoSlot
     FROM tennis_matches WHERE tournament_id = ? ORDER BY round, bracket_position`,
    tournamentId
  );
  return rows;
}

export function getTennisSets(matchId: number): TennisSet[] {
  const db = getDatabase();
  const rows = db.getAllSync<TennisSet>(
    `SELECT id, match_id as matchId, set_number as setNumber, games_a as gamesA, games_b as gamesB
     FROM tennis_match_sets WHERE match_id = ? ORDER BY set_number`,
    matchId
  );
  return rows;
}

export function updateTennisSet(
  matchId: number,
  setNumber: number,
  gamesA: number | null,
  gamesB: number | null
) {
  const db = getDatabase();
  db.runSync(
    'UPDATE tennis_match_sets SET games_a = ?, games_b = ? WHERE match_id = ? AND set_number = ?',
    gamesA,
    gamesB,
    matchId,
    setNumber
  );
}

export function updateTennisMatchStatus(
  matchId: number,
  status: TennisMatch['status'],
  winnerId: number | null
) {
  const db = getDatabase();
  db.runSync(
    'UPDATE tennis_matches SET status = ?, winner_id = ? WHERE id = ?',
    status,
    winnerId,
    matchId
  );
}

// ─── Table Tennis Matches ────────────────────────────────────────────────────

export interface TableTennisMatchCreateOptions {
  round?: number;
  bracketPosition?: number;
  feedsIntoMatchId?: number | null;
  feedsIntoSlot?: 'A' | 'B' | null;
}

export function createTableTennisMatch(
  tournamentId: number,
  participantAId: number,
  participantBId: number | null,
  gamePoint: number,
  bestOfGames: number,
  options: TableTennisMatchCreateOptions = {}
): TableTennisMatch {
  const db = getDatabase();
  const {
    round = 1,
    bracketPosition = 1,
    feedsIntoMatchId = null,
    feedsIntoSlot = null,
  } = options;

  const result = db.runSync(
    `INSERT INTO table_tennis_matches
     (tournament_id, participant_a_id, participant_b_id, game_point, best_of_games,
      status, winner_id, round, bracket_position, feeds_into_match_id, feeds_into_slot)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    tournamentId,
    participantAId,
    participantBId,
    gamePoint,
    bestOfGames,
    'upcoming',
    null,
    round,
    bracketPosition,
    feedsIntoMatchId,
    feedsIntoSlot
  );

  const matchId = Number(result.lastInsertRowId);

  if (participantBId !== null) {
    for (let i = 1; i <= bestOfGames; i++) {
      db.runSync(
        'INSERT INTO table_tennis_match_games (match_id, game_number) VALUES (?, ?)',
        matchId,
        i
      );
    }
  }

  return {
    id: matchId,
    tournamentId,
    participantAId,
    participantBId,
    gamePoint,
    bestOfGames,
    status: 'upcoming',
    winnerId: null,
    createdAt: Math.floor(Date.now() / 1000),
    round,
    bracketPosition,
    feedsIntoMatchId,
    feedsIntoSlot,
  };
}

export function getTableTennisMatches(tournamentId: number): TableTennisMatch[] {
  const db = getDatabase();
  const rows = db.getAllSync<TableTennisMatch>(
    `SELECT id, tournament_id as tournamentId, participant_a_id as participantAId,
            participant_b_id as participantBId, game_point as gamePoint, best_of_games as bestOfGames,
            status, winner_id as winnerId, created_at as createdAt,
            round, bracket_position as bracketPosition,
            feeds_into_match_id as feedsIntoMatchId, feeds_into_slot as feedsIntoSlot
     FROM table_tennis_matches WHERE tournament_id = ? ORDER BY round, bracket_position`,
    tournamentId
  );
  return rows;
}

export function getTableTennisGames(matchId: number): TableTennisGame[] {
  const db = getDatabase();
  const rows = db.getAllSync<TableTennisGame>(
    `SELECT id, match_id as matchId, game_number as gameNumber, score_a as scoreA, score_b as scoreB
     FROM table_tennis_match_games WHERE match_id = ? ORDER BY game_number`,
    matchId
  );
  return rows;
}

export function updateTableTennisGame(
  matchId: number,
  gameNumber: number,
  scoreA: number | null,
  scoreB: number | null
) {
  const db = getDatabase();
  db.runSync(
    'UPDATE table_tennis_match_games SET score_a = ?, score_b = ? WHERE match_id = ? AND game_number = ?',
    scoreA,
    scoreB,
    matchId,
    gameNumber
  );
}

export function updateTableTennisMatchStatus(
  matchId: number,
  status: TableTennisMatch['status'],
  winnerId: number | null
) {
  const db = getDatabase();
  db.runSync(
    'UPDATE table_tennis_matches SET status = ?, winner_id = ? WHERE id = ?',
    status,
    winnerId,
    matchId
  );
}

// ─── Knockout Tournament Operations ──────────────────────────────────────────

export function updateBadmintonMatchParticipant(
  matchId: number,
  slot: 'A' | 'B',
  participantId: number
) {
  const db = getDatabase();
  const column = slot === 'A' ? 'participant_a_id' : 'participant_b_id';
  db.runSync(
    `UPDATE badminton_matches SET ${column} = ? WHERE id = ?`,
    participantId,
    matchId
  );

  // Create empty games if both participants are now known
  const match = db.getFirstSync<BadmintonMatch>(
    `SELECT id, participant_a_id as participantAId, participant_b_id as participantBId, best_of_games as bestOfGames
     FROM badminton_matches WHERE id = ?`,
    matchId
  );

  if (match && match.participantAId !== null && match.participantBId !== null) {
    // Check if games already exist
    const existingGames = db.getAllSync(
      'SELECT id FROM badminton_match_games WHERE match_id = ?',
      matchId
    );

    if (existingGames.length === 0) {
      // Create empty games
      for (let i = 1; i <= match.bestOfGames; i++) {
        db.runSync(
          'INSERT INTO badminton_match_games (match_id, game_number) VALUES (?, ?)',
          matchId,
          i
        );
      }
    }
  }
}

export function updateTennisMatchParticipant(
  matchId: number,
  slot: 'A' | 'B',
  participantId: number
) {
  const db = getDatabase();
  const column = slot === 'A' ? 'participant_a_id' : 'participant_b_id';
  db.runSync(
    `UPDATE tennis_matches SET ${column} = ? WHERE id = ?`,
    participantId,
    matchId
  );

  // Create empty sets if both participants are now known
  const match = db.getFirstSync<TennisMatch>(
    `SELECT id, participant_a_id as participantAId, participant_b_id as participantBId, sets_to_win as setsToWin
     FROM tennis_matches WHERE id = ?`,
    matchId
  );

  if (match && match.participantAId !== null && match.participantBId !== null) {
    // Check if sets already exist
    const existingSets = db.getAllSync(
      'SELECT id FROM tennis_match_sets WHERE match_id = ?',
      matchId
    );

    if (existingSets.length === 0) {
      // Create empty sets
      const maxSets = match.setsToWin * 2 - 1;
      for (let i = 1; i <= maxSets; i++) {
        db.runSync(
          'INSERT INTO tennis_match_sets (match_id, set_number) VALUES (?, ?)',
          matchId,
          i
        );
      }
    }
  }
}

export function updateBadmintonMatchBracketLink(
  matchId: number,
  feedsIntoMatchId: number,
  feedsIntoSlot: 'A' | 'B'
) {
  const db = getDatabase();
  db.runSync(
    'UPDATE badminton_matches SET feeds_into_match_id = ?, feeds_into_slot = ? WHERE id = ?',
    feedsIntoMatchId,
    feedsIntoSlot,
    matchId
  );
}

export function updateTennisMatchBracketLink(
  matchId: number,
  feedsIntoMatchId: number,
  feedsIntoSlot: 'A' | 'B'
) {
  const db = getDatabase();
  db.runSync(
    'UPDATE tennis_matches SET feeds_into_match_id = ?, feeds_into_slot = ? WHERE id = ?',
    feedsIntoMatchId,
    feedsIntoSlot,
    matchId
  );
}

export function updateTableTennisMatchParticipant(
  matchId: number,
  slot: 'A' | 'B',
  participantId: number
) {
  const db = getDatabase();
  const column = slot === 'A' ? 'participant_a_id' : 'participant_b_id';
  db.runSync(
    `UPDATE table_tennis_matches SET ${column} = ? WHERE id = ?`,
    participantId,
    matchId
  );

  const match = db.getFirstSync<TableTennisMatch>(
    `SELECT id, participant_a_id as participantAId, participant_b_id as participantBId, best_of_games as bestOfGames
     FROM table_tennis_matches WHERE id = ?`,
    matchId
  );

  if (match && match.participantAId !== null && match.participantBId !== null) {
    const existingGames = db.getAllSync(
      'SELECT id FROM table_tennis_match_games WHERE match_id = ?',
      matchId
    );

    if (existingGames.length === 0) {
      for (let i = 1; i <= match.bestOfGames; i++) {
        db.runSync(
          'INSERT INTO table_tennis_match_games (match_id, game_number) VALUES (?, ?)',
          matchId,
          i
        );
      }
    }
  }
}

export function updateTableTennisMatchBracketLink(
  matchId: number,
  feedsIntoMatchId: number,
  feedsIntoSlot: 'A' | 'B'
) {
  const db = getDatabase();
  db.runSync(
    'UPDATE table_tennis_matches SET feeds_into_match_id = ?, feeds_into_slot = ? WHERE id = ?',
    feedsIntoMatchId,
    feedsIntoSlot,
    matchId
  );
}
