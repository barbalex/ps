import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'
import { Switch } from '@fluentui/react-components'

import { ListValues as ListValue } from '../../../generated/client'
import { listValue as createListValuePreset } from '../modules/dataPresets'
import { useElectric } from '../ElectricProvider'
import { TextField } from '../components/shared/TextField'
import { TextFieldInactive } from '../components/shared/TextFieldInactive'
import { getValueFromChange } from '../modules/getValueFromChange'
import { FormMenu } from '../components/FormMenu'

import '../form.css'

export const Component = () => {
  const { project_id, list_id, list_value_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () => db.list_values.liveUnique({ where: { list_value_id } }),
    [list_value_id],
  )

  const addRow = useCallback(async () => {
    const newListValue = createListValuePreset()
    await db.list_values.create({
      data: { ...newListValue, list_id },
    })
    navigate(
      `/projects/${project_id}/lists/${list_id}/values/${newListValue.list_value_id}`,
    )
  }, [db.list_values, list_id, navigate, project_id])

  const deleteRow = useCallback(async () => {
    await db.list_values.delete({
      where: {
        list_value_id,
      },
    })
    navigate(`/projects/${project_id}/lists/${list_id}/values`)
  }, [db.list_values, list_id, list_value_id, navigate, project_id])

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
      <FormMenu addRow={addRow} deleteRow={deleteRow} tableName="list value" />
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
