import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'

import { Lists as List } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import { list as createList } from '../modules/dataPresets'
import { TextField } from '../components/shared/TextField'
import { TextFieldInactive } from '../components/shared/TextFieldInactive'
import { SwitchField } from '../components/shared/SwitchField'
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
    const data = await createList({ db, project_id })
    await db.lists.create({ data })
    navigate(`/projects/${project_id}/lists/${data.list_id}`)
  }, [db, navigate, project_id])

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
      <SwitchField
        label="Obsolete"
        name="obsolete"
        value={row.obsolete}
        onChange={onChange}
      />
    </div>
  )
}
