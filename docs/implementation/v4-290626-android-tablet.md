# v4: Android Tablet / Responsive Layout

## Overview

ScoreBook ships today as a portrait-locked, phone-only app. The audit confirmed nothing functionally breaks on a tablet, but every screen stretches edge-to-edge (`SpacoPhone.xl = 20`) with no max-width wrapper, no `useWindowDimensions` anywhere, and the tournament-detail tab bar wastes width on a 1280dp screen. The goal of v4 is the minimum set of changes that take the app from "stretched phone" to a real tablet-class experience, without committing to a bracket-visualizer or master-detail rewrite that those features deserve on their own.

## Implementation Status

✅ **Complete** - Tablet / responsive layout is implemented. One breakpoint (768dp), one shared `ContentContainer` (720dp cap), side-rail nav on wide tournament detail, centered score-entry dialog on wide, 2/3-column tournament list grid, orientation unlocked. See `docs/adr/0002-responsive-breakpoint-and-container.md` for the decision.

## Domain Decisions (Grilling Summary)

| # | Decision | Choice |
|---|----------|--------|
| 1 | Breakpoint strategy | Single width breakpoint at **768dp**. Below → current phone layout; >= 768 → wide layout. |
| 2 | Content max-width | **720dp**, centered. The breakpoint only kicks in on tablet. One value, shared container. |
| 3 | Tournament detail on wide | **Side rail nav** (icon + label left), single content pane right. Top tab bar moves to the left; same three tabs, same "only active mounts" rule. Purely presentational. |
| 4 | Tournament list on wide | **2-column card grid** at width >= 768; **3 columns** when width >= 1100. Capped at 720 container. |
| 5 | Create form on wide | **Single column, capped at 720**. Wizard stays linear. |
| 6 | Score-entry modal on wide | **Centered bounded dialog** (maxWidth ~480), mirroring `confirm-dialog.tsx`. Below 768 stays the bottom sheet. |
| 7 | Knockout bracket | **Keep vertical list, capped at 720.** SVG bracket / horizontal round-columns are separate work — deferred. |
| 8 | Orientation | **Unlock for all devices** (`"orientation": "default"`). Landscape on a phone still works because every screen is vertically scrollable and the shared container caps width at 720. |

## Core Features

### 1. Responsive Hook — `useIsWideLayout`

**New file:** `src/hooks/use-layout.ts`

```typescript
import { useWindowDimensions } from 'react-native';

export const WIDE_BREAKPOINT = 768;
export const GRID_3_BREAKPOINT = 1100;
export const CONTENT_MAX_WIDTH = 720;
export const MODAL_MAX_WIDTH = 480;

export function useIsWideLayout(): boolean {
  const { width } = useWindowDimensions();
  return width >= WIDE_BREAKPOINT;
}

export function useGridColumnCount(): number {
  const { width } = useWindowDimensions();
  if (width >= GRID_3_BREAKPOINT) return 3;
  if (width >= WIDE_BREAKPOINT) return 2;
  return 1;
}
```

One hook, one breakpoint, no per-screen reasoning. `useWindowDimensions` re-renders on rotation; values are stable.

### 2. Shared `ContentContainer`

**New file:** `src/components/content-container.tsx`

```tsx
export function ContentContainer({ children, style }) {
  return (
    <View style={[{
      width: '100%',
      maxWidth: CONTENT_MAX_WIDTH,
      alignSelf: 'center',
    }, style]}>
      {children}
    </View>
  );
}
```

Drop-in wrapper placed inside each screen's existing `ScrollView` (or replacing the outer `View`), so all content caps at 720 and centers without per-screen style changes. Below 768, `width: '100%'` exceeds the cap so the cap is invisible. The pattern already works in `confirm-dialog.tsx:129-130` (`width: '100%', maxWidth: 400`).

### 3. Orientation Unlock

`app.json`:
```json
"orientation": "default"
```

Below 768 in landscape on a phone, the shared `ContentContainer` caps content width, the player names / match cards stay readable. Tested paths: tournament list, create form, detail tabs.

### 4. Tournament Detail — Side Rail on Wide

