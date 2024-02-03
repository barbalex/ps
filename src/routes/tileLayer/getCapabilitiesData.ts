// import axios from 'redaxios'

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

  // console.log('hello, getCapabilitiesData, capabilities:', capabilities)

  if (!capabilities) return undefined

  const wmsFormatOptions =
    capabilities?.Capability?.Request?.GetMap?.Format?.filter((v) =>
      v.toLowerCase().includes('image'),
    ).map((v) => ({
      label: v,
      value: v,
    }))
  if (wmsFormatOptions?.length) {
    for (const o of wmsFormatOptions) {
      await db.layer_options.upsert({
        create: {
          layer_option_id: `${row.wms_base_url}/${o.value}/wms_format`,
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
          layer_option_id: `${row.wms_base_url}/${o.value}/wms_format`,
        },
      })
    }
  }

  // let user choose from layers
  // only layers with crs EPSG:4326
  const layers = (capabilities?.Capability?.Layer?.Layer ?? []).filter((v) =>
    v?.CRS?.includes('EPSG:4326'),
  )
  console.log('hello, getCapabilitiesData 1, layers:', layers)
  for (const l of layers) {
    const layer_option_id = `${row.wms_base_url}/${l.Name}/wms_layer`
    const value = {
      tile_layer_id: row.tile_layer_id,
      vector_layer_id: null,
      field: 'wms_layer',
      value: l.Name,
      label: l.Title,
      queryable: l.queryable,
      legend_url: l.Style?.[0]?.LegendURL?.[0]?.OnlineResource,
    }
    console.log('hello, getCapabilitiesData 2', {
      layer: l,
      value,
      layer_option_id,
      row,
    })
    try {
      const res = await db.layer_options.upsert({
        create: {
          layer_option_id,
          ...value,
        },
        update: value,
        where: {
          layer_option_id,
        },
      })
      console.log('hello, getCapabilitiesData 3, res:', res)
    } catch (error) {
      console.error('hello, getCapabilitiesData 4, error:', error)
    }
    console.log(
      'hello, getCapabilitiesData 5, upserted value into layer_options',
    )
  }

  // TODO: should legends be saved in sqlite? can be 700!!!
  // ensure only for layers with tile_layer
  // const wmsLayerValues = (row.wms_layer ?? []).map((l) => l.value)

  // const legendUrlsToUse = (wmsLayerOptions ?? []).filter((o) =>
  //   wmsLayerValues.includes?.(o.value),
  // )

  // const _legendBlobs: [Blob, string] = []
  // for (const lUrl of legendUrlsToUse) {
  //   let res
  //   try {
  //     res = await axios.get(lUrl.url, {
  //       responseType: 'blob',
  //     })
  //   } catch (error) {
  //     // error can also be caused by timeout
  //     console.error(`error fetching legend for layer '${lUrl.title}':`, error)
  //     return false
  //   }
  //   // console.log('Legends, res.data:', res.data)
  //   if (res.data) _legendBlobs.push([lUrl.title, res.data])
  // }

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
          layer_option_id: `${row.wms_base_url}/${o.value}/wms_info_format`,
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
          layer_option_id: `${row.wms_base_url}/${o.value}/wms_info_format`,
        },
      })
    }
  }
  // console.log('TileLayerForm, cbData:', cbData)

  // if wms_format is not yet set, set version with png or jpg
  if (!row?.wms_format) {
    const wmsFormatValues =
      capabilities?.Capability?.Request?.GetMap?.Format.filter((v) =>
        v.toLowerCase().includes('image'),
      )
    const preferedFormat =
      wmsFormatValues?.find((v) => v?.toLowerCase?.().includes('image/png')) ??
      wmsFormatValues?.find((v) => v?.toLowerCase?.().includes('png')) ??
      wmsFormatValues?.find((v) => v?.toLowerCase?.().includes('image/jpeg')) ??
      wmsFormatValues?.find((v) => v?.toLowerCase?.().includes('jpeg'))
    if (preferedFormat) {
      values.wms_format = { label: preferedFormat, value: preferedFormat }
    }
  }

  const wmsVersion = capabilities?.version
  if (wmsVersion) {
    if (!row?.wms_version) {
      values.wms_version = wmsVersion
    }
  }

  // set title as label if undefined
  // nope: better to set layer title as label
  // if (!row?.label && capabilities?.Service?.Title) {
  //   values.label = capabilities?.Service?.Title
  // }

  // activate layer, if not too many
  if (!row?.wms_layer && layers?.length === 1) {
    values.wms_layer = {
      value: layers[0].Name,
      label: layers[0].Title,
    }
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
      values.wms_info_format = { label: preferedFormat, value: preferedFormat }
    }
  }

  // enable updating in a single operation
  if (returnValue) return values

  // console.log('hello, getCapabilitiesData, values added to tileLayer:', values)

  if (Object.keys(values).length) {
    await db.tile_layers.update({
      where: { tile_layer_id: row.tile_layer_id },
      data: values,
    })
  }

  return false
}
