# v1: Round-Robin Tournaments

## Overview

Round-robin tournaments are the first tournament format implemented in ScoreBook. In a round-robin tournament, every participant plays against every other participant exactly once. This format ensures fairness and provides comprehensive standings based on all matches played.

## Implementation Status

✅ **Complete** - Round-robin tournaments are fully functional for both badminton and tennis.

## Core Features

### 1. Tournament Creation

**User Flow:**
1. Enter tournament name
2. Select sport (badminton or tennis)
3. Add participants (2-16 players)
4. Configure match format
5. Create tournament

**Match Format Options:**

**Badminton:**
- Game point: 11, 15, 21, 30 (default: 21)
- Best of: 1, 3, 5 games (default: 3)

**Tennis:**
- Games per set: 4, 5, 6 (default: 6)
- Best of: 1, 3, 5 sets (default: 3)

**Implementation:**
- `useTournaments.createTournament()` orchestrates creation
- Participants created first, then matches generated
- Round-robin scheduling via `scheduler.generateRoundRobin()`

### 2. Match Scheduling

**Algorithm:**
- Circle method (rotating positions)
- Handles odd number of participants by adding BYE
- Generates all pairings upfront

**Example (4 players):**
```
Round 1: P1 vs P4, P2 vs P3
Round 2: P1 vs P3, P4 vs P2
Round 3: P1 vs P2, P3 vs P4
```

**Total Matches:** n(n-1)/2 where n = number of participants
- 4 players = 6 matches
- 6 players = 15 matches
- 8 players = 28 matches

**Implementation:**
- `src/lib/scheduler.ts` - `generateRoundRobin()` function
- Returns array of `[participantAId, participantBId]` pairs
- BYE represented as -1, filtered out before match creation

### 3. Match Structure

**Badminton Match:**
```
Match (best of 3 games, 21 points)
├── Game 1: 21-15
├── Game 2: 18-21
└── Game 3: 21-19
Winner: Player A (2-1)
```

**Tennis Match:**
```
Match (best of 3 sets, 6 games per set)
├── Set 1: 6-4
├── Set 2: 3-6
└── Set 3: 6-2
Winner: Player A (2-1)
```

**Database Schema:**
- `badminton_matches`: Match metadata (participants, format, status, winner)
- `badminton_match_games`: Individual game scores
- `tennis_matches`: Match metadata
- `tennis_match_sets`: Individual set scores

### 4. Score Entry

**User Flow:**
1. Tap match from list
2. ScoreEntryModal opens with match data
3. Enter scores for each game/set
4. Tap Save
5. Modal closes, match updates

**Validation Rules:**

**Badminton:**
- Winner must reach game point (e.g., 21)
- Winner must have higher score than loser
- No "win by 2" requirement (simplified for casual play)
- Scores must be non-negative integers

**Tennis:**
- Winner must reach games per set (e.g., 6)
- Winner must have higher score than loser
- No tiebreak logic (simplified for v1)
- Scores must be non-negative integers

**Implementation:**
- `ScoreEntryModal` - Controlled component receiving data via props
- `Sport.validateUnitScore()` - Sport-specific validation
- `useMatches.updateScore()` - Orchestrates save and status updates

### 5. Match Status Transitions

**State Machine:**
```
upcoming → in_progress → completed
```

**Transitions:**
- `upcoming → in_progress`: When first game/set score is entered
- `in_progress → completed`: When match winner is determined
- `completed → in_progress`: When scores are edited (if match no longer complete)

**Implementation:**
- `useMatches.updateScore()` handles transitions
- Checks `Sport.isMatchComplete()` after each score update
- Updates match status in database
- Updates tournament status if needed

### 6. Tournament Status

**State Machine:**
```
upcoming → active → completed
```

**Transitions:**
- `upcoming → active`: When first match starts
- `active → completed`: When all matches are completed

**Implementation:**
- `useMatches.updateScore()` checks all match statuses
- If all matches completed, updates tournament to 'completed'
- Tournament list shows status with color-coded indicators

### 7. Standings Calculation

