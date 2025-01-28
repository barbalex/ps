import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { usePGlite } from '@electric-sql/pglite-react'

import { createWidgetType } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'

export const Header = memo(({ autoFocusRef }) => {
  const { widget_type_id } = useParams<{ widget_type_id: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const db = usePGlite()

  const addRow = useCallback(async () => {
    const data = createWidgetType()
    await db.widget_types.create({ data })
    navigate({
      pathname: `../${data.widget_type_id}`,
      search: searchParams.toString(),
    })
    autoFocusRef.current?.focus()
  }, [autoFocusRef, db.widget_types, navigate, searchParams])

  const deleteRow = useCallback(async () => {
    await db.widget_types.delete({
      where: { widget_type_id },
    })
    navigate({ pathname: `..`, search: searchParams.toString() })
  }, [db.widget_types, navigate, widget_type_id, searchParams])

  const toNext = useCallback(async () => {
    const widgetTypes = await db.widget_types.findMany({
      orderBy: { label: 'asc' },
    })
    const len = widgetTypes.length
    const index = widgetTypes.findIndex(
      (p) => p.widget_type_id === widget_type_id,
    )
    const next = widgetTypes[(index + 1) % len]
    navigate({
      pathname: `../${next.widget_type_id}`,
      search: searchParams.toString(),
    })
  }, [db.widget_types, navigate, widget_type_id, searchParams])

  const toPrevious = useCallback(async () => {
    const widgetTypes = await db.widget_types.findMany({
      orderBy: { label: 'asc' },
    })
    const len = widgetTypes.length
    const index = widgetTypes.findIndex(
      (p) => p.widget_type_id === widget_type_id,
    )
    const previous = widgetTypes[(index + len - 1) % len]
    navigate({
      pathname: `../${previous.widget_type_id}`,
      search: searchParams.toString(),
    })
  }, [db.widget_types, navigate, widget_type_id, searchParams])

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
