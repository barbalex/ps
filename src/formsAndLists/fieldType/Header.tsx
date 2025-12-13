import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'

import { createFieldType } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { addOperationAtom } from '../../store.ts'

const from = '/data/field-types/$fieldTypeId'

export const Header = ({ autoFocusRef }) => {
  const { fieldTypeId } = useParams({ from })
  const navigate = useNavigate()
  const addOperation = useSetAtom(addOperationAtom)

  const db = usePGlite()

  const addRow = async () => {
    const res = await createFieldType({ db })
    const fieldType = res?.rows?.[0]
    navigate({ to: `../${fieldType.field_type_id}` })
    autoFocusRef?.current?.focus()
  }

  const deleteRow = async () => {
    const prevRes = await db.query(
      `SELECT * FROM field_types WHERE field_type_id = $1`,
      [fieldTypeId],
    )
    const prev = prevRes?.rows?.[0] ?? {}
    db.query(`DELETE FROM field_types WHERE field_type_id = $1`, [fieldTypeId])
    addOperation({
      table: 'field_types',
      rowIdName: 'field_type_id',
      rowId: fieldTypeId,
      operation: 'delete',
      prev,
    })
    navigate({ to: `..` })
  }

  const toNext = async () => {
    const res = await db.query(
      `SELECT field_type_id FROM field_types order by label`,
    )
    const rows = res?.rows
    const len = rows.length
    const index = rows.findIndex((p) => p.field_type_id === fieldTypeId)
    const next = rows[(index + 1) % len]
    navigate({
      to: `/data/field-types/${next.field_type_id}`,
      params: (prev) => ({ ...prev, fieldTypeId: next.field_type_id }),
    })
  }

  const toPrevious = async () => {
    const res = await db.query(
      `SELECT field_type_id FROM field_types order by label`,
    )
    const rows = res?.rows
    const len = rows.length
    const index = rows.findIndex((p) => p.field_type_id === fieldTypeId)
    const previous = rows[(index + len - 1) % len]
    navigate({
      to: `/data/field-types/${previous.field_type_id}`,
      params: (prev) => ({ ...prev, fieldTypeId: previous.field_type_id }),
    })
  }

  return (
    <FormHeader
      title="Field type"
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="field type"
    />
  )
}
