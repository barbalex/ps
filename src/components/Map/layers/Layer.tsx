import { Pane } from 'react-leaflet'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useParams } from '@tanstack/react-router'

import { Background } from './Background.tsx'
import { backgroundLayers } from './backgroundLayers.ts'
import { TilesLayer, type TileLayerRow } from './TilesLayer.tsx'
import { WmsLayerComponent } from './WmsLayer/index.tsx'
import { VectorLayerChooser } from './VectorLayer/index.tsx'
import { tableLayerToComponent } from './tableLayerToComponent.ts'
import { useUrlLayers } from '../../../modules/useUrlLayers.ts'
import type LayerPresentations from '../../../models/public/LayerPresentations.ts'
import type VectorLayers from '../../../models/public/VectorLayers.ts'
import type VectorLayerDisplays from '../../../models/public/VectorLayerDisplays.ts'
import type WmsLayers from '../../../models/public/WmsLayers.ts'

const paneBaseIndex = 400 // was: 200. then wfs layers covered lower ones

type Props = {
  layerPresentationId: string
  index: number
}

// Row of the wms_layers query, joined with selected wms_services columns
type WmsLayerRow = WmsLayers & {
  wms_services_url: string | null
  wms_services_image_format: string | null
  wms_services_version: string | null
  opacity?: number
}

// Row of the vector_layers query with aggregated json columns
type VectorLayerRow = VectorLayers & {
  label: string | null
  wfs_services?: {
    url: string | null
    version: string | null
    info_format: string | null
    default_crs: string | null
  } | null
  vector_layer_displays?: VectorLayerDisplays[] | null
}

