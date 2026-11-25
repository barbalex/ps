import * as L from 'leaflet'

const targets = new WeakMap<L.Layer, { label: string; rowId?: string }>()

export const markSnapTarget = (
  layer: L.Layer,
  label: string,
  rowId?: string,
) => {
  if (layer instanceof L.LayerGroup) {
    layer.eachLayer((child) => markSnapTarget(child, label, rowId))
  } else if (!(
    layer instanceof L.Path && layer.options.className?.includes('hitbox')
  )) {
    layer.options.snapIgnore = false
    targets.set(layer, { label, rowId })
  }
}

export const showVectorSnapping = (
  map: L.Map,
  edits: L.FeatureGroup,
  rowId: string,
  fallback: string,
) => {
  const excluded = new Set<L.Layer>()
  const excludeSelf = (layer: L.Layer) => {
    if (targets.get(layer)?.rowId !== rowId) return
    layer.options.snapIgnore = true
    excluded.add(layer)
  }
  map.eachLayer((layer) => {
    if (layer instanceof L.Layer) excludeSelf(layer)
  })
  const added = ({ layer }: L.LayerEvent) => excludeSelf(layer)
  map.on('layeradd', added)

  const indicator = new L.CircleMarker([0, 0], {
    pane: 'tooltipPane',
    radius: 7,
    color: '#00a5a8',
    weight: 3,
    fill: false,
    interactive: false,
    geomanIgnore: true,
    snapIgnore: true,
    className: 'geometry-snap-target',
  })
  const caption = document.createElement('span')
  indicator.bindTooltip(caption, { permanent: true, direction: 'top' })
  const clear = () => {
    indicator.remove()
  }
  const snap: L.Geoman.SnapEventHandler = ({
    snapLatLng,
    layerInteractedWith,
  }) => {
    caption.textContent = targets.get(layerInteractedWith)?.label || fallback
    indicator.setLatLng(snapLatLng)
    if (!map.hasLayer(indicator)) indicator.addTo(map)
  }
  const listen = (layer: L.Layer) => {
    layer.on('geoman:snap', snap)
    layer.on('geoman:unsnap', clear)
    layer.on('geoman:dragend', clear)
    layer.on('geoman:markerdragend', clear)
    layer.on('geoman:vertexadded', clear)
  }
  const unlisten = (layer: L.Layer) => {
    layer.off('geoman:snap', snap)
    layer.off('geoman:unsnap', clear)
    layer.off('geoman:dragend', clear)
    layer.off('geoman:markerdragend', clear)
    layer.off('geoman:vertexadded', clear)
  }
  let working: L.Layer | undefined
  const end = () => {
    if (working) unlisten(working)
    working = undefined
    clear()
  }
  const start: L.Geoman.DrawStartEventHandler = ({ workingLayer }) => {
    end()
    working = workingLayer
    listen(working)
  }
  // Edit events propagate to the feature group. Unfinished drawings have
  // their own working layer until Geoman emits create.
  listen(edits)
  map.on('geoman:drawstart', start)
  map.on('geoman:drawend', end)
  map.on('geoman:create', clear)
  map.on('geoman:globaleditmodetoggled', clear)
  const alt = (event: KeyboardEvent) => {
    if (event.key === 'Alt') clear()
  }
  window.addEventListener('keydown', alt)
  return () => {
    window.removeEventListener('keydown', alt)
    end()
    unlisten(edits)
    map.off('layeradd', added)
    map.off('geoman:drawstart', start)
    map.off('geoman:drawend', end)
    map.off('geoman:create', clear)
    map.off('geoman:globaleditmodetoggled', clear)
    excluded.forEach((layer) => {
      layer.options.snapIgnore = false
    })
  }
}
