import { useLiveQuery } from '@electric-sql/pglite-react'
import { useParams } from '@tanstack/react-router'

import type { FieldsWithTypes } from '../Jsonb/index.tsx'

/**
 * The fields of a table in form order — the same query the auto-generated
 * Jsonb form runs. `enabled` false runs a dead query (hooks must not be
 * conditional), for surfaces not currently rendering a design.
 */
export const useFormDesignFields = ({
  table,
  enabled,
}: {
  table: string
  enabled: boolean
}) => {
  const { projectId, placeId2 } = useParams({ strict: false })
  const useProjectId = !!projectId && table !== 'projects'
  const sql = `
      SELECT
        fields.*,
        field_types.name as field_type,
        widget_types.name as widget_type
      FROM fields
        INNER JOIN field_types USING (field_type_id)
        INNER JOIN widget_types USING (widget_type_id)
        LEFT JOIN unnest(
            ARRAY(SELECT sorted_field_ids FROM field_sorts WHERE table_name = fields.table_name and project_id = fields.project_id)
          ) WITH ORDINALITY t(field_id, ord) USING (field_id)
      WHERE
        fields.table_name = $1
        and fields.project_id ${useProjectId ? `= '${projectId}'` : 'IS NULL'}
        ${table === 'places' ? ` and level = $2` : ''}
      ORDER BY t.ord`
  const res = useLiveQuery<FieldsWithTypes>(
    enabled ? sql : `SELECT * FROM fields WHERE false`,
    enabled ?
      ((table === 'places' ? [table, placeId2 ? 2 : 1] : [table]) as never[])
    : [],
  )
  return res?.rows ?? []
}
