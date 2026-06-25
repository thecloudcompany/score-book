# ScoreBook - Application Architecture

## Technical Stack

### Core Framework
- **Expo SDK 56**: Cross-platform mobile framework
- **React Native 0.85**: UI rendering engine
- **Expo Router**: File-based routing with type-safe navigation
- **TypeScript 6.0**: Type-safe development

### Data Layer
- **expo-sqlite**: Local SQLite database for native platforms
- **Custom WebDatabase**: localStorage-backed SQLite emulator for web
- **expo-splash-screen**: Native splash screen with fade animation

### UI & Fonts
- **Figtree font family**: Clean, modern typography (6 weights loaded)
- **react-native-safe-area-context**: Proper safe area handling
- **react-native-view-shot**: Screenshot capture for sharing
- **expo-sharing**: Native share sheet integration

### Build & Deployment
- **EAS Build**: Cloud-based native builds
- **Expo Web**: Static site generation for web deployment

## Architecture Principles

### 1. Local-First Architecture

All data resides on the device. The application has no backend, no API calls, and no cloud dependencies.

**Benefits:**
- Works offline in any environment
- No privacy concerns (data never leaves device)
- Instant performance (no network latency)
- User owns their data completely

**Implementation:**
- SQLite database for native (iOS/Android)
- Custom WebDatabase emulator for web (localStorage-backed)
- Synchronous database operations for simplicity
- No data synchronization between devices (intentional for v1)

### 2. Sport-Agnostic Engine

The application separates sport-specific logic from tournament management logic through a modular interface system.

**Sport Interface:**
```typescript
interface Sport {
  id: string;
  name: string;
  defaultFormat: MatchFormat;
  validateUnitScore(scoreA: number, scoreB: number, format: MatchFormat): ValidationResult;
  determineWinner(units: ScoringUnit[], format: MatchFormat): 'a' | 'b' | null;
  isMatchComplete(units: ScoringUnit[], format: MatchFormat): boolean;
  getUnitCount(format: MatchFormat): number;
  tieBreakers: string[];
}
```

**Current Implementations:**
- `badmintonSport`: Game-based scoring (21 points, best of 3, no win-by-2)
- `tennisSport`: Set-based scoring (6 games per set, best of 3 sets)
- `tableTennisSport`: Game-based scoring (11 points, best of 3, win-by-2)

**Benefits:**
- Adding a new sport requires only implementing the Sport interface
- Tournament logic (scheduling, standings) is completely sport-agnostic
- Sport-specific validation is isolated and testable

### 3. Controlled Component Pattern

UI components receive all data via props and emit events upward. No component fetches its own data.

**Example: ScoreEntryModal**
```typescript
interface ScoreEntryModalProps {
  playerA: string;
  playerB: string;
  unitLabel: string;
  units: ScoreUnit[];
  onSave: (unitNumber: number, scoreA: number, scoreB: number) => void;
  onClose: () => void;
}
```

**Benefits:**
- Components are pure functions of their props
- Easy to test (no mocking database calls)
- Clear data flow (parent → child)
- No stale state issues

### 4. Progressive Enhancement

The application works on web, iOS, and Android with platform-specific optimizations:

- **Web**: Custom WebDatabase emulator (localStorage-backed)
- **Native**: Direct SQLite access via expo-sqlite
- **Sharing**: Web Share API on web, native share sheet on mobile
- **Safe Areas**: Automatic handling via react-native-safe-area-context

## Module Structure

### Data Layer (`src/lib/`)

**database.ts**
- Platform detection and database initialization
- Exports `getDatabase()` which returns platform-appropriate implementation
- Handles schema creation and migrations

**database-web.ts**
- Custom SQLite emulator for web
- Parses SQL statements and executes against localStorage
- Supports: SELECT, INSERT, UPDATE, DELETE with WHERE clauses
- Handles foreign key cascades manually

**db-operations.ts**
- Repository pattern for all database operations
- Functions: `createTournament`, `getBadmintonMatches`, `updateScore`, etc.
- Abstracts SQL queries behind typed function calls
- Platform-agnostic (works with both SQLite and WebDatabase)

**scheduler.ts**
- Round-robin scheduling algorithm
- Handles odd number of participants (adds BYE)
- Returns array of match pairings

