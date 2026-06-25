# v3: Table Tennis (Sport)

## Overview

Table tennis is the third sport added to ScoreBook. Structurally it is a near-twin of badminton: a match is **best-of-N games**, each game is played to an organizer-set target (default **11** points), and the first participant to win `ceil(N/2)` games wins the match. The single behavioral delta from badminton is the **win-by-2 rule** — once a game goes to deuce (both players at or above `target - 1`), play must continue until one side leads by 2. This mirrors real table-tennis rules and is enforced as a hard validation gate in `validateUnitScore`.

Scope for v3 is deliberately narrow per the Play-Store feedback that the UI already works well: only scoring rules, format configuration, and final standings. Bracket generation, advancement, sharing, and tournament-type selection are unchanged from v1/v2 and apply to table tennis through the same sport-agnostic paths.

## Implementation Status

🚧 **Planned** - Design complete, implementation pending. Domain language and storage strategy resolved in a `/grilling` session; see `docs/adr/0001-per-sport-match-tables.md` for the storage decision.

## Domain Decisions (Grilling Summary)

| # | Decision | Choice |
|---|----------|--------|
| 1 | Match structure | Best-of-N games (each to a target) — mirrors badminton's shape |
| 2 | Validation rule | `winner >= target` AND `(winner - loser) >= 2`; cap-less deuce (loser may also exceed target) |
| 3 | Format keys | Reuse badminton's `{ gamePoint, bestOfGames }` (no new key set) |
| 4 | DB storage | Clone badminton's two-table pattern: `table_tennis_matches` + `table_tennis_match_games` |
| 5 | Default format | `gamePoint: 11`, `bestOfGames: 3` |
| 6 | Tournament types | Both Round-Robin and Knockout (no per-sport branching) |
| 7 | Sport id / display | `table_tennis` / "Table Tennis" + 🏓 |

## Core Features

### 1. Sport Selector — Third Option

**User Flow:**
1. Enter tournament name
2. Select sport: **Badminton** / **Tennis** / **Table Tennis** ← NEW
3. Select tournament type (Round-Robin / Knockout)
4. Add participants
5. Configure format (sport-specific options)
6. Create tournament

**UI Changes:**
- Add a third button in the sport row of `tournament-details-section.tsx`
- 🏓 emoji + "Table Tennis" label
- The form's sport-specific format row and advanced options branch on `sport === 'table_tennis'`

**Implementation:**
- Extend `SportType` in `src/types/index.ts`: `'badminton' | 'tennis' | 'table_tennis'`
- Update `tournaments.sport` CHECK constraint in `src/lib/database.ts` to include `'table_tennis'`
- The sport's `defaultFormat` is read from `tableTennisSport` and used to seed the form

### 2. Format Configuration

**User Flow (Table Tennis):**
- **Main row:** "Games to win" — Single / Best of 3 / Best of 5 (same picker as badminton; default "Best of 3")
- **Advanced:** "Points to win" — TextInput, default 11

**Why same shape as badminton:**
- The scoring engine treats both as "multi-game match, each game to a target." Sharing the format keys means zero changes to `determineWinner`, the leaderboard, the scheduler, or the bracket engine.
- The only behavioural difference lives in `validateUnitScore` (the win-by-2 check).

**Implementation:**
- `tableTennisSport.defaultFormat = { gamePoint: 11, bestOfGames: 3 }`
- `create.tsx` `handleSetSport` adds a third branch seeding `{ gamePoint: 11, bestOfGames: 3 }`
- `tournament-details-section.tsx` adds a third branch in the format-key switch (uses `bestOfGames` like badminton) and a third branch in the Advanced row (uses `gamePoint` TextInput, default 11)

### 3. Validation Rule — Win-by-2

**Predicate:**
```
validUnitScore(scoreA, scoreB, format) =
  scoreA >= 0 AND scoreB >= 0
  AND scoreA != scoreB
  AND max(scoreA, scoreB) >= format.gamePoint
  AND abs(scoreA - scoreB) >= 2
```

