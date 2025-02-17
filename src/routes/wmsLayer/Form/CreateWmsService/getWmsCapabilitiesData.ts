import { getCapabilities } from '../../../../modules/getCapabilities.ts'
import { chunkArrayWithMinSize } from '../../../../modules/chunkArrayWithMinSize.ts'
import { createWmsServiceLayer } from '../../../../modules/createRows.ts'

export const getWmsCapabilitiesData = async ({ wmsLayer, service, db }) => {
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

  const layersData = layers.map((l) =>
    createWmsServiceLayer({
      wms_service_id: service.wms_service_id,
      name: l.Name,
      label: l.Title,
      queryable: l.queryable,
      legend_url: l.Style?.[0]?.LegendURL?.[0]?.OnlineResource,
    }),
  )
  const chunked = chunkArrayWithMinSize(layersData, 500)
  for (const data of chunked) {
    try {
      await db.wms_service_layers.createMany({ data })
    } catch (error) {
      // field value must be a string, number, boolean, null or one of the registered custom value types
      console.error('getWmsCapabilitiesData, error:', { error, data })
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
