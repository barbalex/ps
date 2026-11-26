import * as L from 'leaflet'
import { useLeafletContext } from '@react-leaflet/core'
import type { Feature } from 'geojson'

import { ProgressiveGeoJSON } from '../ProgressiveGeoJSON.tsx'
import type { GeoJSONInput } from '../progressiveGeoJSON.ts'
import { markSnapTarget } from '../../DrawControl/vectorSnapping.ts'
import { cachedMarkerIconHtml } from '../markerIconHtml.tsx'
import { vectorLayerDisplayToProperties } from '../../../../modules/vectorLayerDisplayToProperties.ts'
import { displayFromFeature } from '../../../../modules/displayByProperty.ts'
import type { VectorProps } from './index.tsx'
import styles from './WFS.module.css'

const featureKey = (feature: Feature) =>
  feature.id != null ? String(feature.id) : undefined

export const VectorFeatures = ({
  layer,
  layerPresentation,
  data,
}: VectorProps & { data: GeoJSONInput }) => {
  const { pane } = useLeafletContext()
  const firstDisplay = layer.vector_layer_displays?.[0]
  if (!data || !firstDisplay) return null
  const displayFor = (feature?: Feature) =>
    displayFromFeature(
      layer.vector_layer_displays,
      layer.display_by_property,
      feature,
    ) ?? firstDisplay

  return (
    <ProgressiveGeoJSON
      cluster={layerPresentation.cluster_markers}
      clusterMaxZoom={layerPresentation.max_zoom}
      resetKey={JSON.stringify([
        layer.vector_layer_displays,
        layer.display_by_property,
        layerPresentation,
        layer.label,
        layer.type,
      ])}
      data={data}
      featureKey={featureKey}
      geomanIgnore={true}
      onEachFeature={(_feature, geoLayer) => {
        markSnapTarget(geoLayer, layer.label)
        Object.assign(geoLayer, {
          vectorLayerLabel: layer.label,
          externalVectorFeature: true,
        })
      }}
      style={(feature) =>
        vectorLayerDisplayToProperties({
          vectorLayerDisplay: displayFor(feature),
          presentation: layerPresentation,
        })
      }
      pointToLayer={(feature, latlng) => {
        const display = displayFor(feature)
        const options = {
          geomanIgnore: true,
          bubblingPointerEvents: true,
          ...(pane && { pane }),
        }
        if (display.marker_type === 'circle') {
          return new L.CircleMarker(latlng, {
            ...(display.stroke != null && { stroke: display.stroke }),
            ...(display.fill != null && { fill: display.fill }),
            ...options,
            radius: display.circle_marker_radius ?? 8,
          })
        }
        const html = cachedMarkerIconHtml({
          symbol: display.marker_symbol,
          className: `${styles.markerIcon} ${styles.markerIconSized}`,
          style: {
            '--marker-color': display.color ?? '#cc756b',
            '--marker-size': `${display.marker_size ?? 16}px`,
          } as React.CSSProperties,
        })
        return new L.Marker(latlng, {
          ...options,
          ...(html && { icon: new L.DivIcon({ html }) }),
        })
      }}
    />
  )
}
