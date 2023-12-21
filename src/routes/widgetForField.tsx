import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'
import { FaPlus, FaMinus } from 'react-icons/fa'
import { Button } from '@fluentui/react-components'

import { WidgetsForFields as WidgetsForField } from '../../../generated/client'
import { widgetForField as createwidgetForFieldPreset } from '../modules/dataPresets'
import { useElectric } from '../ElectricProvider'
import { TextField } from '../components/shared/TextField'
import { TextFieldInactive } from '../components/shared/TextFieldInactive'

import '../form.css'

export const Component = () => {
  const { widget_for_field_id } = useParams<{ widget_for_field_id: string }>()
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () => db.widgets_for_fields.liveUnique({ where: { widget_for_field_id } }),
    [widget_for_field_id],
  )

  const addRow = async () => {
    const newWidgetForField = createwidgetForFieldPreset()
    await db.widgets_for_fields.create({
      data: newWidgetForField,
    })
    navigate(`/widgets_for_fields/${newWidgetForField.widget_for_field_id}`)
  }

  const deleteRow = async () => {
    await db.widgets_for_fields.delete({
      where: {
        widget_for_field_id,
      },
    })
    navigate(`/widgets_for_fields`)
  }

  const row: WidgetsForField = results

  const onChange = useCallback(
    (e, data) => {
      const targetType = e.target.type
      const value =
        targetType === 'checkbox'
          ? data.checked
          : targetType === 'number'
          ? e.target.valueAsNumber ?? null
          : e.target.value ?? null
      const name = e.target.name
      // console.log('onChange', {
      //   name,
      //   targetType,
      //   value,
      // })
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
      <div className="controls">
        <Button
          size="large"
          icon={<FaPlus />}
          onClick={addRow}
          title="Add new project"
        />
        <Button
          size="large"
          icon={<FaMinus />}
          onClick={deleteRow}
          title="Delete project"
        />
      </div>
      <TextFieldInactive
        label="ID"
        name="widget_for_field_id"
        value={row.widget_for_field_id}
      />
      <TextField
        label="Field type"
        name="field_type"
        value={row.field_type ?? ''}
        onChange={onChange}
      />
      <TextField
        label="Widget type"
        name="widget_type"
        value={row.widget_type ?? ''}
        onChange={onChange}
      />
    </div>
  )
}
