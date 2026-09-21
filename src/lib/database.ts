import { Platform } from 'react-native';
import { openDatabase } from './db-adapter';

interface DatabaseLike {
  execSync(sql: string): void;
  runSync(sql: string, ...params: any[]): { lastInsertRowId: number; changes: number };
  getAllSync<T>(sql: string, ...params: any[]): T[];
  getFirstSync<T>(sql: string, ...params: any[]): T | null;
}

let db: DatabaseLike | null = null;

export function getDatabase(): DatabaseLike {
  if (!db) {
    db = openDatabase() as unknown as DatabaseLike;
  }
  return db;
}

const SPORT_CHECK = `CHECK(sport IN ('badminton', 'tennis', 'table_tennis', 'pickleball'))`;

function matchTableDef(table: string, extra: string): string {
  return `CREATE TABLE IF NOT EXISTS ${table} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tournament_id INTEGER NOT NULL,
      participant_a_id INTEGER,
      participant_b_id INTEGER,
      ${extra},
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
    );`;
}

function baseSchema(database: DatabaseLike) {
  // ponytail: sequential statements so one failure can't abort the rest.
  const statements = [
    `CREATE TABLE IF NOT EXISTS tournaments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      sport TEXT NOT NULL ${SPORT_CHECK},
      type TEXT NOT NULL DEFAULT 'round_robin' CHECK(type IN ('round_robin', 'knockout')),
      status TEXT NOT NULL DEFAULT 'upcoming' CHECK(status IN ('upcoming', 'active', 'completed')),
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    );`,
    `CREATE TABLE IF NOT EXISTS participants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tournament_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
      UNIQUE(tournament_id, name)
    );`,
    matchTableDef('badminton_matches', 'game_point INTEGER NOT NULL DEFAULT 21,\n      best_of_games INTEGER NOT NULL DEFAULT 3'),
    `CREATE TABLE IF NOT EXISTS badminton_match_games (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      match_id INTEGER NOT NULL,
      game_number INTEGER NOT NULL,
      score_a INTEGER,
      score_b INTEGER,
      FOREIGN KEY (match_id) REFERENCES badminton_matches(id) ON DELETE CASCADE,
      UNIQUE(match_id, game_number)
    );`,
    matchTableDef('tennis_matches', 'sets_to_win INTEGER NOT NULL DEFAULT 2,\n      games_to_win_per_set INTEGER NOT NULL DEFAULT 6'),
    `CREATE TABLE IF NOT EXISTS tennis_match_sets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      match_id INTEGER NOT NULL,
      set_number INTEGER NOT NULL,
      games_a INTEGER,
      games_b INTEGER,
      FOREIGN KEY (match_id) REFERENCES tennis_matches(id) ON DELETE CASCADE,
      UNIQUE(match_id, set_number)
    );`,
    matchTableDef('table_tennis_matches', 'game_point INTEGER NOT NULL DEFAULT 11,\n      best_of_games INTEGER NOT NULL DEFAULT 3'),
    `CREATE TABLE IF NOT EXISTS table_tennis_match_games (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      match_id INTEGER NOT NULL,
      game_number INTEGER NOT NULL,
      score_a INTEGER,
      score_b INTEGER,
      FOREIGN KEY (match_id) REFERENCES table_tennis_matches(id) ON DELETE CASCADE,
      UNIQUE(match_id, game_number)
    );`,
    matchTableDef('pickleball_matches', 'game_point INTEGER NOT NULL DEFAULT 11,\n      best_of_games INTEGER NOT NULL DEFAULT 3'),
    `CREATE TABLE IF NOT EXISTS pickleball_match_games (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      match_id INTEGER NOT NULL,
      game_number INTEGER NOT NULL,
      score_a INTEGER,
      score_b INTEGER,
      FOREIGN KEY (match_id) REFERENCES pickleball_matches(id) ON DELETE CASCADE,
      UNIQUE(match_id, game_number)
    );`,
  ];
  for (const sql of statements) database.execSync(sql);
}

function columnNames(database: DatabaseLike, table: string): string[] | null {
  try {
    const rows = database.getAllSync<{ name: string }>(`PRAGMA table_info(${table});`);
    if (!rows || rows.length === 0) return null;
    return rows.map((r) => r.name);
  } catch {
    return null;
  }
}

function tableSql(database: DatabaseLike, table: string): string | null {
  try {
    const row = database.getFirstSync<{ sql: string }>(
      `SELECT sql FROM sqlite_master WHERE type = 'table' AND name = ?;`,
      table
    );
    return row?.sql ?? null;
  } catch {
    return null;
  }
}

function ensureColumn(database: DatabaseLike, table: string, column: string, def: string) {
  const cols = columnNames(database, table);
  if (cols === null) return; // fresh table already has it via baseSchema
  if (!cols.includes(column)) database.execSync(`ALTER TABLE ${table} ADD COLUMN ${def};`);
}

function rebuildTable(database: DatabaseLike, table: string, createSql: string, columns: string[]) {
  database.execSync('PRAGMA foreign_keys = OFF;');
  try {
    database.execSync(createSql.replace(table, `${table}_new`));
    const cols = columns.join(', ');
    database.execSync(`INSERT INTO ${table}_new (${cols}) SELECT ${cols} FROM ${table};`);
    database.execSync(`DROP TABLE ${table};`);
    database.execSync(`ALTER TABLE ${table}_new RENAME TO ${table};`);
  } finally {
    database.execSync('PRAGMA foreign_keys = ON;');
  }
}

