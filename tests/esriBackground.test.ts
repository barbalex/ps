import { afterEach, expect, it, vi } from 'vitest'

vi.mock('../src/modules/useUrlLayers.ts', () => ({
  OSM_LAYER_PRESENTATION_ID: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
}))

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
  vi.resetModules()
})

it.each([
  ['localhost', 'dev/key', 'dev%2Fkey'],
  ['promote-species.app', 'dev/key', 'prod%2Fkey'],
  ['localhost', '', null],
])(
  'resolves imagery on %s with local key "%s"',
  async (hostname, local, token) => {
    vi.stubGlobal('window', { location: { hostname } })
    vi.stubEnv('VITE_ESRI_BASEMAPS_KEY_LOCALHOST', local!)
    vi.stubEnv('VITE_ESRI_BASEMAPS_KEY', 'prod/key')
    const {
      ESRI_IMAGERY_LAYER_PRESENTATION_ID: id,
      availableBackgroundId,
      backgroundLayers,
      backgroundLayerIds,
      defaultBackgroundLayerId,
    } = await import('../src/components/Map/layers/backgroundLayers.ts')
    if (token) {
      expect(backgroundLayerIds).toContain(id)
      expect(backgroundLayers[availableBackgroundId(id)].url).toBe(
        `https://ibasemaps-api.arcgis.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}?token=${token}`,
      )
    } else {
      expect(backgroundLayerIds).not.toContain(id)
      expect(availableBackgroundId(id)).toBe(defaultBackgroundLayerId)
    }
  },
)
