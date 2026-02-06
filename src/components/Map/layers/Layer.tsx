import { Pane } from 'react-leaflet'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtomValue } from 'jotai'
import { useParams } from '@tanstack/react-router'

import { OsmColor } from './OsmColor.tsx'
import { WmsLayerComponent } from './WmsLayer/index.tsx'
// import { VectorLayerChooser } from './VectorLayer/index.tsx'
import { tableLayerToComponent } from './tableLayerToComponent.ts'
import { mapLayerSortingAtom } from '../../../store.ts'
import type LayerPresentations from '../../../models/public/LayerPresentations.ts'
import type VectorLayers from '../../../models/public/VectorLayers.ts'

const paneBaseIndex = 400 // was: 200. then wfs layers covered lower ones

// TODO: text
// layerPresentationId should be uuid for queries. Need to convert
// TODO: only load layers of active project
// 99999999-9999-9999-9999-999999999999
export const Layer = ({ layerPresentationId, index }) => {
  const { projectId = '99999999-9999-9999-9999-999999999999' } = useParams({
    strict: false,
  })
  const mapLayerSorting = useAtomValue(mapLayerSortingAtom)
  const resWms = useLiveQuery(
    `
    SELECT 
      wms_layers.*,
      wms_services.url as wms_services_url,
      wms_services.image_format as wms_services_image_format,
      wms_services.version as wms_services_version 
    FROM wms_layers
      INNER JOIN layer_presentations lp ON wms_layers.wms_layer_id = lp.wms_layer_id
      INNER JOIN wms_services ON wms_layers.wms_service_id = wms_services.wms_service_id
    WHERE 
      lp.layer_presentation_id = $1
      AND wms_layers.project_id = $2`,
    [layerPresentationId, projectId],
  )
  const wmsLayer = resWms?.rows?.[0]

  const resVector = useLiveQuery(
    `
    SELECT vl.* 
    FROM 
      vector_layers vl 
      INNER JOIN layer_presentations lp ON vl.vector_layer_id = lp.vector_layer_id
    WHERE 
      lp.layer_presentation_id = $1
      AND vl.project_id = $2`,
    [layerPresentationId, projectId],
  )
  const vectorLayer: VectorLayers | undefined = resVector?.rows?.[0]
  const isWfsLayer = vectorLayer?.type === 'wfs'
  const isTableLayer = !!vectorLayer?.type && vectorLayer?.type !== 'wfs'

  const resLP = useLiveQuery(
    `SELECT * FROM layer_presentations WHERE layer_presentation_id = $1`,
    [layerPresentationId],
  )
  const layerPresentation: LayerPresentations | undefined = resLP?.rows?.[0]

  // console.log('Layer', {
  //   layerPresentationId,
  //   layerPresentation,
  //   index,
  //   resWms,
  //   wmsLayer,
  //   resVector,
  //   vectorLayer,
  //   isWfsLayer,
  //   isTableLayer,
  // })

  if (layerPresentationId === 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa') {
    return <OsmColor key="aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa" />
  }

  if (!layerPresentation) return null
  if (!layerPresentation.active) return null

  // // todo: add key, layerPresentationId
  if (wmsLayer) {
    wmsLayer.opacity =
      layerPresentation.opacity_percent ?
        layerPresentation.opacity_percent / 100
      : 1
    const partsToRedrawOn = {
      max_zoom: layerPresentation.max_zoom,
      min_zoom: layerPresentation.min_zoom,
      opacity: layerPresentation.opacity_percent,
      url: wmsLayer.wms_services_url,
      format: wmsLayer.wms_services_image_format,
      layer: wmsLayer.wms_service_layer_name,
      transparent: layerPresentation.transparent,
      version: wmsLayer.wms_services_version,
      grayscale: layerPresentation.grayscale,
    }
    return (
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
      </Pane>
    )
  }

  // TODO: Error when VectorLayerChooser is not commented out
  // [vite] TypeError: Cannot read properties of undefined (reading 'ReactCurrentDispatcher')
  if (isWfsLayer) {
    return (
      <Pane
        key={`${layerPresentationId}/${mapLayerSorting.join()}`}
        name={vectorLayer.label}
        style={{ zIndex: paneBaseIndex - index }}
      >
        {/* <VectorLayerChooser
          layerPresentation={layerPresentation}
          layer={vectorLayer}
        /> */}
      </Pane>
    )
  }

  if (isTableLayer) {
    const Component =
      tableLayerToComponent[
        `${vectorLayer.own_table}${vectorLayer.own_table_level}`
      ]

    return (
      <Pane
        key={`${layerPresentationId}/${mapLayerSorting.join()}`}
        name={vectorLayer.label}
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