**Ranking Criteria (in order):**
1. Wins (most wins ranks higher)
2. Point differential (total points scored - total points conceded)
3. Game/Set differential (total games/sets won - total games/sets lost)
4. Alphabetical by name (if still tied)

**Tie Detection:**
- Participants with identical ranking criteria are marked as tied
- Displayed with same rank number
- "T" prefix indicates tie (e.g., "T2" for tied at rank 2)

**Implementation:**
- `src/lib/leaderboard.ts` - `calculateStandings()` function
- Loads all matches and games/sets for tournament
- Aggregates statistics per participant
- Sorts by ranking criteria
- Detects ties by comparing all criteria

**Example Standings:**
```
Rank  Name     W  L  Pts Diff  Game Diff
1     Alice    3  0  +45       +6
2     Bob      2  1  +12       +2
3     Charlie  1  2  -15       -2
4     Diana    0  3  -42       -6
```

### 8. Match Editing

**Capabilities:**
- Edit scores for any game/set in a match
- Add scores to games/sets that haven't been scored yet
- Change existing scores

**Side Effects:**
- Recalculates match winner
- Updates match status if needed
- Recalculates tournament standings
- Updates tournament status if needed

**Implementation:**
- Same `useMatches.updateScore()` function
- Loads current scores, applies changes, recalculates everything
- No history/undo (v1 limitation)

### 9. Sharing Standings

**User Flow:**
1. View Standings tab
2. Tap Share button (📤 icon in header)
3. Native share sheet opens (or download on web)
4. Share image via messaging, email, etc.

**Implementation:**
- `react-native-view-shot` captures standings table as image
- `expo-sharing` opens native share sheet
- Web: Uses Web Share API or downloads PNG
- Image includes tournament name, standings table, and timestamp

### 10. Tournament Management

**Rename Tournament:**
- Tap tournament name in Settings tab
- Edit inline
- Tap outside or press Enter to save

**Rename Participant:**
- Tap participant name in Settings tab
- Edit inline
- Tap outside or press Enter to save
- Updates all matches involving that participant

**Delete Tournament:**
- Long-press tournament in list (mobile)
- Or tap Delete button in Settings tab
- Confirmation dialog
- Cascading delete removes all participants, matches, and games/sets

## Database Schema

### tournaments
```sql
CREATE TABLE tournaments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  sport TEXT NOT NULL CHECK(sport IN ('badminton', 'tennis')),
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK(status IN ('upcoming', 'active', 'completed')),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
```

### participants
```sql
CREATE TABLE participants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tournament_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
  UNIQUE(tournament_id, name)
);
```

### badminton_matches
```sql
CREATE TABLE badminton_matches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tournament_id INTEGER NOT NULL,
  participant_a_id INTEGER NOT NULL,
  participant_b_id INTEGER NOT NULL,
  game_point INTEGER NOT NULL DEFAULT 21,
  best_of_games INTEGER NOT NULL DEFAULT 3,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK(status IN ('upcoming', 'in_progress', 'completed')),
  winner_id INTEGER,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
  FOREIGN KEY (participant_a_id) REFERENCES participants(id),
  FOREIGN KEY (participant_b_id) REFERENCES participants(id),
  FOREIGN KEY (winner_id) REFERENCES participants(id)
);
```

### badminton_match_games
```sql
CREATE TABLE badminton_match_games (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  match_id INTEGER NOT NULL,
  game_number INTEGER NOT NULL,
  score_a INTEGER,
  score_b INTEGER,
  FOREIGN KEY (match_id) REFERENCES badminton_matches(id) ON DELETE CASCADE,
  UNIQUE(match_id, game_number)
);
```

### tennis_matches
```sql
CREATE TABLE tennis_matches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tournament_id INTEGER NOT NULL,
  participant_a_id INTEGER NOT NULL,
  participant_b_id INTEGER NOT NULL,
  sets_to_win INTEGER NOT NULL DEFAULT 2,
  games_to_win_per_set INTEGER NOT NULL DEFAULT 6,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK(status IN ('upcoming', 'in_progress', 'completed')),
  winner_id INTEGER,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
  FOREIGN KEY (participant_a_id) REFERENCES participants(id),
  FOREIGN KEY (participant_b_id) REFERENCES participants(id),
  FOREIGN KEY (winner_id) REFERENCES participants(id)
);
```

