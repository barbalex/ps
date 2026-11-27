import type { Feature } from 'geojson'

import type VectorLayerDisplays from '../models/public/VectorLayerDisplays.ts'
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
  current_project_area: ['name', 'label', 'project_id'],
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

// The display a feature is drawn with: the one whose value its property has.
// Features whose value has no display (it appeared in the data after the
// displays were created) are drawn with the layer's first display
export const displayFromFeature = (
  displays: VectorLayerDisplays[] | null | undefined,
  displayByProperty: string | null | undefined,
  feature: Feature | undefined,
): VectorLayerDisplays | undefined => {
  const value =
    displayByProperty == null ? null : feature?.properties?.[displayByProperty]
  const valueText = propertyValueToText(value)
  return (
    displays?.find(({ display_property_value: label }) => {
      if (propertyValueToText(label) === valueText) return true
      // Uploads use jsonb ->> for their display labels. Normalize PostgreSQL
      // spacing in arrays/objects and its decimal notation for numbers.
      if (
        label &&
        value != null &&
        (typeof value === 'object' || typeof value === 'number')
      ) {
        try {
          return propertyValueToText(JSON.parse(label)) === valueText
        } catch {
          return false
        }
      }
      return false
    }) ?? displays?.[0]
  )
}
