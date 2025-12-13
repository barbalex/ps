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
    const res = await createField({ projectId, db })
    const data = res?.rows?.[0]
    navigate({
      to: `/data/fields/${data.field_id}`,
      params: (prev) => ({ ...prev, fieldId: data.field_id }),
    })
    autoFocusRef?.current?.focus()
  }

  const deleteRow = () => {
    db.query(`DELETE FROM fields WHERE field_id = $1`, [fieldId])
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
