import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'

import type { FieldChangeHandler } from '../fieldChange.ts'
import type { FieldsWithTypes } from '../Jsonb/index.tsx'

export type FormDesignMode = 'live' | 'preview' | 'print'

/**
 * A real column of the form's table (e.g. places.name), declared by the form
 * so it can be placed in a form design like a jsonb key: the label names the
 * column in the designer's drawer and on its widget, `render` draws the
 * widget. The form closes over the row for the value; the write path is
 * handed in at render time so the preview and the print view stay read-only.
 */
export type FormColumnDef = {
  label: string
  render: (bindings: {
    label: string
    onChange: FieldChangeHandler
  }) => ReactNode
}

/** the placeable columns of a form, keyed by column name */
export type FormColumns = Record<string, FormColumnDef>

/**
 * Everything a rendered field component of a form design needs to bind to
 * the row: the field definitions, the row's jsonb data and the write path.
 * Provided above the Puck editor/renderer so the config's render functions
 * stay stable (a closure over `data` would rebuild the config on every
 * keystroke and remount every widget, losing focus).
 */
export type FormDesignRuntime = {
  fields: Record<string, FieldsWithTypes>
  data: Record<string, unknown>
  mode: FormDesignMode
  table: string
  jsonFieldName: string
  idField: string
  id: string
  /** the real columns that may occur in the design */
  columns?: FormColumns
  /** the form's change handler — writes the columns in live mode only */
  onChange?: FieldChangeHandler
}

/** stands in for the write path where widgets must stay read-only */
export const inertChangeHandler: FieldChangeHandler = () => {
  // nothing is written — in the editor preview and the print view
}

export const FormDesignRuntimeContext = createContext<FormDesignRuntime | null>(
  null,
)

export const useFormDesignRuntime = () =>
  useContext(FormDesignRuntimeContext) as FormDesignRuntime
