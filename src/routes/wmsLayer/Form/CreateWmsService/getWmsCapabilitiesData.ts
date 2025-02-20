import { getCapabilities } from '../../../../modules/getCapabilities.ts'
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

  if (Object.keys(newServiceData).length) {
    const columns = Object.keys(newServiceData).join(',')
    const values = Object.values(newServiceData)
      .map((_, i) => `$${i + 1}`)
      .join(',')
    await db.query(
      `UPDATE wms_services SET (${columns}) = (${values}) WHERE wms_service_id = $${
        Object.values(newServiceData).length + 1
      }`,
      [...Object.values(newServiceData), service.wms_service_id],
    )
  }
  // let user choose from layers
  // only layers with crs EPSG:4326
  const layers = (capabilities?.Capability?.Layer?.Layer ?? []).filter((v) =>
    v?.CRS?.includes('EPSG:4326'),
  )

  for (const l of layers) {
    await createWmsServiceLayer({
      wms_service_id: service.wms_service_id,
      name: l.Name,
      label: l.Title,
      queryable: l.queryable,
      legend_url: l.Style?.[0]?.LegendURL?.[0]?.OnlineResource,
      db,
    })
  }

  // single layer? update wmsLayer
  if (!wmsLayer?.wms_service_layer_name && layers?.length === 1) {
    db.query(
      `UPDATE wms_layers SET wms_service_layer_name = $1, label = $2 WHERE wms_layer_id = $3`,
      [layers[0].Name, layers[0].Title, wmsLayer.wms_layer_id],
    )
  }

  return false
}