**leaderboard.ts**
- Standings calculation for round-robin tournaments
- Implements tiebreaker logic (wins → point diff → game diff)
- Detects ties and groups tied participants

**sports/badminton.ts, tennis.ts, table-tennis.ts**
- Sport-specific scoring logic
- Implements Sport interface
- Validates scores according to sport rules
- Determines match completion and winners

### Hooks Layer (`src/hooks/`)

**use-tournaments.ts**
- Tournament CRUD operations
- Orchestrates participant creation and match generation
- Handles tournament deletion

**use-matches.ts**
- Match data loading and score updates
- Automatic match status transitions (upcoming → in_progress → completed)
- Tournament status updates based on match completion
- Winner determination and advancement logic

**use-standings.ts**
- Standings calculation and caching
- Refreshes when matches change

### UI Layer (`src/app/`)

**index.tsx** (Tournament List)
- Displays all tournaments with status indicators
- FAB for creating new tournaments
- Long-press to delete

**create.tsx** (Tournament Creation)
- Multi-step form: name → sport → participants → format
- Sport-specific format options
- Validation before creation

**tournament/[id].tsx** (Tournament Detail)
- Tabbed interface: Matches, Standings, Settings
- Match list with status badges
- Standings table with share functionality
- Settings for renaming tournament/participants

### Components (`src/components/`)

**score-entry-modal.tsx**
- Controlled component for entering match scores
- Shows all games/sets with edit capability
- Auto-closes after save
- Validates scores before saving

## Data Flow

### Tournament Creation
```
User fills form
  → useTournaments.createTournament()
    → db-operations.createTournament()
    → db-operations.createParticipant() (for each player)
    → scheduler.generateRoundRobin()
    → db-operations.createBadmintonMatch() (for each pairing)
  → Refresh tournament list
  → Navigate to tournament detail
```

### Score Entry
```
User taps match
  → Parent loads match data from useMatches hook
  → Parent passes data to ScoreEntryModal as props
  → User enters scores
  → User taps Save
  → Modal calls onSave callback
  → Parent calls useMatches.updateScore()
    → db-operations.updateBadmintonGame()
    → Determine match completion
    → db-operations.updateBadmintonMatchStatus()
    → Update tournament status if needed
  → Modal closes
  → Parent refreshes matches and standings
```

### Standings Calculation
```
User views Standings tab
  → useStandings hook loads data
    → db-operations.getParticipants()
    → db-operations.getBadmintonMatches()
    → db-operations.getBadmintonGames() (for each match)
  → leaderboard.calculateStandings()
    → Calculate wins, losses, point diff, game diff
    → Apply tiebreaker logic
    → Assign ranks
  → Render standings table
```

## Database Schema

### Core Tables

**tournaments**
```sql
id INTEGER PRIMARY KEY
name TEXT NOT NULL
sport TEXT NOT NULL ('badminton' | 'tennis' | 'table_tennis')
status TEXT NOT NULL ('upcoming' | 'active' | 'completed')
type TEXT NOT NULL DEFAULT 'round_robin' ('round_robin' | 'knockout')
created_at INTEGER
updated_at INTEGER
```

**participants**
```sql
id INTEGER PRIMARY KEY
tournament_id INTEGER (FK → tournaments.id)
name TEXT NOT NULL
created_at INTEGER
```

**badminton_matches**
```sql
id INTEGER PRIMARY KEY
tournament_id INTEGER (FK → tournaments.id)
participant_a_id INTEGER (FK → participants.id)
participant_b_id INTEGER (FK → participants.id)
game_point INTEGER (e.g., 21)
best_of_games INTEGER (e.g., 3)
status TEXT NOT NULL ('upcoming' | 'in_progress' | 'completed')
winner_id INTEGER (FK → participants.id, nullable)
created_at INTEGER
```

**badminton_match_games**
```sql
id INTEGER PRIMARY KEY
match_id INTEGER (FK → badminton_matches.id)
game_number INTEGER
score_a INTEGER (nullable)
score_b INTEGER (nullable)
```

**tennis_matches** and **tennis_match_sets** follow similar structure with set-based scoring.

