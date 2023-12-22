import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'
import { FaPlus, FaMinus } from 'react-icons/fa'
import { Button, Switch } from '@fluentui/react-components'

import { ListValues as ListValue } from '../../../generated/client'
import { listValue as createListValuePreset } from '../modules/dataPresets'
import { useElectric } from '../ElectricProvider'
import { TextField } from '../components/shared/TextField'
import { TextFieldInactive } from '../components/shared/TextFieldInactive'
import { getValueFromChange } from '../modules/getValueFromChange'

import '../form.css'

export const Component = () => {
  const { list_id, list_value_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () => db.list_values.liveUnique({ where: { list_value_id } }),
    [list_value_id],
  )

  const addRow = async () => {
    const newListValue = createListValuePreset()
    await db.list_values.create({
      data: { ...newListValue, project_id },
    })
    navigate(
      `/projects/${project_id}/lists/${list_id}/values/${newListValue.list_value_id}`,
    )
  }

  const deleteRow = async () => {
    await db.list_values.delete({
      where: {
        list_value_id,
      },
    })
    navigate(`/projects/${project_id}/lists/${list_id}/values`)
  }

  const row: ListValue = results

  const onChange = useCallback(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      db.list_values.update({
        where: { list_value_id },
        data: { [name]: value },
      })
    },
    [db.list_values, list_value_id],
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
          title="Add new list value"
        />
        <Button
          size="large"
          icon={<FaMinus />}
          onClick={deleteRow}
          title="Delete list value"
        />
      </div>
      <TextFieldInactive
        label="ID"
        name="list_value_id"
        value={row.list_value_id}
      />
      <TextField
        label="Value"
        name="value"
        value={row.value ?? ''}
        onChange={onChange}
      />
      <Switch
        label="Obsolete"
        name="obsolete"
        checked={row.obsolete ?? false}
        onChange={onChange}
      />
    </div>
  )
}
