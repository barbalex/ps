import { memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'

import { useElectric } from '../../../ElectricProvider.tsx'
import {
  Tile_layers as TileLayer,
  Vector_layers as VectorLayer,
} from '../../../generated/client/index.ts'
import { OsmColor } from './OsmColor.tsx'
import { TileLayerComponent } from './TileLayer/index.tsx'

export const Layers = memo(() => {
  const { user: authUser } = useCorbado()

  const { db } = useElectric()!

  const { results: appState } = useLiveQuery(
    db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
  )
  const mapLayerSorting = appState?.map_layer_sorting ?? []

  // for every layer_presentation_id in mapLayerSorting, get the layer_presentation
  const { results: layerPresentations = [] } = useLiveQuery(
    db.layer_presentations.liveMany({
      where: { layer_presentation_id: { in: mapLayerSorting }, active: true },
      include: { vector_layers: true, tile_layers: true },
    }),
  )
  const tileLayersCount = layerPresentations.filter(
    (lp) => !!lp.tile_layers,
  ).length
  // if no tile layer is present, add osm
  if (!tileLayersCount) mapLayerSorting.push('osm')

  console.log('Layers', {
    layerPresentations,
    mapLayerSorting,
  })

  // return an array of layerPresentations
  // for every one determine if is: tile, wfs, own (table)

  return mapLayerSorting.map((layerPresentationId) => {
    if (layerPresentationId === 'osm') return <OsmColor key="osm" />

    const layerPresentation = layerPresentations.find(
      (lp) => lp.layer_presentation_id === layerPresentationId,
    )

    if (!layerPresentation) return null

    const tileLayer: TileLayer | undefined = layerPresentation.tile_layers
    const vectorLayer: VectorLayer | undefined = layerPresentation.vector_layers
    const wfsLayer = vectorLayer?.type === 'wfs' ? vectorLayer : null
    const tableLayer =
      vectorLayer?.type && vectorLayer.type !== 'wfs' ? vectorLayer : null

    // todo: add key, layerPresentationId
    if (tileLayer) {
      tileLayer.opacity = layerPresentation.opacity_percent
        ? layerPresentation.opacity_percent / 100
        : 1
      const partsToRedrawOn = {
        wmts_url_template: tileLayer.wmts_url_template,
        max_zoom: tileLayer.max_zoom,
        min_zoom: tileLayer.min_zoom,
        opacity: tileLayer.layer_presentations?.[0]?.opacity_percent,
        wms_base_url: tileLayer.wms_base_url,
        wms_format: tileLayer.wms_format?.value,
        wms_layer: tileLayer.wms_layer?.value,
        wms_parameters: tileLayer.wms_parameters,
        wms_styles: tileLayer.wms_styles,
        wms_transparent: tileLayer.wms_transparent,
        wms_version: tileLayer.wms_version,
      }
      return (
        <TileLayerComponent
          key={`${layerPresentationId}/${JSON.stringify(partsToRedrawOn)}`}
          layer={tileLayer}
        />
      )
    }

    if (wfsLayer) {
      // return <VectorLayerComponent key={layerPresentationId} layerPresentation={layerPresentation} />
    }

    if (tableLayer) {
      // return <OwnLayerComponent key={layerPresentationId} layerPresentation={layerPresentation} />
    }

    return null
  })
})
