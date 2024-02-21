import { useCallback, memo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import { createWidgetType } from '../../modules/createRows'
import { useElectric } from '../../ElectricProvider'
import { FormHeader } from '../../components/FormHeader'

export const Header = memo(({ autoFocusRef }) => {
  const { widget_type_id } = useParams<{ widget_type_id: string }>()
  const navigate = useNavigate()

  const { db } = useElectric()!

  const addRow = useCallback(async () => {
    const data = createWidgetType()
    await db.widget_types.create({ data })
    navigate(`/widget-types/${data.widget_type_id}`)
    autoFocusRef.current?.focus()
  }, [autoFocusRef, db.widget_types, navigate])

  const deleteRow = useCallback(async () => {
    await db.widget_types.delete({
      where: { widget_type_id },
    })
    navigate(`/widget-types`)
  }, [db.widget_types, navigate, widget_type_id])

  const toNext = useCallback(async () => {
    const widgetTypes = await db.widget_types.findMany({
      where: { deleted: false },
      orderBy: { label: 'asc' },
    })
    const len = widgetTypes.length
    const index = widgetTypes.findIndex(
      (p) => p.widget_type_id === widget_type_id,
    )
    const next = widgetTypes[(index + 1) % len]
    navigate(`/widget-types/${next.widget_type_id}`)
  }, [db.widget_types, navigate, widget_type_id])

  const toPrevious = useCallback(async () => {
    const widgetTypes = await db.widget_types.findMany({
      where: { deleted: false },
      orderBy: { label: 'asc' },
    })
    const len = widgetTypes.length
    const index = widgetTypes.findIndex(
      (p) => p.widget_type_id === widget_type_id,
    )
    const previous = widgetTypes[(index + len - 1) % len]
    navigate(`/widget-types/${previous.widget_type_id}`)
  }, [db.widget_types, navigate, widget_type_id])

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
