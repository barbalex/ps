import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'

import { createFieldType } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'

const from = '/data/field-types/$fieldTypeId'

export const Header = ({ autoFocusRef }) => {
  const { fieldTypeId } = useParams({ from })
  const navigate = useNavigate()

  const db = usePGlite()

  const addRow = async () => {
    const res = await createFieldType({ db })
    const fieldType = res?.rows?.[0]
    navigate({ to: `../${fieldType.field_type_id}` })
    autoFocusRef?.current?.focus()
  }

  const deleteRow = () => {
    db.query(`DELETE FROM field_types WHERE field_type_id = $1`, [fieldTypeId])
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
