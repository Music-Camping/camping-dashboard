# Phase 1: Streams Fix - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-02
**Phase:** 01-streams-fix
**Areas discussed:** Metric labeling, Delta calculation
**Mode:** Auto (recommended defaults selected)

---

## Metric Labeling

| Option            | Description                 | Selected |
| ----------------- | --------------------------- | -------- |
| Spotify Streams   | Clear platform attribution  | ✓        |
| Streams (Spotify) | Parenthetical clarification |          |
| Keep "Streams"    | No change to label          |          |

**User's choice:** [auto] Spotify Streams (recommended default)
**Notes:** Consistent with existing platform-specific labeling pattern (YouTube icon for views, Spotify icon for streams)

---

## Delta Calculation

| Option              | Description                                         | Selected |
| ------------------- | --------------------------------------------------- | -------- |
| Spotify-only delta  | Consistent with total — only Spotify stream changes | ✓        |
| Keep combined delta | YouTube views delta still included in streams delta |          |

**User's choice:** [auto] Spotify-only delta (recommended default)
**Notes:** Delta must be consistent with the total value it describes

---

## Claude's Discretion

- Comment cleanup on `dashboard-client.tsx:237`

## Deferred Ideas

None
