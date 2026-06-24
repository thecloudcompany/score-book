# v1: Knockout Tournaments (Single Elimination)

## Overview

Knockout tournaments (single elimination) are the second tournament format to be implemented in ScoreBook. In a knockout tournament, participants are eliminated after a single loss. The tournament progresses through rounds until a single winner remains.

## Implementation Status

✅ **Complete** - Knockout tournaments (single elimination) are fully functional for both badminton and tennis, including bracket generation, bye handling, automatic winner advancement, and elimination-based standings. All five bug fixes from initial end-to-end testing are landed in code; see "Implementation Notes & Bug Fixes" below.

## Core Features

### 1. Tournament Type Selection

**User Flow:**
1. Enter tournament name
2. Select sport (badminton or tennis)
3. **Select tournament type: Round-Robin or Knockout** ← NEW
4. Enter participants
5. **If knockout: Choose bye method (random or manual)** ← NEW
6. Configure match format
7. Create tournament

**UI Changes:**
- Add tournament type selector after sport selection
- Show explanation of each format
- Branch creation flow based on selection

**Implementation:**
- Add `tournament_type` column to `tournaments` table
- Update `useTournaments.createTournament()` to accept type parameter
- Update creation UI to include type selection step

### 2. Bye Handling

**Problem:**
Single elimination brackets work best with powers of 2 (2, 4, 8, 16 participants). Real tournaments often have other counts (5, 6, 7, 10, 12 players).

**Solution:**
Add "byes" - some participants skip the first round to fill the bracket to the next power of 2.

**Example (6 players):**
- Next power of 2 = 8 slots
- Need 2 byes (8 - 6 = 2)
- 2 participants skip Round 1, appear in Round 2

**Bye Assignment Methods:**

**A. Random (Recommended for casual play)**
- System randomly assigns byes
- Fair for casual tournaments
- No user intervention needed

**B. Manual Selection**
- User selects which participants get byes
- Checkbox list showing all participants
- Counter shows "X of Y byes selected"
- User can change selection before creating

**UI Flow for Manual:**
```
This tournament needs 2 byes (8 slots, 6 players).

Choose bye method:
○ Random (system assigns byes automatically)
● I'll choose (select which players skip Round 1)

Select players who get byes (2 of 6):
☐ Player 1
☐ Player 2
☑ Player 3  ← selected
☑ Player 4  ← selected
☐ Player 5
☐ Player 6

[Continue]
```

**Implementation:**
- Calculate byes needed: `nextPowerOf2(participants) - participants`
- If random: shuffle participants, first N get byes
- If manual: show selection UI, validate count matches needed byes
- Store bye assignments for match generation

### 3. Bracket Structure

**Database Schema Extensions:**

Add columns to `badminton_matches` and `tennis_matches`:

```sql
ALTER TABLE badminton_matches ADD COLUMN round INTEGER NOT NULL DEFAULT 1;
ALTER TABLE badminton_matches ADD COLUMN bracket_position INTEGER NOT NULL DEFAULT 1;
ALTER TABLE badminton_matches ADD COLUMN feeds_into_match_id INTEGER;
ALTER TABLE badminton_matches ADD COLUMN feeds_into_slot TEXT; -- 'A' or 'B'
```

**Column Meanings:**
- `round`: Which round this match is in (1 = first round, 2 = second round, etc.)
- `bracket_position`: Position within the round (1, 2, 3, etc.)
- `feeds_into_match_id`: ID of the next match this winner advances to (NULL for final)
- `feeds_into_slot`: Which slot in the next match ('A' or 'B')

**Example Bracket (6 players, 2 byes):**

```
Round 1 (2 matches):
  Match 1: P3 vs P4
    - round=1, bracket_position=1
    - feeds_into_match_id=3, feeds_into_slot='A'
  
  Match 2: P5 vs P6
    - round=1, bracket_position=2
    - feeds_into_match_id=4, feeds_into_slot='B'

Round 2 (2 matches - semifinals):
  Match 3: P1 (bye) vs [Winner of Match 1]
    - participant_a_id=1 (P1, known from start)
    - participant_b_id=NULL (filled when Match 1 completes)
    - round=2, bracket_position=1
    - feeds_into_match_id=5, feeds_into_slot='A'
  
  Match 4: P2 (bye) vs [Winner of Match 2]
    - participant_a_id=2 (P2, known from start)
    - participant_b_id=NULL (filled when Match 2 completes)
    - round=2, bracket_position=2
    - feeds_into_match_id=5, feeds_into_slot='B'

Round 3 (1 match - final):
  Match 5: [Winner of Match 3] vs [Winner of Match 4]
    - participant_a_id=NULL (filled when Match 3 completes)
    - participant_b_id=NULL (filled when Match 4 completes)
    - round=3, bracket_position=1
    - feeds_into_match_id=NULL, feeds_into_slot=NULL (this is the final)
```

