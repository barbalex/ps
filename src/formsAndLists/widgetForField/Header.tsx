import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
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

  const countRes = useLiveQuery(
    'SELECT COUNT(*) as count FROM widgets_for_fields',
  )
  const rowCount = countRes?.rows?.[0]?.count ?? 2

  const addRow = async () => {
    const widgetForFieldId = await createWidgetForField()
    navigate({ to: `/data/widgets-for-fields/${widgetForFieldId}` })
    autoFocusRef?.current?.focus()
  }

  const deleteRow = async () => {
    try {
      const prevRes = await db.query(
        `SELECT * FROM widgets_for_fields WHERE widget_for_field_id = $1`,
        [widgetForFieldId],
      )
      const prev = prevRes?.rows?.[0] ?? {}
      const sql = `DELETE FROM widgets_for_fields WHERE widget_for_field_id = $1`
      await db.query(sql, [widgetForFieldId])
      addOperation({
        table: 'widgets_for_fields',
        rowIdName: 'widget_for_field_id',
        rowId: widgetForFieldId,
        operation: 'delete',
        prev,
      })
      navigate({ to: `/data/widgets-for-fields` })
    } catch (error) {
      console.error('Error deleting widget for field:', error)
    }
  }

  const toNext = async () => {
    try {
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
    } catch (error) {
      console.error('Error navigating to next widget for field:', error)
    }
  }

  const toPrevious = async () => {
    try {
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
    } catch (error) {
      console.error('Error navigating to previous widget for field:', error)
    }
  }

  return (
    <FormHeader
      title="Widget for field"
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      toNextDisabled={rowCount <= 1}
      toPreviousDisabled={rowCount <= 1}
      tableName="widget for field"
    />
  )
}
