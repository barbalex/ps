import { createRoot } from 'react-dom/client'
import { useEffect } from 'react'
import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import Geoman from '@geoman-io/leaflet-geoman-free'
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css'
import {
  MapContainer,
  TileLayer,
  Circle,
  CircleMarker,
  Marker,
  Polygon,
  Pane,
  Popup,
  Tooltip,
  useMap,
  useMapEvents,
} from 'react-leaflet'

// Self-reporting status panel so failures are visible without console access
const statusEl = document.getElementById('status') as HTMLDivElement
const steps: string[] = []
const errors: string[] = []
window.addEventListener('error', (e) => {
  const stack = (e.error as Error | undefined)?.stack
  errors.push(`${e.message}${stack ? `\n${stack.split('\n').slice(0, 6).join('\n')}` : ''}`)
  renderStatus()
})
window.addEventListener('unhandledrejection', (e) => {
  errors.push(`unhandled rejection: ${String(e.reason)}`)
  renderStatus()
})
function step(name: string) {
  steps.push(name)
  renderStatus()
}
function renderStatus() {
  statusEl.innerHTML =
    steps.map((s) => `✓ ${s}`).join('<br/>') +
    (errors.length
      ? '<br/>' +
        errors
          .map((e) => `<span class="err">✗ ${e.replace(/\n/g, '<br/>')}</span>`)
          .join('<br/>')
      : '')
}

// v3: no global L.PM — initialize hooks before the first map is created
Geoman.initialize()

let clickCount = 0
const ClickWatcher = () => {
  useMapEvents({
    click: () => {
      clickCount++
      const i = steps.indexOf(`map click events: ${clickCount - 1}`)
      if (i === -1) steps.push(`map click events: ${clickCount}`)
      else steps[i] = `map click events: ${clickCount}`
      renderStatus()
    },
  })
  return null
}

// Simulates the DrawControl flow: toolbar + German strings + pre-loaded
// DB geometry that must become editable
const GeomanSpike = () => {
  const map = useMap()

  useEffect(() => {
    const geoman = map.geoman
    // exposed for automated verification
    ;(window as unknown as Record<string, unknown>).__spikeMap = map
    if (!geoman) {
      errors.push('map.geoman is undefined — Geoman.initialize() did not hook this map')
      renderStatus()
      return
    }
    step('map.geoman present')

    geoman.setLang('de')

    geoman.addControls({
      position: 'topleft',
      drawMarker: true,
      drawCircleMarker: false,
      drawPolyline: true,
      drawRectangle: true,
      drawPolygon: true,
      drawText: false,
      drawCircle: true,
      editMode: true,
      dragMode: false,
      cutPolygon: false,
      removalMode: true,
      rotateMode: false,
    })
    step('toolbar added (addControls)')

    // existing geometry as it would come from the DB (GeometryCollection → features)
    const existing = new L.GeoJSON({
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [8.53, 47.375],
            [8.545, 47.375],
            [8.545, 47.382],
            [8.53, 47.382],
          ],
        ],
      },
    })
    map.addLayer(existing)
    step('existing GeoJSON layer added')

    map.on('geoman:drawstart', () => step('geoman:drawstart'))
    const wireLayerEvents = (layer: L.Layer) => {
      layer.on('geoman:edit', () => step('layer geoman:edit (shape changed)'))
      layer.on('geoman:vertexdrag', () => step('layer geoman:vertexdrag'))
      layer.on('geoman:dragend', () => step('layer geoman:dragend'))
    }
    map.on('geoman:create', (e) => {
      const layer = (e as unknown as { layer: L.Layer }).layer
      step(`geoman:create (${layer.constructor.name})`)
      wireLayerEvents(layer)
    })
    wireLayerEvents(existing)
    map.on('geoman:update', () => step('geoman:update (edit session ended)'))
    map.on('geoman:remove', () => step('geoman:remove'))
    map.on('geoman:globaleditmodetoggled', (e) => {
      const enabled = (e as unknown as { enabled: boolean }).enabled
      step(`geoman:globaleditmodetoggled enabled=${enabled}`)
    })
    map.on('geoman:globalremovalmodetoggled', (e) => {
      const enabled = (e as unknown as { enabled: boolean }).enabled
      step(`geoman:globalremovalmodetoggled enabled=${enabled}`)
    })
    map.on('moveend', () => step('map moveend (pan/drag worked)'))

    // mirrors DrawControl's active-class wiring (geoman-active contract)
    const GEOMAN_ACTIVE = 'geoman-active'
    const anyGeomanModeActive = () =>
      geoman.globalDrawModeEnabled() ||
      geoman.globalEditModeEnabled() ||
      geoman.globalRemovalModeEnabled()
    map.on('geoman:drawstart', () =>
      map.getContainer().classList.add(GEOMAN_ACTIVE),
    )
    map.on('geoman:drawend', () => {
      if (!anyGeomanModeActive()) {
        map.getContainer().classList.remove(GEOMAN_ACTIVE)
      }
    })
    map.on('geoman:globaleditmodetoggled', (e) =>
      map
        .getContainer()
        .classList.toggle(
          GEOMAN_ACTIVE,
          (e as unknown as { enabled: boolean }).enabled || anyGeomanModeActive(),
        ),
    )
    map.on('geoman:globalremovalmodetoggled', (e) =>
      map
        .getContainer()
        .classList.toggle(
          GEOMAN_ACTIVE,
          (e as unknown as { enabled: boolean }).enabled || anyGeomanModeActive(),
        ),
    )
  }, [map])

  return null
}

