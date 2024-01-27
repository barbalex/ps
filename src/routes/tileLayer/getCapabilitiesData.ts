import axios from 'redaxios'

import { getCapabilities } from '../../modules/getCapabilities'
import { Tile_layers as TileLayer, Electric } from '../../generated/client'

interface Props {
  row: TileLayer
  returnValue: boolean
  db: Electric
}

export const getCapabilitiesData = async ({
  row,
  returnValue = false,
  db,
}: Props) => {
  if (!row?.wms_base_url) return undefined

  console.log('hello getCapabilitiesDataForTileLayer, label:', row.label)

  const values = {}

  const capabilities = await getCapabilities({
    url: row.wms_base_url,
    service: 'WMS',
  })

  values.wms_format_options =
    capabilities?.Capability?.Request?.GetMap?.Format.filter((v) =>
      v.toLowerCase().includes('image'),
    ).map((v) => ({
      label: v,
      value: v,
    }))

  // let user choose from layers
  // only layers with crs EPSG:4326
  const layers = (capabilities?.Capability?.Layer?.Layer ?? []).filter((v) =>
    v?.CRS?.includes('EPSG:4326'),
  )
  values.wms_layer_options = layers.map((v) => ({
    label: v.Title,
    value: v.Name,
  }))

  // fetch legends
  values.wms_legend_urls = layers
    .map((l) => ({
      title: l.Title,
      url: l.Style?.[0]?.LegendURL?.[0]?.OnlineResource,
      name: l.Name,
    }))
    .filter((u) => !!u.url)

  const legendUrlsToUse = values.wms_legend_urls.filter((lUrl) =>
    row.wms_layers?.includes?.(lUrl.name),
  )

  const _legendBlobs: [Blob, string] = []
  for (const lUrl of legendUrlsToUse) {
    let res
    try {
      res = await axios.get(lUrl.url, {
        responseType: 'blob',
      })
    } catch (error) {
      // error can also be caused by timeout
      console.error(`error fetching legend for layer '${lUrl.title}':`, error)
      return false
    }
    // console.log('Legends, res.data:', res.data)
    if (res.data) _legendBlobs.push([lUrl.title, res.data])
  }

  // TODO: these are blobs. How to save in sqlite?
  // TODO: solve this problem, then set the wms_legends
  // add legends into row to reduce network activity and make them offline available
  // values.wms_legends = _legendBlobs.length ? _legendBlobs : undefined

  // use capabilities.Capability?.Request?.GetFeatureInfo?.Format
  // to set wms_info_format
  const infoFormats =
    capabilities?.Capability?.Request?.GetFeatureInfo?.Format ?? []
  values.wms_info_format_options = infoFormats.map((l) => ({
    label: l,
    value: l,
  }))
  // console.log('TileLayerForm, cbData:', cbData)

  // if wms_format is not yet set, set version with png or jpg
  if (!row?.wms_format) {
    const _wmsFormatValues =
      capabilities?.Capability?.Request?.GetMap?.Format.filter((v) =>
        v.toLowerCase().includes('image'),
      )
    const preferedFormat =
      _wmsFormatValues?.find((v) => v?.toLowerCase?.().includes('image/png')) ??
      _wmsFormatValues?.find((v) => v?.toLowerCase?.().includes('png')) ??
      _wmsFormatValues?.find((v) =>
        v?.toLowerCase?.().includes('image/jpeg'),
      ) ??
      _wmsFormatValues?.find((v) => v?.toLowerCase?.().includes('jpeg'))
    if (preferedFormat) {
      values.wms_format = preferedFormat
    }
  }

  const _wmsVersion = capabilities?.version
  if (_wmsVersion) {
    if (!row?.wms_version) {
      values.wms_version = _wmsVersion
    }
  }

  // set title as label if undefined
  if (!row?.label && capabilities?.Service?.Title) {
    values.label = capabilities?.Service?.Title
  }

  const _layerOptions = layers.map((v) => v.Name)
  // activate layer, if not too many
  if (!row?.wms_layers && _layerOptions?.map && _layerOptions?.length <= 5) {
    values.wms_layers = _layerOptions.map((o) => o.value).join(',')
  }

  // use capabilities.Capability?.Layer?.Layer[this]?.queryable to allow/disallow getting feature info?
  if (![true, false].includes(row?.wms_queryable)) {
    values.wms_queryable = layers.some((l) => l.queryable)
  }

  // set info_format if undefined
  if (!row?.wms_info_format && infoFormats.length) {
    // for values see: https://docs.geoserver.org/stable/en/user/services/wms/reference.html#getfeatureinfo
    const preferedFormat =
      infoFormats.find(
        (v) => v?.toLowerCase?.() === 'application/vnd.ogc.gml',
      ) ??
      infoFormats.find((v) =>
        v?.toLowerCase?.().includes('application/vnd.ogc.gml'),
      ) ??
      infoFormats.find((v) => v?.toLowerCase?.().includes('text/plain')) ??
      infoFormats.find((v) =>
        v?.toLowerCase?.().includes('application/json'),
      ) ??
      infoFormats.find((v) => v?.toLowerCase?.().includes('text/javascript')) ??
      infoFormats.find((v) => v?.toLowerCase?.().includes('text/html'))
    if (preferedFormat) {
      values.wms_info_format = preferedFormat
    }
  }

  // enable updating in a single operation
  if (returnValue) return values

  console.log('hello getCapabilitiesData 1', {
    values,
    where: { tile_layer_id: row.tile_layer_id },
    row,
    db,
    tile_layers: db.tile_layers,
    update: db.tile_layers.update,
  })
  // TODO: somehow above log appears, next no more - and update seems not to happen

  const result = await db.tile_layers.update({
    where: { tile_layer_id: row.tile_layer_id },
    data: values,
  })
  console.log('hello getCapabilitiesData 2', { result })
  return
}
