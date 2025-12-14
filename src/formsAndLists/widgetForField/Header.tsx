import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'

import { createWidgetForField } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { addOperationAtom } from '../../store.ts'

const from = '/data/widgets-for-fields/$widgetForFieldId'

export const Header = ({ autoFocusRef }) => {
  const { widgetForFieldId } = useParams({ from })
  const navigate = useNavigate()
  const addOperation = useSetAtom(addOperationAtom)

  const db = usePGlite()

  const addRow = async () => {
    const res = await createWidgetForField({ db })
    const data = res?.rows?.[0]
    navigate({ to: `/data/widgets-for-fields/${data.widget_for_field_id}` })
    autoFocusRef?.current?.focus()
  }

  const deleteRow = async () => {
    const sql = `DELETE FROM widgets_for_fields WHERE widget_for_field_id = $1`
    await db.query(sql, [widgetForFieldId])
    navigate({ to: `/data/widgets-for-fields` })
  }

  const toNext = async () => {
    const res = await db.query(
      `SELECT widget_for_field_id FROM widgets_for_fields ORDER BY label`,
    )
    const rows = res?.rows
    const len = rows.length
    const index = rows.findIndex(
      (p) => p.widget_for_field_id === widgetForFieldId,
    )
    const next = rows[(index + 1) % len]
    navigate({
      to: `/data/widgets-for-fields/${next.widget_for_field_id}`,
      params: (prev) => ({
        ...prev,
        widgetForFieldId: next.widget_for_field_id,
      }),
    })
  }

  const toPrevious = async () => {
    const res = await db.query(
      `SELECT widget_for_field_id FROM widgets_for_fields ORDER BY label`,
    )
    const rows = res?.rows
    const len = rows.length
    const index = rows.findIndex(
      (p) => p.widget_for_field_id === widgetForFieldId,
    )
    const previous = rows[(index + len - 1) % len]
    navigate({
      to: `/data/widgets-for-fields/${previous.widget_for_field_id}`,
      params: (prev) => ({
        ...prev,
        widgetForFieldId: previous.widget_for_field_id,
      }),
    })
  }

  return (
    <FormHeader
      title="Widget for field"
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="widget for field"
    />
  )
}
