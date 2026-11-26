import { createContext, useContext, useMemo } from 'react'
import { useParams } from '@tanstack/react-router'
import type { FieldsWithTypes } from '../Jsonb/index.tsx'
import { placeScopedFieldTables } from '../../../modules/fieldTableLabel.ts'

export type FormField = FieldsWithTypes & { reserved: boolean }
export const FieldRows = createContext<FormField[] | undefined>(undefined)

export const useFormFields = (table: string) => {
  const rows = useContext(FieldRows)
  const { projectId, placeId2 } = useParams({ strict: false })
  const scope = table === 'projects' ? null : projectId ?? null
  const level = placeId2 ? 2 : 1
  return useMemo(() => rows?.filter(field =>
    field.project_id === scope && field.table_name === table &&
    (!placeScopedFieldTables.has(table) || field.level === level),
  ), [rows, table, scope, level])
}
