/**
 * WebDatabase — SQLite sync API emulator for web, backed by localStorage.
 * Implements only the SQL patterns used by db-operations.ts.
 */

type Row = Record<string, any>;

interface RunResult {
  lastInsertRowId: number;
  changes: number;
}

const STORAGE_KEY = 'scorebook:web-db:v2';

class WebDatabase {
  private tables: Record<string, Row[]>;
  private sequences: Record<string, number>;

  constructor() {
    this.tables = {};
    this.sequences = {};
    this.reload();
    // Keep this tab fresh when another tab writes.
    // Note: this narrows the stale-write window (every op reloads first)
    // but overlapping same-moment writes can still race — no cross-tab lock.
    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEY) this.reload();
      });
    }
  }

  // Re-read the persisted snapshot so an idle tab never writes from stale state.
  private reload() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        this.tables = parsed.tables ?? {};
        this.sequences = parsed.sequences ?? {};
      }
    } catch {
      // Corrupt snapshot — keep in-memory state rather than wiping it.
    }
  }

  private persist() {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ tables: this.tables, sequences: this.sequences })
    );
  }

  private nextId(table: string): number {
    const id = (this.sequences[table] ?? 0) + 1;
    this.sequences[table] = id;
    return id;
  }

  // ─── execSync ─────────────────────────────────────────────────────────
  execSync(source: string) {
    this.reload();
    const stmts = source
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const stmt of stmts) {
      const upper = stmt.toUpperCase();
      // Schemaless store: constraints/migrations/indexes are no-ops.
      if (upper.startsWith('PRAGMA')) continue;
      if (upper.startsWith('CREATE INDEX')) continue;
      if (upper.startsWith('ALTER TABLE')) continue;
      if (upper.startsWith('DROP TABLE')) continue;

      // CREATE TABLE IF NOT EXISTS table_name (...)
      const createMatch = stmt.match(
        /CREATE\s+TABLE\s+IF\s+NOT\s+EXISTS\s+(\w+)/i
      );
      if (createMatch) {
        const table = createMatch[1];
        if (!this.tables[table]) {
          this.tables[table] = [];
        }
        continue;
      }

      throw new Error(`WebDatabase execSync: unsupported statement: ${stmt.slice(0, 50)}`);
    }

    this.persist();
  }

  // ─── runSync ──────────────────────────────────────────────────────────
  runSync(source: string, ...params: any[]): RunResult {
    this.reload();
    // INSERT INTO table (cols) VALUES (?...)
    const insertMatch = source.match(
      /INSERT\s+INTO\s+(\w+)\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)/i
    );
    if (insertMatch) {
      const table = insertMatch[1];
      // INSERT OR IGNORE into schema_migrations — track versions in-memory only.
      if (table === 'schema_migrations') return { lastInsertRowId: 0, changes: 0 };
      const cols = insertMatch[2].split(',').map((c) => c.trim());
      const row: Row = { id: this.nextId(table) };
      for (let i = 0; i < cols.length; i++) {
        row[cols[i]] = params[i] ?? null;
      }
      // Default timestamps
      if (cols.includes('created_at') === false && !row.created_at) {
        row.created_at = Math.floor(Date.now() / 1000);
      }
      if (cols.includes('updated_at') === false && !row.updated_at) {
        row.updated_at = Math.floor(Date.now() / 1000);
      }
      // Default status for match tables
      if (cols.includes('status') === false && row.status === undefined) {
        row.status = 'upcoming';
      }
      // Default winner_id for match tables
      if (cols.includes('winner_id') === false && row.winner_id === undefined) {
        row.winner_id = null;
      }
      this.tables[table] = this.tables[table] || [];
      this.tables[table].push(row);
      this.persist();
      return { lastInsertRowId: row.id, changes: 1 };
    }

    // UPDATE table SET ... WHERE ...
    const updateMatch = source.match(
      /UPDATE\s+(\w+)\s+SET\s+(.+?)\s+WHERE\s+(.+)/i
    );
    if (updateMatch) {
      const table = updateMatch[1];
      const setClause = updateMatch[2];
      const whereClause = updateMatch[3];
      const rows = this.tables[table] || [];

      // Parse SET col = ?, col2 = ?
      const setPairs = setClause.split(',').map((s) => {
        const m = s.trim().match(/(\w+)\s*=\s*\?/);
        return m ? m[1] : null;
      }).filter(Boolean) as string[];

      // Parse WHERE (simple: col = ? or col = ? AND col2 = ?)
      const where = this.parseWhere(whereClause, params.slice(setPairs.length));

      let changes = 0;
      for (const row of rows) {
        if (this.matchesWhere(row, where)) {
          for (let i = 0; i < setPairs.length; i++) {
            row[setPairs[i]] = params[i];
          }
          changes++;
        }
      }
      this.persist();
      return { lastInsertRowId: 0, changes };
    }

    // DELETE FROM table WHERE col = ?
    const deleteMatch = source.match(/DELETE\s+FROM\s+(\w+)\s+WHERE\s+(.+)/i);
    if (deleteMatch) {
      const table = deleteMatch[1];
      const whereClause = deleteMatch[2];
      const rows = this.tables[table] || [];
      const where = this.parseWhere(whereClause, params);
      const before = rows.length;
      this.tables[table] = rows.filter((row) => !this.matchesWhere(row, where));
      const changes = before - this.tables[table].length;

      // CASCADE: delete from child tables
      if (table === 'tournaments') {
        const tid = params[0] as number;
        const matchId = (t: string) =>
          new Set((this.tables[t] || []).filter((r) => r.tournament_id === tid).map((r) => r.id));
        const badmintonIds = matchId('badminton_matches');
        const tennisIds = matchId('tennis_matches');
        const tableTennisIds = matchId('table_tennis_matches');
        const pickleballIds = matchId('pickleball_matches');
        this.tables['participants'] = (this.tables['participants'] || []).filter(
          (r) => r.tournament_id !== tid
        );
        this.tables['badminton_matches'] = (this.tables['badminton_matches'] || []).filter(
          (r) => r.tournament_id !== tid
        );
        this.tables['tennis_matches'] = (this.tables['tennis_matches'] || []).filter(
          (r) => r.tournament_id !== tid
        );
        this.tables['table_tennis_matches'] = (this.tables['table_tennis_matches'] || []).filter(
          (r) => r.tournament_id !== tid
        );
        this.tables['badminton_match_games'] = (this.tables['badminton_match_games'] || []).filter(
          (r) => !badmintonIds.has(r.match_id)
        );
        this.tables['tennis_match_sets'] = (this.tables['tennis_match_sets'] || []).filter(
          (r) => !tennisIds.has(r.match_id)
        );
        this.tables['table_tennis_match_games'] = (this.tables['table_tennis_match_games'] || []).filter(
          (r) => !tableTennisIds.has(r.match_id)
        );
        this.tables['pickleball_matches'] = (this.tables['pickleball_matches'] || []).filter(
          (r) => r.tournament_id !== tid
        );
        this.tables['pickleball_match_games'] = (this.tables['pickleball_match_games'] || []).filter(
          (r) => !pickleballIds.has(r.match_id)
        );
      }
      if (table === 'badminton_matches') {
        const mid = params[0] as number;
        this.tables['badminton_match_games'] = (this.tables['badminton_match_games'] || []).filter(
          (r) => r.match_id !== mid
        );
      }
      if (table === 'tennis_matches') {
        const mid = params[0] as number;
        this.tables['tennis_match_sets'] = (this.tables['tennis_match_sets'] || []).filter(
          (r) => r.match_id !== mid
        );
      }
      if (table === 'table_tennis_matches') {
        const mid = params[0] as number;
        this.tables['table_tennis_match_games'] = (this.tables['table_tennis_match_games'] || []).filter(
          (r) => r.match_id !== mid
        );
      }
      if (table === 'pickleball_matches') {
        const mid = params[0] as number;
        this.tables['pickleball_match_games'] = (this.tables['pickleball_match_games'] || []).filter(
          (r) => r.match_id !== mid
        );
      }

      this.persist();
      return { lastInsertRowId: 0, changes };
    }

    throw new Error(`WebDatabase runSync: unsupported query: ${source.slice(0, 80)}`);
  }

  // ─── getAllSync ───────────────────────────────────────────────────────
  getAllSync<T>(source: string, ...params: any[]): T[] {
    return this.query<T>(source, params);
  }

  // ─── getFirstSync ─────────────────────────────────────────────────────
  getFirstSync<T>(source: string, ...params: any[]): T | null {
    const rows = this.query<T>(source, params);
    return rows.length > 0 ? rows[0] : null;
  }

  // ─── Internal query engine ────────────────────────────────────────────
  private query<T>(source: string, params: any[]): T[] {
    this.reload();
    const upper = source.trim().toUpperCase();
    if (upper.startsWith('PRAGMA')) return [];
    if (upper.includes('SQLITE_MASTER')) return [];
    if (upper.includes('SCHEMA_MIGRATIONS')) return [];
    const selectMatch = source.match(
      /SELECT\s+([\s\S]+?)\s+FROM\s+(\w+)(?:\s+WHERE\s+([\s\S]+?)(?=\s+ORDER\s+BY|$))?(?:\s+ORDER\s+BY\s+([\s\S]+))?/i
    );
    if (!selectMatch) {
      throw new Error(`WebDatabase query: unsupported SELECT: ${source.slice(0, 80)}`);
    }

    const colSpec = selectMatch[1].trim();
    const table = selectMatch[2];
    const whereClause = selectMatch[3];
    const orderBy = selectMatch[4];

    let rows = [...(this.tables[table] || [])];

    // Apply WHERE
    if (whereClause) {
      const where = this.parseWhere(whereClause, params);
      rows = rows.filter((row) => this.matchesWhere(row, where));
    }

    // Apply ORDER BY
    if (orderBy) {
      const ob = orderBy.trim();
      const desc = ob.toUpperCase().endsWith('DESC');
      const col = ob.replace(/\s+(ASC|DESC)$/i, '').trim();
      rows.sort((a, b) => {
        const av = a[col] ?? 0;
        const bv = b[col] ?? 0;
        if (av < bv) return desc ? 1 : -1;
        if (av > bv) return desc ? -1 : 1;
        return 0;
      });
    }

    // Map columns (handle aliases like created_at as createdAt)
    const colDefs = colSpec.split(',').map((c) => c.trim());
    return rows.map((row) => {
      const mapped: any = {};
      for (const def of colDefs) {
        const aliasMatch = def.match(/(.+?)\s+as\s+(\w+)/i);
        if (aliasMatch) {
          const srcCol = aliasMatch[1].trim();
          const alias = aliasMatch[2];
          mapped[alias] = row[srcCol] ?? null;
        } else if (def === '*') {
          Object.assign(mapped, row);
        } else {
          mapped[def] = row[def] ?? null;
        }
      }
      return mapped as T;
    });
  }

  // ─── WHERE parser ─────────────────────────────────────────────────────
  private parseWhere(clause: string, params: any[]): { col: string; val: any }[] {
    const conditions: { col: string; val: any }[] = [];
    const parts = clause.split(/\s+AND\s+/i);
    let pIdx = 0;
    for (const part of parts) {
      const m = part.trim().match(/(\w+)\s*=\s*\?/);
      if (m) {
        conditions.push({ col: m[1], val: params[pIdx] });
        pIdx++;
      }
    }
    return conditions;
  }

  private matchesWhere(row: Row, where: { col: string; val: any }[]): boolean {
    return where.every((w) => row[w.col] === w.val);
  }
}

// Singleton
let webDb: WebDatabase | null = null;

export function getWebDatabase() {
  if (!webDb) webDb = new WebDatabase();
  return webDb;
}
