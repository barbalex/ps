import { getCapabilities } from '../../../modules/getCapabilities.ts'
import {
  Vector_layers as VectorLayer,
  Wfs_services as WfsService,
  Electric,
} from '../../../generated/client/index.ts'
import { createWfsServiceLayer } from '../../../modules/createRows.ts'

interface Props {
  vectorLayer: VectorLayer
  service: WfsService
  db: Electric
}

export const getWfsCapabilitiesData = async ({
  vectorLayer,
  service,
  db,
}: Props) => {
  // console.log('getWfsCapabilitiesData', { vectorLayer, service, db })
  if (!vectorLayer) throw new Error('vector layer is required')
  if (!service.url) throw new Error('wfs service url is required')
  if (!db) throw new Error('db is required')

  // console.log('getCapabilitiesDataForVectorLayer, row:', row)

  const serviceData = {}

  const capabilitiesData = await getCapabilities({
    url: service?.url,
    service: 'WFS',
    db,
  })
  // console.log('getWfsCapabilitiesData, capabilitiesData:', capabilitiesData)

  if (!capabilitiesData) return undefined

  const capabilities = capabilitiesData?.HTML?.BODY?.['WFS:WFS_CAPABILITIES']
  // console.log('getWfsCapabilitiesData, capabilities:', capabilities)

  // 1. wfs version
  if (!service.version) {
    serviceData.version = capabilities?.['@attributes']?.version
  }

  // 2. info formats
  const operations =
    capabilities?.['OWS:OPERATIONSMETADATA']?.['OWS:OPERATION'] ?? []
  const getFeatureOperation = operations.find(
    (o) => o?.['@attributes']?.name === 'GetFeature',
  )
  const infoFormats = (
    getFeatureOperation?.['OWS:PARAMETER']?.['OWS:ALLOWEDVALUES']?.[
      'OWS:VALUE'
    ] ?? []
  ).map((v) => v?.['#text'])

  // also accept gml
  // example: https://maps.zh.ch/wfs/VeloparkieranlagenZHWFS
  const acceptableInfoFormats = infoFormats.filter(
    (v) =>
      v?.toLowerCase?.()?.includes('json') ||
      v?.toLowerCase?.()?.includes('gml'),
  )
  serviceData.info_formats = acceptableInfoFormats

  const preferredInfoFormat =
    acceptableInfoFormats.filter((v) =>
      v.toLowerCase().includes('geojson'),
    )[0] ??
    acceptableInfoFormats.filter((v) =>
      v.toLowerCase().includes('application/json'),
    )[0] ??
    acceptableInfoFormats[0]
  serviceData.info_format = preferredInfoFormat

  // 3. layers
  let layers = capabilities?.FEATURETYPELIST?.FEATURETYPE ?? []
  // console.log('getWfsCapabilitiesData, layers:', layers)
  // this value can be array OR object!!!
  if (!Array.isArray(layers)) layers = [layers]

  // 4a DefaultCRS: get the first layer's
  const defaultCRS = layers[0]?.DEFAULTCRS?.['#text']
  serviceData.default_crs = defaultCRS
  // console.log('getWfsCapabilitiesData, serviceData:', serviceData)

  // now update vectorLayer
  if (Object.keys(serviceData).length) {
    await db.wfs_services.update({
      where: { wfs_service_id: service.wfs_service_id },
      data: serviceData,
    })
  }

  const acceptableLayers = layers
    // accept only layers with crs EPSG:4326
    .filter((l) => l.OTHERCRS?.map((o) => o?.['#text']?.includes('EPSG:4326')))
    // accept only layers with acceptable info formats
    .filter((l) =>
      preferredInfoFormat
        ? l.OUTPUTFORMATS?.FORMAT?.map((f) =>
            acceptableInfoFormats.includes(f?.['#text']),
          )
        : true,
    )
  // console.log('getWfsCapabilitiesData, acceptableLayers:', acceptableLayers)

  const layersData = acceptableLayers.map((l) => ({
    name: l.NAME?.['#text'],
    label: l.TITLE?.['#text'],
  }))
  // console.log('getWfsCapabilitiesData, layersData:', layersData)

  // TODO: chunked createMany, see wms
  for await (const layerData of layersData) {
    const data = createWfsServiceLayer({
      ...layerData,
      wfs_service_id: service.wfs_service_id,
    })
    try {
      await db.wfs_service_layers.create({ data })
    } catch (error) {
      console.error(
        'hello, getCapabilitiesData 5, error from upserting:',
        error,
      )
    }
  }

  // single layer? update vectorLayer
  if (!vectorLayer?.wfs_service_layer_name && layers?.length === 1) {
    db.vector_layers.update({
      where: { vector_layer_id: vectorLayer.vector_layer_id },
      data: {
        wfs_service_layer_name: layers[0].Name,
        label: layers[0].Title,
      },
    })
  }

  return
}
