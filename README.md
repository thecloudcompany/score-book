# ScoreBook

A clean, offline-first tournament manager for casual racket sports. Track round-robin and knockout tournaments for badminton and tennis, with live standings and easy sharing — all on-device, no account, no internet.

## Features

- **Tournament types:** Round-robin and single-elimination knockout
- **Sports:** Badminton and tennis (more coming)
- **Configurable scoring:** Game points, best-of-N games, sets-to-win, games-per-set
- **Live standings:** Auto-computed leaderboard with tiebreakers
- **Knockout bracket:** Random or manual bye assignment, automatic winner advancement
- **Share standings:** Export the leaderboard as an image via your device's share sheet
- **Participant autocomplete:** Re-use past player names when creating new tournaments
- **100% offline:** All data lives in a local SQLite database. Nothing leaves your device.

## Quick Start

```bash
npm install
npx expo start          # Metro bundler
npm run web             # open in browser
npm run android         # build & run on Android emulator/device
npm run ios             # build & run on iOS simulator
```

## Project Structure

```
src/
  app/                    Expo Router file-based routes
    tournament/[id].tsx   Tournament detail screen (orchestrator)
    create.tsx            Tournament creation form
    index.tsx             Tournament list
  components/             UI components, one per file
  hooks/                  React hooks wrapping data layer
  lib/
    database.ts           Platform-aware SQLite init
    database-web.ts       localStorage-backed emulator for web
    db-operations.ts      Typed CRUD
    bracket-generator.ts  Knockout bracket creation
    leaderboard.ts        Standings calculation
    sports/               Sport modules (badminton, tennis)
  constants/theme.ts      Shared design tokens

docs/
  project.md              Project vision & scope
  application.md          Architecture & technical decisions
  privacy.html            Privacy policy (host this for Play Store)
  implementation/         Per-release implementation notes
```

## Design Principles

- **Local-first** — all data on-device via SQLite. No cloud, no telemetry, no accounts.
- **Light theme only** — sharp corners, thin borders, Figtree typography.
- **300-line limit** — components are split and styles extracted to sibling files when they grow.
- **Sport modules own validation** — `validateUnitScore(a, b, format)` is the single source of truth for score rules.

## Tech Stack

- **Expo SDK 56** / **React Native 0.85** / **React 19**
- **expo-router** for file-based navigation
- **expo-sqlite** for native storage, custom emulator for web
- **TypeScript** strict
- **Figtree** (Google Fonts) — 6 weights

## License

MIT
