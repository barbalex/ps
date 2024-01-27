import { useLiveQuery } from 'electric-sql/react'
import { useParams } from 'react-router-dom'

import { Tile_layers as TileLayer } from '../../../generated/client'
import { TileLayerComponent } from './TileLayer'
import { OsmColor } from '../layers/OsmColor'
import { useElectric } from '../../../ElectricProvider'

export const TileLayers = () => {
  const { project_id } = useParams()
  const where = project_id
    ? { deleted: false, active: true, type: { not: null }, project_id }
    : { deleted: false, active: true, type: { not: null } }

  const { db } = useElectric()!
  const { results: layersResult = [] } = useLiveQuery(
    db.tile_layers.liveMany({
      where,
      orderBy: [{ sort: 'asc' }, { label: 'asc' }],
    }),
  )
  const tileLayers: TileLayer[] = layersResult.map((l) => {
    // need to convert opacity_percent to opacity
    const { opacity_percent, ...rest } = l
    return {
      ...rest,
      opacity: opacity_percent ? opacity_percent / 100 : 1,
    }
  })
  /**
   * Ensure needed data exists:
   * - wmts_url_template has template
   * - wms has base-url and layers
   */
  const validTileLayers = tileLayers.filter((l) => {
    if (l.type === 'wmts') {
      if (!l.wmts_url_template) return false
    } else {
      if (!l.wms_base_url) return false
      if (!l.wms_layers) return false
    }
    return true
  })

  // console.log('hello Map, TileLayers', {
  //   validTileLayerLabels: validTileLayers.map((t) => t.label),
  //   tileLayers,
  //   where,
  // })

  // is no tile layer was yet defined, use osm
  if (!validTileLayers.length) return [<OsmColor key="osm" />]

  /**
   * TODO:
   * Profit from server combining wms in single image
   * Find unique wms sources
   * create leaflet.wms source
   * then in layer only call source.getLayer
   */

  return validTileLayers.map((layer: TileLayer) => {
    const partsToRedrawOn = {
      wmts_url_template: layer.wmts_url_template,
      max_zoom: layer.max_zoom,
      min_zoom: layer.min_zoom,
      opacity: layer.opacity,
      wms_base_url: layer.wms_base_url,
      wms_format: layer.wms_format,
      wms_layers: (layer.wms_layers ?? []).map((l) => l.value).join(','),
      wms_parameters: layer.wms_parameters,
      wms_styles: layer.wms_styles,
      wms_transparent: layer.wms_transparent,
      wms_version: layer.wms_version,
      grayscale: layer.grayscale,
      sort: layer.sort,
      label: layer.label,
    }

    // console.log('hello Map, TileLayers', { partsToRedrawOn, layer })

    return (
      <TileLayerComponent key={JSON.stringify(partsToRedrawOn)} layer={layer} />
    )
  })
}