`src/app/tournament/[id].tsx` + `src/app/tournament/[id].styles.ts`:

- When `useIsWideLayout()`, render the tab bar as a left-side rail (`flexDirection: 'column'`, fixed rail width ~180dp) instead of a top bar (`flexDirection: 'row'`). Content pane takes the remaining `flex: 1`.
- Each rail item shows an emoji + label (📋 Matches, 🏆 Standings, ⚙ Settings) — borrowed the emoji metaphor the app already uses for share (📤), champion (🏆), empty state (🏸).
- Same `activeTab` state, same three tabs, same "only active tab mounts" rule — purely a layout swap.
- The `ContentContainer` caps the inner content at 720, so on a 1280dp screen with a 180dp rail, the content is 1100dp wide, capped to 720 and centered in the remaining 1100. Looks intentional.

When NOT wide (phone), the tab bar stays at the top exactly as today — no behaviour change.

### 5. Score-Entry Modal — Centered Dialog on Wide

`src/components/score-entry-modal.tsx` + `score-entry-modal.styles.ts`:

- When `useIsWideLayout()`, the modal switches from `justifyContent: 'flex-end'` (bottom sheet) to `justifyContent: 'center'` and caps the sheet width at `MODAL_MAX_WIDTH` (= 480), centered.
- Below 768, it keeps the existing bottom-sheet behaviour. The win: a 1280-wide tablet no longer shows a 1280-wide sheet sliding up from the bottom.
- The internal `ScrollView` we added to fix the keyboard-hidden-input bug still works inside the bounded dialog.

### 6. Tournament List — Card Grid on Wide

`src/app/index.tsx`:

- Use `useGridColumnCount()` to drive a `flexWrap: 'wrap'` row of cards instead of a single vertical `.map`.
- Each card takes `width: (100% - gap * (cols - 1)) / cols` minus its share of the inter-card gap. At 2 cols = ~356dp per card (close to today's full-width phone card). At 3 cols = ~232dp (slightly narrower but still legible — the card content is short).
- Still wrapped in `ContentContainer` so the whole grid caps at 720.
- The list `ScrollView` stays — virtualization is not needed (project scope is dozens of tournaments, not thousands).

### 7. Create Form — Single Column Capped

`src/app/create.tsx`:

- Wrap the `ScrollView` content in `ContentContainer`. Single column, capped at 720.
- No two-column branch. The wizard flow (name → sport → type → format → participants → byes → Create) stays linear.
- `KeyboardAvoidingView`'s Android `behavior: 'height'` may misbehave in landscape on a tablet with a soft keyboard; covered by manual testing in the testing strategy.

### 8. Standings Table — Capped

`src/components/standings-tab.tsx`:

- Standings card already uses flex-ratio columns (works today). It only needs to live inside the shared `ContentContainer` so it doesn't stretch to 1280 wide. No table restructure.
- Same for knockout standings sections.

## Module Summary

| File | Change |
|------|--------|
| `app.json` | `orientation: "default"` |
| `src/hooks/use-layout.ts` | NEW — breakpoint + max-width constants, `useIsWideLayout`, `useGridColumnCount` |
| `src/components/content-container.tsx` | NEW — `maxWidth: 720, alignSelf: 'center'` wrapper |
| `src/app/index.tsx` | Wrap list in `ContentContainer`; 2/3-col grid when wide |
| `src/app/create.tsx` | Wrap form in `ContentContainer` |
| `src/app/tournament/[id].tsx` | Side rail when wide; `ContentContainer` around panes |
| `src/app/tournament/[id].styles.ts` | Side-rail styles (rail container, rail item, active rail indicator) |
| `src/components/score-entry-modal.tsx` + styles | Centered dialog when wide |
| `src/components/matches-tab.tsx` | Wrap in `ContentContainer` (inside the existing `ScrollView`) |
| `src/components/standings-tab.tsx` | Wrap in `ContentContainer` |

## Database Schema

No schema changes. Pure presentational + navigation work.

## Testing Strategy

### Manual Testing

**Phone (e.g. Pixel 5, 393dp portrait):**
- Tournament list: single column, no visual change
- Tournament detail: top tab bar, no visual change
- Create form: single column, no visual change
- Score entry: bottom sheet, no visual change
- Rotate to landscape (663dp): still single column (below 768 breakpoint); content caps to 720 (which is wider than 663, so effectively full-width). Verify no layout breakage.

**7" tablet portrait (600dp):**
- Below the 768 breakpoint — behaves like a large phone. Single column everywhere. Verify content caps to 720 (= full width, no visible change).

**7" tablet landscape (1024dp) and 10" tablet portrait (800dp):**
- Tournament list: 2-column card grid, capped at 720, centered
- Tournament detail: left side rail, content pane right
- Create form: single column, capped at 720, centered
- Score entry: centered dialog, maxWidth 480
- Standings table: 720 wide, centered

**10" tablet landscape (1280dp):**
- Tournament list: 3-column grid (>= 1100)
- Everything else: same as 800dp case but more horizontal whitespace around the 720 container
- Verify the felt-experience: content should never float over the rail; rail should stay visible; modal should stay centered on top of content

### Regression Checks

- Table tennis (v3) creation + score entry still works in portrait and landscape
- Knockout edit lockout (canEditMatch) still disables locked rows when the modal is centered
- Share-as-image standings capture (`captureRef`) still produces a usable PNG when the captured view is 720 wide (vs the previous full-width). Aspect ratio changes; not a bug.

## Known Limitations

### v4 Limitations

1. **No true bracket visualizer.** The knockout match list stays vertical. A real SVG bracket with round-columns and connectors is its own feature; deferred.
2. **No persistent standings sidebar.** The decision was "side rail nav, single content pane" — only the active tab mounts, so matches and standings can't be shown simultaneously. A future master-detail pass can add this if the user feedback asks.
3. **No adaptive font scaling.** Body text is still `fontSize: 12–16` from `theme.ts`. The 720 cap partly mitigates this (content concentrates rather than stretches, so the text-to-card ratio stays phone-familiar). A real tablet-tuned typography pass is a separate task.
4. **Landscape on phones is now allowed.** This is a deliberate consequence of the orientation unlock. Phone users who prefer portrait-locked apps can use Android's per-app rotation lock.

## Out of Scope

### Not Included in v4

1. **SVG bracket visualizer** — separate feature with its own design questions (line drawing, scroll management, tap targets on connectors).
2. **Master-detail on tournament detail** — requires restructuring the modal-as-match-detail pattern and rendering two tabs simultaneously; deferred.
3. **Adaptive typography scale** — these tokens (`Font`, `Spacing`) would need a width-scaled variant; speculative until tablet users actually report text being too small.
4. **FlatList migration** — list lengths are tournament-scoped (a few dozen rows). Not a tablet concern.
5. **iPad-specific layout** — same responsive hook covers it; no need for `Platform.isPad` branching. iPad testing is a manual-testing task, not a code task.
6. **Web-only desktop layout (multi-pane)** — the app already runs on web; v4 makes web look the same as on a wide tablet. A true desktop layout (multiple simultaneous panes, mouse hover, etc.) is not in scope.

## Future Enhancements

### Potential v5 Features

- **SVG bracket visualizer** with horizontal round-columns and connectors — the next-biggest tablet win after this pass
- **Master-detail navigation** for tournament detail when very wide (standings persistent on the right)
- **Per-screen font / spacing scaling** — replace `theme.ts` fixed values with a density-aware scale
- **Larger tap targets** for tablet (current rows are sized for a phone; the 720 cap means they stay legible but the touch-targets aren't tablet-generous)

## Summary

v4 is small and surgical: one orientation unlock, one shared `ContentContainer`, one `useIsWideLayout` hook, one side-rail layout branch on the tournament detail, one centered-modal branch on score entry, and one card-grid branch on the list. Six files and two small new modules. The codebase's existing flex-based layout already scales; v4 gives it a width-aware discipline it never had. The three structural bets that need their own implementation passes — SVG bracket, master-detail, adaptive typography — are explicitly excluded.

The change reads as "the app respects the screen it's on" rather than "the app is a different app on a tablet". That's the right bar for a v4 of a casual-racket-sports tournament tool.