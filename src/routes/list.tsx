import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'
import { Switch } from '@fluentui/react-components'

import { Lists as List } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import { list as createListPreset } from '../modules/dataPresets'
import { TextField } from '../components/shared/TextField'
import { TextFieldInactive } from '../components/shared/TextFieldInactive'
import { Jsonb } from '../components/shared/Jsonb'
import { getValueFromChange } from '../modules/getValueFromChange'
import { FormMenu } from '../components/FormMenu'

import '../form.css'

export const Component = () => {
  const { project_id, list_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () => db.lists.liveUnique({ where: { list_id } }),
    [list_id],
  )

  const addRow = useCallback(async () => {
    const newList = createListPreset()
    await db.lists.create({
      data: { ...newList, project_id },
    })
    navigate(`/projects/${project_id}/lists/${newList.list_id}`)
  }, [db.lists, navigate, project_id])

  const deleteRow = useCallback(async () => {
    await db.lists.delete({
      where: {
        list_id,
      },
    })
    navigate(`/projects/${project_id}/lists`)
  }, [db.lists, list_id, navigate, project_id])

  const row: List = results

  const onChange = useCallback(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      db.lists.update({
        where: { list_id },
        data: { [name]: value },
      })
    },
    [db.lists, list_id],
  )

  if (!row) {
    return <div>Loading...</div>
  }

  return (
    <div className="form-container">
      <FormMenu addRow={addRow} deleteRow={deleteRow} tableName="list" />
      <TextFieldInactive label="ID" name="list_id" value={row.list_id} />
      <TextField
        label="Name"
        name="name"
        value={row.name ?? ''}
        onChange={onChange}
        autoFocus
      />
      <Jsonb
        table="lists"
        idField="list_id"
        id={row.list_id}
        data={row.data ?? {}}
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
