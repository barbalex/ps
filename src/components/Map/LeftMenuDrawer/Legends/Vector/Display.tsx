import { MapContainer, Rectangle } from 'react-leaflet'

import { vectorLayerDisplayToProperties } from '../../../../../modules/vectorLayerDisplayToProperties.ts'
import './display.css'
import styles from './Display.module.css'

// idea: use a leaflet map to display: a rectangle, line and point
// build map and pass geometries as data attribute to GeoJSON, using vectorLayerDisplayToProperties as in TableLayer.tsx
export const Display = ({ display, layerPresentation }) => (
  <div className={styles.container}>
    {/* if a display_property_value exists, display it */}
    <MapContainer
      crs={L.CRS.Simple}
      zoomControl={false}
      attributionControl={false}
      boxZoom={false}
      doubleClickZoom={false}
      scrollWheelZoom={false}
      dragging={false}
      className={styles.mapContainer}
      bounds={[
        [0, 0],
        [20, 20],
      ]}
    >
      <Rectangle
        bounds={[
          [1, 1],
          [19, 19],
        ]}
        pathOptions={vectorLayerDisplayToProperties({
          vectorLayerDisplay: display,
          presentation: layerPresentation,
        })}
      />
    </MapContainer>
    <p className={styles.displayPropertyValue}>
      {display.display_property_value ?? ''}
    </p>
  </div>
)
