import { v7 as uuidv7 } from 'uuid'
import proj4 from 'proj4'

import { getCapabilities } from '../../../../modules/getCapabilities.ts'
import { rankedInfoFormats } from '../../../../modules/infoFormats.ts'
import type { Extent } from '../../../../modules/geoQueries.ts'
import {
  beginCapabilitiesFetch,
  endCapabilitiesFetch,
} from '../../../../modules/capabilitiesFetchGuard.ts'
import { addOperationAtom, store, pgliteDbAtom } from '../../../../store.ts'
import type WmsLayers from '../../../../models/public/WmsLayers.ts'
import type WmsServices from '../../../../models/public/WmsServices.ts'

type CapabilitiesLayer = {
  Name?: string | null
  Title?: string | null
  queryable?: boolean
  CRS?: string[]
  Style?: { LegendURL?: { OnlineResource?: string }[] }[]
  BoundingBox?: { crs?: string; extent?: number[] }[] | { crs?: string; extent?: number[] }
}

type Capabilities = {
  version?: string
  Capability?: {
    Request?: {
      GetMap?: { Format?: string[] }
      GetFeatureInfo?: { Format?: string[] }
    }
    Layer?: { Layer?: CapabilitiesLayer[] }
  }
}

type ServiceData = {
  image_formats?: string[]
  image_format?: string
  version?: string
  info_formats?: string[] | null
  info_format?: string
}

type GetWmsCapabilitiesDataArgs = {
  wmsLayer?: WmsLayers | null
  service: WmsServices
}

// published area of use (WGS84, [west, south, east, north]) of crs whose
// projections extrapolate wildly outside it — oblique mercator (LV95/CH1903)
// is off by ~100km for the over-wide boxes geo.admin.ch advertises
const AREA_OF_USE_WGS84: Record<string, [number, number, number, number]> = {
  'EPSG:2056': [5.91, 45.82, 10.49, 47.81],
  'EPSG:21781': [5.91, 45.82, 10.49, 47.81],
}

/**
 * WGS84 extent of a capabilities layer from its BoundingBox elements, or
 * undefined when none is usable. EPSG:4326 boxes pass through unchanged;
 * anything the crs table can project (geo.admin.ch advertises only
 * EPSG:2056/21781) is reprojected via proj4 and clamped to the crs area
 * of use. Powers zoom-to-layer.
 */
export const wgs84ExtentForLayer = (
  layer: CapabilitiesLayer,
  crsProj4ByCode: Map<string, string>,
): Extent | undefined => {
  const boxes = ([] as { crs?: string; extent?: number[] }[]).concat(
    layer.BoundingBox ?? [],
  )
  const box4326 = boxes.find((b) => b.crs === 'EPSG:4326')
  if (box4326?.extent) {
    const [xMin, yMin, xMax, yMax] = box4326.extent
    return { xMin, yMin, xMax, yMax }
  }
  for (const box of boxes) {
    const proj4Definition = box.crs ? crsProj4ByCode.get(box.crs) : undefined
    if (!proj4Definition || !box.extent) continue
    let [xMin, yMin] = proj4(proj4Definition, 'EPSG:4326', [
      box.extent[0]!,
      box.extent[1]!,
    ])
    let [xMax, yMax] = proj4(proj4Definition, 'EPSG:4326', [
      box.extent[2]!,
      box.extent[3]!,
    ])
    const areaOfUse = box.crs ? AREA_OF_USE_WGS84[box.crs] : undefined
    if (areaOfUse) {
      xMin = Math.max(xMin, areaOfUse[0])
      yMin = Math.max(yMin, areaOfUse[1])
      xMax = Math.min(xMax, areaOfUse[2])
      yMax = Math.min(yMax, areaOfUse[3])
    }
    return { xMin, yMin, xMax, yMax }
  }
  return undefined
}

export const getWmsCapabilitiesData = async (
  args: GetWmsCapabilitiesDataArgs,
) => {
  const fetchKey = `wms:${args.service?.wms_service_id}`
  if (!beginCapabilitiesFetch(fetchKey)) {
    // another fetch for this service is already populating the layers
    console.warn(
      'getWmsCapabilitiesData: returning because a fetch is already in flight for service',
      args.service?.wms_service_id,
    )
    return undefined
  }
  try {
    return await getWmsCapabilitiesDataForService(args)
  } finally {
    endCapabilitiesFetch(fetchKey)
  }
}

