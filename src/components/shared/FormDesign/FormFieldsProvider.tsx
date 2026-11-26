import type { ReactNode } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useParams } from '@tanstack/react-router'
import { FieldRows, type FormField } from './useFormFields.ts'

// Field configuration changes with the project, not the record. Keep it
// subscribed while moving between records (including map inspections).
export const FormFieldsProvider = ({ children }: { children: ReactNode }) => {
  const { projectId } = useParams({ strict: false })
  const result = useLiveQuery<FormField>(`
    SELECT f.*, ft.name AS field_type, wt.name AS widget_type,
      EXISTS (SELECT 1 FROM field_groups g JOIN table_views v USING (field_group_id)
        WHERE g.project_id = f.project_id AND g.table_name = f.table_name
          AND g.sorted_field_ids ? f.field_id::text) AS reserved
    FROM fields f
    JOIN field_types ft USING (field_type_id)
    JOIN widget_types wt USING (widget_type_id)
    LEFT JOIN field_sorts s ON s.project_id = f.project_id AND s.table_name = f.table_name
    WHERE f.project_id = $1 OR f.project_id IS NULL
    ORDER BY array_position(s.sorted_field_ids, f.field_id), f.field_id`,
    [projectId ?? null],
  )
  return <FieldRows.Provider value={result?.rows}>{children}</FieldRows.Provider>
}
