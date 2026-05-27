# ScoreBook — Design Document

> **Status:** Ready for Implementation  
> **Last Updated:** 2026-05-25  
> **Product:** ScoreBook — A clean, simple, local-first tournament manager for racket sports (and beyond).

---

## 1. Vision & Core Principles

ScoreBook is a **local-first** mobile app for creating and managing round-robin tournaments completely offline. The core differentiator is a **live, accurate leaderboard** that updates automatically as match scores are entered.

### Principles
1. **Simplicity First** — No bloatware. Every screen has a single purpose.
2. **Local-First** — All data lives on-device via `expo-sqlite`.
3. **Sport-Agnostic Engine** — The core scheduling and ranking logic is generic; sport-specific behavior is injected via rule modules.
4. **Future-Proof** — While v1 covers Badminton and Tennis, the architecture must cleanly support Football, Board Games, etc., in future releases.

---

## 2. Supported Sports (v1)

### 2.1 Badminton
- **Match Format:** Configurable game point (11, 15, 21, 30, etc.) set at tournament creation. Default: 21.
- **Match Depth:** Configurable number of games (e.g., 1, 3, 5). Default: Best of 3.
- **Score Unit:** A "Game" (e.g., 21-15).
- **Validation Rule:** Winner's score must be ≥ `game_point` AND strictly greater than the loser's score. No "win by 2" enforcement. No cap.
- **Tie-Breaker Hierarchy:**
  1. Match Wins
  2. Point Differential (total points won − total points lost across all games)
  3. Game Differential (total games won − total games lost)
  4. Head-to-Head result (v2) — for v1, display "Tie".

### 2.2 Tennis
- **Match Format:** Configurable sets (1, 3, 5, etc.). Default: Best of 3.
- **Games per Set:** Configurable games to win a set (4, 5, 6, etc.). Default: 6.
- **Score Unit:** A "Set" (e.g., 6-4).
- **Validation Rule:** Winner's games must be ≥ `games_to_win_per_set` AND strictly greater than the loser's games. No tie-break logic for v1.
- **Tie-Breaker Hierarchy:**
  1. Match Wins
  2. Set Differential
  3. Game Differential
  4. Head-to-Head (v2) — for v1, display "Tie".

### 2.3 Future Sports (Post-v1)
- Football, Cricket, Board Games, etc.
- Each sport will be a hardcoded TypeScript module implementing the `Sport` interface.

---

## 3. Data Model

### 3.1 Shared Tables

#### `tournaments`
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | INTEGER PK | Auto-increment |
| `name` | TEXT NOT NULL | |
| `sport` | TEXT NOT NULL | `'badminton' \| 'tennis'` |
| `status` | TEXT NOT NULL | `'upcoming' \| 'active' \| 'completed'` |
| `created_at` | INTEGER (timestamp) | |
| `updated_at` | INTEGER (timestamp) | |

#### `participants`
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | INTEGER PK | Auto-increment |
| `tournament_id` | INTEGER FK | `ON DELETE CASCADE` |
| `name` | TEXT NOT NULL | Unique per tournament |
| `created_at` | INTEGER (timestamp) | |

### 3.2 Badminton-Specific Tables

#### `badminton_matches`
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | INTEGER PK | Auto-increment |
| `tournament_id` | INTEGER FK | `ON DELETE CASCADE` |
| `participant_a_id` | INTEGER FK | |
| `participant_b_id` | INTEGER FK | |
| `game_point` | INTEGER NOT NULL | e.g., 21 |
| `best_of_games` | INTEGER NOT NULL | e.g., 3 |
| `status` | TEXT NOT NULL | `'upcoming' \| 'in_progress' \| 'completed'` |
| `winner_id` | INTEGER FK | Nullable |
| `created_at` | INTEGER (timestamp) | |

#### `badminton_match_games`
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | INTEGER PK | Auto-increment |
| `match_id` | INTEGER FK | `ON DELETE CASCADE` |
| `game_number` | INTEGER NOT NULL | 1, 2, 3, ... |
| `score_a` | INTEGER | Nullable |
| `score_b` | INTEGER | Nullable |

### 3.3 Tennis-Specific Tables

