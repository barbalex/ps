import type { PrimitiveType } from 'react-intl'

/**
 * The tables table views can be built on. The Ansichten config shows one
 * entry per table; each leads to the list of that table's views.
 * Runtime rendering of views is currently implemented for checks only —
 * the others can be configured ahead of their runtime.
 */
export const tableViewTables: {
  tableName: string
  label: { id: string; defaultMessage: string }
}[] = [
  { tableName: 'checks', label: { id: 'oPMDm+', defaultMessage: 'Kontrollen' } },
  { tableName: 'actions', label: { id: 'pH7MgC', defaultMessage: 'Massnahmen' } },
  {
    tableName: 'places',
    label: { id: 'nK8tR4', defaultMessage: 'Orte' },
  },
  {
    tableName: 'subprojects',
    label: { id: 'qW5eT7', defaultMessage: 'Teil-Projekte' },
  },
]

/**
 * Views on these tables are forms on a single row (the entity itself):
 * no row filter, no list, no label_by — only the field group matters.
 */
export const singleRowTableViewTables = new Set(['subprojects'])

export const tableViewTableLabel = (
  tableName: string,
  formatMessage: (
    descriptor: { id: string; defaultMessage: string },
    values?: Record<string, PrimitiveType>,
  ) => string,
) =>
  formatMessage(
    tableViewTables.find((t) => t.tableName === tableName)?.label ?? {
      id: `tableViews.table.${tableName}`,
      defaultMessage: tableName,
    },
  )
