// Ambient declarations for untyped CommonJS dependencies.
// API surface limited to what this app uses.

declare module 'is-uuid' {
  const isUuid: {
    v1: (uuid: string) => boolean
    v2: (uuid: string) => boolean
    v3: (uuid: string) => boolean
    v4: (uuid: string) => boolean
    v5: (uuid: string) => boolean
    nil: (uuid: string) => boolean
    anyNonNil: (value: unknown) => boolean
  }
  export default isUuid
}

declare module 'reproject' {
  import type { GeoJSON } from 'geojson'

  const reproject: {
    /**
     * Reprojects a GeoJSON object between projections.
     * `from`/`to` accept proj4 definition strings or L.Projection instances.
     * Returns a cloned object; the input is not mutated.
     */
    reproject(
      geojson: GeoJSON,
      from?: unknown,
      to?: unknown,
      proj4?: unknown,
    ): GeoJSON
    toWgs84(geojson: GeoJSON, from?: unknown, projs?: unknown): GeoJSON
    reverse(geojson: GeoJSON): GeoJSON
  }
  export default reproject
}
