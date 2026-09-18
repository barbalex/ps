import { getCapabilities } from '../../../modules/getCapabilities.ts'
import { createWfsServiceLayer } from '../../../modules/createRows.ts'
import { addOperationAtom, store, pgliteDbAtom } from '../../../store.ts'
import type VectorLayers from '../../../models/public/VectorLayers.ts'
import type WfsServices from '../../../models/public/WfsServices.ts'

// loosely typed structure of the parsed capabilities xml
type CapabilitiesNode = { [key: string]: CapabilitiesNode }

export const getWfsCapabilitiesData = async ({
  vectorLayer,
  service,
}: {
  vectorLayer: VectorLayers
  service: WfsServices
}) => {
  const db = store.get(pgliteDbAtom)
  if (!vectorLayer) throw new Error('vector layer is required')
  if (!service.url) throw new Error('wfs service url is required')
  if (!db) throw new Error('db is required')

  const serviceData: Record<string, unknown> = {}

  const capabilitiesData = (await getCapabilities({
    url: service?.url,
    service: 'WFS',
  })) as { HTML?: { BODY?: Record<string, CapabilitiesNode> } } | undefined

  if (!capabilitiesData) return undefined

  const capabilities = capabilitiesData?.HTML?.BODY?.['WFS:WFS_CAPABILITIES']

  // 1. wfs version
  if (!service.version) {
    serviceData.version = capabilities?.['@attributes']?.version
  }

  // 2. info formats
  const operations = (capabilities?.['OWS:OPERATIONSMETADATA']?.[
    'OWS:OPERATION'
  ] ?? []) as CapabilitiesNode[]
  const getFeatureOperation = operations.find(
    (o) =>
      (o?.['@attributes']?.name as unknown as string | undefined) ===
      'GetFeature',
  )
  const infoFormats = ((getFeatureOperation?.['OWS:PARAMETER']?.[
    'OWS:ALLOWEDVALUES'
  ]?.['OWS:VALUE'] ?? []) as CapabilitiesNode[]).map(
    (v) => v?.['#text'] as unknown as string | undefined,
  )

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
      v?.toLowerCase().includes('geojson'),
    )[0] ??
    acceptableInfoFormats.filter((v) =>
      v?.toLowerCase().includes('application/json'),
    )[0] ??
    acceptableInfoFormats[0]
  serviceData.info_format = preferredInfoFormat

  // 3. layers
  let layers = (capabilities?.FEATURETYPELIST?.FEATURETYPE ??
    []) as CapabilitiesNode[]
  // console.log('getWfsCapabilitiesData, layers:', layers)
  // this value can be array OR object!!!
  if (!Array.isArray(layers)) layers = [layers]

  // 4a DefaultCRS: get the first layer's
  const defaultCRS = layers[0]?.DEFAULTCRS?.['#text']
  serviceData.default_crs = defaultCRS
  // console.log('getWfsCapabilitiesData, serviceData:', serviceData)

  // now update vectorLayer
  if (Object.keys(serviceData).length) {
    const columns = Object.keys(serviceData).join(',')
    const values = Object.values(serviceData)
      .map((_, i) => `$${i + 1}`)
      .join(',')
    await db.query(
      `UPDATE wfs_services SET (${columns}) = (${values}) WHERE wfs_service_id = $${
        Object.values(serviceData).length + 1
      }`,
      [...Object.values(serviceData), service.wfs_service_id],
    )
    store.set(addOperationAtom, {
      table: 'wfs_services',
      rowIdName: 'wfs_service_id',
      rowId: service.wfs_service_id,
      operation: 'update',
      draft: serviceData,
    })
  }

  const acceptableLayers = layers
    // accept only layers with crs EPSG:4326
    .filter((l) =>
      (l.OTHERCRS as unknown as CapabilitiesNode[] | undefined)?.map((o) =>
        (o?.['#text'] as unknown as string | undefined)?.includes('EPSG:4326'),
      ),
    )
    // accept only layers with acceptable info formats
    .filter((l) =>
      preferredInfoFormat
        ? (l.OUTPUTFORMATS?.FORMAT as unknown as CapabilitiesNode[] | undefined)?.map(
            (f) =>
              acceptableInfoFormats.includes(
                f?.['#text'] as unknown as string,
              ),
          )
        : true,
    )

  for (const l of acceptableLayers) {
    await createWfsServiceLayer({
      wfsServiceId: service.wfs_service_id,
      name: l.NAME?.['#text'] as unknown as string,
      label: l.TITLE?.['#text'] as unknown as string,
    })
  }

  // single layer? update vectorLayer
  if (
    !vectorLayer?.wfs_service_layer_name &&
    layers?.length === 1 &&
    vectorLayer?.vector_layer_id
  ) {
    await db.query(
      `UPDATE vector_layers SET wfs_service_layer_name = $1, name = $2, label_de = $3 WHERE vector_layer_id = $4`,
      [
        layers[0].Name,
        layers[0].Name,
        layers[0].Title,
        vectorLayer.vector_layer_id,
      ],
    )
    store.set(addOperationAtom, {
      table: 'vector_layers',
      rowIdName: 'vector_layer_id',
      rowId: vectorLayer.vector_layer_id,
      operation: 'update',
      draft: {
        wfs_service_layer_name: layers[0].Name,
        name: layers[0].Name,
        label_de: layers[0].Title,
      },
    })
  }

  return
}
