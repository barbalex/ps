import * as L from 'leaflet'
import type { Feature } from 'geojson'

type FeatureLayer = L.Layer & {
  feature?: Feature
  vectorLayerLabel?: string
  activeIdField?: string
  externalVectorFeature?: boolean
  _clickableCircle?: L.CircleMarker
}

// GeoJSON retains the original feature tree for viewport reconciliation.
// Only its visible leaves go on the map, with the parent record's identity.
export function clusterMembers(root: FeatureLayer, map: L.Map): L.Layer[] {
  const members: L.Layer[] = []
  const visit = (part: FeatureLayer) => {
    const hitbox = part._clickableCircle
    if (part instanceof L.LayerGroup) {
      if (hitbox) {
        // Own points pair one symbol with an enlarged hit target. The target
        // follows the symbol's *displayed* position, including spiderfying.
        const symbol = part.getLayers().find((child) => child !== hitbox)
        if (!(symbol instanceof L.Marker || symbol instanceof L.CircleMarker))
          throw new Error('Missing map point symbol')
        const move = () => {
          hitbox.setLatLng(symbol.getLatLng())
        }
        const events: L.Evented = symbol
        events.on('add', () => {
          move()
          hitbox.addTo(map)
        })
        events.on('move', move)
        events.on('remove', () => {
          hitbox.remove()
        })
        Object.assign(hitbox, {
          _isInternal: false,
          _clickableCircle: hitbox,
          feature: root.feature,
          activeIdField: root.activeIdField,
          vectorLayerLabel: root.vectorLayerLabel,
        })
        members.push(symbol)
      } else {
        part.eachLayer(visit)
      }
      return
    }
    if (part !== root)
      Object.assign(part, {
        feature: root.feature,
        vectorLayerLabel: root.vectorLayerLabel,
        externalVectorFeature: root.externalVectorFeature,
        activeIdField: root.activeIdField,
      })
    members.push(part)
  }
  visit(root)
  return members
}