function migrateNative(database: DatabaseLike) {
  // Ordered, idempotent migrations for pre-existing databases.
  database.execSync(
    `CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY, applied_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')));`
  );
  const applied = new Set(
    database.getAllSync<{ version: number }>(`SELECT version FROM schema_migrations;`).map((r) => r.version)
  );
  const record = (v: number) => {
    database.runSync(`INSERT OR IGNORE INTO schema_migrations (version) VALUES (?);`, v);
    applied.add(v);
  };

  // v1: knockout bracket columns (round 2+ needs TBD slots).
  if (!applied.has(1)) {
    for (const table of ['badminton_matches', 'tennis_matches', 'table_tennis_matches']) {
      ensureColumn(database, table, 'round', 'round INTEGER NOT NULL DEFAULT 1');
      ensureColumn(database, table, 'bracket_position', 'bracket_position INTEGER NOT NULL DEFAULT 1');
      ensureColumn(database, table, 'feeds_into_match_id', 'feeds_into_match_id INTEGER');
      ensureColumn(database, table, 'feeds_into_slot', `feeds_into_slot TEXT CHECK(feeds_into_slot IN ('A', 'B'))`);
    }
    ensureColumn(database, 'tournaments', 'type', `type TEXT NOT NULL DEFAULT 'round_robin' CHECK(type IN ('round_robin', 'knockout'))`);
    record(1);
  }

  // v2: nullable participant_a_id so later-round TBD matches can be created.
  if (!applied.has(2)) {
    for (const [table, extra] of [
      ['badminton_matches', 'game_point INTEGER NOT NULL DEFAULT 21,\n      best_of_games INTEGER NOT NULL DEFAULT 3'],
      ['tennis_matches', 'sets_to_win INTEGER NOT NULL DEFAULT 2,\n      games_to_win_per_set INTEGER NOT NULL DEFAULT 6'],
      ['table_tennis_matches', 'game_point INTEGER NOT NULL DEFAULT 11,\n      best_of_games INTEGER NOT NULL DEFAULT 3'],
    ] as const) {
      const cols = columnNames(database, table);
      if (cols === null) continue;
      const info = database.getAllSync<{ name: string; notnull: number }>(`PRAGMA table_info(${table});`);
      const aCol = info.find((c) => c.name === 'participant_a_id');
      if (aCol && aCol.notnull === 1) {
        const keep = cols.filter((c) =>
          ['id', 'tournament_id', 'participant_a_id', 'participant_b_id', 'game_point', 'best_of_games', 'sets_to_win', 'games_to_win_per_set', 'status', 'winner_id', 'created_at', 'round', 'bracket_position', 'feeds_into_match_id', 'feeds_into_slot'].includes(c)
        );
        rebuildTable(database, table, matchTableDef(table, extra), keep);
      }
    }
    record(2);
  }

  // v3: widen tournaments.sport to include table_tennis (CREATE IF NOT EXISTS never alters it).
  if (!applied.has(3)) {
    const sql = tableSql(database, 'tournaments');
    if (sql && !sql.includes('table_tennis')) {
      rebuildTable(
        database,
        'tournaments',
        `CREATE TABLE tournaments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          sport TEXT NOT NULL ${SPORT_CHECK},
          type TEXT NOT NULL DEFAULT 'round_robin' CHECK(type IN ('round_robin', 'knockout')),
          status TEXT NOT NULL DEFAULT 'upcoming' CHECK(status IN ('upcoming', 'active', 'completed')),
          created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
          updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
        );`,
        ['id', 'name', 'sport', 'type', 'status', 'created_at', 'updated_at']
      );
    }
    record(3);
  }

  // v4: widen tournaments.sport to include pickleball.
  if (!applied.has(4)) {
    const sql = tableSql(database, 'tournaments');
    if (sql && !sql.includes('pickleball')) {
      rebuildTable(
        database,
        'tournaments',
        `CREATE TABLE tournaments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          sport TEXT NOT NULL ${SPORT_CHECK},
          type TEXT NOT NULL DEFAULT 'round_robin' CHECK(type IN ('round_robin', 'knockout')),
          status TEXT NOT NULL DEFAULT 'upcoming' CHECK(status IN ('upcoming', 'active', 'completed')),
          created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
          updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
        );`,
        ['id', 'name', 'sport', 'type', 'status', 'created_at', 'updated_at']
      );
    }
    record(4);
  }
}

export function initDatabase() {
  const database = getDatabase();
  database.execSync('PRAGMA journal_mode = WAL;');
  database.execSync('PRAGMA foreign_keys = ON;');

  baseSchema(database);

  // Web emulator is schemaless — native PRAGMA/sqlite_master migrations would throw there.
  if (Platform.OS === 'web') return;

  migrateNative(database);

  // Indexes last, so they can never run before the columns they reference.
  for (const [table, name] of [
    ['badminton_matches', 'idx_badminton_matches_bracket'],
    ['tennis_matches', 'idx_tennis_matches_bracket'],
    ['table_tennis_matches', 'idx_table_tennis_matches_bracket'],
    ['pickleball_matches', 'idx_pickleball_matches_bracket'],
  ] as const) {
    database.execSync(`CREATE INDEX IF NOT EXISTS ${name} ON ${table}(tournament_id, round, bracket_position);`);
  }
}