**Total Matches:** Always n-1 where n = number of participants
- 6 players = 5 matches
- 8 players = 7 matches
- 16 players = 15 matches

### 4. Bye Match Representation

**Approach: Fake Matches with NULL Participant**

Create "bye matches" that auto-complete immediately:

```sql
-- Bye match for Player 1
INSERT INTO badminton_matches (
  tournament_id, participant_a_id, participant_b_id,
  round, bracket_position, status, winner_id,
  feeds_into_match_id, feeds_into_slot
) VALUES (
  1, 1, NULL,  -- participant_b_id is NULL (the BYE)
  1, 3, 'completed', 1,  -- auto-completed, Player 1 wins
  3, 'A'  -- feeds into Match 3, slot A
);
```

**Benefits:**
- Consistent logic (all participants go through same flow)
- Easy to detect in UI (`participantBId === null && status === 'completed'`)
- Doesn't pollute participant list
- Clear representation of bracket structure

**UI Display:**
- Show as "Player 1 (bye)" instead of "Player 1 vs TBD"
- Mark as completed with no score
- Visually distinct from real matches (e.g., grayed out)

### 5. Match Progression

**Automatic Advancement:**

When a match completes:
1. Determine winner (existing logic)
2. Look up: "This match feeds into Match X slot Y"
3. Update Match X participant (A or B) with winner ID
4. If Match X now has both participants, it becomes playable

**Implementation:**

```typescript
function handleMatchCompletion(matchId: number, winnerId: number) {
  // 1. Update match status and winner (existing)
  updateMatchStatus(matchId, 'completed', winnerId);
  
  // 2. Look up where this match feeds into
  const match = getMatch(matchId);
  if (match.feedsIntoMatchId) {
    // 3. Update the next match with the winner
    if (match.feedsIntoSlot === 'A') {
      updateMatchParticipant(match.feedsIntoMatchId, 'A', winnerId);
    } else {
      updateMatchParticipant(match.feedsIntoMatchId, 'B', winnerId);
    }
  }
  
  // 4. Check if tournament is complete (final match done)
  if (!match.feedsIntoMatchId) {
    updateTournamentStatus(tournamentId, 'completed');
  }
}
```

**Integration:**
- Extend `useMatches.updateScore()` to handle progression
- Add helper functions: `advanceWinner()`, `isMatchPlayable()`
- Update match status transitions to consider bracket position

### 6. Match Display

**Grouped by Round:**

```
▼ Round 1 (2 matches)
  Match 1: P3 vs P4 (Completed: 21-15, 21-18)
  Match 2: P5 vs P6 (In Progress)

▼ Round 2 (2 matches)
  Match 3: P1 vs Winner of Match 1 (Upcoming)
  Match 4: P2 vs Winner of Match 2 (Upcoming)

▼ Final (1 match)
  Match 5: TBD vs TBD (Upcoming)
```

**Round Naming:**
- Round 1, Round 2, Round 3, etc. for early rounds
- "Quarterfinals" when 8 participants remain
- "Semifinals" when 4 participants remain
- "Final" for the last match

**TBD Participants:**
- Show "Winner of Match X" for unknown participants
- Show "TBD" if multiple matches could feed into this slot
- Clear indication that match is not yet playable

**Bye Matches:**
- Show as "Player 1 (bye)" with completed status
- No score displayed
- Visually distinct (e.g., grayed out, smaller text)

**Implementation:**
- Group matches by `round` column
- Sort by `bracket_position` within each round
- Check `participant_a_id` and `participant_b_id` for TBD status
- Format round names based on participants remaining

### 7. Standings View (Elimination Status)

**Structure:**

```
🏆 Champion: Player 1 (if tournament complete)

Still Competing (3):
- Player 1
- Player 3  
- Player 5

Eliminated in Semifinals (2):
- Player 2
- Player 4

Eliminated in Quarterfinals (3):
- Player 6
- Player 7
- Player 8
```

**Calculation Logic:**

