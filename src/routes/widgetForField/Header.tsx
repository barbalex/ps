import { useCallback, memo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import { createWidgetForField } from '../../modules/createRows'
import { useElectric } from '../../ElectricProvider'
import { FormHeader } from '../../components/FormHeader'

export const Header = memo(({ autoFocusRef }) => {
  const { widget_for_field_id } = useParams<{ widget_for_field_id: string }>()
  const navigate = useNavigate()

  const { db } = useElectric()!

  const addRow = useCallback(async () => {
    const data = createWidgetForField()
    await db.widgets_for_fields.create({ data })
    navigate(`/widgets-for-fields/${data.widget_for_field_id}`)
    autoFocusRef.current?.focus()
  }, [autoFocusRef, db.widgets_for_fields, navigate])

  const deleteRow = useCallback(async () => {
    await db.widgets_for_fields.delete({
      where: { widget_for_field_id },
    })
    navigate(`/widgets-for-fields`)
  }, [db.widgets_for_fields, navigate, widget_for_field_id])

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
    navigate(`/widgets-for-fields/${next.widget_for_field_id}`)
  }, [db.widgets_for_fields, navigate, widget_for_field_id])

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
    navigate(`/widgets-for-fields/${previous.widget_for_field_id}`)
  }, [db.widgets_for_fields, navigate, widget_for_field_id])

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
