import type VectorLayerOwnTablesEnum from '../models/public/VectorLayerOwnTablesEnum.ts'

// Configurable per-property styling (vector_layers.display_by_property +
// vector_layer_displays.display_property_value) resolves which properties a
// layer can be styled by and how feature values match a display.

// fields are stored per real table while vector_layers.own_table names the
// layer's view: every observation layer styles the observations table. The
// to_assess/not_to_assign layers are created without own_table_level and span
// both levels (level null); the assigned lines layer has fixed properties and
// no fields.
export const ownTableToFieldsTable = (
  ownTable: VectorLayerOwnTablesEnum | null | undefined,
  ownTableLevel: number | null | undefined,
): { tableName: string | null; level: number | null } => {
  switch (ownTable) {
    case 'places':
    case 'actions':
    case 'checks':
      return { tableName: ownTable, level: ownTableLevel ?? null }
    case 'observations_assigned':
      return { tableName: 'observations', level: ownTableLevel ?? null }
    case 'observations_to_assess':
    case 'observations_not_to_assign':
      return { tableName: 'observations', level: null }
    default:
      return { tableName: null, level: null }
  }
}

// real table columns that are not in the fields table but can be styled by
export const builtInDisplayByProperties: Record<string, string[]> = {
  observations_assigned: ['absence'],
  observations_to_assess: ['absence'],
  observations_not_to_assign: ['absence'],
}

// display_property_value is text while feature properties hold raw jsonb
// values (booleans, numbers): compare via their text representation
export const propertyValueToText = (value: unknown): string | null => {
  if (value === null || value === undefined) return null
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}
