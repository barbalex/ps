import { getCapabilities } from '../../../modules/getCapabilities.ts'
import {
  Vector_layers as VectorLayer,
  Wfs_services as WfsService,
  Electric,
} from '../../../generated/client/index.ts'

interface Props {
  vectorLayer: VectorLayer
  returnValue?: boolean
  db: Electric
}

export const getWfsCapabilitiesData = async ({
  vectorLayer,
  returnValue = false,
  db,
}: Props) => {
  console.log('getWfsCapabilitiesData', { vectorLayer, returnValue, db })
  if (!vectorLayer) throw new Error('vector layer is required')
  const wfsService: WfsService | undefined = vectorLayer?.wfs_services
  console.log('getWfsCapabilitiesData, wfsService:', wfsService)
  if (!wfsService.url) throw new Error('wfs service url is required')
  if (!db) throw new Error('db is required')

  // console.log('getCapabilitiesDataForVectorLayer, row:', row)

  const values = {}

  const response = await getCapabilities({
    url: wfsService?.url,
    service: 'WFS',
    db,
  })

  const capabilities = response?.HTML?.BODY?.['WFS:WFS_CAPABILITIES']

  // TODO: see if can extract whether a layer is queryable
  console.log('getCapabilitiesDataForVectorLayer, capabilities:', capabilities)

  // 1. wfs version
  if (!wfsService.version) {
    values.wfs_version = capabilities?.['@attributes']?.version
  }

  // 2. output formats
  const operations =
    capabilities?.['OWS:OPERATIONSMETADATA']?.['OWS:OPERATION'] ?? []
  const getFeatureOperation = operations.find(
    (o) => o?.['@attributes']?.name === 'GetFeature',
  )
  const outputFormats = (
    getFeatureOperation?.['OWS:PARAMETER']?.['OWS:ALLOWEDVALUES']?.[
      'OWS:VALUE'
    ] ?? []
  ).map((v) => v?.['#text'])

  // also accept gml
  // example: https://maps.zh.ch/wfs/VeloparkieranlagenZHWFS
  const acceptableOutputFormats = outputFormats.filter(
    (v) =>
      v?.toLowerCase?.()?.includes('json') ||
      v?.toLowerCase?.()?.includes('gml'),
  )
  const preferredOutputFormat =
    acceptableOutputFormats.filter((v) =>
      v.toLowerCase().includes('geojson'),
    )[0] ??
    acceptableOutputFormats.filter((v) =>
      v.toLowerCase().includes('application/json'),
    )[0] ??
    acceptableOutputFormats[0]
  for (const f of acceptableOutputFormats) {
    try {
      await db.layer_options.upsert({
        create: {
          layer_option_id: `${vectorLayer.wfs_url}/wfs_output_format/${f.value}`,
          service_url: vectorLayer.wfs_url,
          field: 'wfs_output_format',
          value: f.value,
          vector_layer_id: vectorLayer.vector_layer_id,
          label: f.label,
        },
        update: {
          service_url: vectorLayer.wfs_url,
          field: 'wfs_output_format',
          value: f.value,
          vector_layer_id: vectorLayer.vector_layer_id,
          label: f.label,
        },
        where: {
          layer_option_id: `${vectorLayer.wfs_url}/wfs_output_format/${f.value}`,
        },
      })
    } catch (error) {
      console.log(
        'vector layers getCapabilitiesData, error when upserting acceptableOutputFormats to layer_options:',
        error,
      )
    }
  }
  if (!vectorLayer.wfs_output_format) {
    values.wfs_output_format = {
      label: preferredOutputFormat,
      value: preferredOutputFormat,
    }
  }

  // 3. label
  const label: string | undefined =
    capabilities?.['OWS:SERVICEIDENTIFICATION']?.['OWS:TITLE']?.['#text']
  if (!vectorLayer.label) {
    values.label = label
  }

  // 4. layers
  let layers = capabilities?.FEATURETYPELIST?.FEATURETYPE ?? []
  // console.log('hello vector layers getCapabilitiesData, layers:', layers)
  // this value can be array OR object!!!
  if (!Array.isArray(layers)) layers = [layers]
  // 4a DefaultCRS: get the first layer's
  const defaultCRS = layers[0]?.DEFAULTCRS?.['#text']
  if (!vectorLayer.wfs_default_crs) {
    values.wfs_default_crs = defaultCRS
  }
  const layerOptions = layers
    .filter((l) => l.OTHERCRS?.map((o) => o?.['#text']?.includes('EPSG:4326')))
    .filter((l) =>
      preferredOutputFormat
        ? l.OUTPUTFORMATS?.FORMAT?.map((f) =>
            acceptableOutputFormats.includes(f?.['#text']),
          )
        : true,
    )
    .map((v) => ({
      label: v.TITLE?.['#text'] ?? v.NAME?.['#text'],
      value: v.NAME?.['#text'],
    }))

  for (const o of layerOptions) {
    try {
      await db.layer_options.upsert({
        create: {
          layer_option_id: `${vectorLayer.wfs_url}/wfs_layer/${o.value}`,
          service_url: vectorLayer.wfs_url,
          field: 'wfs_layer',
          value: o.value,
          vector_layer_id: vectorLayer.vector_layer_id,
          label: o.label,
        },
        update: {
          service_url: vectorLayer.wfs_url,
          field: 'wfs_layer',
          value: o.value,
          vector_layer_id: vectorLayer.vector_layer_id,
          label: o.label,
        },
        where: {
          layer_option_id: `${vectorLayer.wfs_url}/wfs_layer/${o.value}`,
        },
      })
    } catch (error) {
      console.log(
        'vector layers getCapabilitiesData, error when upserting layerOptions to layer_options:',
        error,
      )
    }
  }

  // activate layer, if only one
  if (
    !vectorLayer?.wfs_layer &&
    layerOptions?.length === 1 &&
    layerOptions?.[0]?.value
  ) {
    values.wfs_layer = layerOptions?.[0]
    const layerPresentation = await db.layer_presentations.findFirst({
      where: { vector_layer_id: vectorLayer.vector_layer_id },
    })
    db.layer_presentations.update({
      where: {
        layer_presentation_id: layerPresentation.layer_presentation_id,
      },
      data: { active: true },
    })
  }

  try {
    await db.vector_layers.update({
      where: { vector_layer_id: vectorLayer.vector_layer_id },
      data: values,
    })
  } catch (error) {
    console.log(
      'vector layers getCapabilitiesData, error when updating vector_layers:',
      error,
    )
  }

  // enable updating in a single operation
  if (returnValue) return values

  return
}
