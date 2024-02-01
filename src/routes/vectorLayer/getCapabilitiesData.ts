import getCapabilities from '../../../utils/getCapabilities'
import { dexie, VectorLayer } from '../../../dexieClient'

interface Props {
  row: VectorLayer
  returnValue?: boolean
}

export const getCapabilitiesData = async ({
  row,
  returnValue = false,
}: Props) => {
  if (!row) return
  if (!row.url) return

  console.log('getCapabilitiesDataForVectorLayer, row:', row)

  const values = {}

  const response = await getCapabilities({
    url: row?.url,
    service: 'WFS',
  })

  const capabilities = response?.HTML?.BODY?.['WFS:WFS_CAPABILITIES']

  // console.log('getCapabilitiesDataForVectorLayer, capabilities:', capabilities)

  // 1. wfs version
  if (!row.wfs_version) {
    values.wfs_version = capabilities?.['@attributes']?.version
  }

  // 2. output formats
  const _operations =
    capabilities?.['OWS:OPERATIONSMETADATA']?.['OWS:OPERATION'] ?? []
  const getFeatureOperation = _operations.find(
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
        layer_option_id: `${row.url}/${f.value}/wfs_output_format`,
        vector_layer_id: row.vector_layer_id,
        vector_layer_id: null,
        field: 'output_format',
        value: f.value,
        label: f.label,
      },
      update: {
        vector_layer_id: row.vector_layer_id,
        field: 'output_format',
        value: f.value,
        label: f.label,
      },
      where: {
        layer_option_id: `${row.url}/${f.value}/wfs_output_format`,
      },
    })
  }
  if (!row.output_format) {
    values.output_format = preferredOutputFormat
  }

  // 3. label
  const _label: string | undefined =
    capabilities?.['OWS:SERVICEIDENTIFICATION']?.['OWS:TITLE']?.['#text']
  if (!row.label) {
    values.label = _label
  }

  // 4. layers
  let layers = capabilities?.FEATURETYPELIST?.FEATURETYPE ?? []
  // this value can be array OR object!!!
  if (!Array.isArray(layers)) layers = [layers]
  if (!row._layerOptions) {
    values._layerOptions = layers
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
  }

  // activate layer, if only one
  if (
    !row?.type_name &&
    values._layerOptions?.map &&
    values._layerOptions?.length === 1
  ) {
    values.type_name = values._layerOptions.map((o) => o.value).join(',')
    values.active = 1
  }

  console.log('pvl, getCapabilitiesData, values:', values)

  // enable updating in a single operation
  if (returnValue) return values

  return dexie.vector_layers.update(row.id, values)
}
