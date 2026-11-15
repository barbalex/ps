// Search params that carry view state and must survive navigation under
// /data — see the search middleware in src/routes/data/route.tsx and the
// validators that pass these keys through.
//
// - `f-*`: list filters (modules/useUrlFilter.ts)
// - `c` / `z`: map center and zoom (modules/useUrlMapViewport.ts)
// - `panes`: visible layout panes (modules/useUrlPanes.ts)
// - `layers`: the map's render list / layer visibility
//   (modules/useUrlLayers.ts)
// - `designing`: design mode for the current session
//   (modules/useUrlDesigning.ts)
// - `*Label` / `*OnlyWithResults`: label filter and only-with-results
//   toggle of the qcs/exports run pages (modules/useUrlSearchParam.ts)
const retainedKeys = new Set([
  'c',
  'z',
  'panes',
  'layers',
  'designing',
  'qcsRunLabel',
  'qcsRunOnlyWithResults',
  'rootQcsRunLabel',
  'rootQcsRunOnlyWithResults',
  'projectQcsRunLabel',
  'projectQcsRunOnlyWithResults',
  'rootExportsRunLabel',
  'projectExportsRunLabel',
  'subprojectExportsRunLabel',
])

export const isRetainedSearchParam = (key: string) =>
  key.startsWith('f-') || retainedKeys.has(key)
