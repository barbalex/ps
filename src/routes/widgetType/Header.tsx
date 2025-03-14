import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router'
import { usePGlite } from '@electric-sql/pglite-react'

import { createWidgetType } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'

export const Header = memo(({ autoFocusRef }) => {
  const { widget_type_id } = useParams<{ widget_type_id: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const db = usePGlite()

  const addRow = useCallback(async () => {
    const res = createWidgetType({ db })
    const data = res?.rows?.[0]
    navigate({
      pathname: `../${data.widget_type_id}`,
      search: searchParams.toString(),
    })
    autoFocusRef.current?.focus()
  }, [autoFocusRef, db, navigate, searchParams])

  const deleteRow = useCallback(async () => {
    const sql = `DELETE FROM widget_types WHERE widget_type_id = $1`
    await db.query(sql, [widget_type_id])
    navigate({ pathname: `..`, search: searchParams.toString() })
  }, [db, widget_type_id, navigate, searchParams])

  const toNext = useCallback(async () => {
    const res = await db.query(
      `SELECT widget_type_id FROM widget_types order by label`,
    )
    const rows = res?.rows
    const len = rows.length
    const index = rows.findIndex((p) => p.widget_type_id === widget_type_id)
    const next = rows[(index + 1) % len]
    navigate({
      pathname: `../${next.widget_type_id}`,
      search: searchParams.toString(),
    })
  }, [db, navigate, searchParams, widget_type_id])

  const toPrevious = useCallback(async () => {
    const res = await db.query(
      `SELECT widget_type_id FROM widget_types order by label`,
    )
    const rows = res?.rows
    const len = rows.length
    const index = rows.findIndex((p) => p.widget_type_id === widget_type_id)
    const previous = rows[(index + len - 1) % len]
    navigate({
      pathname: `../${previous.widget_type_id}`,
      search: searchParams.toString(),
    })
  }, [db, navigate, searchParams, widget_type_id])

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
