# 0001 — Per-sport match tables

## Status

Accepted. Drives the storage shape of `docs/implementation/v3-250626-table-tennis.md`.

## Context

Table tennis is structurally identical to badminton: best-of-N games, each to a target, the same `gamePoint + bestOfGames` format. Adding it required choosing how to store the new sport's matches. Three options were considered.

## Decision

Clone badminton's two-table pattern. Add `table_tennis_matches` and `table_tennis_match_games`; do NOT touch badminton's existing tables; do NOT collapse them into a sport-agnostic `matches` / `match_units` pair.

## Considered Options

- **Reuse badminton's existing tables** (distinguish by `tournaments.sport`). Saves ~2 tables and ~7 db-operations functions, but couples two sports by row class. A future table-tennis-specific column would force a badminton-side migration; raw SQL reads would show `badminton_*` tables holding table-tennis records. Brittle and confusing.
- **Refactor to sport-agnostic `matches` + `match_units` tables.** Cleanest long-term — one row class for all sports, format stored inline. Requires migrating existing badminton and tennis rows, rewriting the db-operations layer, the leaderboard, and the bracket feeding. Out of scope for the "add a sport" task.
- **Clone badminton's pattern (chosen).** Each sport owns its two-table pair. The cost is verbosity (~7 cloned functions per sport, one schema block, one web-db cascade case, one leaderboard wrapper). The benefit is a surgical add that ships independently, zero migration of existing rows, and clear ownership of data per sport.

## Consequences

- Adding a fourth same-shape sport continues to clone. This is fine through sport 4-5. When the count grows, revisit option 2 (sport-agnostic refactor) — the db-operations layer is the natural seam for that refactor.
- The `tournaments.sport` CHECK constraint widens with each new sport. A future enum-style migration is needed if the sport list grows past a handful.
- `Match` is a discriminated union (`BadmintonMatch | TennisMatch | TableTennisMatch`) and the `useMatches` hook has a `sport` switch. This is verbose but each branch is local and obvious.
- Table tennis does NOT reuse badminton's tables, so any future table-tennis-specific column (e.g. a serving rotation flag) does not contaminate badminton rows.
