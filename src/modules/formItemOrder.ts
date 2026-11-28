import {
  columnComponentType,
  fieldComponentType,
  isFieldComponentType,
} from './formDesignComponents.ts'

/**
 * The order of a form's items — its real columns next to its jsonb fields —
 * in the auto-generated form. Items are named like the components of a form
 * design: `field_<field_id>` and `column_<name>`.
 *
 * The saved order (field_sorts.sorted_items) wins for the items it names.
 * Items it does not name — new fields, columns that only apply to some rows
 * or users — take the place the form gives them in its fixed layout: columns
 * before the fields at the top, columns after the fields at the bottom,
 * fields at the end of the fields. With nothing saved the result is that
 * fixed layout itself.
 */
export const formItemOrder = ({
  saved,
  columnsBefore,
  columnsAfter,
  fields,
}: {
  saved?: string[] | null
  /** the columns the form places before its fields, in order */
  columnsBefore: string[]
  /** the columns the form places after its fields, in order */
  columnsAfter: string[]
  /** the jsonb fields (field_ids) in the order of the project's field sort */
  fields: string[]
}): string[] => {
  const after = new Set(columnsAfter.map(columnComponentType))
  const existing = new Set([...after])
  for (const column of columnsBefore) existing.add(columnComponentType(column))
  for (const field of fields) existing.add(fieldComponentType(field))

  // the saved order, down to the items that still exist
  const known = (saved ?? []).filter((item) => existing.has(item))
  const placed = new Set(known)

  // where the fields end: after the last saved field — or, with none saved,
  // where the fields sit in the fixed layout: before the first column that
  // follows them, else at the end
  let fieldsEnd = known.findLastIndex(isFieldComponentType) + 1
  if (fieldsEnd === 0) {
    const firstAfter = known.findIndex((item) => after.has(item))
    fieldsEnd = firstAfter === -1 ? known.length : firstAfter
  }

  return [
    ...columnsBefore
      .filter((column) => !placed.has(columnComponentType(column)))
      .map(columnComponentType),
    ...known.slice(0, fieldsEnd),
    ...fields
      .filter((field) => !placed.has(fieldComponentType(field)))
      .map(fieldComponentType),
    ...known.slice(fieldsEnd),
    ...columnsAfter
      .filter((column) => !placed.has(columnComponentType(column)))
      .map(columnComponentType),
  ]
}

/**
 * The displayed items in their new order, merged back into the full order:
 * the displayed items take their new places in sequence, items that are not
 * displayed (hidden fields) stay where they are.
 */
export const withDisplayOrder = ({
  order,
  displayed,
  reordered,
}: {
  /** the full order of the form's items */
  order: string[]
  /** the displayed items, in the order they were shown */
  displayed: string[]
  /** the same items after a move */
  reordered: string[]
}): string[] => {
  const isDisplayed = new Set(displayed)
  let next = 0
  return order.map((item) =>
    isDisplayed.has(item) ? (reordered[next++] ?? item) : item,
  )
}

/** the field_ids in an item order — for field_sorts.sorted_field_ids */
export const fieldIdsOfOrder = (order: string[]) =>
  order.filter(isFieldComponentType).map((item) => item.slice('field_'.length))
