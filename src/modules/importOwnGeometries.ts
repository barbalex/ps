import type { Feature, Geometry } from 'geojson'
import { validate as isUuid } from 'uuid'

import { postgrestClientAtom, store } from '../store.ts'
import { requirePostgrestToken } from './fetchPostgrestToken.ts'

export type GeometryTable = 'projects' | 'places' | 'actions' | 'checks'
export type GeometryTarget = { table: GeometryTable } & (
  { rowId: string } | { rowIds: readonly string[] }
)

export async function importOwnGeometries(
  target: GeometryTarget,
  layers: { name: string; features: Feature[]; uuidField: string }[],
  mode: 'append' | 'replace',
) {
  const allowed = 'rowIds' in target ? new Set(target.rowIds) : null
  const rows: Record<string, Geometry[]> = {}
  for (const { name, features, uuidField } of layers) {
    if (!features.length) throw new Error(`${name}: no features.`)
    for (const [i, feature] of features.entries()) {
      const raw: unknown =
        'rowId' in target ? target.rowId
        : uuidField ? feature.properties?.[uuidField]
        : feature.id
      const id = typeof raw === 'string' ? raw.trim().toLowerCase() : ''
      if (!isUuid(id) || (allowed && !allowed.has(id)))
        throw new Error(
          `${name}, feature ${i + 1}: UUID ${id || '—'} does not match an object in this list.`,
        )
      if (!feature.geometry)
        throw new Error(`${name}, feature ${i + 1}: missing geometry.`)
      ;(rows[id] ??= []).push(feature.geometry)
    }
  }
  const token = await requirePostgrestToken()
  const client = store.get(postgrestClientAtom)
  if (!client) throw new Error('No PostgREST client available')
  const { data, error } = await client
    .rpc('import_own_geometries', {
      p_table: target.table,
      p_rows: rows,
      p_mode: mode,
    })
    .setHeader('Authorization', `Bearer ${token}`)
  if (error) throw new Error(error.message)
  if (data !== Object.keys(rows).length)
    throw new Error(
      'Unexpected import count. Check the objects before retrying.',
    )
  return data
}