#### `tennis_matches`
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | INTEGER PK | Auto-increment |
| `tournament_id` | INTEGER FK | `ON DELETE CASCADE` |
| `participant_a_id` | INTEGER FK | |
| `participant_b_id` | INTEGER FK | |
| `sets_to_win` | INTEGER NOT NULL | e.g., 2 (for Best of 3) |
| `games_to_win_per_set` | INTEGER NOT NULL | e.g., 6 |
| `status` | TEXT NOT NULL | `'upcoming' \| 'in_progress' \| 'completed'` |
| `winner_id` | INTEGER FK | Nullable |
| `created_at` | INTEGER (timestamp) | |

#### `tennis_match_sets`
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | INTEGER PK | Auto-increment |
| `match_id` | INTEGER FK | `ON DELETE CASCADE` |
| `set_number` | INTEGER NOT NULL | 1, 2, 3, ... |
| `games_a` | INTEGER | Nullable |
| `games_b` | INTEGER | Nullable |

### 3.4 Internal BYE Participant
- For odd participant counts, an internal `BYE` participant is auto-created.
- The `BYE` match is auto-completed with the real participant as winner.
- The `BYE` participant is **excluded** from the participant list UI and leaderboard queries.

---

## 4. SQL Views for Leaderboard

### 4.1 Badminton Standings View

```sql
CREATE VIEW badminton_standings AS
SELECT
  p.id AS participant_id,
  p.name AS participant_name,
  p.tournament_id,
  COUNT(DISTINCT CASE WHEN m.winner_id = p.id THEN m.id END) AS wins,
  COUNT(DISTINCT CASE WHEN m.status = 'completed' AND m.winner_id != p.id THEN m.id END) AS losses,
  COALESCE(SUM(CASE WHEN g.match_id IN (
    SELECT id FROM badminton_matches WHERE participant_a_id = p.id OR participant_b_id = p.id
  ) THEN
    CASE WHEN m_inner.participant_a_id = p.id THEN g.score_a ELSE g.score_b END -
    CASE WHEN m_inner.participant_a_id = p.id THEN g.score_b ELSE g.score_a END
  END), 0) AS point_diff,
  COALESCE(SUM(CASE WHEN g.match_id IN (
    SELECT id FROM badminton_matches WHERE participant_a_id = p.id OR participant_b_id = p.id
  ) THEN
    CASE
      WHEN (m_inner.participant_a_id = p.id AND g.score_a > g.score_b) OR
           (m_inner.participant_b_id = p.id AND g.score_b > g.score_a) THEN 1
      WHEN (m_inner.participant_a_id = p.id AND g.score_a < g.score_b) OR
           (m_inner.participant_b_id = p.id AND g.score_b > g.score_a) THEN -1
      ELSE 0
    END
  END), 0) AS game_diff
FROM participants p
LEFT JOIN badminton_matches m ON m.tournament_id = p.tournament_id
  AND (m.participant_a_id = p.id OR m.participant_b_id = p.id)
LEFT JOIN badminton_match_games g ON g.match_id = m.id
LEFT JOIN badminton_matches m_inner ON m_inner.id = g.match_id
WHERE p.name != 'BYE'
GROUP BY p.id, p.name, p.tournament_id;
```

### 4.2 Tennis Standings View

```sql
CREATE VIEW tennis_standings AS
SELECT
  p.id AS participant_id,
  p.name AS participant_name,
  p.tournament_id,
  COUNT(DISTINCT CASE WHEN m.winner_id = p.id THEN m.id END) AS wins,
  COUNT(DISTINCT CASE WHEN m.status = 'completed' AND m.winner_id != p.id THEN m.id END) AS losses,
  COALESCE(SUM(CASE WHEN s.match_id IN (
    SELECT id FROM tennis_matches WHERE participant_a_id = p.id OR participant_b_id = p.id
  ) THEN
    CASE WHEN m_inner.participant_a_id = p.id THEN s.games_a ELSE s.games_b END -
    CASE WHEN m_inner.participant_a_id = p.id THEN s.games_b ELSE s.games_a END
  END), 0) AS set_diff,
  -- Game diff calculation would need a sub-query or app-layer computation
  -- since tennis_match_sets stores set scores, not individual game scores.
  -- This is a simplified representation; the app may compute game diff in JS.
  0 AS game_diff_placeholder
FROM participants p
LEFT JOIN tennis_matches m ON m.tournament_id = p.tournament_id
  AND (m.participant_a_id = p.id OR m.participant_b_id = p.id)
LEFT JOIN tennis_match_sets s ON s.match_id = m.id
LEFT JOIN tennis_matches m_inner ON m_inner.id = s.match_id
WHERE p.name != 'BYE'
GROUP BY p.id, p.name, p.tournament_id;
```

