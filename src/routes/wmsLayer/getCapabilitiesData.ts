import { getCapabilities } from '../../modules/getCapabilities.ts'
import {
  Wms_layers as WmsLayer,
  Electric,
} from '../../generated/client/index.ts'
// import { chunkArrayWithMinSize } from '../../modules/chunkArrayWithMinSize'
import {
  createWmsService,
  createWmsServiceLayer,
} from '../../modules/createRows.ts'

interface Props {
  wmsLayer: WmsLayer
  db: Electric
  wmsServiceId: string
}

export const getCapabilitiesData = async ({
  wmsLayer,
  db,
  wmsServiceId,
}: Props) => {
  if (!wmsLayer?.wms_url) return undefined

  // console.log('getCapabilitiesData 1', {
  //   label: row.label,
  //   id: row.wms_layer_id,
  //   db,
  // })

  const serviceData = {}

  const capabilities = await getCapabilities({
    url: wmsLayer.wms_url,
    service: 'WMS',
    db,
  })

  // console.log('getCapabilitiesData 2, capabilities:', capabilities)

  if (!capabilities) return undefined

  // let user choose from layers
  // only layers with crs EPSG:4326
  const layers = (capabilities?.Capability?.Layer?.Layer ?? []).filter((v) =>
    v?.CRS?.includes('EPSG:4326'),
  )
  // console.log('hello, getCapabilitiesData 1, layers:', layers)
  // console.log(
  //   'getCapabilitiesData 3, layer swisstopo pixel farbe:',
  //   layers.find((l) => l.Name === 'ch.swisstopo.pixelkarte-farbe'),
  // )
  // TODO: because upsert errors and single creates are slow
  // https://github.com/electric-sql/electric/issues/916
  // Deleting may not be good because other layers might use the same layer_option_id
  // 1. delete existing service including its layers
  if (wmsLayer.wms_service_layer_name) {
    if (wmsServiceId) {
      try {
        await db.wms_service_layers.delete({
          where: {
            wms_service_id: wmsServiceId,
          },
        })
      } catch (error) {
        console.error('hello, getCapabilitiesData 3, error:', error)
      }
    }
  }

  const imageFormats = capabilities?.Capability?.Request?.GetMap?.Format.filter(
    (v) => v.toLowerCase().includes('image'),
  )
  const preferedFormat =
    imageFormats?.find((v) => v?.toLowerCase?.().includes('image/png')) ??
    imageFormats?.find((v) => v?.toLowerCase?.().includes('png')) ??
    imageFormats?.find((v) => v?.toLowerCase?.().includes('image/jpeg')) ??
    imageFormats?.find((v) => v?.toLowerCase?.().includes('jpeg'))
  if (preferedFormat) {
    serviceData.image_format = preferedFormat
  }
  serviceData.image_formats = imageFormats

  serviceData.wms_version = capabilities?.version

  serviceData.info_formats =
    capabilities?.Capability?.Request?.GetFeatureInfo?.Format ?? null

  // set info_format if undefined
  if (!wmsLayer?.wms_info_format && serviceData.info_formats?.length) {
    // for values see: https://docs.geoserver.org/stable/en/user/services/wms/reference.html#getfeatureinfo
    const preferedFormat =
      serviceData.info_formats.find(
        (v) => v?.toLowerCase?.() === 'application/vnd.ogc.gml',
      ) ??
      serviceData.info_formats.find((v) =>
        v?.toLowerCase?.().includes('application/vnd.ogc.gml'),
      ) ??
      serviceData.info_formats.find((v) =>
        v?.toLowerCase?.().includes('text/plain'),
      ) ??
      serviceData.info_formats.find((v) =>
        v?.toLowerCase?.().includes('application/json'),
      ) ??
      serviceData.info_formats.find((v) =>
        v?.toLowerCase?.().includes('text/javascript'),
      ) ??
      serviceData.info_formats.find((v) =>
        v?.toLowerCase?.().includes('text/html'),
      )
    if (preferedFormat) {
      serviceData.info_format = preferedFormat
    }
  }

  // console.log('hello, getCapabilitiesData, values added to wmsLayer:', values)

  const service = createWmsService(serviceData)

  if (Object.keys(serviceData).length) {
    if (wmsServiceId) {
      // update existing service
      await db.wms_services.update({
        where: { wms_service_id: wmsServiceId },
        data: service,
      })
    } else {
      await db.wms_services.create({ data: service })
    }
  }

  const layersData = layers.map((l) => ({
    value: l.Name,
    label: l.Title,
    queryable: l.queryable,
    legend_url: l.Style?.[0]?.LegendURL?.[0]?.OnlineResource,
  }))
  // console.log('hello, getCapabilitiesData 4, layersData:', layersData)
  // sadly, creating many this errors
  // const chunked = chunkArrayWithMinSize(layersData, 500)
  // for (const chunk of chunked) {
  //   try {
  //     const chunkResult = await db.wms_service_layers.createMany({ data: chunk })
  //     console.log('hello, getCapabilitiesData 5a, chunkResult:', chunkResult)
  //   } catch (error) {
  //     // field value must be a string, number, boolean, null or one of the registered custom value types
  //     console.error('hello, getCapabilitiesData 5b, error:', { error, chunk })
  //   }
  // }

  for (const layerData of layersData) {
    const data = createWmsServiceLayer({
      ...layerData,
      wms_service_id: service.wms_service_id,
    })
    try {
      await db.wms_service_layers.create({ data })
    } catch (error) {
      console.error(
        'hello, getCapabilitiesData 5, error from upserting:',
        error,
      )
    }
  }

  // TODO: should legends be saved in SQLite? can be 700!!!
  // ensure only for layers with wms_layer
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

  // // TODO: these are blobs. How to save in SQLite?
  // // TODO: solve this problem, then set the wms_legend
  // // add legends into row to reduce network activity and make them offline available
  // values.wms_legend = _legendBlobs.length ? _legendBlobs : undefined

  // activate layer, if not too many
  if (!wmsLayer?.wms_service_layer_name && layers?.length === 1) {
    db.wms_layers.update({
      where: { wms_layer_id: wmsLayer.wms_layer_id },
      data: {
        wms_service_layer_name: layers[0].Name,
      },
    })
  }

  return false
}
