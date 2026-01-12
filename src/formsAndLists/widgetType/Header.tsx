import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'

import { createWidgetType } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { addOperationAtom } from '../../store.ts'

const from = '/data/widget-types/$widgetTypeId'

export const Header = ({ autoFocusRef }) => {
  const { widgetTypeId } = useParams({ from })
  const navigate = useNavigate()
  const addOperation = useSetAtom(addOperationAtom)

  const db = usePGlite()

  const addRow = async () => {
    const widgetTypeId = await createWidgetType()
    navigate({ to: `../${widgetTypeId}` })
    autoFocusRef?.current?.focus()
  }

  const deleteRow = async () => {
    try {
      const prevRes = await db.query(
        `SELECT * FROM widget_types WHERE widget_type_id = $1`,
        [widgetTypeId],
      )
      const prev = prevRes?.rows?.[0] ?? {}
      const sql = `DELETE FROM widget_types WHERE widget_type_id = $1`
      await db.query(sql, [widgetTypeId])
      addOperation({
        table: 'widget_types',
        rowIdName: 'widget_type_id',
        rowId: widgetTypeId,
        operation: 'delete',
        prev,
      })
      navigate({ to: `..` })
    } catch (error) {
      console.error('Error deleting widget type:', error)
    }
  }

  const toNext = async () => {
    try {
      const res = await db.query(
        `SELECT widget_type_id FROM widget_types order by label`,
      )
      const rows = res?.rows
      const len = rows.length
      const index = rows.findIndex((p) => p.widget_type_id === widgetTypeId)
      const next = rows[(index + 1) % len]
      navigate({
        to: `/data/widget-types/${next.widget_type_id}`,
        params: (prev) => ({ ...prev, widgetTypeId: next.widget_type_id }),
      })
    } catch (error) {
      console.error('Error navigating to next widget type:', error)
    }
  }

  const toPrevious = async () => {
    try {
      const res = await db.query(
        `SELECT widget_type_id FROM widget_types order by label`,
      )
      const rows = res?.rows
      const len = rows.length
      const index = rows.findIndex((p) => p.widget_type_id === widgetTypeId)
      const previous = rows[(index + len - 1) % len]
      navigate({
        to: `/data/widget-types/${previous.widget_type_id}`,
        params: (prev) => ({ ...prev, widgetTypeId: previous.widget_type_id }),
      })
    } catch (error) {
      console.error('Error navigating to previous widget type:', error)
    }
  }

  return (
    <FormHeader
      title="Widget type"
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="widget type"
    />
  )
}
