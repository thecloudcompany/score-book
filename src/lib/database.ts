import { Platform } from 'react-native';
import { openDatabaseSync } from 'expo-sqlite';
import { getWebDatabase } from './database-web';

interface DatabaseLike {
  execSync(sql: string): void;
  runSync(sql: string, ...params: any[]): { lastInsertRowId: number; changes: number };
  getAllSync<T>(sql: string, ...params: any[]): T[];
  getFirstSync<T>(sql: string, ...params: any[]): T | null;
}

let db: DatabaseLike | null = null;

export function getDatabase(): DatabaseLike {
  if (!db) {
    if (Platform.OS === 'web') {
      db = getWebDatabase() as DatabaseLike;
    } else {
      db = openDatabaseSync('scorebook.db') as unknown as DatabaseLike;
    }
  }
  return db;
}

export function initDatabase() {
  const database = getDatabase();

  database.execSync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS tournaments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      sport TEXT NOT NULL CHECK(sport IN ('badminton', 'tennis', 'table_tennis')),
      type TEXT NOT NULL DEFAULT 'round_robin' CHECK(type IN ('round_robin', 'knockout')),
      status TEXT NOT NULL DEFAULT 'upcoming' CHECK(status IN ('upcoming', 'active', 'completed')),
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    );

    CREATE TABLE IF NOT EXISTS participants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tournament_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
      UNIQUE(tournament_id, name)
    );

    CREATE TABLE IF NOT EXISTS badminton_matches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tournament_id INTEGER NOT NULL,
      participant_a_id INTEGER NOT NULL,
      participant_b_id INTEGER,
      game_point INTEGER NOT NULL DEFAULT 21,
      best_of_games INTEGER NOT NULL DEFAULT 3,
      status TEXT NOT NULL DEFAULT 'upcoming' CHECK(status IN ('upcoming', 'in_progress', 'completed')),
      winner_id INTEGER,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      round INTEGER NOT NULL DEFAULT 1,
      bracket_position INTEGER NOT NULL DEFAULT 1,
      feeds_into_match_id INTEGER,
      feeds_into_slot TEXT CHECK(feeds_into_slot IN ('A', 'B')),
      FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
      FOREIGN KEY (participant_a_id) REFERENCES participants(id),
      FOREIGN KEY (participant_b_id) REFERENCES participants(id),
      FOREIGN KEY (winner_id) REFERENCES participants(id)
    );

    CREATE TABLE IF NOT EXISTS badminton_match_games (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      match_id INTEGER NOT NULL,
      game_number INTEGER NOT NULL,
      score_a INTEGER,
      score_b INTEGER,
      FOREIGN KEY (match_id) REFERENCES badminton_matches(id) ON DELETE CASCADE,
      UNIQUE(match_id, game_number)
    );

    CREATE TABLE IF NOT EXISTS tennis_matches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tournament_id INTEGER NOT NULL,
      participant_a_id INTEGER NOT NULL,
      participant_b_id INTEGER,
      sets_to_win INTEGER NOT NULL DEFAULT 2,
      games_to_win_per_set INTEGER NOT NULL DEFAULT 6,
      status TEXT NOT NULL DEFAULT 'upcoming' CHECK(status IN ('upcoming', 'in_progress', 'completed')),
      winner_id INTEGER,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      round INTEGER NOT NULL DEFAULT 1,
      bracket_position INTEGER NOT NULL DEFAULT 1,
      feeds_into_match_id INTEGER,
      feeds_into_slot TEXT CHECK(feeds_into_slot IN ('A', 'B')),
      FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
      FOREIGN KEY (participant_a_id) REFERENCES participants(id),
      FOREIGN KEY (participant_b_id) REFERENCES participants(id),
      FOREIGN KEY (winner_id) REFERENCES participants(id)
    );

    CREATE TABLE IF NOT EXISTS tennis_match_sets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      match_id INTEGER NOT NULL,
      set_number INTEGER NOT NULL,
      games_a INTEGER,
      games_b INTEGER,
      FOREIGN KEY (match_id) REFERENCES tennis_matches(id) ON DELETE CASCADE,
      UNIQUE(match_id, set_number)
    );

    CREATE INDEX IF NOT EXISTS idx_badminton_matches_bracket 
      ON badminton_matches(tournament_id, round, bracket_position);

    CREATE INDEX IF NOT EXISTS idx_tennis_matches_bracket 
      ON tennis_matches(tournament_id, round, bracket_position);

    CREATE TABLE IF NOT EXISTS table_tennis_matches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tournament_id INTEGER NOT NULL,
      participant_a_id INTEGER NOT NULL,
      participant_b_id INTEGER,
      game_point INTEGER NOT NULL DEFAULT 11,
      best_of_games INTEGER NOT NULL DEFAULT 3,
      status TEXT NOT NULL DEFAULT 'upcoming' CHECK(status IN ('upcoming', 'in_progress', 'completed')),
      winner_id INTEGER,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      round INTEGER NOT NULL DEFAULT 1,
      bracket_position INTEGER NOT NULL DEFAULT 1,
      feeds_into_match_id INTEGER,
      feeds_into_slot TEXT CHECK(feeds_into_slot IN ('A', 'B')),
      FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
      FOREIGN KEY (participant_a_id) REFERENCES participants(id),
      FOREIGN KEY (participant_b_id) REFERENCES participants(id),
      FOREIGN KEY (winner_id) REFERENCES participants(id)
    );

    CREATE TABLE IF NOT EXISTS table_tennis_match_games (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      match_id INTEGER NOT NULL,
      game_number INTEGER NOT NULL,
      score_a INTEGER,
      score_b INTEGER,
      FOREIGN KEY (match_id) REFERENCES table_tennis_matches(id) ON DELETE CASCADE,
      UNIQUE(match_id, game_number)
    );

    CREATE INDEX IF NOT EXISTS idx_table_tennis_matches_bracket 
      ON table_tennis_matches(tournament_id, round, bracket_position);
  `);

  // Migration: Add tournament_type column if it doesn't exist
  try {
    database.execSync(`
      ALTER TABLE tournaments ADD COLUMN type TEXT NOT NULL DEFAULT 'round_robin' CHECK(type IN ('round_robin', 'knockout'));
    `);
  } catch (e) {
    // Column already exists, ignore
  }

  // Migration: Add bracket columns to badminton_matches if they don't exist
  try {
    database.execSync(`ALTER TABLE badminton_matches ADD COLUMN round INTEGER NOT NULL DEFAULT 1;`);
  } catch (e) {}
  try {
    database.execSync(`ALTER TABLE badminton_matches ADD COLUMN bracket_position INTEGER NOT NULL DEFAULT 1;`);
  } catch (e) {}
  try {
    database.execSync(`ALTER TABLE badminton_matches ADD COLUMN feeds_into_match_id INTEGER;`);
  } catch (e) {}
  try {
    database.execSync(`ALTER TABLE badminton_matches ADD COLUMN feeds_into_slot TEXT CHECK(feeds_into_slot IN ('A', 'B'));`);
  } catch (e) {}

  // Migration: Add bracket columns to tennis_matches if they don't exist
  try {
    database.execSync(`ALTER TABLE tennis_matches ADD COLUMN round INTEGER NOT NULL DEFAULT 1;`);
  } catch (e) {}
  try {
    database.execSync(`ALTER TABLE tennis_matches ADD COLUMN bracket_position INTEGER NOT NULL DEFAULT 1;`);
  } catch (e) {}
  try {
    database.execSync(`ALTER TABLE tennis_matches ADD COLUMN feeds_into_match_id INTEGER;`);
  } catch (e) {}
  try {
    database.execSync(`ALTER TABLE tennis_matches ADD COLUMN feeds_into_slot TEXT CHECK(feeds_into_slot IN ('A', 'B'));`);
  } catch (e) {}

  // Migration: Add bracket columns to table_tennis_matches if they don't exist
  try {
    database.execSync(`ALTER TABLE table_tennis_matches ADD COLUMN round INTEGER NOT NULL DEFAULT 1;`);
  } catch (e) {}
  try {
    database.execSync(`ALTER TABLE table_tennis_matches ADD COLUMN bracket_position INTEGER NOT NULL DEFAULT 1;`);
  } catch (e) {}
  try {
    database.execSync(`ALTER TABLE table_tennis_matches ADD COLUMN feeds_into_match_id INTEGER;`);
  } catch (e) {}
  try {
    database.execSync(`ALTER TABLE table_tennis_matches ADD COLUMN feeds_into_slot TEXT CHECK(feeds_into_slot IN ('A', 'B'));`);
  } catch (e) {}
}