**table_tennis_matches** and **table_tennis_match_games** follow the same shape as badminton's two-table pair (gamePoint, bestOfGames, status, winner, bracket fields). Each sport owns its own two-table pair; see `docs/adr/0001-per-sport-match-tables.md` for the rationale.

### Foreign Key Cascades

- Deleting a tournament cascades to participants and matches
- Deleting a match cascades to games/sets
- Deleting a participant sets winner_id to NULL in matches

## State Management

### Local Component State
- Form inputs (create.tsx)
- Modal visibility (tournament/[id].tsx)
- Editing state (settings tab)

### Hook-Based State
- Tournament list (useTournaments)
- Match data (useMatches)
- Standings (useStandings)

### No Global State
- No Redux, Zustand, or Context API
- Each screen loads its own data via hooks
- Data flows down via props, events flow up via callbacks

## Design Decisions

### 1. Synchronous Database Operations
**Decision:** Use synchronous SQLite operations (`runSync`, `getAllSync`) instead of async.

**Rationale:**
- Simplifies code (no async/await everywhere)
- Prevents race conditions in score updates
- Acceptable for local-only app with small datasets
- Easier to reason about data flow

**Trade-off:** Blocks UI thread during database operations (acceptable for < 100ms operations)

### 2. No Data Synchronization
**Decision:** v1 has no multi-device sync.

**Rationale:**
- Keeps architecture simple
- Avoids conflict resolution complexity
- Aligns with offline-first principle
- Can be added later as opt-in feature

**Trade-off:** Users cannot access tournaments from multiple devices

### 3. Controlled Components for Modals
**Decision:** ScoreEntryModal receives all data via props, never fetches its own data.

**Rationale:**
- Prevents stale state issues
- Makes component testable
- Clear data ownership (parent owns data)
- Easier to reason about updates

**Trade-off:** Parent must load and pass all required data

### 4. Sport Interface Abstraction
**Decision:** Define a Sport interface that all sports must implement.

**Rationale:**
- Enables adding new sports without modifying core logic
- Isolates sport-specific validation
- Makes tournament logic truly sport-agnostic
- Easy to test sport implementations independently

**Trade-off:** Slightly more complex initial setup

### 5. WebDatabase Emulator
**Decision:** Build custom SQLite emulator for web instead of using sql.js or similar.

**Rationale:**
- Full control over implementation
- Can optimize for our specific query patterns
- Avoids WebAssembly complexity
- Simpler deployment (no .wasm files)

**Trade-off:** Limited SQL support (only what we need), more code to maintain

## Security & Privacy

### Data Storage
- All data stored locally in SQLite database
- No data transmitted to external servers
- No analytics or tracking
- No third-party services

### Data Ownership
- Users can export/delete their data at any time
- Database file accessible on device filesystem
- No account system or authentication required

### Privacy by Design
- No personal information collected beyond player names
- No location tracking
- No usage analytics
- No advertising

## Performance Considerations

### Database Optimization
- Indexed foreign keys for fast joins
- Synchronous operations for simplicity (acceptable for small datasets)
- Lazy loading of game/set data (only when viewing match details)

### UI Optimization
- Virtualized lists not needed (tournaments < 100 items)
- Image sharing uses native APIs for efficiency
- Font loading happens once at app startup

### Scalability Limits
- Tested up to 16 participants per tournament
- Tested up to 50 tournaments per device
- Database size < 10MB for typical usage
- No pagination needed for v1 scale

## Future Extensibility

### Adding New Sports
1. Create `src/lib/sports/{sport}.ts` implementing Sport interface
2. Add database tables for sport-specific match structure
3. Add format options to tournament creation UI
4. Update type definitions

### Adding New Tournament Formats
1. Create scheduler function (e.g., `generateKnockout`)
2. Add format selection to tournament creation
3. Update match creation logic
4. Add format-specific UI (brackets, etc.)

### Adding Multi-Device Sync
1. Add optional cloud backend (user-controlled)
2. Implement conflict resolution strategy
3. Add sync status indicators
4. Handle offline/online transitions

### Adding Statistics
1. Add player profile system
2. Track historical performance
3. Calculate win rates, averages, etc.
4. Display in player detail view
