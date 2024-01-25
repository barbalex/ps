import { useLiveQuery } from 'dexie-react-hooks'
import { useParams } from 'react-router-dom'

import { dexie, TileLayer as TileLayerType } from '../../../dexieClient'
import TileLayer from './TileLayer'
import OsmColor from '../layers/OsmColor'

const TileLayers = () => {
  const { projectId } = useParams()
  const where = projectId
    ? // Beware: projectId can be undefined and dexie does not like that
      { deleted: 0, active: 1, project_id: projectId }
    : { deleted: 0, active: 1 }

  const tileLayers: TileLayerType[] =
    useLiveQuery(
      async () => await dexie.tile_layers.where(where).reverse().sortBy('sort'),
      [projectId],
    ) ?? []
  /**
   * Ensure needed data exists:
   * - wmts_url_template has template
   * - wms has base-url and layers
   */
  const validTileLayers = tileLayers.filter((l) => {
    if (!l.type) return false
    if (l.type === 'wmts') {
      if (!l.wmts_url_template) return false
    } else {
      if (!l.wms_base_url) return false
      if (!l.wms_layers) return false
    }
    return true
  })

  // is no tile layer was yet defined, use osm
  if (!validTileLayers.length) return [<OsmColor key="osm" />]
  // if (!validTileLayers.length) return []

  // console.log(
  //   'Map, TileLayers, validTileLayers:',
  //   validTileLayers.map((t) => t.label),
  // )

  /**
   * TODO:
   * Profit from server combining wms in single image
   * Find unique wms sources
   * create leaflet.wms source
   * then in layer only call source.getLayer
   */

  return validTileLayers.map((layer: TileLayerType) => {
    const partsToRedrawOn = {
      wmts_url_template: layer.wmts_url_template,
      max_zoom: layer.max_zoom,
      min_zoom: layer.min_zoom,
      opacity: layer.opacity,
      wms_base_url: layer.wms_base_url,
      wms_format: layer.wms_format,
      wms_layers: layer.wms_layers,
      wms_parameters: layer.wms_parameters,
      wms_styles: layer.wms_styles,
      wms_transparent: layer.wms_transparent,
      wms_version: layer.wms_version,
      grayscale: layer.grayscale,
    }

    return <TileLayer key={JSON.stringify(partsToRedrawOn)} layer={layer} />
  })
}

export default TileLayers
