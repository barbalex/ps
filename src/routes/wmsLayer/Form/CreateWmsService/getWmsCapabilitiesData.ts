import { uuidv7 } from '@kripod/uuidv7'

import { getCapabilities } from '../../../../modules/getCapabilities.ts'

export const getWmsCapabilitiesData = async ({ wmsLayer, service, db }) => {
  if (!service?.url) {
    return console.warn(
      'getWmsCapabilitiesData: returning due to missing service.url',
    )
  }

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

  const values = layers.map(
    (l) =>
      `(${[
        `'${uuidv7()}'`,
        `'${service.wms_service_id}'`,
        l.Name ? `'${l.Name}'` : 'NULL',
        l.Title ? `'${l.Title}'` : 'NULL',
        l.queryable === true,
        l.Style?.[0]?.LegendURL?.[0]?.OnlineResource
          ? `'${l.Style?.[0]?.LegendURL?.[0]?.OnlineResource}'`
          : 'NULL',
      ].join(',')})`,
  )
  const sql = `INSERT INTO wms_service_layers (wms_service_layer_id, wms_service_id, name, label, queryable, legend_url) VALUES ${values.join(
    ',',
  )}`

  // TODO: create wms_service_layers in one transaction
  try {
    await db.query(sql)
  } catch (error) {
    console.error('getWmsCapabilitiesData inserting wms_service_layers', error)
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