**Examples (target = 11):**
| Score | Valid? | Reason |
|------:|:------:|--------|
| 11–9 | ✅ | Winner 11 ≥ 11, diff 2 |
| 11–10 | ❌ | Diff 1 — must continue |
| 12–10 | ✅ | Winner 12 ≥ 11, diff 2 (deuce extended) |
| 14–12 | ✅ | Cap-less deuce, both above target, diff 2 |
| 11–7 | ✅ | Winner 11 ≥ 11, diff 4 |
| 5–3 | ❌ | Winner 5 < 11 (game not over) |

**Divergence from badminton:** Badminton's `validateUnitScore` does NOT enforce a 2-point lead — winner only needs to reach `gamePoint` (v1 simplification for casual play, see `docs/implementation/v1-270526-round-robin.md` §4). Table tennis enforces win-by-2 from launch. The two sport modules differ in exactly this predicate. Existing badminton tournaments and stored scores are NOT re-validated; the divergence is a per-sport policy.

**Implementation:**
- `src/lib/sports/table-tennis.ts` exports `tableTennisSport: Sport` whose `validateUnitScore` returns `{ valid: false, error: 'Winner must reach at least {gamePoint} and win by 2' }` on any of the four failures above
- `determineWinner` and `isMatchComplete` are identical to badminton's (first-to-`ceil(bestOfGames/2)`-games-wins; `determineWinner !== null` ⇔ complete)
- `useMatches.updateScore` and `score-entry-modal.tsx` call `sport.validateUnitScore(a, b, format)` — already sport-aware, no plumbing change

### 4. Standings

**Unchanged from v1 / v2.** The leaderboard's `calculateStats` operates on the `{ scoreA, scoreB }[]` shape per match and is already sport-agnostic (the badminton/tennis split lives only at the entry-function layer). Table tennis adds a third entry function:

```ts
calculateTableTennisLeaderboard(
  matches: TableTennisMatch[],
  games: TableTennisGame[],
  participants: Participant[]
): LeaderboardEntry[]
```

— parallel to `calculateBadmintonLeaderboard`. Tiebreaker order: **wins → pointDiff → gameDiff → name** (unchanged). A wrapper in `useStandings` dispatches to the right function based on `tournament.sport`.

### 5. Tournament Types

**Both Round-Robin and Knockout** are available for table tennis on launch. The bracket generator (`generateKnockoutBracket`) and the round-robin scheduler (`generateRoundRobin`) are sport-agnostic; the `useTournaments.createTournament` switch dispatches on `tournamentType`, and the per-sport match table decides which rows to write.

No new knockout code is required. The bye-handling flow, automatic winner advancement, edit lockout (`canEditMatch`), elimination-based standings (`calculateKnockoutStandings`), and the "Winner of Match N" label all work for table tennis unchanged.

## Database Schema

### `tournaments` CHECK constraint (extend)

```sql
sport TEXT NOT NULL CHECK(sport IN ('badminton', 'tennis', 'table_tennis'))
```

Existing rows pass the new constraint unchanged (they all currently hold `'badminton'` or `'tennis'`).

### `table_tennis_matches` (new)

```sql
CREATE TABLE table_tennis_matches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tournament_id INTEGER NOT NULL,
  participant_a_id INTEGER NOT NULL,
  participant_b_id INTEGER,                    -- NULL for bye matches
  game_point INTEGER NOT NULL DEFAULT 11,
  best_of_games INTEGER NOT NULL DEFAULT 3,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK(status IN ('upcoming', 'in_progress', 'completed')),
  winner_id INTEGER,
  round INTEGER NOT NULL DEFAULT 1,
  bracket_position INTEGER NOT NULL DEFAULT 1,
  feeds_into_match_id INTEGER,
  feeds_into_slot TEXT CHECK(feeds_into_slot IN ('A', 'B')),
  created_at INTEGER NOT NULL,
  FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
  FOREIGN KEY (participant_a_id) REFERENCES participants(id),
  FOREIGN KEY (participant_b_id) REFERENCES participants(id),
  FOREIGN KEY (winner_id) REFERENCES participants(id)
);

CREATE INDEX idx_table_tennis_matches_bracket
  ON table_tennis_matches(tournament_id, round, bracket_position);
```

