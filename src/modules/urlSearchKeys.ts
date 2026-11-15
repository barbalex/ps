// Search params that carry view state and must survive navigation under
// /data — see the search middleware in src/routes/data/route.tsx and the
// validators that pass these keys through.
//
// - `f-*`: list filters (modules/useUrlFilter.ts)
// - `c` / `z`: map center and zoom (modules/useUrlMapViewport.ts)
// - `panes`: visible layout panes (modules/useUrlPanes.ts)
const retainedKeys = new Set(['c', 'z', 'panes'])

export const isRetainedSearchParam = (key: string) =>
  key.startsWith('f-') || retainedKeys.has(key)
