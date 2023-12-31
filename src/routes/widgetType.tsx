import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'

import { WidgetTypes as WidgetType } from '../../../generated/client'
import { createWidgetType } from '../modules/createRows'
import { useElectric } from '../ElectricProvider'
import { TextField } from '../components/shared/TextField'
import { TextFieldInactive } from '../components/shared/TextFieldInactive'
import { SwitchField } from '../components/shared/SwitchField'
import { getValueFromChange } from '../modules/getValueFromChange'
import { FormMenu } from '../components/FormMenu'

import '../form.css'

export const Component = () => {
  const { widget_type_id } = useParams<{ widget_type_id: string }>()
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () => db.widget_types.liveUnique({ where: { widget_type_id } }),
    [widget_type_id],
  )

  const addRow = useCallback(async () => {
    const data = createWidgetType()
    await db.widget_types.create({ data })
    navigate(`/widget-types/${data.widget_type_id}`)
  }, [db.widget_types, navigate])

  const deleteRow = useCallback(async () => {
    await db.widget_types.delete({
      where: {
        widget_type_id,
      },
    })
    navigate(`/widget-types`)
  }, [db.widget_types, navigate, widget_type_id])

  const row: WidgetType = results

  const onChange = useCallback(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
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
      <FormMenu addRow={addRow} deleteRow={deleteRow} tableName="widget type" />
      <TextFieldInactive
        label="ID"
        name="widget_type_id"
        value={row.widget_type_id}
      />
      <TextField
        label="Name"
        name="name"
        value={row.name ?? ''}
        onChange={onChange}
        autoFocus
      />
      <SwitchField
        label="Needs a list"
        name="needs_list"
        value={row.needs_list ?? false}
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