### `table_tennis_match_games` (new)

```sql
CREATE TABLE table_tennis_match_games (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  match_id INTEGER NOT NULL,
  game_number INTEGER NOT NULL,
  score_a INTEGER,
  score_b INTEGER,
  FOREIGN KEY (match_id) REFERENCES table_tennis_matches(id) ON DELETE CASCADE,
  UNIQUE(match_id, game_number)
);
```

### Migration Strategy

1. New `sport` value added to the `tournaments` CHECK constraint (existing rows are unaffected)
2. Two new tables created via `CREATE TABLE IF NOT EXISTS` — fresh installs and existing installs both pick them up cleanly
3. No data migration; no column changes to existing tables
4. WebDatabase (`src/lib/database-web.ts`) gains a small cascade case for `table_tennis_matches` (parallel to the existing `badminton_matches` case at lines 157-166)

### Why Per-Sport Tables (Not a Unified `matches` Table)

Table tennis is structurally identical to badminton — same columns, same two-table shape. Reusing badminton's existing tables (distinguishing by `tournaments.sport`) was rejected as brittle (couples two sports by row class; raw-SQL readability suffers). A sport-agnostic `matches`/`match_units` refactor was rejected as out of scope for the "add a sport" task. Decision recorded in `docs/adr/0001-per-sport-match-tables.md`.

## Key Modules

### `src/lib/sports/table-tennis.ts` (NEW)

```typescript
import type { ValidationResult, ScoringUnit, MatchFormat, Sport } from '@/types';

export const tableTennisSport: Sport = {
  id: 'table_tennis',
  name: 'Table Tennis',
  defaultFormat: {
    gamePoint: 11,
    bestOfGames: 3,
  },

  validateUnitScore(scoreA, scoreB, format): ValidationResult {
    const gamePoint = format.gamePoint ?? 11;
    if (scoreA < 0 || scoreB < 0) return { valid: false, error: 'Scores cannot be negative' };
    if (scoreA === scoreB) return { valid: false, error: 'Game cannot be tied' };
    const winnerScore = Math.max(scoreA, scoreB);
    const loserScore = Math.min(scoreA, scoreB);
    if (winnerScore < gamePoint) return { valid: false, error: `Winner must reach at least ${gamePoint} points` };
    if (winnerScore - loserScore < 2) return { valid: false, error: `Winner must lead by at least 2 points` };
    return { valid: true };
  },

  determineWinner(units, format): 'a' | 'b' | null {
    const winsNeeded = Math.ceil((format.bestOfGames ?? 3) / 2);
    let aWins = 0, bWins = 0;
    for (const unit of units) {
      if (unit.scoreA === null || unit.scoreB === null) continue;
      if (unit.scoreA > unit.scoreB) aWins++;
      else if (unit.scoreB > unit.scoreA) bWins++;
    }
    if (aWins >= winsNeeded) return 'a';
    if (bWins >= winsNeeded) return 'b';
    return null;
  },

  isMatchComplete(units, format): boolean {
    return this.determineWinner(units, format) !== null;
  },
};
```

**Why identical `determineWinner` and `isMatchComplete` to badminton:** first-to-`ceil(bestOfGames/2)`-games-wins is the natural rule for "best-of-N games." Only `validateUnitScore` diverges. The ~30-line diff from `badmintonSport` is exactly the win-by-2 check.

### `src/lib/leaderboard.ts` (EXTEND)

Add a third entry function:

```typescript
export function calculateTableTennisLeaderboard(
  matches: TableTennisMatch[],
  games: TableTennisGame[],
  participants: Participant[]
): LeaderboardEntry[] {
  const matchUnits = matches.map((match) => ({
    match,
    units: games
      .filter((g) => g.matchId === match.id)
      .sort((a, b) => a.gameNumber - b.gameNumber)
      .map((g) => ({ scoreA: g.scoreA, scoreB: g.scoreB })),
  }));
  return calculateStats(matchUnits, participants, 'table_tennis');
}
```