```typescript
function calculateKnockoutStandings(tournamentId: number): KnockoutStandings {
  const matches = getMatches(tournamentId);
  const participants = getParticipants(tournamentId);
  
  // Find champion (winner of final match)
  const finalMatch = matches.find(m => !m.feedsIntoMatchId);
  const champion = finalMatch?.status === 'completed' ? finalMatch.winnerId : null;
  
  // Track elimination round for each participant
  const eliminations: Map<number, number> = new Map();
  
  for (const match of matches) {
    if (match.status === 'completed' && match.winnerId) {
      // Loser is eliminated in this round
      const loserId = match.participantAId === match.winnerId 
        ? match.participantBId 
        : match.participantAId;
      eliminations.set(loserId, match.round);
    }
  }
  
  // Group participants by status
  const stillCompeting = participants.filter(p => 
    !eliminations.has(p.id) && p.id !== champion
  );
  
  const eliminatedByRound: Map<number, Participant[]> = new Map();
  for (const [participantId, round] of eliminations) {
    if (!eliminatedByRound.has(round)) {
      eliminatedByRound.set(round, []);
    }
    eliminatedByRound.get(round)!.push(
      participants.find(p => p.id === participantId)!
    );
  }
  
  return {
    champion,
    stillCompeting,
    eliminatedByRound
  };
}
```

**UI Implementation:**
- Reuse Standings tab (same location, different content)
- Show sections for each elimination round
- Collapse sections with many participants
- Highlight champion prominently if tournament complete

### 8. Match Editing Restrictions

**Rule:** Prevent editing completed matches that have downstream effects.

