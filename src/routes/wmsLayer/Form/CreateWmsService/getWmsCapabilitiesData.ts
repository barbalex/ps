import { getCapabilities } from '../../../../modules/getCapabilities.ts'
import {
  Wms_layers as WmsLayer,
  Wms_services as WmsService,
  Electric,
} from '../../../../generated/client/index.ts'
// import { chunkArrayWithMinSize } from '../../modules/chunkArrayWithMinSize'
import { createWmsServiceLayer } from '../../../../modules/createRows.ts'

interface Props {
  wmsLayer: WmsLayer
  service: WmsService
  db: Electric
}

export const getWmsCapabilitiesData = async ({
  wmsLayer,
  service,
  db,
}: Props) => {
  if (!service?.url) return undefined

  const serviceData = {}

  const capabilities = await getCapabilities({
    url: service.url,
    service: 'WMS',
    db,
  })

  if (!capabilities) return undefined

  const imageFormats = capabilities?.Capability?.Request?.GetMap?.Format.filter(
    (v) => v.toLowerCase().includes('image'),
  )
  serviceData.image_formats = imageFormats

  const preferedFormat =
    imageFormats?.find((v) => v?.toLowerCase?.().includes('image/png')) ??
    imageFormats?.find((v) => v?.toLowerCase?.().includes('png')) ??
    imageFormats?.find((v) => v?.toLowerCase?.().includes('image/jpeg')) ??
    imageFormats?.find((v) => v?.toLowerCase?.().includes('jpeg'))
  if (preferedFormat) {
    serviceData.image_format = preferedFormat
  }

  serviceData.version = capabilities?.version

  serviceData.info_formats =
    capabilities?.Capability?.Request?.GetFeatureInfo?.Format ?? null

  // set info_format if undefined
  if (!service.info_format && serviceData.info_formats?.length) {
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

  const newServiceData = { ...service, ...serviceData }

  if (Object.keys(serviceData).length) {
    await db.wms_services.update({
      where: { wms_service_id: service.wms_service_id },
      data: newServiceData,
    })
  }
  // let user choose from layers
  // only layers with crs EPSG:4326
  const layers = (capabilities?.Capability?.Layer?.Layer ?? []).filter((v) =>
    v?.CRS?.includes('EPSG:4326'),
  )

  const layersData = layers.map((l) => ({
    name: l.Name,
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

  for await (const layerData of layersData) {
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

  // single layer? update wmsLayer
  if (!wmsLayer?.wms_service_layer_name && layers?.length === 1) {
    db.wms_layers.update({
      where: { wms_layer_id: wmsLayer.wms_layer_id },
      data: {
        wms_service_layer_name: layers[0].Name,
        label: layers[0].Title,
      },
    })
  }

  return false
}
