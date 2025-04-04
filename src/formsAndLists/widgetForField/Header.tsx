import { useCallback, memo } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'

import { createWidgetForField } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'

const from = '/data/_authLayout/widgets-for-fields/$widgetForFieldId'

export const Header = memo(({ autoFocusRef }) => {
  const { widgetForFieldId } = useParams({ from })
  const navigate = useNavigate()

  const db = usePGlite()

  const addRow = useCallback(async () => {
    const res = await createWidgetForField({ db })
    const data = res?.rows?.[0]
    navigate({ to: `/data/widgets-for-fields/${data.widget_for_field_id}` })
    autoFocusRef?.current?.focus()
  }, [autoFocusRef, db, navigate])

  const deleteRow = useCallback(async () => {
    const sql = `DELETE FROM widgets_for_fields WHERE widget_for_field_id = $1`
    await db.query(sql, [widgetForFieldId])
    navigate({ to: `/data/widgets-for-fields` })
  }, [db, widgetForFieldId, navigate])

  const toNext = useCallback(async () => {
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
  }, [db, navigate, widgetForFieldId])

  const toPrevious = useCallback(async () => {
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
  }, [db, navigate, widgetForFieldId])

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
})