function App() {
  return (
    <MapContainer
      id="map"
      center={[47.3769, 8.5417]}
      zoom={13}
      zoomControl={true}
      whenReady={() => step('MapContainer ready (whenReady)')}
    >
      <ClickWatcher />
      <GeomanSpike />
      <TileLayer
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
        eventHandlers={{
          load: () => step('TileLayer load event'),
          tileerror: () => {
            errors.push('tileerror (tiles unreachable?)')
            renderStatus()
          },
        }}
      />
      <Pane name="spike-pane" style={{ zIndex: 450 }}>
        <Polygon
          geomanIgnore={true}
          positions={[
            [47.38, 8.53],
            [47.38, 8.55],
            [47.37, 8.55],
            [47.37, 8.53],
          ]}
          pathOptions={{ color: 'orange', fillColor: 'orange', fillOpacity: 0.3 }}
          eventHandlers={{ add: () => step('Polygon added in custom pane') }}
        />
      </Pane>
      <Circle
        center={[47.3769, 8.5417]}
        radius={300}
        geomanIgnore={true}
        pathOptions={{ color: 'blue' }}
        eventHandlers={{ add: () => step('Circle added') }}
      />
      <CircleMarker
        center={[47.379, 8.54]}
        radius={8}
        geomanIgnore={true}
        pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.8 }}
        eventHandlers={{ add: () => step('CircleMarker added') }}
      />
      <Marker
        position={[47.374, 8.545]}
        geomanIgnore={true}
        icon={new L.DivIcon({ html: '<div style="color:#0a0;font-weight:bold">M</div>' })}
        eventHandlers={{ add: () => step('Marker (divIcon) added') }}
      />
      {/* react-leaflet Popup + Tooltip against Leaflet 2's DivOverlay */}
      <Marker position={[47.372, 8.535]} geomanIgnore={true}>
        <Popup>
          <div>spike popup content</div>
        </Popup>
      </Marker>
      <CircleMarker center={[47.381, 8.535]} radius={6} geomanIgnore={true}>
        <Tooltip>spike tooltip</Tooltip>
      </CircleMarker>
    </MapContainer>
  )
}

step('module evaluated')
createRoot(document.getElementById('root')!).render(<App />)
