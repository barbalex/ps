Move PGlite + Electric sync into the (already written but never wired-up) web worker, and add a background-sync indicator for the remaining main-thread work.

## Context

`src/pglite-worker.ts` is dead code — nothing imports it. The real PGlite instance (WASM Postgres, Electric sync apply, live queries, IndexedDB persistence) is created on the **main thread** in `src/modules/ensurePgliteDb.ts`. That is why heavy sync data blocks the UI. Verified feasibility: pglite 0.5.10 ships `PGliteWorker` (client) + `worker()` (worker side), with leader election for multi-tab; `electricSync`/`live` namespace methods call `instance.exec()`/`transaction()`, which become transparent RPC calls when the instance is a `PGliteWorker` — so `startSyncing.ts` (callbacks, `fetchClient`, `isUpToDate` getters) stays on the page unchanged.

## Part 1: Wire up the worker

**`src/modules/ensurePgliteDb.ts`** (only real change):

- Replace `PGlite.create('idb://ps', {...})` with:
  ```ts
  import { PGliteWorker } from '@electric-sql/pglite/worker'
  const worker = new Worker(new URL('../pglite-worker.ts', import.meta.url), {
    type: 'module',
  })
  PGliteWorker.create(worker, {
    extensions: { live, electric: electricSync(), postgis, pg_uuidv7 },
    relaxedDurability: true,
  })
  ```
  Client side needs the same extension factories so their namespaces attach to the client instance; the real extensions run worker-side (`pglite-worker.ts` already registers all four + relaxedDurability).
- Keep the WASM-abort recovery (`deleteIdbDatabases` + retry); on retry, terminate the old worker before creating a new one.
- Keep `window.__pglite_db__` dev handle; adjust the atom/typing in `store.ts` (`pgliteDbAtom` is typed `PGlite`) via cast or widened type — `AuthAndDb.tsx` already casts `as unknown as PGliteWithLive`, `startSyncing.ts` types stay valid.
- `reportSyncRejectionsFromWorker()` (currently dead) becomes active in the worker and pairs with the already-armed `armSyncErrorRecovery()` on the page — FK-violation reload recovery starts working as designed.
- Known-benign: postgis logs a "bundlePath not supported on client side" warning client-side; if it turns out to error at runtime, register only `live` + `electric` in the client-side options.

**`src/pglite-worker.ts`**: no changes expected (already correct).

## Part 2: Background-sync indicator (reuse existing patterns)

- **`src/store.ts`**: add non-persisted `backgroundSyncingAtom` (boolean) next to `syncObjectAtom`.
- **New headless component `src/components/BackgroundSyncIndicator.tsx`** (modeled on `Syncer`/`InitialSyncManager`), mounted in `AuthAndDb.tsx` next to `<Syncer />`:
  - Polls `syncObjectAtom`'s `isUpToDate` every ~2s while a sync object exists and `initialSyncingAtom` is false (boot phase keeps its existing splash/notification).
  - Hysteresis: only flag "background syncing" when not up-to-date for >3s continuously (single-row live changes must not flicker it); clear when up to date or sync object gone (offline).
  - On flag set/clear, use the existing notification system (`addNotificationAtom`/`updateNotificationAtom`) exactly like `Syncer.tsx` does: `intent: 'info', paused: true` (built-in spinner) while syncing → flip to `intent: 'success', paused: false` with short duration when done.
- **i18n** (react-intl, German as `defaultMessage`): new keys `syncInBackgroundTitle` ("Synchronisiere im Hintergrund"), `syncInBackgroundBody` ("Daten werden aktualisiert. Die Oberfläche kann währenddessen kurzzeitig blockieren."), reuse existing `syncServerTaskDone` for completion; add en/fr/it entries to `src/i18n/*.json` and run `npm run i18n:extract`.

## Verification

1. `npm run dev`: app boots through splash, staged sync completes, data renders, map (postgis) works.
2. Reload with shape re-sync (or sign in fresh): confirm UI stays responsive during heavy apply — this is the core win.
3. Trigger live changes (write via PostgREST/second tab): live queries update; indicator appears only for sustained syncs.
4. Run unit tests (`vitest`) and the Playwright e2e suite against the running dev stack.
5. Console check: no `DataCloneError`, no worker boot errors.

## Notes

- With sync moved to the worker, `FetchError: pause-stream` rejections surface worker-side, so the red `REJ:` overlay stops showing them (page overlay keeps catching genuine page errors).
- Query results now cross the worker boundary (structured clone) — small per-query overhead, expected net win; watch the map/vector-layer queries during verification.
