/**
 * The component types of a form design (Puck): one per jsonb key of the
 * table, `field_<field_id>`, and one per real column the form declares,
 * `column_<name>` — next to the layout components (Grid, Heading, …).
 * The saved order of the auto-generated form names its items the same way
 * (see formItemOrder).
 */
const FIELD_PREFIX = 'field_'
const COLUMN_PREFIX = 'column_'

export const fieldComponentType = (fieldId: string) =>
  `${FIELD_PREFIX}${fieldId}`

export const columnComponentType = (column: string) =>
  `${COLUMN_PREFIX}${column}`

export const isFieldComponentType = (type: string) =>
  type.startsWith(FIELD_PREFIX)

export const isColumnComponentType = (type: string) =>
  type.startsWith(COLUMN_PREFIX)

/** the field_id or column name a field or column component type names */
export const nameOfComponentType = (type: string) =>
  isColumnComponentType(type) ? type.slice(COLUMN_PREFIX.length)
  : isFieldComponentType(type) ? type.slice(FIELD_PREFIX.length)
  : undefined

/**
 * The component types placed anywhere in a design — root content and nested
 * slots (e.g. a Grid's children).
 */
export const placedComponentTypes = (
  design: unknown,
  placed = new Set<string>(),
): Set<string> => {
  const items = (design as { content?: unknown[] } | null)?.content
  if (!Array.isArray(items)) return placed
  for (const item of items) {
    if (!item || typeof item !== 'object') continue
    const { type, props } = item as {
      type?: unknown
      props?: Record<string, unknown>
    }
    if (typeof type === 'string') placed.add(type)
    // slots hold nested item arrays (e.g. the Grid's children)
    if (props) {
      for (const value of Object.values(props)) {
        if (Array.isArray(value) && value.length) {
          placedComponentTypes({ content: value }, placed)
        }
      }
    }
  }
  return placed
}

const placedNames = (design: unknown, isKind: (type: string) => boolean) =>
  new Set(
    [...placedComponentTypes(design)]
      .filter(isKind)
      .map(nameOfComponentType)
      .filter((name): name is string => name !== undefined),
  )

/**
 * The field_ids of the jsonb keys placed in a design — used to warn about
 * fields that exist but are not placed (they would be invisible to users of
 * the designed form).
 */
export const placedFieldIds = (design: unknown) =>
  placedNames(design, isFieldComponentType)

/**
 * The names of the real columns placed in a design — a placed column renders
 * inside the design, so its fixed widget outside steps aside.
 */
export const placedColumnNames = (design: unknown) =>
  placedNames(design, isColumnComponentType)
