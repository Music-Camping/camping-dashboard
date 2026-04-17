---
status: awaiting_human_verify
trigger: "tv-overscan-presentation-cut"
created: 2026-04-16T14:00:00Z
updated: 2026-04-16T14:45:00Z
---

## Current Focus

hypothesis: TV overscan is cropping physical edges, AND the root layout uses `h-screen` which maps to the browser-reported 100vh (1080px) — but the TV box's overscan eats 3-5% of that. The content fills 100% of browser viewport, yet the TV physically clips the outer edges. The fix is dual: (1) add inset padding on the outermost presentation container so content stays inside the "safe area", and (2) ideally instruct user to disable overscan from TV settings.
test: Read full layout chain to confirm no existing safe-area / overscan padding exists.
expecting: No padding/margin on the root presentation wrapper around all four edges — confirmed.
next_action: Apply defensive overscan-safe padding on the two outermost wrappers (sidebar.tsx h-screen div + dashboard-client.tsx presentation-mode container) and document TV setting fix.

## Symptoms

expected: Full presentation mode UI renders within viewport on 1080p TV. No content should be cut off — all performer cards, stats, and side columns fully visible.
actual: When displayed on physical TV (AOC) via MiTV-AFMU0 TV box at 1080p: Pedro Trick card bottom text cut off; left numeric column (76.847, 39.350, 37.606, 27.996, 19.669) clipped at left edge.
errors: No console errors — purely visual clipping.
reproduction: Enable presentation mode on a TV connected through MiTV-AFMU0 at 1080p.
started: After commits c403ad5 / cae7807 / 653abea introducing @container + cqi clamp values.

## Eliminated

- hypothesis: @container / cqi browser support causing silent failures
  evidence: Clipping is physical-edge cropping (bottom + left) — not a font size collapse. cqi would affect font sizes uniformly, not crop specific edges. The image shows text is the right size, just cut off by the screen edge.
  timestamp: 2026-04-16T14:20:00Z

- hypothesis: Aspect ratio mismatch or wrong resolution
  evidence: Clipping is edge-specific (bottom + left), consistent with overscan pattern, not a scaling/ratio issue.
  timestamp: 2026-04-16T14:20:00Z

## Evidence

- timestamp: 2026-04-16T14:10:00Z
  checked: /home/wicar/Downloads/WhatsApp Image 2026-04-16 at 13.35.45.jpeg
  found: Bottom clipping cuts "446.814 ouvintes" mid-character on Pedro Trick card. Left clipping removes leading digit from numbers like "76.847" (shows ".847"). Classic overscan pattern: symmetric crop of ~3-5% on affected edges.
  implication: The browser viewport fills exactly to physical screen edges; TV's overscan then hides the outermost ~3-5% on bottom and left.

- timestamp: 2026-04-16T14:15:00Z
  checked: components/sidebar.tsx line 98-103
  found: In presentation mode, the wrapping div uses `h-screen overflow-hidden` with NO padding. This is the outermost DOM container for all presentation content.
  implication: Zero inset from any edge — content touches all four physical TV edges.

- timestamp: 2026-04-16T14:20:00Z
  checked: components/dashboard/dashboard-client.tsx line 356-364
  found: The DashboardClient root div in presentation mode adds class `presentation-mode h-dvh overflow-hidden p-0` — explicitly sets padding to 0.
  implication: p-0 removes any default padding, ensuring content goes edge-to-edge, which then gets clipped by TV overscan.

- timestamp: 2026-04-16T14:25:00Z
  checked: dashboard-client.tsx line 367 — grid container inside presentation layout
  found: `grid h-full grid-rows-[auto_1fr] gap-[1vh] overflow-hidden` — NO padding on this grid. The 1vh gap is between rows, not from the screen edge.
  implication: The entire content grid sits flush against all 4 screen edges with 0 padding.

- timestamp: 2026-04-16T14:28:00Z
  checked: ROW 2 content container (dashboard-client.tsx line 449)
  found: `relative min-h-0 overflow-hidden` with inner motion.div using `absolute inset-0 grid grid-cols-2 gap-[1vh] p-[1vh]`
  implication: The p-[1vh] padding is INSIDE row 2 only — no padding on the outer grid's edges (top of header, bottom of row 2, left/right of full layout).

## Resolution

root_cause: TV overscan on the MiTV-AFMU0 TV box physically crops the outer ~3-5% of the display. The presentation layout uses h-screen/h-dvh with p-0 (explicitly zero padding) at all outermost container levels (sidebar.tsx wrapper and dashboard-client.tsx presentation div). This means content renders flush to all 4 viewport edges, and the TV's overscan then hides the outermost band — cropping the bottom of Pedro Trick's card and the left edge of the city listeners column.

fix: Add a defensive "overscan-safe" padding on the two outermost wrappers (sidebar.tsx + dashboard-client.tsx), and document the TV-side setting fix. A ~2% padding on all sides (or ~20px on a 1080p display) keeps content within the TV's safe area regardless of overscan setting.

verification: Build passes (npm run build). Type-check clean. Lint 0 errors (2 pre-existing warnings unrelated to this change). Awaiting physical TV confirmation.
files_changed:

- components/dashboard/dashboard-client.tsx