### tennis_match_sets
```sql
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

## Key Modules

### src/lib/scheduler.ts
- `generateRoundRobin(participantIds: number[]): [number, number][]`
- Implements circle method for round-robin scheduling
- Handles odd participants with BYE (-1)
- Returns array of match pairings

### src/lib/leaderboard.ts
- `calculateStandings(tournamentId: number, sport: SportType): LeaderboardEntry[]`
- Loads all matches and scores for tournament
- Aggregates wins, losses, point diff, game diff per participant
- Sorts by ranking criteria
- Detects ties

### src/lib/sports/badminton.ts
- Implements `Sport` interface for badminton
- `validateUnitScore()`: Checks winner reached game point and has higher score
- `isMatchComplete()`: Checks if any player has won majority of games
- `determineWinner()`: Returns 'a' or 'b' based on games won

### src/lib/sports/tennis.ts
- Implements `Sport` interface for tennis
- `validateUnitScore()`: Checks winner reached games per set and has higher score
- `isMatchComplete()`: Checks if any player has won majority of sets
- `determineWinner()`: Returns 'a' or 'b' based on sets won

### src/hooks/use-matches.ts
- `useMatches(tournamentId, sport)` - Hook for match data management
- `refresh()` - Loads all matches and games/sets from database
- `updateScore(matchId, gameNumber, scoreA, scoreB)` - Updates score and handles status transitions
- Returns `{ matches, units, participants, refresh, updateScore }`

### src/hooks/use-standings.ts
- `useStandings(tournamentId, sport)` - Hook for standings data
- `refresh()` - Recalculates standings
- Returns `{ standings, refresh }`

### src/components/score-entry-modal.tsx
- Controlled component for score entry
- Receives match data via props
- Shows all games/sets with edit capability
- Validates scores before saving
- Auto-closes after save

## Testing Strategy

### Unit Tests
- `scheduler.ts`: Test round-robin generation for various participant counts
- `leaderboard.ts`: Test standings calculation with various scenarios
- `sports/badminton.ts`: Test validation, completion, winner determination
- `sports/tennis.ts`: Test validation, completion, winner determination

### Integration Tests
- Tournament creation flow
- Score entry and status transitions
- Standings calculation with multiple matches
- Tournament status updates

### Manual Testing
- Create tournaments with 2-16 participants
- Enter various score combinations
- Edit scores and verify recalculation
- Share standings on different platforms
- Test on iOS, Android, and web

## Known Limitations

### v1 Limitations
1. **No match history**: Editing scores overwrites previous values (no undo)
2. **No player statistics**: Only tournament-level standings, no career stats
3. **No multi-device sync**: Each device has independent data
4. **No tournament templates**: Must configure format for each tournament
5. **Limited tiebreakers**: Only basic criteria (wins, point diff, game diff)
6. **No scheduling**: All matches available from start, no round-by-round progression
7. **No third-party integration**: Cannot export to other tournament systems

### Performance Limits
- Tested up to 16 participants (120 matches)
- Database operations < 100ms for typical usage
- Standings calculation < 500ms for 16 participants
- No pagination needed at this scale

## Future Enhancements

### Potential v2 Features
- **Match scheduling**: Unlock matches round-by-round
- **Advanced tiebreakers**: Head-to-head results, custom criteria
- **Player profiles**: Track statistics across tournaments
- **Tournament templates**: Save and reuse format configurations
- **Export formats**: CSV, JSON for external analysis
- **Undo/redo**: History of score changes

### Potential v3 Features
- **Multi-device sync**: Optional cloud backup and sync
- **League mode**: Recurring tournaments with season standings
- **Advanced statistics**: Win rates, averages, trends over time
- **Spectator mode**: Read-only view for non-participants
- **Live scoring**: Real-time updates for spectators
