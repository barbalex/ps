import { useLiveQuery } from '@electric-sql/pglite-react'

export type FormDesignRow = {
  form_design_id: string
  project_id: string
  table_name: string
  table_view_id: string | null
  active: boolean
  design: { content?: unknown[] } | null
}

/**
 * Loads the design row of a form target — the plain form of a table
 * (no tableViewId) or a specific table view. Undefined while loading or
 * when no design exists yet.
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
  const res = useLiveQuery<FormDesignRow>(
    projectId ?
      `SELECT form_design_id, project_id, table_name, table_view_id, active, design
         FROM form_designs
         WHERE project_id = $1 AND table_name = $2
           AND table_view_id ${tableViewId ? '= $3' : 'IS NULL'}
         LIMIT 1`
      // account tables have no form designs; keep the hook unconditional
    : `SELECT form_design_id, project_id, table_name, table_view_id, active, design
         FROM form_designs WHERE false`,
    projectId ?
      tableViewId ? [projectId, table, tableViewId]
      : [projectId, table]
    : [],
  )
  return res?.rows?.[0]
}
