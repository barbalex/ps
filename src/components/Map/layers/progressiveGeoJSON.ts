import type { Feature, FeatureCollection, GeoJSON, Geometry } from 'geojson'

/** the data shapes the map layers feed to leaflet's GeoJSON layer */
export type GeoJSONInput = GeoJSON | GeoJSON[] | null | undefined

/**
 * Upper bound of features added to a layer per animation frame. The port of
 * apf2's chunked marker mounting: layers with tens of thousands of markers
 * fill in these chunks instead of one synchronous L.geoJSON build, so the UI
 * stays responsive while they stream in.
 */
export const PROGRESSIVE_CHUNK_SIZE = 300

/**
 * Wall-clock budget per animation frame. ps markers are heavier than apf2's
 * (2–3 leaflet layers plus a rendered icon each), so a frame stops adding
 * early once it exceeds this budget.
 */
export const PROGRESSIVE_BUDGET_MS = 12

/** Sub-batch granularity, so the time budget is checked between additions. */
const SUB_BATCH_SIZE = 50

/**
 * Flattens the data shapes the map layers feed to leaflet's GeoJSON layer —
 * a FeatureCollection, an array of them, bare features or geometries — into
 * a plain list, mirroring how L.GeoJSON.addData recurses.
 */
export const flattenGeoJSON = (data: GeoJSONInput): (Feature | Geometry)[] => {
  if (!data) return []
  const items: GeoJSON[] = Array.isArray(data) ? data : [data]
  const flattened: (Feature | Geometry)[] = []
  for (const item of items) {
    if (!item) continue
    if (item.type === 'FeatureCollection') {
      for (const feature of (item as FeatureCollection).features ?? []) {
        if (feature) flattened.push(feature)
      }
    } else {
      flattened.push(item)
    }
  }
  return flattened
}

export type ProgressiveAddOptions = {
  chunkSize?: number
  budgetMs?: number
  /** requestAnimationFrame-like scheduler, injectable for tests */
  schedule?: (callback: () => void) => number
  cancelSchedule?: (handle: number) => void
}

/**
 * Adds items via addChunk in bounded batches per animation frame (the first
 * batch synchronously, so markers appear immediately). addChunk may return
 * false to abort the stream, e.g. when adding a chunk failed.
 *
 * Returns an idempotent cancel function.
 */
export const addProgressively = (
  items: (Feature | Geometry)[],
  addChunk: (chunk: (Feature | Geometry)[]) => boolean | void,
  {
    chunkSize = PROGRESSIVE_CHUNK_SIZE,
    budgetMs = PROGRESSIVE_BUDGET_MS,
    schedule = requestAnimationFrame,
    cancelSchedule = cancelAnimationFrame,
  }: ProgressiveAddOptions = {},
): (() => void) => {
  let index = 0
  let handle = 0
  let cancelled = false

  const cancel = () => {
    cancelled = true
    if (handle) cancelSchedule(handle)
    handle = 0
  }

  const step = () => {
    handle = 0
    const start = performance.now()
    let added = 0
    while (
      !cancelled &&
      added < chunkSize &&
      index < items.length &&
      performance.now() - start < budgetMs
    ) {
      const end = Math.min(index + SUB_BATCH_SIZE, items.length)
      if (addChunk(items.slice(index, end)) === false) {
        cancelled = true
        break
      }
      added += end - index
      index = end
    }
    if (!cancelled && index < items.length) {
      handle = schedule(step)
    }
  }
  step()

  return cancel
}