> **Note:** The exact SQL views will be refined during implementation. The app layer may supplement SQL with JavaScript computations for complex tie-breakers.

---

## 5. Sport Interface (TypeScript)

```typescript
interface Sport {
  id: string; // 'badminton' | 'tennis'
  name: string;
  icon: string; // Icon name or component
  
  // Default tournament config
  defaultFormat: MatchFormat;
  
  // Validate a single scoring unit
  validateUnitScore(params: {
    scoreA: number;
    scoreB: number;
    format: MatchFormat;
  }): ValidationResult;
  
  // Determine match winner based on completed units
  determineWinner(units: ScoringUnit[], format: MatchFormat): WinnerResult;
  
  // Check if match is mathematically complete
  isMatchComplete(units: ScoringUnit[], format: MatchFormat): boolean;
  
  // Tie-breaker hierarchy
  tieBreakers: TieBreaker[];
}

interface MatchFormat {
  // Badminton: { gamePoint: number, bestOfGames: number }
  // Tennis: { setsToWin: number, gamesToWinPerSet: number }
  [key: string]: number;
}

interface ValidationResult {
  valid: boolean;
  error?: string;
}

interface WinnerResult {
  winnerIndex: 0 | 1 | null; // 0 = participant A, 1 = participant B
}

interface ScoringUnit {
  scoreA: number | null;
  scoreB: number | null;
}

type TieBreaker = 'wins' | 'pointDiff' | 'gameDiff' | 'setDiff';
```

---

## 6. Application Flow

### 6.1 Tournament Creation (Hybrid Flow)

1. **Tournament List Screen** → Tap "+" (Create Tournament).
2. **Creation Form:**
   - Tournament Name (text input)
   - Sport Selection (Badminton / Tennis)
   - **Advanced Toggle** (collapsed by default)
     - Badminton: Game Point (default 21), Best of N Games (default 3)
     - Tennis: Best of N Sets (default 3), Games to Win per Set (default 6)
3. **Add Participants** (min 2, max 50):
   - Inline text inputs, add/remove rows.
   - Duplicate names blocked with inline error.
4. **Create** → Generates round-robin pairings + BYE if needed.

### 6.2 Tournament Detail (3 Tabs)

#### Tab 1: Matches
- **Default view:** `upcoming` matches first.
- **Grouped by status:** `in_progress`, `upcoming`, `completed`.
- **Match Labeling:**
  - Upcoming: "Match 12: Alice vs Bob"
  - In Progress / Completed: Compact card with score preview.
- **Tap match** → Score Entry Screen.

#### Tab 2: Standings
- Live leaderboard table.
- Columns: Rank, Participant, Wins, Losses, Point/Set Diff, Game Diff.
- Competition ranking (`1224` style) with tie indicator (`T=`).
- **Share button:** Captures the table as an image via `react-native-view-shot` and opens OS share sheet.

#### Tab 3: Settings
- Rename tournament.
- Rename participants (always allowed).
- Delete tournament (with confirmation).

### 6.3 Score Entry Screen

- Shows both participant names.
- Numeric text inputs for each scoring unit (Badminton = games, Tennis = sets).
- **Validation:** On save, run `sport.validateUnitScore()`. If invalid, show toast: "Invalid score: [reason]". Still save if user confirms.
- **Auto-state transitions:**
  - Any score entered → `in_progress`
  - Mathematical winner determined → `completed`
  - Editing completed match → stays `completed`, shows invalid toast if needed.

### 6.4 Tournament Lifecycle

```
upcoming → active → completed
```

- **Automatic transitions:** Based on match states.
- **Structural lock:** Once first score is entered, tournament is locked:
  - Cannot add/remove participants.
  - Cannot change match format (game point, sets, etc.).
  - Can still rename participants and tournament.

---

## 7. UI/UX Specifications

### 7.1 Theme
- **Light theme only** for v1.
- Clean, modern aesthetic.
- Uses existing theme infrastructure: `src/constants/theme.ts`, `use-color-scheme.ts`.