const getWmsCapabilitiesDataForService = async ({
  wmsLayer,
  service,
}: GetWmsCapabilitiesDataArgs) => {
  if (!service?.url) {
    return console.warn(
      'getWmsCapabilitiesData: returning due to missing service.url',
    )
  }

  const db = store.get(pgliteDbAtom)!
  const serviceData: ServiceData = {}

  const capabilities = (await getCapabilities({
    url: service.url,
    service: 'WMS',
  })) as Capabilities | undefined

  // no Capability object: no capabilities at all, or the url served
  // something that is not a WMS capabilities document (e.g. a website)
  if (!capabilities?.Capability) return undefined

  const imageFormats = capabilities?.Capability?.Request?.GetMap?.Format!.filter(
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

  // set info_format if undefined: the format to ask for first. The click listener
  // falls back through the other advertised ones when the server rejects it
  if (!service.info_format) {
    const [preferedFormat] = rankedInfoFormats(serviceData.info_formats ?? [])
    if (preferedFormat) {
      serviceData.info_format = preferedFormat
    }
  }

  const newServiceData = { ...service, ...serviceData }
  // exclude generated columns that cannot be updated explicitly
  const { label: _label, ...updatableServiceData } = newServiceData

  if (Object.keys(updatableServiceData).length) {
    const columns = Object.keys(updatableServiceData).join(',')
    const values = Object.values(updatableServiceData)
      .map((_, i) => `$${i + 1}`)
      .join(',')
    await db.query(
      `UPDATE wms_services SET (${columns}) = (${values}) WHERE wms_service_id = $${
        Object.values(updatableServiceData).length + 1
      }`,
      [...Object.values(updatableServiceData), service.wms_service_id],
    )
    store.set(addOperationAtom, {
      table: 'wms_services',
      rowIdName: 'wms_service_id',
      rowId: service.wms_service_id,
      operation: 'update',
      draft: updatableServiceData,
    })
  }
  // let user choose from layers
  // only layers with crs EPSG:4326
  const layers = ((capabilities?.Capability?.Layer?.Layer ?? []) as CapabilitiesLayer[]).filter((v) =>
    v?.CRS?.includes('EPSG:4326'),
  )

  const crsRes = await db.query<{ code: string; proj4: string }>(
    `SELECT code, proj4 FROM crs WHERE proj4 IS NOT NULL`,
  )
  const crsProj4ByCode = new Map(
    (crsRes?.rows ?? []).map((row) => [row.code, row.proj4]),
  )

  const layersWithIds = layers.map((l) => ({
    wms_service_layer_id: uuidv7(),
    wms_service_id: service.wms_service_id,
    name: l.Name ?? null,
    label: l.Title ?? null,
    queryable: l.queryable === true,
    legend_url: l.Style?.[0]?.LegendURL?.[0]?.OnlineResource ?? null,
    extent: wgs84ExtentForLayer(l, crsProj4ByCode) ?? null,
  }))

  // replace semantics: another fetch for this service may have populated the
  // layers moments ago (AutoFetchCapabilities racing the fetch button runs
  // sequentially, not concurrently — the in-flight guard cannot catch that).
  // Delete what is there so repeated fetches converge to one batch.
  await db.query(
    `DELETE FROM wms_service_layers WHERE wms_service_id = $1`,
    [service.wms_service_id],
  )
  store.set(addOperationAtom, {
    table: 'wms_service_layers',
    filter: {
      function: 'eq',
      column: 'wms_service_id',
      value: service.wms_service_id,
    },
    operation: 'delete',
  })

  const values = layersWithIds.map(
    (l) =>
      `(${[
        `'${l.wms_service_layer_id}'`,
        `'${l.wms_service_id}'`,
        l.name ? `'${l.name}'` : 'NULL',
        l.label ? `'${l.label}'` : 'NULL',
        l.queryable,
        l.legend_url ? `'${l.legend_url}'` : 'NULL',
        // numeric content only: no quote escaping needed
        l.extent ? `'${JSON.stringify(l.extent)}'` : 'NULL',
      ].join(',')})`,
  )
  const sql = `INSERT INTO wms_service_layers (wms_service_layer_id, wms_service_id, name, label, queryable, legend_url, extent) VALUES ${values.join(
    ',',
  )}`

  // TODO: create wms_service_layers in one transaction
  try {
    await db.query(sql)
  } catch (error) {
    console.error('getWmsCapabilitiesData inserting wms_service_layers', error)
  }
  store.set(addOperationAtom, {
    table: 'wms_service_layers',
    operation: 'insertMany',
    draft: layersWithIds,
  })

  // single layer? update wmsLayer
  if (
    !wmsLayer?.wms_service_layer_name &&
    layers?.length === 1 &&
    wmsLayer?.wms_layer_id
  ) {
    await db.query(
      `UPDATE wms_layers SET wms_service_layer_name = $1, label = $2 WHERE wms_layer_id = $3`,
      [layers[0].Name, layers[0].Title, wmsLayer.wms_layer_id],
    )
    store.set(addOperationAtom, {
      table: 'wms_layers',
      rowIdName: 'wms_layer_id',
      rowId: wmsLayer.wms_layer_id,
      operation: 'update',
      draft: {
        wms_service_layer_name: layers[0].Name,
        label: layers[0].Title,
      },
    })
  }

  return false
}
