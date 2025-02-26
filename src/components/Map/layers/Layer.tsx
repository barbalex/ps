import { memo, useMemo } from 'react'
import { Pane } from 'react-leaflet'
import { useLiveQuery } from '@electric-sql/pglite-react'

import { OsmColor } from './OsmColor.tsx'
import { WmsLayerComponent } from './WmsLayer/index.tsx'
import { VectorLayerChooser } from './VectorLayer/index.tsx'
import { tableLayerToComponent } from './tableLayerToComponent.ts'

const paneBaseIndex = 400 // was: 200. then wfs layers covered lower ones

// TODO: text
// layerPresentationId should be uuid for queries. Need to convert
export const Layer = memo(({ layerPresentationId, index }) => {
  const resWms = useLiveQuery(
    `
    SELECT wms_layers.* 
    FROM wms_layers
      INNER JOIN layer_presentations lp ON wms_layers.wms_layer_id = lp.wms_layer_id 
    WHERE lp.layer_presentation_id = $1`,
    [layerPresentationId],
  )
  const wmsLayer = useMemo(() => resWms?.rows?.[0], [resWms])

  const resVector = useLiveQuery(
    `
    SELECT vector_layers.* 
    FROM vector_layers 
      INNER JOIN layer_presentations lp ON vector_layers.vector_layer_id = lp.vector_layer_id
    WHERE lp.layer_presentation_id = $1`,
    [layerPresentationId],
  )
  const vectorLayer = useMemo(() => resVector?.rows?.[0], [resVector])
  const isWfsLayer = vectorLayer?.type === 'wfs'
  const isTableLayer = vectorLayer?.type !== 'wfs'

  if (layerPresentationId === 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa') {
    return <OsmColor key="aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa" />
  }

  const layerPresentation = layerPresentations.find(
    (lp) => lp.layer_presentation_id === layerPresentationId,
  )

  if (!layerPresentation) return null

  return null

  // // todo: add key, layerPresentationId
  // if (wmsLayer) {
  //   wmsLayer.opacity = layerPresentation.opacity_percent
  //     ? layerPresentation.opacity_percent / 100
  //     : 1
  //   const partsToRedrawOn = {
  //     max_zoom: layerPresentation.max_zoom,
  //     min_zoom: layerPresentation.min_zoom,
  //     opacity: layerPresentation.opacity_percent,
  //     url: wmsLayer.wms_services.url,
  //     format: wmsLayer.wms_services.image_format,
  //     layer: wmsLayer.wms_service_layer_name,
  //     transparent: layerPresentation.transparent,
  //     version: wmsLayer.wms_services.version,
  //     grayscale: layerPresentation.grayscale,
  //   }
  //   return (
  //     <Pane
  //       key={`${layerPresentationId}/${mapLayerSorting.join()}`}
  //       name={wmsLayer.label}
  //       style={{ zIndex: paneBaseIndex - index }}
  //     >
  //       <WmsLayerComponent
  //         key={JSON.stringify(partsToRedrawOn)}
  //         layer={wmsLayer}
  //         layerPresentation={layerPresentation}
  //       />
  //     </Pane>
  //   )
  // }

  // if (isWfsLayer) {
  //   return (
  //     <Pane
  //       key={`${layerPresentationId}/${mapLayerSorting.join()}`}
  //       name={vectorLayer.label}
  //       style={{ zIndex: paneBaseIndex - index }}
  //     >
  //       <VectorLayerChooser
  //         layerPresentation={layerPresentation}
  //         layer={vectorLayer}
  //       />
  //     </Pane>
  //   )
  // }

  // if (isTableLayer) {
  //   const Component =
  //     tableLayerToComponent[
  //       `${vectorLayer.own_table}${vectorLayer.own_table_level}`
  //     ]

  //   return (
  //     <Pane
  //       key={`${layerPresentationId}/${mapLayerSorting.join()}`}
  //       name={vectorLayer.label}
  //       style={{ zIndex: paneBaseIndex - index }}
  //     >
  //       <Component
  //         key={layerPresentationId}
  //         layerPresentation={layerPresentation}
  //       />
  //     </Pane>
  //   )
  // }

  // return null
})
