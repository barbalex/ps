import { useCallback, memo } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'

import { createWidgetType } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'

const from = '/data/_authLayout/widget-types/$widgetTypeId'

export const Header = memo(({ autoFocusRef }) => {
  const { widgetTypeId } = useParams({ from })
  const navigate = useNavigate()

  const db = usePGlite()

  const addRow = useCallback(async () => {
    const res = createWidgetType({ db })
    const data = res?.rows?.[0]
    navigate({ to: `../${data.widget_type_id}` })
    autoFocusRef.current?.focus()
  }, [autoFocusRef, db, navigate])

  const deleteRow = useCallback(async () => {
    const sql = `DELETE FROM widget_types WHERE widget_type_id = $1`
    await db.query(sql, [widgetTypeId])
    navigate({ to: `..` })
  }, [db, widgetTypeId, navigate])

  const toNext = useCallback(async () => {
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
  }, [db, navigate, widgetTypeId])

  const toPrevious = useCallback(async () => {
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
  }, [db, navigate, widgetTypeId])

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
})
