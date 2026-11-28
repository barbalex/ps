import { createContext, useContext } from 'react'

import type { FormDesignRow } from './useFormDesignRow.ts'

/**
 * A row of field_sorts: the order of a table's form items. sorted_items
 * names the form's real columns next to its jsonb fields (see formItemOrder);
 * sorted_field_ids keeps the relative order of the fields alone.
 */
export type FieldSortRow = {
  field_sort_id: string
  project_id: string | null
  table_name: string | null
  sorted_field_ids: string[] | null
  sorted_items: string[] | null
}

export type FormDesigns = {
  /** the project's form designs — undefined while they load */
  designs?: FormDesignRow[]
  /** the project's field sorts — undefined while they load */
  fieldSorts?: FieldSortRow[]
  /** the user may design the project's forms (design or own role) */
  mayDesign: boolean
}

/** provided by FormDesignsProvider */
export const FormDesignsContext = createContext<FormDesigns | null>(null)

export const useFormDesigns = () => {
  const formDesigns = useContext(FormDesignsContext)
  if (!formDesigns) {
    throw new Error(
      'The form designs of the project are needed here — mount a FormDesignsProvider above',
    )
  }
  return formDesigns
}

/**
 * The field sort of a table's form: its row once loaded, undefined when the
 * project has none for the table.
 */
export const useFieldSort = (table: string) => {
  const { fieldSorts } = useFormDesigns()
  return {
    row: fieldSorts?.find((sort) => sort.table_name === table),
    loaded: fieldSorts !== undefined,
  }
}