(`calculateStats` is already sport-agnostic; the unused `sport` parameter can be removed at the same time — see "Cleanup Opportunities" below.)

### `src/hooks/use-standings.ts` (EXTEND)

The `sport` switch adds a `table_tennis` branch calling the new leaderboard function. Same shape as the existing `badminton` / `tennis` branches.

### `src/hooks/use-matches.ts` (EXTEND)

The `useMatches(tournamentId, sport, tournamentType)` signature already takes `sport: 'badminton' | 'tennis'`. Extend the type to include `'table_tennis'` and add the corresponding `getTableTennisMatches` / `getTableTennisGames` / `updateTableTennisGame` / `updateTableTennisMatchStatus` / `updateTableTennisMatchParticipant` calls in the existing `sport === '...'` branches.

### `src/hooks/use-tournaments.ts` (EXTEND)

`createTournament`'s sport switch adds a `table_tennis` branch that calls `generateRoundRobin` / `generateKnockoutBracket` and writes rows into `table_tennis_matches` + `table_tennis_match_games`. Mirrors the badminton branch exactly.

### `src/lib/db-operations.ts` (EXTEND)

Add the table-tennis pair, parallel to the existing badminton pair (~7 functions):

- `createTableTennisMatch`
- `getTableTennisMatches(tournamentId)`
- `getTableTennisGames(matchId)`
- `updateTableTennisGame(matchId, gameNumber, scoreA, scoreB)`
- `updateTableTennisMatchStatus(matchId, status, winnerId)`
- `updateTableTennisMatchParticipant(matchId, slot, participantId)`
- `updateTableTennisMatchBracketLink(matchId, feedsIntoMatchId, feedsIntoSlot)`

### `src/lib/database.ts` (EXTEND)

- `tournaments` table: add `'table_tennis'` to the `sport` CHECK
- New `CREATE TABLE IF NOT EXISTS table_tennis_matches (...)`
- New `CREATE TABLE IF NOT EXISTS table_tennis_match_games (...)`
- New `CREATE INDEX IF NOT EXISTS idx_table_tennis_matches_bracket ...`

### `src/lib/database-web.ts` (EXTEND)

Add a `table_tennis_matches` cascade case in the foreign-key cascade handler (parallel to the existing `badminton_matches` case at lines 157-166).

### `src/types/index.ts` (EXTEND)

```typescript
export type SportType = 'badminton' | 'tennis' | 'table_tennis';

export interface TableTennisMatch extends BaseMatch {
  gamePoint: number;
  bestOfGames: number;
}

export interface TableTennisGame {
  id: number;
  matchId: number;
  gameNumber: number;
  scoreA: number | null;
  scoreB: number | null;
}

export type Match = BadmintonMatch | TennisMatch | TableTennisMatch;
```

### `src/app/create.tsx` + `src/components/tournament-details-section.tsx` (EXTEND)

- Add a third sport button (🏓 + "Table Tennis") in the picker
- `handleSetSport('table_tennis')` seeds `{ gamePoint: 11, bestOfGames: 3 }`
- Format-key switch and advanced-row switch add a `table_tennis` branch (uses `bestOfGames` and `gamePoint` keys, default 11, identical layout to badminton)

### `src/app/index.tsx` (small EXTEND)

The "sport" label on each tournament card now needs to map `table_tennis` to "Table Tennis" (currently it maps only badminton / tennis). Smallest fix: change the inline ternary to a small lookup map.

## Cleanup Opportunities (Tangent, Not Required for v3)

While in the affected files, two related drifts could be tidied at the same time. Listed for visibility; **not** required by table tennis itself:

1. `Sport` interface in `src/types/index.ts` no longer includes `getUnitCount` or `tieBreakers` (stripped in commit `9d01097`). The doc snippet in `docs/application.md` §2 still shows the older shape. Either drop those properties from the doc snippet, or accept the drift.
2. `calculateStats(matches, participants, sport)` in `src/lib/leaderboard.ts` declares a `sport: 'badminton' | 'tennis'` parameter that is never used inside the function body. Adding `table_tennis` requires either widening the type or removing the parameter entirely. Removing it is the cleaner fix and the natural place to do it.

## Testing Strategy

### Unit Tests

**`sports/table-tennis.ts`**
- `validateUnitScore` boundary cases:
  - Negatives rejected
  - Ties rejected
  - Below target rejected (e.g. 5-3 with target 11)
  - At target with diff 1 rejected (e.g. 11-10)
  - At target with diff 2 accepted (e.g. 11-9)
  - Above target with diff 2 accepted (e.g. 12-10, 14-12, 30-28)
  - Above target with diff 1 rejected (e.g. 12-11)
- `determineWinner` cases:
  - Best-of-1: first game decides
  - Best-of-3: first to 2 games
  - Best-of-5: first to 3 games
  - Mid-match (no winner yet) returns null
  - Incomplete games (null scores) are skipped
- `isMatchComplete` mirrors `determineWinner !== null`

**`leaderboard.ts`**
- `calculateTableTennisLeaderboard`:
  - Wins are the primary sort key
  - Point diff (sum of (scoreA - scoreB) across all games) is the secondary sort key
  - Game diff (wins minus losses at game level) is the tertiary sort key
  - Alphabetical fallback
  - 1224-style competition ranking with tie detection (T-prefix not used; tied participants share a rank)

**`bracket-generator.ts`**
- Bracket generation with table-tennis defaults (`gamePoint: 11, bestOfGames: 3`) should produce the same number of matches as badminton with the same participant count
- Round naming ("Round 1", "Quarterfinals", "Semifinals", "Final") is sport-agnostic and needs no change

### Integration Tests

**Tournament Creation:**
- Create a round-robin table-tennis tournament with 4 players → 6 matches, 18 game rows (6 matches × 3 games each, with `bestOfGames: 3` the row count is 3 even when most are unfilled)
- Create a knockout table-tennis tournament with 5 players → 4 matches + 1 bye, bracket links correct
- Create with default `gamePoint: 11, bestOfGames: 3` and confirm the `tournament_tennis_matches.game_point` column is `11` and `best_of_games` is `3`
- Create with the Advanced TextInput overridden to target 21 (a casual-group preference) and confirm it round-trips through the DB

**Score Entry:**
- Enter an invalid score (11-10) → modal shows the win-by-2 error
- Enter a valid score (11-9) → match status transitions to `in_progress`
- Enter scores until `determineWinner` returns a value → match transitions to `completed`, tournament moves to `active`
- Knockout: completing a match advances the winner into `feeds_into_match_id`'s slot
- Bye match is auto-completed and the bye recipient advances correctly (regression check on Fix 2 from `v2-030626-knockout.md`)

**Standings:**
- Standings tab for a round-robin table-tennis tournament shows correct rank, wins, pointDiff, gameDiff
- Knockout tournament shows champion, still-competing, and eliminated-in-round sections (sport-agnostic, but should not regress)
- Sharing a standings image as PNG works (sport-agnostic, but should not regress)

### Manual Testing

**Small tournaments:**
- 2 players (1 match, best of 1, target 11)
- 3 players (round-robin: 3 matches; knockout: 2 matches + 1 bye)
- 4 players (round-robin: 6 matches; knockout: 3 matches, no byes)

**Validation edge cases:**
- 11-9 valid
- 11-10 invalid (diff 1)
- 12-10 valid (deuce extended)
- 14-12 valid
- 5-3 invalid (below target)
- 0-0 invalid (tied, also below target)

**Cross-platform:**
- Create a table-tennis tournament on iOS, enter scores, verify the share-as-image standings export
- Repeat on Android and on web; confirm the WebDatabase's new `table_tennis_matches` cascade works when the parent tournament is deleted

