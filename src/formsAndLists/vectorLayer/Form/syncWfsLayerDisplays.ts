// "Anzeigen nach" for wfs layers: the fields and the values of a field come
// from the service (modules/wfsDisplayByProperty.ts). This brings them to the
// layer — the fields to vector_layers.properties, a chosen field to
// display_by_property, and one display per value of it
import { addOperationAtom, pgliteDbAtom, store } from '../../../store.ts'
import {
  fetchWfsLayerFields,
  readWfsFieldValues,
} from '../../../modules/wfsDisplayByProperty.ts'
import {
  clearVectorLayerDisplaysByValue,
  syncVectorLayerDisplaysForValues,
} from './upsertVectorLayerDisplaysForVectorLayer.ts'
import type VectorLayers from '../../../models/public/VectorLayers.ts'
import type WfsServices from '../../../models/public/WfsServices.ts'

type Args = {
  vectorLayerId: string
  service: Pick<WfsServices, 'url' | 'version'>
}

export type WfsDisplaysResult =
  | { ok: true; created: number; removed: number; complete: boolean }
  | { ok: false; reason: 'tooManyValues' }
  | { ok: false; reason: 'unreadable'; message: string }

const getLayer = async (vectorLayerId: string): Promise<VectorLayers> => {
  const res = await store
    .get(pgliteDbAtom)!
    .query(`SELECT * FROM vector_layers WHERE vector_layer_id = $1`, [
      vectorLayerId,
    ])
  const vectorLayer = res?.rows?.[0] as VectorLayers | undefined
  if (!vectorLayer?.wfs_service_layer_name) {
    throw new Error(
      `vector_layer_id ${vectorLayerId} has no wfs layer selected`,
    )
  }
  return vectorLayer
}

const requestOf = (vectorLayer: VectorLayers, service: Args['service']) => {
  const { url, version } = service
  const typeName = vectorLayer.wfs_service_layer_name
  if (!url || !typeName) {
    throw new Error(
      `vector_layer_id ${vectorLayer.vector_layer_id} has no wfs url or layer`,
    )
  }
  return { url, version, typeName }
}

/**
 * Reads the layer's fields from its schema and caches them in
 * vector_layers.properties — once: they are read again only on demand.
 */
export const cacheWfsLayerFields = async ({
  vectorLayerId,
  service,
}: Args): Promise<string[]> => {
  const vectorLayer = await getLayer(vectorLayerId)
  const fields = await fetchWfsLayerFields(requestOf(vectorLayer, service))
  const cached = vectorLayer.properties
  const unchanged =
    Array.isArray(cached) &&
    cached.length === fields.length &&
    cached.every((field, index) => field === fields[index])
  if (!unchanged) {
    await store
      .get(pgliteDbAtom)!
      .query(
        `UPDATE vector_layers SET properties = $1 WHERE vector_layer_id = $2`,
        [JSON.stringify(fields), vectorLayerId],
      )
    store.set(addOperationAtom, {
      table: 'vector_layers',
      rowIdName: 'vector_layer_id',
      rowId: vectorLayerId,
      operation: 'update',
      draft: { properties: fields },
      prev: { ...vectorLayer },
    })
  }
  return fields
}

/**
 * Displays the layer by a field: its values are read first — a field with too
 * many of them leaves the layer untouched — then the field is stored and the
 * missing displays created. Choosing another field drops the displays of the
 * values it does not have (when its values were read completely).
 */
export const setWfsDisplayByProperty = async ({
  vectorLayerId,
  service,
  displayByProperty,
}: Args & { displayByProperty: string | null }): Promise<WfsDisplaysResult> => {
  const vectorLayer = await getLayer(vectorLayerId)
  const values =
    displayByProperty ?
      await readWfsFieldValues({
        ...requestOf(vectorLayer, service),
        vectorLayerId,
        field: displayByProperty,
      })
    : null
  if (values && !values.ok) return values

  await store
    .get(pgliteDbAtom)!
    .query(
      `UPDATE vector_layers SET display_by_property = $1 WHERE vector_layer_id = $2`,
      [displayByProperty, vectorLayerId],
    )
  store.set(addOperationAtom, {
    table: 'vector_layers',
    rowIdName: 'vector_layer_id',
    rowId: vectorLayerId,
    operation: 'update',
    draft: { display_by_property: displayByProperty },
    prev: { ...vectorLayer },
  })
  // no field: the displays of the values are gone, one without a value remains
  if (!values) {
    return {
      ok: true,
      ...(await clearVectorLayerDisplaysByValue(vectorLayerId)),
      complete: true,
    }
  }

  const synced = await syncVectorLayerDisplaysForValues({
    vectorLayerId,
    values: values.values,
    removeVanished:
      values.complete && displayByProperty !== vectorLayer.display_by_property,
  })
  return { ok: true, ...synced, complete: values.complete }
}

/**
 * Reads the fields and the values of the displayed-by field anew — the
 * service's data changes. Displays are added for new values, none is
 * removed: one styled in advance for a value still to come must survive
 */
export const reReadWfsDisplayBy = async (
  args: Args,
): Promise<WfsDisplaysResult> => {
  await cacheWfsLayerFields(args)
  const vectorLayer = await getLayer(args.vectorLayerId)
  const field = vectorLayer.display_by_property
  if (!field) return { ok: true, created: 0, removed: 0, complete: true }

  const values = await readWfsFieldValues({
    ...requestOf(vectorLayer, args.service),
    vectorLayerId: args.vectorLayerId,
    field,
  })
  if (!values.ok) return values
  const synced = await syncVectorLayerDisplaysForValues({
    vectorLayerId: args.vectorLayerId,
    values: values.values,
    removeVanished: false,
  })
  return { ok: true, ...synced, complete: values.complete }
}