### 7.2 Navigation
- **Stack Navigation:**
  - `/` → Tournament List
  - `/tournament/[id]` → Tournament Detail (Tabs: Matches, Standings, Settings)
  - `/tournament/[id]/match/[matchId]` → Score Entry
  - `/create` → Create Tournament

### 7.3 Key UI Patterns
- **Tournament List Card:** Name, Sport badge, Participant count, Status badge (Upcoming/Active/Completed).
- **Match List Item:** Numbered pairing for upcoming; score preview card for completed.
- **Score Entry:** Clean form with large numeric inputs, per-unit validation feedback.
- **Standings Table:** Sortable columns, competition ranking, tie indicator, pull-to-refresh.

---

## 8. Edge Cases & Decisions

| Scenario | Decision |
|----------|----------|
| Odd number of participants | Auto-create internal `BYE` participant. BYE matches auto-complete. |
| Duplicate participant names | Blocked at creation with inline error. |
| Editing completed match scores | Allowed. Stays `completed`. Shows invalid toast if validation fails. |
| Deleting active tournament | Allowed with confirmation. Cascades delete to all matches/scores. |
| All matches tied in standings | Display "Tie" with shared rank. |
| Match interrupted mid-score | Save partial progress. Match stays `in_progress`. |
| Tournament with 0 completed matches | Standings shows all participants with 0 stats, alphabetical order. |

---

## 9. Future Roadmap (Post-v1)

1. **Dark Theme**
2. **Import/Export** (JSON + share sheet)
3. **Additional Sports** (Football, Cricket, Board Games)
4. **Custom Tie-Breaker Configuration** per tournament
5. **Head-to-Head Tie-Breaker** (when standings are tied)
6. **Match Scheduling / Rounds** (group matches into rounds for court management)
7. **Player Roster** (cross-tournament player tracking)
8. **Hypothetical Simulation** (what-if standings)

---

## 10. Database Schema (Complete)

```sql
-- Shared tables
CREATE TABLE tournaments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  sport TEXT NOT NULL CHECK(sport IN ('badminton', 'tennis')),
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK(status IN ('upcoming', 'active', 'completed')),
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

CREATE TABLE participants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tournament_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
  UNIQUE(tournament_id, name)
);

-- Badminton tables
CREATE TABLE badminton_matches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tournament_id INTEGER NOT NULL,
  participant_a_id INTEGER NOT NULL,
  participant_b_id INTEGER NOT NULL,
  game_point INTEGER NOT NULL DEFAULT 21,
  best_of_games INTEGER NOT NULL DEFAULT 3,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK(status IN ('upcoming', 'in_progress', 'completed')),
  winner_id INTEGER,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
  FOREIGN KEY (participant_a_id) REFERENCES participants(id),
  FOREIGN KEY (participant_b_id) REFERENCES participants(id),
  FOREIGN KEY (winner_id) REFERENCES participants(id)
);

CREATE TABLE badminton_match_games (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  match_id INTEGER NOT NULL,
  game_number INTEGER NOT NULL,
  score_a INTEGER,
  score_b INTEGER,
  FOREIGN KEY (match_id) REFERENCES badminton_matches(id) ON DELETE CASCADE,
  UNIQUE(match_id, game_number)
);

-- Tennis tables
CREATE TABLE tennis_matches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tournament_id INTEGER NOT NULL,
  participant_a_id INTEGER NOT NULL,
  participant_b_id INTEGER NOT NULL,
  sets_to_win INTEGER NOT NULL DEFAULT 2,
  games_to_win_per_set INTEGER NOT NULL DEFAULT 6,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK(status IN ('upcoming', 'in_progress', 'completed')),
  winner_id INTEGER,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
  FOREIGN KEY (participant_a_id) REFERENCES participants(id),
  FOREIGN KEY (participant_b_id) REFERENCES participants(id),
  FOREIGN KEY (winner_id) REFERENCES participants(id)
);

CREATE TABLE tennis_match_sets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  match_id INTEGER NOT NULL,
  set_number INTEGER NOT NULL,
  games_a INTEGER,
  games_b INTEGER,
  FOREIGN KEY (match_id) REFERENCES tennis_matches(id) ON DELETE CASCADE,
  UNIQUE(match_id, set_number)
);
```

---

*Document generated during the design grilling session. All decisions captured here are binding for v1 implementation.*
