import { createContext, useContext } from 'react'

import type { FieldsWithTypes } from '../Jsonb/index.tsx'

export type FormDesignMode = 'live' | 'preview' | 'print'

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
}

export const FormDesignRuntimeContext = createContext<FormDesignRuntime | null>(
  null,
)

export const useFormDesignRuntime = () =>
  useContext(FormDesignRuntimeContext) as FormDesignRuntime