## Known Limitations

### v3 Limitations

1. **No per-game validation history**: editing a game score overwrites the previous value with no undo (carried over from v1).
2. **No sport-specific tiebreakers**: all sports use wins → pointDiff → gameDiff → name. A real table-tennis tiebreaker (e.g. head-to-head result) is not implemented.
3. **Win-by-2 is binary**: the validation rejects 11-10 outright. Some casual groups prefer "first to 11 wins, no deuce rule." A per-tournament toggle is out of scope for v3.
4. **No target presets**: the Advanced TextInput accepts any positive integer. Some apps offer a 11 / 15 / 21 picker. Out of scope.
5. **No sport-specific share text**: the share-as-image export shows the standings table but does not call out the sport's win-by-2 rule. Acceptable for v3 — standings and rules are visible inside the app.

### Performance Limits

- Same as v1/v2: tested up to 16 participants (120 matches for round-robin, 15 matches for knockout). Table tennis adds no new hot paths.
- Standings calculation cost is unchanged (one extra entry function wrapping the existing `calculateStats`).

## Out of Scope

### Not Included in v3

1. **Squash / pickleball / other racket sports** — the natural follow-up, blocked on the same storage decision but never a free add. v3 establishes the pattern (per-sport tables + sport interface module); a fourth sport with a different format (e.g. squash's PAR-11 win-by-2) would slot in by the same recipe.
2. **Toggling win-by-2 off per tournament** — see "Known Limitations" §3.
3. **Tournament-level target override** — target is per-format, not per-match. Allowing a "this match plays to 15" override on a per-game basis is over-engineering for the casual profile.
4. **UI translation of the win-by-2 rule** — the modal's error message mentions the rule, but the create form does not call it out as a Table-Tennis-specific note. Adding a "First to 11, win by 2" hint to the sport button is a polish task.
5. **Sport-agnostic `matches` / `match_units` refactor** — the long-term cleaner schema. Deferred until a fourth sport lands and the cost of cloning is no longer worth the simplicity.

## Future Enhancements

### Potential v4 Features

- **Fourth sport (squash or pickleball)** — same recipe, the per-sport-table pattern is now established
- **Sport-agnostic `matches` / `match_units` refactor** — when the per-sport-table count reaches 3-4, the cost/benefit of unifying tips
- **Per-tournament win-by-2 toggle** — opt-in for groups that prefer "first to target, no deuce"
- **Default-target picker (11 / 15 / 21)** — surfaces a common-casual-play option without requiring the Advanced TextInput
- **Tiebreaker richness** — head-to-head record, points-against (not just point-diff), sets-against

### Potential v5+ Features

- **Sport-specific bracket visualisation** — the bracket is currently a flat list grouped by round. A graphical tree (rendered with `react-native-svg`) would be sport-agnostic but could highlight bye matches and locked edits visually
- **Per-sport default-format profiles** — "Recreational" / "Club" / "Tournament" presets, similar to how some scoreboards ship configuration profiles
- **Stat export per sport** — CSV / JSON export of the standings table for further analysis (kept generic across sports by reusing the `LeaderboardEntry` shape)

## Summary

Table tennis is the third sport in ScoreBook. It is structurally a clone of badminton: best-of-N games, each to an organizer-set target, with the same `determineWinner`, the same leaderboard, the same bracket engine, the same `useMatches` plumbing. The single behavioural delta is `validateUnitScore` enforcing the **win-by-2 rule** — `winner >= gamePoint` AND `winner - loser >= 2`, with cap-less deuce (loser may exceed target). Storage follows the established per-sport two-table pattern (`table_tennis_matches` + `table_tennis_match_games`); the rationale for cloning rather than unifying is in `docs/adr/0001-per-sport-match-tables.md`.

Scope is narrow by design: scoring rules, format configuration, final standings. No new tournament formats, no new UI primitives, no new dependencies. Existing v1/v2 code paths accept table tennis through the same sport switch — the change is additive everywhere.
