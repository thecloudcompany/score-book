# 0002 — Single breakpoint + 720dp max-width container for responsive layout

## Status

Accepted. Drives the responsive layout of `docs/implementation/v4-290626-android-tablet.md`.

## Context

ScoreBook shipped as a portrait-locked phone app. To support Android tablets (and iPhone-and-Android landscape, and the existing web target) without per-screen reasoning everywhere, the app needed one width-aware layout discipline. Three options were considered.

## Decision

Adopt a **single width breakpoint at 768dp** and a **shared `ContentContainer` that caps content at 720dp and centers it on wide screens**. Below 768 the layout is unchanged; at or above 768 the layout adapts (side-rail nav, centered modal dialog, multi-column list grid). One hook, one container, one breakpoint.

## Considered Options

- **Two breakpoints (phone < 600 < tablet < 1100 < desktop)** — gives more layout tiers (phone / small tablet / large tablet + web) but doubles the layout variants to test and maintain. The middle tier (small tablet) is roughly phone-treatment anyway; the marginal value vs the cost is low for an app of this size.
- **Detect physical tablet (Platform.isPad + screen aspect ratio)** — locks the layout to the device's identity regardless of width. Breaks under Android split-view, foldables, and narrow phone-landscape. Width-tier is the React Native standard precisely because width is the thing that actually drives layout, not whether the device is marketed as a "tablet".
- **Single breakpoint + 720dp max-width container (chosen)** — one value, one container, one hook. Every screen reaches the wide layout through the same rule. The default-on-tablet 720 cap matches the existing flex-ratio standings table's usable width. The `confirm-dialog.tsx` component already proves the `width: '100%', maxWidth: N, alignSelf: 'center'` pattern works in this codebase.

## Consequences

- Adding a new screen will wrap its content in `ContentContainer` by default. The discipline is "every screen caps, every wide layout branches on `useIsWideLayout`".
- The 720dp cap is a magic number but lives in one place (`src/hooks/use-layout.ts`) and is referenced by both the shared container and the modal dialog's 480 cap.
- Tablet-specific layouts (side rail, multi-column grid) live in the screens that need them, not in a global provider. No global `ResponsiveContext` is introduced — the hook is called directly where needed, which keeps the diff local and avoids a "which screen should re-render on rotation" question.
- If a future page needs a third breakpoint (e.g. proper desktop web), add `DESKTOP_BREAKPOINT` to the same hook — the pattern extends cleanly without per-screen rewrites.
- The orientation unlock in `app.json` is a prerequisite. Without `"orientation": "default"`, the breakpoint hook never sees a wide width on Android and the wide-layout branches become dead code.