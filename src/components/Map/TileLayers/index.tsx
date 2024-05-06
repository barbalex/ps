import { useLiveQuery } from 'electric-sql/react'
import { useParams } from 'react-router-dom'

import { Tile_layers as TileLayer } from '../../../generated/client/index.ts'
import { TileLayerComponent } from './TileLayer'
import { OsmColor } from '../layers/OsmColor'
import { useElectric } from '../../../ElectricProvider.tsx'

export const TileLayers = () => {
  const { project_id } = useParams()

  const { db } = useElectric()!

  /**
   * Ensure needed data exists:
   * - wmts_url_template has template
   * - wms has base-url and layers
   */
  const { results: layersResult = [] } = useLiveQuery(
    db.tile_layers.liveMany({
      where: {
        active: true,
        type: { not: null },
        project_id,
        OR: [
          { type: 'wmts', wmts_url_template: { not: null } },
          {
            type: 'wms',
            AND: [
              { wms_base_url: { not: null } },
              { wms_layer: { not: null } },
            ],
          },
        ],
      },
      // try not selecting label, to see if it helps with performance when label is changed
      // but: had no influence on performance
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

  // console.log('hello Map, TileLayers, tileLayers:', tileLayers)

  // is no tile layer was yet defined, use osm
  if (!tileLayers.length) return [<OsmColor key="osm" />]

  /**
   * TODO:
   * Profit from server combining wms in single image
   * Find unique wms sources
   * create leaflet.wms source
   * then in layer only call source.getLayer
   */

  return tileLayers.map((layer: TileLayer) => {
    const partsToRedrawOn = {
      wmts_url_template: layer.wmts_url_template,
      max_zoom: layer.max_zoom,
      min_zoom: layer.min_zoom,
      opacity: layer.opacity,
      wms_base_url: layer.wms_base_url,
      wms_format: layer.wms_format?.value,
      wms_layer: layer.wms_layer?.value,
      wms_parameters: layer.wms_parameters,
      wms_styles: layer.wms_styles,
      wms_transparent: layer.wms_transparent,
      wms_version: layer.wms_version,
      grayscale: layer.grayscale,
      sort: layer.sort,
    }

    // console.log('hello Map, TileLayers', { partsToRedrawOn, layer })

    return (
      <TileLayerComponent key={JSON.stringify(partsToRedrawOn)} layer={layer} />
    )
  })
}
