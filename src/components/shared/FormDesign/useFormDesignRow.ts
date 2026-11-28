import { useFormDesigns } from './useFormDesigns.ts'

export type FormDesignRow = {
  form_design_id: string
  project_id: string
  table_name: string
  table_view_id: string | null
  active: boolean
  design: { content?: unknown[] } | null
}

/**
 * The design row of a form target — the plain form of a table (no
 * tableViewId) or a specific table view — read from the project's designs
 * (FormDesignsProvider). `row` is undefined while they load and when no
 * design exists yet; `loaded` tells the two apart: until it is true,
 * neither the designed nor the auto-generated form may render.
 */
export const useFormDesignRow = ({
  projectId,
  table,
  tableViewId,
}: {
  projectId?: string
  table: string
  tableViewId?: string
}) => {
  const { designs } = useFormDesigns()
  // account tables have no form designs
  if (!projectId) return { row: undefined, loaded: true }
  if (!designs) return { row: undefined, loaded: false }
  const row = designs.find(
    (design) =>
      design.project_id === projectId &&
      design.table_name === table &&
      (design.table_view_id ?? null) === (tableViewId ?? null),
  )
  return { row, loaded: true }
}
