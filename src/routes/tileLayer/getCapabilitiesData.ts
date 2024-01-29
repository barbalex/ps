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

  // console.log('hello getting capabilites data for Tile Layer', {
  //   label: row.label,
  //   id: row.tile_layer_id,
  //   db,
  // })

  const values = {}

  const capabilities = await getCapabilities({
    url: row.wms_base_url,
    service: 'WMS',
  })

  if (!capabilities) return undefined

  const wmsFormatOptions =
    capabilities?.Capability?.Request?.GetMap?.Format.filter((v) =>
      v.toLowerCase().includes('image'),
    ).map((v) => ({
      label: v,
      value: v,
    }))
  if (wmsFormatOptions?.length) {
    for (const o of wmsFormatOptions) {
      await db.layer_options.upsert({
        create: {
          layer_option_id: `${row.wms_base_url}/wms_format`,
          tile_layer_id: row.tile_layer_id,
          vector_layer_id: null,
          field: 'wms_format',
          value: o.value,
          label: o.label,
        },
        update: {
          tile_layer_id: row.tile_layer_id,
          field: 'wms_format',
          value: o.value,
          label: o.label,
        },
        where: {
          layer_option_id: `${row.wms_base_url}/wms_format`,
        },
      })
    }
  }

  // let user choose from layers
  // only layers with crs EPSG:4326
  const layers = (capabilities?.Capability?.Layer?.Layer ?? []).filter((v) =>
    v?.CRS?.includes('EPSG:4326'),
  )
  const wmsLayerOptions = layers.map((v) => ({
    label: v.Title,
    value: v.Name,
  }))
  if (wmsLayerOptions?.length) {
    for (const o of wmsLayerOptions) {
      await db.layer_options.upsert({
        create: {
          layer_option_id: `${row.wms_base_url}/wms_layers`,
          tile_layer_id: row.tile_layer_id,
          vector_layer_id: null,
          field: 'wms_layers',
          value: o.value,
          label: o.label,
        },
        update: {
          tile_layer_id: row.tile_layer_id,
          field: 'wms_layers',
          value: o.value,
          label: o.label,
        },
        where: {
          layer_option_id: `${row.wms_base_url}/wms_layers`,
        },
      })
    }
  }

  // fetch legends
  values.wms_legend_urls = layers
    .map((l) => ({
      title: l.Title,
      url: l.Style?.[0]?.LegendURL?.[0]?.OnlineResource,
      name: l.Name,
    }))
    .filter((u) => !!u.url)

  const wmsLayerValues = (row.wms_layers ?? []).map((l) => l.value)

  const legendUrlsToUse = values.wms_legend_urls.filter((lUrl) =>
    wmsLayerValues.includes?.(lUrl.name),
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
  const wmsInfoFormatOptions = infoFormats.map((l) => ({
    label: l,
    value: l,
  }))
  if (wmsInfoFormatOptions?.length) {
    for (const o of wmsInfoFormatOptions) {
      await db.layer_options.upsert({
        create: {
          layer_option_id: `${row.wms_base_url}/wms_info_format`,
          tile_layer_id: row.tile_layer_id,
          vector_layer_id: null,
          field: 'wms_info_format',
          value: o.value,
          label: o.label,
        },
        update: {
          tile_layer_id: row.tile_layer_id,
          field: 'wms_info_format',
          value: o.value,
          label: o.label,
        },
        where: {
          layer_option_id: `${row.wms_base_url}/wms_info_format`,
        },
      })
    }
  }
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

  // activate layer, if not too many
  if (!row?.wms_layers && layers?.length && layers?.length <= 5) {
    values.wms_layers = layers.map((o) => ({
      value: o.Name,
      label: o.Title,
    }))
  }

  // use capabilities.Capability?.Layer?.Layer[this]?.queryable to allow/disallow getting feature info?
  if (![true, false].includes(row?.wms_queryable)) {
    values.wms_queryable = layers.some((l) => l.queryable)
  }

  // set info_format if undefined
  if (!row?.wms_info_format && infoFormats?.length) {
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

  return await db.tile_layers.update({
    where: { tile_layer_id: row.tile_layer_id },
    data: values,
  })
}
