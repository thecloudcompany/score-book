import { getDatabase } from './database';
import type {
  Tournament,
  Participant,
  BadmintonMatch,
  BadmintonGame,
  TennisMatch,
  TennisSet,
  SportType,
} from '@/types';

// ─── Tournaments ─────────────────────────────────────────────────────────────

export function createTournament(
  name: string,
  sport: SportType
): Tournament {
  const db = getDatabase();
  const result = db.runSync(
    'INSERT INTO tournaments (name, sport, status) VALUES (?, ?, ?)',
    name,
    sport,
    'upcoming'
  );

  return {
    id: Number(result.lastInsertRowId),
    name,
    sport,
    status: 'upcoming',
    createdAt: Math.floor(Date.now() / 1000),
    updatedAt: Math.floor(Date.now() / 1000),
  };
}

export function getTournaments(): Tournament[] {
  const db = getDatabase();
  const rows = db.getAllSync<Tournament>(
    'SELECT id, name, sport, status, created_at as createdAt, updated_at as updatedAt FROM tournaments ORDER BY created_at DESC'
  );
  return rows;
}

export function getTournament(id: number): Tournament | null {
  const db = getDatabase();
  const row = db.getFirstSync<Tournament>(
    'SELECT id, name, sport, status, created_at as createdAt, updated_at as updatedAt FROM tournaments WHERE id = ?',
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

export function updateParticipantName(id: number, name: string) {
  const db = getDatabase();
  db.runSync('UPDATE participants SET name = ? WHERE id = ?', name, id);
}

// ─── Badminton Matches ───────────────────────────────────────────────────────

export function createBadmintonMatch(
  tournamentId: number,
  participantAId: number,
  participantBId: number,
  gamePoint: number,
  bestOfGames: number
): BadmintonMatch {
  const db = getDatabase();
  const result = db.runSync(
    'INSERT INTO badminton_matches (tournament_id, participant_a_id, participant_b_id, game_point, best_of_games, status, winner_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
    tournamentId,
    participantAId,
    participantBId,
    gamePoint,
    bestOfGames,
    'upcoming',
    null
  );

  const matchId = Number(result.lastInsertRowId);

  // Create empty games
  for (let i = 1; i <= bestOfGames; i++) {
    db.runSync(
      'INSERT INTO badminton_match_games (match_id, game_number) VALUES (?, ?)',
      matchId,
      i
    );
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
  };
}

export function getBadmintonMatches(tournamentId: number): BadmintonMatch[] {
  const db = getDatabase();
  const rows = db.getAllSync<BadmintonMatch>(
    `SELECT id, tournament_id as tournamentId, participant_a_id as participantAId,
            participant_b_id as participantBId, game_point as gamePoint, best_of_games as bestOfGames,
            status, winner_id as winnerId, created_at as createdAt
     FROM badminton_matches WHERE tournament_id = ? ORDER BY id`,
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

export function createTennisMatch(
  tournamentId: number,
  participantAId: number,
  participantBId: number,
  setsToWin: number,
  gamesToWinPerSet: number
): TennisMatch {
  const db = getDatabase();
  const result = db.runSync(
    'INSERT INTO tennis_matches (tournament_id, participant_a_id, participant_b_id, sets_to_win, games_to_win_per_set, status, winner_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
    tournamentId,
    participantAId,
    participantBId,
    setsToWin,
    gamesToWinPerSet,
    'upcoming',
    null
  );

  const matchId = Number(result.lastInsertRowId);
  const maxSets = setsToWin * 2 - 1;

  // Create empty sets
  for (let i = 1; i <= maxSets; i++) {
    db.runSync(
      'INSERT INTO tennis_match_sets (match_id, set_number) VALUES (?, ?)',
      matchId,
      i
    );
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
  };
}

export function getTennisMatches(tournamentId: number): TennisMatch[] {
  const db = getDatabase();
  const rows = db.getAllSync<TennisMatch>(
    `SELECT id, tournament_id as tournamentId, participant_a_id as participantAId,
            participant_b_id as participantBId, sets_to_win as setsToWin, games_to_win_per_set as gamesToWinPerSet,
            status, winner_id as winnerId, created_at as createdAt
     FROM tennis_matches WHERE tournament_id = ? ORDER BY id`,
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
