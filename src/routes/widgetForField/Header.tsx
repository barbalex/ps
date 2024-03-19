import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'

import { createWidgetForField } from '../../modules/createRows'
import { useElectric } from '../../ElectricProvider'
import { FormHeader } from '../../components/FormHeader'

export const Header = memo(({ autoFocusRef }) => {
  const { widget_for_field_id } = useParams<{ widget_for_field_id: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const { db } = useElectric()!

  const addRow = useCallback(async () => {
    const data = createWidgetForField()
    await db.widgets_for_fields.create({ data })
    navigate({
      pathname: `../${data.widget_for_field_id}`,
      search: searchParams.toString(),
    })
    autoFocusRef.current?.focus()
  }, [autoFocusRef, db.widgets_for_fields, navigate, searchParams])

  const deleteRow = useCallback(async () => {
    await db.widgets_for_fields.delete({
      where: { widget_for_field_id },
    })
    navigate({ pathname: `..`, search: searchParams.toString() })
  }, [db.widgets_for_fields, navigate, widget_for_field_id, searchParams])

  const toNext = useCallback(async () => {
    const widgetsForFields = await db.widgets_for_fields.findMany({
      where: { deleted: false },
      orderBy: { label: 'asc' },
    })
    const len = widgetsForFields.length
    const index = widgetsForFields.findIndex(
      (p) => p.widget_for_field_id === widget_for_field_id,
    )
    const next = widgetsForFields[(index + 1) % len]
    navigate({
      pathname: `../${next.widget_for_field_id}`,
      search: searchParams.toString(),
    })
  }, [db.widgets_for_fields, navigate, widget_for_field_id, searchParams])

  const toPrevious = useCallback(async () => {
    const widgetsForFields = await db.widgets_for_fields.findMany({
      where: { deleted: false },
      orderBy: { label: 'asc' },
    })
    const len = widgetsForFields.length
    const index = widgetsForFields.findIndex(
      (p) => p.widget_for_field_id === widget_for_field_id,
    )
    const previous = widgetsForFields[(index + len - 1) % len]
    navigate({
      pathname: `../${previous.widget_for_field_id}`,
      search: searchParams.toString(),
    })
  }, [db.widgets_for_fields, navigate, widget_for_field_id, searchParams])

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
