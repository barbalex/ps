import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'
import { FaPlus, FaMinus } from 'react-icons/fa'
import { Button, Switch } from '@fluentui/react-components'

import { WidgetTypes as WidgetType } from '../../../generated/client'
import { widgetType as createWidgetTypePreset } from '../modules/dataPresets'
import { useElectric } from '../ElectricProvider'
import { TextField } from '../components/shared/TextField'

import '../form.css'

export const Component = () => {
  const { widget_type_id } = useParams<{ widget_type_id: string }>()
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () => db.widget_types.liveUnique({ where: { widget_type_id } }),
    [widget_type_id],
  )

  const addRow = async () => {
    const newWidgetType = createWidgetTypePreset()
    await db.widget_types.create({
      data: newWidgetType,
    })
    navigate(`/widget-types/${newWidgetType.widget_type_id}`)
  }

  const deleteRow = async () => {
    await db.widget_types.delete({
      where: {
        widget_type_id,
      },
    })
    navigate(`/widget-types`)
  }

  const row: WidgetType = results

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
      db.widget_types.update({
        where: { widget_type_id },
        data: { [name]: value },
      })
    },
    [db.widget_types, widget_type_id],
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
      <TextField
        label="Type"
        name="name"
        value={row.name ?? ''}
        onChange={onChange}
      />
      <Switch
        label="Needs a list"
        name="needs_list"
        checked={row.needs_list ?? false}
        onChange={onChange}
      />
      <TextField
        label="Sort value"
        name="sort"
        value={row.sort ?? ''}
        type="number"
        onChange={onChange}
      />
      <TextField
        label="Comment"
        name="comment"
        value={row.comment ?? ''}
        onChange={onChange}
      />
    </div>
  )
}
