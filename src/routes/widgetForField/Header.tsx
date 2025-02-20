import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { usePGlite } from '@electric-sql/pglite-react'

import { createWidgetForField } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'

export const Header = memo(({ autoFocusRef }) => {
  const { widget_for_field_id } = useParams<{ widget_for_field_id: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const db = usePGlite()

  const addRow = useCallback(async () => {
    const res = await createWidgetForField({ db })
    const data = res.rows[0]
    navigate({
      pathname: `../${data.widget_for_field_id}`,
      search: searchParams.toString(),
    })
    autoFocusRef.current?.focus()
  }, [autoFocusRef, db, navigate, searchParams])

  const deleteRow = useCallback(async () => {
    const sql = `DELETE FROM widgets_for_fields WHERE widget_for_field_id = $1`
    await db.query(sql, [widget_for_field_id])
    navigate({ pathname: `..`, search: searchParams.toString() })
  }, [db, widget_for_field_id, navigate, searchParams])

  const toNext = useCallback(async () => {
    const result = await db.query(
      `SELECT * FROM widgets_for_fields ORDER BY label ASC`,
    )
    const widgetsForFields = result.rows
    const len = widgetsForFields.length
    const index = widgetsForFields.findIndex(
      (p) => p.widget_for_field_id === widget_for_field_id,
    )
    const next = widgetsForFields[(index + 1) % len]
    navigate({
      pathname: `../${next.widget_for_field_id}`,
      search: searchParams.toString(),
    })
  }, [db, navigate, searchParams, widget_for_field_id])

  const toPrevious = useCallback(async () => {
    const result = await db.query(
      `SELECT * FROM widgets_for_fields ORDER BY label ASC`,
    )
    const widgetsForFields = result.rows
    const len = widgetsForFields.length
    const index = widgetsForFields.findIndex(
      (p) => p.widget_for_field_id === widget_for_field_id,
    )
    const previous = widgetsForFields[(index + len - 1) % len]
    navigate({
      pathname: `../${previous.widget_for_field_id}`,
      search: searchParams.toString(),
    })
  }, [db, navigate, searchParams, widget_for_field_id])

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