**Rationale:**
- Changing a winner in Round 1 could invalidate the entire bracket
- Prevents data corruption and confusion
- Allows editing current round matches (where next round hasn't started)

**Implementation:**

```typescript
function canEditMatch(matchId: number): boolean {
  const match = getMatch(matchId);
  
  // Can't edit if this match feeds into another match that already has participants
  if (match.feedsIntoMatchId) {
    const nextMatch = getMatch(match.feedsIntoMatchId);
    // If the next match already has both participants, it's locked
    if (nextMatch.participantAId && nextMatch.participantBId) {
      return false;
    }
  }
  
  return true;
}
```

**UI Feedback:**
- Disable edit button for locked matches
- Show tooltip: "Cannot edit - winner has already advanced"
- Allow editing matches in current round (where next round is still TBD)

### 9. Tournament Completion

**Detection:**
- Tournament is complete when the final match (no `feeds_into_match_id`) is completed
- Final match winner is the tournament champion

**Status Update:**
```typescript
if (!match.feedsIntoMatchId && match.status === 'completed') {
  updateTournamentStatus(tournamentId, 'completed');
}
```

**UI Changes:**
- Show champion in standings view
- Display completion banner on tournament detail
- Disable further score entry (all matches completed)

## Implementation Notes & Bug Fixes

A handful of issues surfaced during the first end-to-end knockout tests (3-player bracket with a random bye, followed by score entry). Each is documented below with the root cause and the fix that landed.

### Fix 1: TBD vs BYE display

**Symptom:** The Final match rendered as `test-2 vs BYE` when test-2 had already advanced and the other finalist (test-1, who had a Round-1 bye) was not yet rendered as a participant.

**Root cause:** The match row in `tournament/[id].tsx` showed `'BYE'` for **any** match with a null `participantBId`. But a null participant can mean two different things:
- **BYE** — Round 1 only, the participant was given a free pass; match is auto-completed.
- **TBD** — a later-round match whose slot is waiting for the winner of a previous match.

**Fix:** `src/lib/knockout-standings.ts` now exposes `isByeMatch(match)` and `getParticipantPlaceholder(match, slot)`. The UI uses these to differentiate:

- `isByeMatch`: `round === 1 && participantBId === null && status === 'completed'`
- `getParticipantPlaceholder`: returns `'BYE'` for actual bye matches, `'TBD'` for everything else (later-round matches waiting on a winner).

The match row now renders `test-2 vs TBD` for the Final until both semi-finals are completed, then `test-1 vs test-2` once test-1's bye winner is filled in.

### Fix 2: Bye matches must auto-advance winners

**Symptom:** With 3 players (test-1, test-2, test-3) and one random bye, the bye was assigned to test-1. test-1's match was correctly auto-completed, but **the Final stayed as `test-2 vs TBD`** even after test-2 won their semi. Expected: `test-1 vs test-2` (bye winner advances to the Final just like a real match winner).

**Root cause:** Bye matches were being auto-completed **before** the bracket links (`feeds_into_match_id`, `feeds_into_slot`) were set. The code looked like:

```typescript
// 1. Create all matches (bracket links still null)
for (const bracketMatch of bracketMatches) {
  const matchId = createMatch(bracketMatch);
  // ❌ Bye auto-completed here — but feedsIntoMatchId is still null
  if (bracketMatch.participantBId === null) {
    updateMatchStatus(matchId, 'completed', bracketMatch.participantAId);
  }
}

// 2. THEN set bracket links
for (const bracketMatch of bracketMatches) {
  updateBracketLink(...);
}
```

**Fix:** In `src/hooks/use-tournaments.ts`, the bye auto-completion was moved into a third pass **after** bracket links are set. The bye match is still auto-completed, but the winner is also advanced to `feedsIntoMatchId` at `feedsIntoSlot`:

```typescript
// 1. Create all matches
// 2. Set all bracket links
// 3. NOW auto-complete byes AND advance winners
for (const bracketMatch of bracketMatches) {
  if (bracketMatch.participantBId === null && bracketMatch.participantAId !== null) {
    const matchId = createdMatchIds[i];
    const winnerId = bracketMatch.participantAId;
    updateMatchStatus(matchId, 'completed', winnerId);
    if (bracketMatch.feedsIntoMatchId !== null) {
      updateMatchParticipant(createdMatchIds[bracketMatch.feedsIntoMatchId], bracketMatch.feedsIntoSlot, winnerId);
    }
  }
}
```

**Existing tournaments:** The fix only runs at tournament creation. Old tournaments with broken state need to be deleted and recreated.

### Fix 3: Tennis "Best of N" — form/storage semantics mismatch

**Symptom:** User picked "Best of 3" for tennis, but the score entry modal showed 5 sets (Set 1, Set 2, Set 3, Set 4, Set 5).

**Root cause:** The form exposed values 1, 3, 5 labelled "Single" / "Best of 3" / "Best of 5". The tennis sport module, however, interprets `setsToWin` as **"first to N wins"** (a *wins needed* field, not a *best-of total*). So `setsToWin: 3` actually meant "first player to win 3 sets" = best-of-5. The form was passing "best of N" semantics, the storage was expecting "first to N wins" — they were off by one factor of 2.

**Fix:** Align the form and storage on the same semantics. The cleanest path was to use **"best of N" everywhere** (matches the standard tennis terminology, matches what the form already showed, matches how badminton was already working). At storage time we convert:

```typescript
// In use-tournaments.ts, before calling createTennisMatch:
const setsToWin = Math.ceil((format.setsToWin ?? 3) / 2);
```

| User picks | Form value | Stored `setsToWin` | Total sets |
|---|---|---|---|
| Single | 1 | 1 | 1 |
| Best of 3 | 3 | 2 | 3 |
| Best of 5 | 5 | 3 | 5 |

The tennis `defaultFormat.setsToWin = 2` ("first to 2 wins" = best-of-3) is still correct. `getUnitCount(format)` in `src/lib/sports/tennis.ts` continues to compute `setsToWin * 2 - 1` and now matches the user-visible intent.

Badminton was always consistent (`bestOfGames: 3` = best-of-3, first to 2 wins via `Math.ceil(3/2)`), so no change was needed there.

**Default value:** `src/app/create.tsx` was initialising the tennis format to `setsToWin: 2` (which now means "best of 4" — nonsensical). Changed to `setsToWin: 3` to default to "Best of 3".

**Existing tennis tournaments:** A tournament created before this fix stored `setsToWin: 3` (= best-of-5 under both old and new code, so the user's set count is unchanged for that tournament). To get the new "Best of 3 = 3 sets" behavior, the tournament must be deleted and recreated. There is no in-place migration for already-created matches because doing so would invalidate any sets the user has already entered.

### Fix 4: Score entry did not enforce sport-specific thresholds

**Symptom:** Even with the validate-by-sport logic in place, the score modal let users save badminton scores like 5-3 (winner didn't reach 21) and tennis scores like 5-4 (winner didn't reach 6). The modals are tied to whatever the user configured, but they were using a hardcoded check that ignored that config.

**Root cause:** `src/components/score-entry-modal.tsx` had its own inline validation (`a === b`, `a < 0`, etc.) that completely bypassed `sport.validateUnitScore`. The threshold values (21 for badminton, 6 for tennis) were hardcoded in the sport modules but never actually consulted.

**Fix:** The score modal now takes `sport: Sport` and `format: MatchFormat` as props and delegates to `sport.validateUnitScore(a, b, format)`. The caller (`tournament/[id].tsx`) constructs the format from the match's stored values (`gamePoint`/`bestOfGames` for badminton, `setsToWin`/`gamesToWinPerSet` for tennis). This means the modal enforces **whatever the user configured** in the tournament creation's advanced options, not a hardcoded default.

The error message shown in the modal is also now sport-specific ("Winner must reach at least 21 points" / "Winner must reach at least 6 games") and reflects the actual configured value.

### Fix 5: Cross-platform delete confirmation

**Symptom:** Tapping "Delete Tournament" in the Settings tab silently did nothing on web.

**Root cause:** React Native's `Alert.alert` is **not implemented on web** — it's a no-op. The same code path worked correctly on iOS and Android because they use the native dialog.

**Fix:** Replaced the two `Alert.alert` call sites (Settings tab delete, Index long-press delete) with a new cross-platform `ConfirmDialog` component (`src/components/confirm-dialog.tsx`). On native it uses `Modal`; on web it renders an absolute-positioned overlay (using `position: fixed` so it covers the viewport even when scrolled). Both paths use the same teal/destructive styling as the rest of the app.

### Refactor: `tournament/[id].tsx` split

The detail screen had grown to ~830 lines with three tab render functions, a header, a tab bar, the score modal, the confirm dialog, and ~270 lines of styles. Split into:

- `tournament/[id].tsx` — orchestrator: state, hooks, header, tab bar, modal mounting
- `components/matches-tab.tsx` — both knockout (grouped by round) and round-robin (grouped by status) views
- `components/standings-tab.tsx` — both knockout (elimination status) and round-robin (table) views
- `components/settings-tab.tsx` — name, sport, players, delete
- `components/match-row.tsx` — shared row used by both knockout and round-robin
- `components/[id].styles.ts` — extracted styles

Each file stays under 300 lines. The orchestrator passes shared data (matches, units, participants, sport, format) down via props, which is the same shape the hooks already return.



### tournaments Table

```sql
ALTER TABLE tournaments ADD COLUMN tournament_type TEXT NOT NULL DEFAULT 'round_robin';
-- Values: 'round_robin' | 'knockout'
```

### badminton_matches Table

```sql
ALTER TABLE badminton_matches ADD COLUMN round INTEGER NOT NULL DEFAULT 1;
ALTER TABLE badminton_matches ADD COLUMN bracket_position INTEGER NOT NULL DEFAULT 1;
ALTER TABLE badminton_matches ADD COLUMN feeds_into_match_id INTEGER;
ALTER TABLE badminton_matches ADD COLUMN feeds_into_slot TEXT; -- 'A' or 'B'

-- Add index for efficient bracket queries
CREATE INDEX idx_badminton_matches_bracket 
  ON badminton_matches(tournament_id, round, bracket_position);
```

### tennis_matches Table

```sql
ALTER TABLE tennis_matches ADD COLUMN round INTEGER NOT NULL DEFAULT 1;
ALTER TABLE tennis_matches ADD COLUMN bracket_position INTEGER NOT NULL DEFAULT 1;
ALTER TABLE tennis_matches ADD COLUMN feeds_into_match_id INTEGER;
ALTER TABLE tennis_matches ADD COLUMN feeds_into_slot TEXT; -- 'A' or 'B'

-- Add index for efficient bracket queries
CREATE INDEX idx_tennis_matches_bracket 
  ON tennis_matches(tournament_id, round, bracket_position);
```

### Migration Strategy

1. Add new columns with default values
2. Existing round-robin tournaments keep default values (round=1, no feeds_into)
3. New knockout tournaments use new columns
4. No data loss or corruption

## Key Modules to Implement

### src/lib/bracket-generator.ts (NEW)

```typescript
interface BracketConfig {
  participantIds: number[];
  byeMethod: 'random' | 'manual';
  manualByeIds?: number[];
}

interface BracketMatch {
  round: number;
  bracketPosition: number;
  participantAId: number | null;
  participantBId: number | null;
  feedsIntoMatchId: number | null;
  feedsIntoSlot: 'A' | 'B' | null;
}

function generateKnockoutBracket(config: BracketConfig): BracketMatch[] {
  // 1. Calculate bracket size (next power of 2)
  // 2. Determine bye assignments
  // 3. Generate Round 1 matches
  // 4. Generate subsequent rounds with TBD participants
  // 5. Link matches via feeds_into_match_id
  // 6. Return array of matches to create
}
```

**Responsibilities:**
- Calculate bracket structure based on participant count
- Assign byes (random or manual)
- Generate all matches with proper linking
- Handle bye matches (NULL participant)

### src/lib/knockout-standings.ts (NEW)

```typescript
interface KnockoutStandings {
  champion: number | null;
  stillCompeting: Participant[];
  eliminatedByRound: Map<number, Participant[]>;
}

function calculateKnockoutStandings(
  tournamentId: number,
  matches: Match[]
): KnockoutStandings {
  // 1. Find champion (winner of final)
  // 2. Track elimination round for each participant
  // 3. Group by status (champion, still competing, eliminated by round)
  // 4. Return structured standings
}
```

**Responsibilities:**
- Calculate elimination status for each participant
- Identify champion when tournament complete
- Group participants by elimination round
- Provide data for standings UI

### src/hooks/use-matches.ts (EXTEND)

**New Functions:**

```typescript
function advanceWinner(matchId: number, winnerId: number): void {
  // Look up where this match feeds into
  // Update next match participant (A or B)
}

function isMatchPlayable(match: Match): boolean {
  // Check if both participants are known
  // Return true if match can be played
}

function canEditMatch(matchId: number): boolean {
  // Check if match has downstream effects
  // Return false if editing would corrupt bracket
}
```

**Modified Functions:**

```typescript
function updateScore(matchId, gameNumber, scoreA, scoreB): void {
  // Existing logic...
  
  // NEW: Handle knockout progression
  if (tournament.type === 'knockout' && match.status === 'completed') {
    advanceWinner(matchId, match.winnerId);
    
    // Check if tournament is complete
    if (!match.feedsIntoMatchId) {
      updateTournamentStatus(tournamentId, 'completed');
    }
  }
}
```

### src/hooks/use-tournaments.ts (EXTEND)

**Modified Function:**

```typescript
function createTournament(
  name: string,
  sport: SportType,
  tournamentType: 'round_robin' | 'knockout', // NEW
  participantNames: string[],
  format: Record<string, number>,
  byeConfig?: ByeConfig // NEW (for knockout)
): Tournament {
  // Existing participant creation...
  
  // NEW: Branch based on tournament type
  if (tournamentType === 'round_robin') {
    // Existing round-robin logic
    const pairings = generateRoundRobin(participantIds);
    // Create matches...
  } else {
    // NEW: Knockout logic
    const bracket = generateKnockoutBracket({
      participantIds,
      byeMethod: byeConfig.method,
      manualByeIds: byeConfig.manualIds
    });
    // Create matches with bracket structure...
  }
}
```

### src/app/create.tsx (EXTEND)

**New UI Elements:**

```typescript
// Tournament type selection
<View>
  <Text>Tournament Type</Text>
  <RadioButton 
    label="Round-Robin (everyone plays everyone)"
    selected={type === 'round_robin'}
    onPress={() => setType('round_robin')}
  />
  <RadioButton 
    label="Knockout (single elimination)"
    selected={type === 'knockout'}
    onPress={() => setType('knockout')}
  />
</View>

// Bye method selection (knockout only)
{type === 'knockout' && (
  <View>
    <Text>Bye Assignment</Text>
    <RadioButton 
      label="Random (system assigns byes)"
      selected={byeMethod === 'random'}
      onPress={() => setByeMethod('random')}
    />
    <RadioButton 
      label="I'll choose (select who gets byes)"
      selected={byeMethod === 'manual'}
      onPress={() => setByeMethod('manual')}
    />
    
    {byeMethod === 'manual' && (
      <ByeSelectionList 
        participants={participants}
        byesNeeded={calculateByesNeeded(participants.length)}
        selectedByes={selectedByes}
        onChange={setSelectedByes}
      />
    )}
  </View>
)}
```

### src/app/tournament/[id].tsx (EXTEND)

**Match Display Changes:**

```typescript
function renderMatchesTab() {
  if (tournament.type === 'round_robin') {
    // Existing round-robin display
    return renderRoundRobinMatches();
  } else {
    // NEW: Knockout display
    return renderKnockoutMatches();
  }
}

function renderKnockoutMatches() {
  // Group matches by round
  const matchesByRound = groupMatchesByRound(matches);
  
  return (
    <ScrollView>
      {matchesByRound.map((roundMatches, roundIndex) => (
        <RoundSection 
          key={roundIndex}
          roundName={getRoundName(roundIndex, totalRounds)}
          matches={roundMatches}
          onMatchPress={handleMatchPress}
        />
      ))}
    </ScrollView>
  );
}
```

**Standings Display Changes:**

```typescript
function renderStandingsTab() {
  if (tournament.type === 'round_robin') {
    // Existing round-robin standings
    return renderRoundRobinStandings();
  } else {
    // NEW: Knockout standings
    return renderKnockoutStandings();
  }
}

function renderKnockoutStandings() {
  const standings = calculateKnockoutStandings(tournamentId, matches);
  
  return (
    <ScrollView>
      {standings.champion && (
        <ChampionSection participant={getParticipant(standings.champion)} />
      )}
      
      <StillCompetingSection participants={standings.stillCompeting} />
      
      {Array.from(standings.eliminatedByRound.entries())
        .sort((a, b) => b[0] - a[0]) // Highest round first
        .map(([round, participants]) => (
          <EliminatedSection 
            key={round}
            round={round}
            participants={participants}
          />
        ))}
    </ScrollView>
  );
}
```

### src/components/score-entry-modal.tsx (EXTEND)

**Edit Restriction:**

```typescript
interface ScoreEntryModalProps {
  // Existing props...
  canEdit: boolean; // NEW
}

export default function ScoreEntryModal({ canEdit, ...props }) {
  // Disable inputs if canEdit is false
  const isDisabled = !canEdit;
  
  return (
    <Modal>
      {/* Existing UI... */}
      
      {isDisabled && (
        <View style={styles.lockedMessage}>
          <Text>Cannot edit - winner has already advanced to next round</Text>
        </View>
      )}
      
      <TextInput 
        disabled={isDisabled}
        // ... rest of props
      />
      
      <TouchableOpacity 
        disabled={isDisabled || !canSave}
        // ... rest of props
      >
        <Text>Save Score</Text>
      </TouchableOpacity>
    </Modal>
  );
}
```

## Testing Strategy

### Unit Tests

**bracket-generator.ts:**
- Test bracket generation for various participant counts (2, 3, 4, 5, 6, 7, 8, 9, 16)
- Test random bye assignment (verify correct number of byes)
- Test manual bye assignment (verify selected participants get byes)
- Test bracket linking (verify feeds_into_match_id and feeds_into_slot)
- Test bye match creation (verify NULL participant and auto-completion)

**knockout-standings.ts:**
- Test champion detection when tournament complete
- Test still competing detection (participants not yet eliminated)
- Test elimination round tracking (correct round for each eliminated participant)
- Test grouping by elimination round
- Test edge cases (tournament not started, in progress, complete)

### Integration Tests

**Tournament Creation:**
- Create knockout tournament with 6 participants (2 byes)
- Verify correct number of matches created (5 matches)
- Verify bracket structure (rounds, positions, linking)
- Verify bye matches created and auto-completed
- Verify bye participants placed in Round 2

**Match Progression:**
- Complete Round 1 match
- Verify winner advances to correct Round 2 match
- Verify Round 2 match becomes playable (both participants known)
- Complete all matches through to final
- Verify tournament marked as completed
- Verify champion correctly identified

**Standings Calculation:**
- Create tournament with 8 participants
- Complete some matches (tournament in progress)
- Verify still competing participants correct
- Verify eliminated participants grouped by correct round
- Complete all matches
- Verify champion shown
- Verify all participants in correct elimination sections

**Edit Restrictions:**
- Complete Round 1 match (winner advances to Round 2)
- Attempt to edit Round 1 match
- Verify edit is blocked (next match already has both participants)
- Complete Round 2 match (but Round 3 not started)
- Verify Round 2 match can be edited (next match still has TBD)
- Edit Round 2 match with different winner
- Verify Round 3 match updated with new winner

### Manual Testing

**Small Tournaments:**
- 2 participants (1 match, no byes)
- 3 participants (2 matches, 1 bye)
- 4 participants (3 matches, no byes)

**Medium Tournaments:**
- 5 participants (4 matches, 3 byes)
- 6 participants (5 matches, 2 byes)
- 7 participants (6 matches, 1 bye)
- 8 participants (7 matches, no byes)

**Large Tournaments:**
- 9 participants (8 matches, 7 byes)
- 12 participants (11 matches, 4 byes)
- 16 participants (15 matches, no byes)

**Edge Cases:**
- Edit scores and verify bracket updates correctly
- Delete tournament and verify all matches deleted
- Share standings and verify elimination status shown
- Test on iOS, Android, and web

## Out of Scope (v1)

### Not Included in v1

1. **Double Elimination**
   - Two brackets (winners and losers)
   - Participants must lose twice to be eliminated
   - More complex bracket structure
   - Planned for v2

2. **Third Place Match**
   - Semifinal losers play for 3rd/4th place
   - Adds one more match to tournament
   - Can be added later as optional feature

3. **Consolation Bracket**
   - First-round losers play in separate bracket
   - Ensures everyone plays at least 2 matches
   - Complex bracket management
   - Planned for v2

4. **Seeding**
   - Rank participants by skill before tournament
   - Top seeds get favorable bracket positions
   - Requires seeding system (manual or based on stats)
   - Planned for v2

5. **Bracket Visualization**
   - Graphical bracket with lines connecting matches
   - Visual representation of tournament structure
   - Complex UI implementation
   - Will iterate on after basic functionality works

6. **Match Scheduling**
   - Unlock matches round-by-round
   - Prevent playing ahead
   - Adds complexity to match management
   - May add later based on user feedback

7. **Tournament Brackets for Different Sizes**
   - Custom bracket structures (e.g., 3rd place consolation)
   - User-selectable bracket types
   - Keep simple for v1

## Performance Considerations

### Database Optimization

**Indexes:**
```sql
CREATE INDEX idx_badminton_matches_bracket 
  ON badminton_matches(tournament_id, round, bracket_position);

CREATE INDEX idx_tennis_matches_bracket 
  ON tennis_matches(tournament_id, round, bracket_position);
```

**Query Patterns:**
- Get all matches for a round: `WHERE tournament_id = ? AND round = ?`
- Get match by ID: `WHERE id = ?` (primary key, already indexed)
- Get matches that feed into a match: `WHERE feeds_into_match_id = ?`

**Expected Performance:**
- Bracket generation: < 50ms for 16 participants
- Match progression: < 10ms per match completion
- Standings calculation: < 100ms for 16 participants
- UI rendering: < 500ms for full bracket display

### Scalability Limits

**Tested Limits:**
- 16 participants (15 matches, 4 rounds)
- 32 participants (31 matches, 5 rounds) - should work but not tested
- 64 participants (63 matches, 6 rounds) - may need pagination

**Recommendations:**
- v1 supports up to 16 participants comfortably
- Consider pagination for larger tournaments in v2
- Monitor performance with real-world usage

## Future Enhancements

### Potential v2 Features

1. **Double Elimination**
   - Winners and losers brackets
   - More forgiving format
   - Complex bracket management

2. **Third Place Match**
   - Optional match for semifinal losers
   - Determines 3rd and 4th place
   - Simple addition to single elimination

3. **Seeding System**
   - Manual seeding by tournament organizer
   - Automatic seeding based on player stats
   - Affects bracket positioning and bye assignment

4. **Bracket Visualization**
   - Graphical bracket with connecting lines
   - Visual representation of tournament flow
   - Interactive (tap match to view details)

5. **Match Scheduling**
   - Round-by-round progression
   - Prevent playing ahead
   - Better for organized tournaments

6. **Consolation Bracket**
   - First-round losers play in separate bracket
   - Ensures minimum 2 matches per participant
   - Good for casual play

### Potential v3 Features

1. **Swiss System**
   - Fixed number of rounds
   - Pair participants with similar records
   - No elimination
   - Good for large tournaments

2. **Team Tournaments**
   - Teams instead of individuals
   - Multiple matches per team matchup
   - Complex scoring and standings

3. **Tournament Templates**
   - Save bracket configurations
   - Reuse for future tournaments
   - Speed up tournament creation

4. **Live Bracket Updates**
   - Real-time updates for spectators
   - Optional multi-device sync
   - Read-only spectator mode

## Summary

Knockout tournaments provide a fast-paced, exciting format where every match matters. The implementation builds on the existing round-robin infrastructure while adding:

- **Bracket structure** with rounds and progression
- **Bye handling** for non-power-of-2 participant counts
- **Automatic advancement** when matches complete
- **Elimination-based standings** showing who's still in
- **Edit restrictions** to prevent bracket corruption

The design prioritizes simplicity and correctness, with clear paths for future enhancements like double elimination, seeding, and bracket visualization.