// TODO: text
// layerPresentationId should be uuid for queries. Need to convert
// TODO: only load layers of active project
// 99999999-9999-9999-9999-999999999999
export const Layer = ({ layerPresentationId, index }: Props) => {
  const { projectId = '99999999-9999-9999-9999-999999999999' } = useParams({
    strict: false,
  })
  // ?layers= override-aware render list and visibility (see the hook);
  // layers uses it for the pane redraw key too
  const { layers, isLayerVisible } = useUrlLayers()
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
  const wmsLayer = resWms?.rows?.[0] as WmsLayerRow | undefined

  const resVector = useLiveQuery(
    `
    SELECT 
      vl.*,
      json_build_object(
        'url', ws.url,
        'version', ws.version,
        'info_format', ws.info_format,
        'default_crs', ws.default_crs
      ) as wfs_services,
      json_agg(
        json_build_object(
          'vector_layer_display_id', vld.vector_layer_display_id,
          'display_property_value', vld.display_property_value,
          'marker_type', vld.marker_type,
          'circle_marker_radius', vld.circle_marker_radius,
          'marker_symbol', vld.marker_symbol,
          'marker_size', vld.marker_size,
          'stroke', vld.stroke,
          'color', vld.color,
          'weight', vld.weight,
          'line_cap', vld.line_cap,
          'line_join', vld.line_join,
          'dash_array', vld.dash_array,
          'dash_offset', vld.dash_offset,
          'fill', vld.fill,
          'fill_color', vld.fill_color,
          'fill_opacity_percent', vld.fill_opacity_percent,
          'fill_rule', vld.fill_rule
        )
        -- the display without a value first: features whose value has no
        -- display are drawn with the first one
        ORDER BY vld.display_property_value NULLS FIRST
      ) FILTER (WHERE vld.vector_layer_display_id IS NOT NULL) as vector_layer_displays
    FROM 
      vector_layers vl 
      INNER JOIN layer_presentations lp ON vl.vector_layer_id = lp.vector_layer_id
      LEFT JOIN wfs_services ws ON vl.wfs_service_id = ws.wfs_service_id
      LEFT JOIN vector_layer_displays vld ON vl.vector_layer_id = vld.vector_layer_id
    WHERE 
      lp.layer_presentation_id = $1
      AND vl.project_id = $2
    GROUP BY vl.vector_layer_id, ws.wfs_service_id`,
    [layerPresentationId, projectId],
  )
  const vectorLayer = resVector?.rows?.[0] as VectorLayerRow | undefined
  const isWfsLayer = vectorLayer?.type === 'wfs'
  const isTableLayer = !!vectorLayer?.type && vectorLayer?.type !== 'wfs'

  const resLP = useLiveQuery(
    `SELECT * FROM layer_presentations WHERE layer_presentation_id = $1`,
    [layerPresentationId],
  )
  const layerPresentation = resLP?.rows?.[0] as LayerPresentations | undefined

  const resTile = useLiveQuery(
    `
    SELECT tl.*, lp.active, lp.opacity_percent, lp.grayscale, lp.max_zoom, lp.min_zoom
    FROM tile_layers tl
      JOIN layer_presentations lp ON tl.tile_layer_id = lp.tile_layer_id
    WHERE lp.layer_presentation_id = $1
      AND tl.project_id = $2`,
    [layerPresentationId, projectId],
  )
  const tileLayer = resTile?.rows?.[0] as TileLayerRow | undefined

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

  const background = backgroundLayers[layerPresentationId]
  if (background) {
    return <Background key={layerPresentationId} background={background} />
  }

  // background tile layers behave like the pseudo backgrounds above: being
  // in the render list IS their visibility, the db flag is irrelevant (it
  // stays false — they are not listed under Active)
  if (tileLayer?.is_background) {
    return <TilesLayer key={layerPresentationId} tileLayer={tileLayer} />
  }

  if (!layerPresentation) return null
  // view-time visibility: an active ?layers= override wins over the
  // layer_presentations.active design flag
  if (!isLayerVisible(layerPresentationId, layerPresentation.active === true))
    return null

  // // todo: add key, layerPresentationId
  if (wmsLayer) {
    wmsLayer.opacity = layerPresentation.opacity_percent
      ? layerPresentation.opacity_percent / 100
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
        key={`${layerPresentationId}/${layers.join()}`}
        name={wmsLayer.label as string}
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
  if (tileLayer) {
    const opacity = (layerPresentation.opacity_percent ?? 100) / 100
    return (
      <Pane
        key={`${layerPresentationId}/${layers.join()}`}
        name={tileLayer.label ?? tileLayer.tile_layer_id}
        style={{ zIndex: paneBaseIndex - index }}
      >
        <TilesLayer
          key={JSON.stringify({
            url: tileLayer.url_template,
            subdomains: tileLayer.subdomains,
            maxNativeZoom: tileLayer.max_native_zoom,
            maxZoom: layerPresentation.max_zoom,
            minZoom: layerPresentation.min_zoom,
            opacity: layerPresentation.opacity_percent,
            grayscale: layerPresentation.grayscale,
          })}
          tileLayer={tileLayer}
          opacity={opacity}
        />
      </Pane>
    )
  }

  if (isWfsLayer) {
    return (
      <Pane
        key={`${layerPresentationId}/${layers.join()}`}
        name={vectorLayer.name ?? vectorLayer.vector_layer_id}
        style={{ zIndex: paneBaseIndex - index }}
      >
        <VectorLayerChooser
          layerPresentation={layerPresentation}
          layer={vectorLayer}
        />
      </Pane>
    )
  }

  if (isTableLayer) {
    const componentKey = vectorLayer.own_table_level
      ? `${vectorLayer.own_table}${vectorLayer.own_table_level}`
      : vectorLayer.own_table
    const Component =
      tableLayerToComponent[componentKey as keyof typeof tableLayerToComponent]

    if (!Component) {
      console.warn(
        `No component found for table layer: ${componentKey}`,
        vectorLayer,
      )
      return null
    }

    // TableLayer expects layerPresentation.vector_layers with vector_layer_displays
    const layerPresentationWithVectorLayer = {
      ...layerPresentation,
      vector_layers: vectorLayer,
    }

    return (
      <Pane
        key={`${layerPresentationId}/${layers.join()}`}
        name={vectorLayer.name ?? vectorLayer.vector_layer_id}
        style={{ zIndex: paneBaseIndex - index }}
      >
        <Component
          key={layerPresentationId}
          layerPresentation={layerPresentationWithVectorLayer}
        />
      </Pane>
    )
  }

  return null
}
