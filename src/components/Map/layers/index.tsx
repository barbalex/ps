import { memo, useEffect, useMemo, useState } from 'react'
import { Pane } from 'react-leaflet'
import { useAtom } from 'jotai'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'

import { OsmColor } from './OsmColor.tsx'
import { WmsLayerComponent } from './WmsLayer/index.tsx'
import { VectorLayerChooser } from './VectorLayer/index.tsx'
import { tableLayerToComponent } from './tableLayerToComponent.ts'
import { mapLayerSortingAtom } from '../../../store.ts'

const paneBaseIndex = 400 // was: 200. then wfs layers covered lower ones

// TODO: text
export const Layers = memo(() => {
  const [mapLayerSorting, setMapLayerSorting] = useAtom(mapLayerSortingAtom)

  const db = usePGlite()

  // for every layer_presentation_id in mapLayerSorting, get the layer_presentation
  const res = useLiveQuery(
    `SELECT 
      *, 
      wms_layers_count as (SELECT COUNT(*) FROM wms_layers where wms_layers.layer_presentation_id = lp.layer_presentation_id) 
      FROM layer_presentations lp 
      WHERE 
        layer_presentation_id IN (${mapLayerSorting
          .map((_, i) => `$${i + 1}`)
          .join(', ')}) 
        AND active = true`,
    mapLayerSorting,
  )
  const layerPresentations = useMemo(() => res?.rows ?? [], [res])

  useEffect(() => {
    const wmsLayersCount = layerPresentations.filter(
      (lp) => lp.wms_layers_count > 0,
    ).length
    // if no wms layer is present, add osm
    if (!wmsLayersCount && !mapLayerSorting.includes('osm')) {
      setMapLayerSorting([...mapLayerSorting, 'osm'])
    }
  }, [mapLayerSorting, layerPresentations, setMapLayerSorting])

  const [returnVal, setReturnVal] = useState(null)

  useEffect(() => {
    const run = async () => {
      if (layerPresentationId === 'osm') {
        return setReturnVal(<OsmColor key="osm" />)
      }

      const layerPresentation = layerPresentations.find(
        (lp) => lp.layer_presentation_id === layerPresentationId,
      )

      if (!layerPresentation) return setReturnVal(null)

      const resWmsLayer = await db.query(
        `SELECT * FROM wms_layers WHERE layer_presentation_id = $1`,
        [layerPresentationId],
      )
      const wmsLayer = resWmsLayer.rows?.[0]

      const resWfsLayer = await db.query(
        `SELECT * FROM wfs_layers WHERE layer_presentation_id = $1 AND type = 'wfs'`,
        [layerPresentationId],
      )
      const wfsLayer = resWfsLayer.rows?.[0]

      const resTableLayer = await db.query(
        `SELECT * FROM vector_layers WHERE layer_presentation_id = $1 AND type != 'wfs'`,
        [layerPresentationId],
      )
      const tableLayer = resTableLayer.rows?.[0]

      // todo: add key, layerPresentationId
      if (wmsLayer) {
        wmsLayer.opacity = layerPresentation.opacity_percent
          ? layerPresentation.opacity_percent / 100
          : 1
        const partsToRedrawOn = {
          max_zoom: layerPresentation.max_zoom,
          min_zoom: layerPresentation.min_zoom,
          opacity: layerPresentation.opacity_percent,
          url: wmsLayer.wms_services.url,
          format: wmsLayer.wms_services.image_format,
          layer: wmsLayer.wms_service_layer_name,
          transparent: layerPresentation.transparent,
          version: wmsLayer.wms_services.version,
          grayscale: layerPresentation.grayscale,
        }
        return setReturnVal(
          <Pane
            key={`${layerPresentationId}/${mapLayerSorting.join()}`}
            name={wmsLayer.label}
            style={{ zIndex: paneBaseIndex - index }}
          >
            <WmsLayerComponent
              key={JSON.stringify(partsToRedrawOn)}
              layer={wmsLayer}
              layerPresentation={layerPresentation}
            />
          </Pane>,
        )
      }

      if (wfsLayer) {
        return setReturnVal(
          <Pane
            key={`${layerPresentationId}/${mapLayerSorting.join()}`}
            name={wfsLayer.label}
            style={{ zIndex: paneBaseIndex - index }}
          >
            <VectorLayerChooser
              layerPresentation={layerPresentation}
              layer={wfsLayer}
            />
          </Pane>,
        )
      }

      if (tableLayer) {
        const Component =
          tableLayerToComponent[
            `${tableLayer.own_table}${tableLayer.own_table_level}`
          ]

        return (
          <Pane
            key={`${layerPresentationId}/${mapLayerSorting.join()}`}
            name={tableLayer.label}
            style={{ zIndex: paneBaseIndex - index }}
          >
            <Component
              key={layerPresentationId}
              layerPresentation={layerPresentation}
            />
          </Pane>
        )
      }

      return null
    }
    run()
  }, [db, layerPresentations, mapLayerSorting])

  // return an array of layerPresentations
  // for every one determine if is: wms, wfs, own (table)
  return returnVal
})
