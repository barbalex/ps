import { createContext, useContext } from 'react'

import type { FieldChangeHandler } from '../fieldChange.ts'
import type { FormColumns } from './FormDesignRuntimeContext.tsx'
import type { FormDesignRow } from './useFormDesignRow.ts'

/**
 * What WithFormDesign knows about the form it wraps, for the parts rendered
 * below it: the declared columns and their write path, and the design that
 * applies — including the columns it places, so their fixed widgets can step
 * aside.
 */
export type FormDesignBinding = {
  designRow?: FormDesignRow
  /** a design may exist for this form here: a project table, neither a
   * filter form nor a history comparison */
  designable: boolean
  /** the active design replaces the auto-generated form here */
  designApplies: boolean
  columns?: FormColumns
  /** the form's change handler — the write path of its columns */
  onChange?: FieldChangeHandler
  /** names of the columns placed in the applying design */
  placedColumns: Set<string>
  /** names of the columns the form places after its jsonb fields (the
   * others precede them) — the default order of the auto-generated form */
  columnsAfter: string[]
  /** the auto-generated form lists the columns between the jsonb fields
   * instead of at their fixed positions */
  columnsInList: boolean
}

export const FormDesignBindingContext = createContext<FormDesignBinding | null>(
  null,
)

/** only valid below WithFormDesign, which is the provider */
export const useFormDesignBinding = () => {
  const binding = useContext(FormDesignBindingContext)
  if (!binding) {
    throw new Error(
      "useFormDesignBinding needs a WithFormDesign above — it provides the form's design and columns",
    )
  }
  return binding
}
