import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'

import { createField } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { addOperationAtom } from '../../store.ts'

export const Header = ({ autoFocusRef, from }) => {
  const { projectId, fieldId } = useParams({ from })
  const navigate = useNavigate()
  const addOperation = useSetAtom(addOperationAtom)

  const db = usePGlite()

  const addRow = async () => {
    const id = await createField({ projectId, db })
    navigate({
      to: `/data/fields/${id}`,
      params: (prev) => ({ ...prev, fieldId: id }),
    })
    autoFocusRef?.current?.focus()
  }

  const deleteRow = async () => {
    const prevRes = await db.query(`SELECT * FROM fields WHERE field_id = $1`, [
      fieldId,
    ])
    const prev = prevRes?.rows?.[0] ?? {}
    db.query(`DELETE FROM fields WHERE field_id = $1`, [fieldId])
    addOperation({
      table: 'fields',
      rowIdName: 'field_id',
      rowId: fieldId,
      operation: 'delete',
      prev,
    })
    navigate({ to: '/data/fields' })
  }

  const toNext = async () => {
    const res = await db.query(`
      SELECT field_id 
      FROM fields 
      WHERE project_id ${projectId ? `= '${projectId}'` : 'IS NULL'} 
      ORDER BY label`)
    const rows = res?.rows
    const len = rows.length
    const index = rows.findIndex((p) => p.field_id === fieldId)
    const next = rows[(index + 1) % len]
    navigate({
      to: `/data/fields/${next.field_id}`,
      params: (prev) => ({ ...prev, fieldId: next.field_id }),
    })
  }

  const toPrevious = async () => {
    const res = await db.query(
      `
      SELECT field_id 
      FROM fields 
      WHERE project_id ${projectId ? `= '${projectId}'` : 'IS NULL'} 
      ORDER BY label`,
    )
    const rows = res?.rows
    const len = rows.length
    const index = rows.findIndex((p) => p.field_id === fieldId)
    const previous = rows[(index + len - 1) % len]
    navigate({
      to: `/data/fields/${previous.field_id}`,
      params: (prev) => ({ ...prev, fieldId: previous.field_id }),
    })
  }

  return (
    <FormHeader
      title="Field"
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="field"
    />
  )
}
