import { getCapabilities } from '../../../modules/getCapabilities.ts'
import {
  Vector_layers as VectorLayer,
  Electric,
} from '../../../generated/client/index.ts'

interface Props {
  row: VectorLayer
  returnValue?: boolean
  db: Electric
}

export const getCapabilitiesData = async ({
  row,
  returnValue = false,
  db,
}: Props) => {
  if (!row) throw new Error('row is required')
  if (!row.wfs_url) throw new Error('row.wfs_url is required')
  if (!db) throw new Error('db is required')

  // console.log('getCapabilitiesDataForVectorLayer, row:', row)

  const values = {}

  const response = await getCapabilities({
    url: row?.wfs_url,
    service: 'WFS',
  })

  const capabilities = response?.HTML?.BODY?.['WFS:WFS_CAPABILITIES']

  // console.log('getCapabilitiesDataForVectorLayer, capabilities:', capabilities)

  // 1. wfs version
  if (!row.wfs_version) {
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
    await db.layer_options.upsert({
      create: {
        layer_option_id: `${row.wfs_url}/wfs_output_format/${f.value}`,
        vector_layer_id: row.vector_layer_id,
        field: 'wfs_output_format',
        value: f.value,
        label: f.label,
      },
      update: {
        vector_layer_id: row.vector_layer_id,
        field: 'wfs_output_format',
        value: f.value,
        label: f.label,
      },
      where: {
        layer_option_id: `${row.wfs_url}/wfs_output_format/${f.value}`,
      },
    })
  }
  if (!row.wfs_output_format) {
    values.wfs_output_format = {
      label: preferredOutputFormat,
      value: preferredOutputFormat,
    }
  }

  // 3. label
  const label: string | undefined =
    capabilities?.['OWS:SERVICEIDENTIFICATION']?.['OWS:TITLE']?.['#text']
  if (!row.label) {
    values.label = label
  }

  // 4. layers
  let layers = capabilities?.FEATURETYPELIST?.FEATURETYPE ?? []
  console.log('hello vector layers getCapabilitiesData', { layers })
  // this value can be array OR object!!!
  if (!Array.isArray(layers)) layers = [layers]
  const layerOptions = layers
    .filter(
      (l) =>
        l.OTHERCRS?.map((o) => o?.['#text']?.includes('EPSG:4326')) ||
        l.DefaultCRS?.map((o) => o?.['#text']?.includes('EPSG:4326')),
    )
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
    await db.layer_options.upsert({
      create: {
        layer_option_id: `${row.wfs_url}/wfs_layer/${o.value}`,
        vector_layer_id: row.vector_layer_id,
        field: 'wfs_layer',
        value: o.value,
        label: o.label,
      },
      update: {
        vector_layer_id: row.vector_layer_id,
        field: 'wfs_layer',
        value: o.value,
        label: o.label,
      },
      where: {
        layer_option_id: `${row.wfs_url}/wfs_layer/${o.value}`,
      },
    })
  }

  // activate layer, if only one
  if (
    !row?.wfs_layer &&
    layerOptions?.length === 1 &&
    layerOptions?.[0]?.value
  ) {
    values.wfs_layer = layerOptions?.[0]
    values.active = true
  }

  // console.log('hello vector layers getCapabilitiesData', {
  //   values,
  //   layerOptions,
  //   acceptableOutputFormats,
  // })

  // enable updating in a single operation
  if (returnValue) return values

  return db.vector_layers.update({
    where: { vector_layer_id: row.vector_layer_id },
    data: values,
  })
}
