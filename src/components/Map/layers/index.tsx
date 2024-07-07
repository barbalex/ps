import { memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'
import { Pane } from 'react-leaflet'

import { useElectric } from '../../../ElectricProvider.tsx'
import {
  Tile_layers as TileLayer,
  Vector_layers as VectorLayer,
} from '../../../generated/client/index.ts'
import { OsmColor } from './OsmColor.tsx'
import { TileLayerComponent } from './TileLayer/index.tsx'
import { VectorLayerChooser } from './VectorLayerChooser.tsx'
import { Places1 } from './TableLayers/Places1.tsx'
import { Places2 } from './TableLayers/Places2.tsx'
import { Checks1 } from './TableLayers/Checks1.tsx'
import { Checks2 } from './TableLayers/Checks2.tsx'
import { Actions1 } from './TableLayers/Actions1.tsx'
import { Actions2 } from './TableLayers/Actions2.tsx'
import { OccurrencesAssigned1 } from './TableLayers/OccurrencesAssigned1.tsx'
import { OccurrencesAssigned2 } from './TableLayers/OccurrencesAssigned2.tsx'
import { OccurrencesToAssess } from './TableLayers/OccurrencesToAssess.tsx'
import { OccurrencesNotToAssign } from './TableLayers/OccurrencesNotToAssign.tsx'

const tableLayerToComponent = {
  places1: Places1,
  places2: Places2,
  checks1: Checks1,
  checks2: Checks2,
  actions1: Actions1,
  actions2: Actions2,
  occurrences_assigned1: OccurrencesAssigned1,
  occurrences_assigned2: OccurrencesAssigned2,
  occurrences_to_assess: OccurrencesToAssess,
  occurrences_not_to_assign: OccurrencesNotToAssign,
}

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
      include: {
        vector_layers: { include: { vector_layer_displays: true } },
        tile_layers: true,
      },
    }),
  )
  const tileLayersCount = layerPresentations.filter(
    (lp) => !!lp.tile_layers,
  ).length
  // if no tile layer is present, add osm
  if (!!appState && !tileLayersCount && !mapLayerSorting.includes('osm')) {
    mapLayerSorting.push('osm')
  }

  // return an array of layerPresentations
  // for every one determine if is: tile, wfs, own (table)
  return mapLayerSorting.map((layerPresentationId, index) => {
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
        opacity: layerPresentation.opacity_percent,
        wms_url: tileLayer.wms_url,
        wms_format: tileLayer.wms_format?.value,
        wms_layer: tileLayer.wms_layer?.value,
        wms_parameters: tileLayer.wms_parameters,
        wms_styles: tileLayer.wms_styles,
        wms_transparent: tileLayer.wms_transparent,
        wms_version: tileLayer.wms_version,
        wms_greyscale: layerPresentation.grayscale,
      }
      return (
        <Pane
          key={`${layerPresentationId}/${mapLayerSorting.join()}`}
          name={tileLayer.label}
          style={{ zIndex: 200 - index }}
        >
          <TileLayerComponent
            key={JSON.stringify(partsToRedrawOn)}
            layer={tileLayer}
            layerPresentation={layerPresentation}
          />
        </Pane>
      )
    }

    if (wfsLayer) {
      return (
        <Pane
          key={`${layerPresentationId}/${mapLayerSorting.join()}`}
          name={wfsLayer.label}
          style={{ zIndex: 200 - index }}
        >
          <VectorLayerChooser
            layerPresentation={layerPresentation}
            layer={wfsLayer}
          />
        </Pane>
      )
    }

    if (tableLayer) {
      // TODO: layer not shown
      const Component = tableLayerToComponent[tableLayer.type]

      return (
        <Pane
          key={`${layerPresentationId}/${mapLayerSorting.join()}`}
          name={tableLayer.label}
          style={{ zIndex: 200 - index }}
        >
          <Component
            key={layerPresentationId}
            layerPresentation={layerPresentation}
          />
        </Pane>
      )
    }

    return null
  })
})
