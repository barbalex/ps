import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'

import { WidgetsForFields as WidgetsForField } from '../../../generated/client'
import { widgetForField as createwidgetForFieldPreset } from '../modules/dataPresets'
import { useElectric } from '../ElectricProvider'
import { TextFieldInactive } from '../components/shared/TextFieldInactive'
import { DropdownField } from '../components/shared/DropdownField'
import { getValueFromChange } from '../modules/getValueFromChange'
import { FormMenu } from '../components/FormMenu'

import '../form.css'

export const Component = () => {
  const { widget_for_field_id } = useParams<{ widget_for_field_id: string }>()
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () => db.widgets_for_fields.liveUnique({ where: { widget_for_field_id } }),
    [widget_for_field_id],
  )

  const addRow = useCallback(async () => {
    const newWidgetForField = createwidgetForFieldPreset()
    await db.widgets_for_fields.create({
      data: newWidgetForField,
    })
    navigate(`/widgets-for-fields/${newWidgetForField.widget_for_field_id}`)
  }, [db.widgets_for_fields, navigate])

  const deleteRow = useCallback(async () => {
    await db.widgets_for_fields.delete({
      where: {
        widget_for_field_id,
      },
    })
    navigate(`/widgets-for-fields`)
  }, [db.widgets_for_fields, navigate, widget_for_field_id])

  const row: WidgetsForField = results

  const onChange = useCallback(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      db.widgets_for_fields.update({
        where: { widget_for_field_id },
        data: { [name]: value },
      })
    },
    [db.widgets_for_fields, widget_for_field_id],
  )

  if (!row) {
    return <div>Loading...</div>
  }

  return (
    <div className="form-container">
      <FormMenu
        addRow={addRow}
        deleteRow={deleteRow}
        tableName="widget for field"
      />
      <TextFieldInactive
        label="ID"
        name="widget_for_field_id"
        value={row.widget_for_field_id}
      />
      <DropdownField
        label="Field type"
        name="field_type_id"
        table="field_types"
        value={row.field_type_id ?? ''}
        onChange={onChange}
        autoFocus
      />
      <DropdownField
        label="Widget type"
        name="widget_type_id"
        table="widget_types"
        value={row.widget_type_id ?? ''}
        onChange={onChange}
      />
    </div>
  )
}
