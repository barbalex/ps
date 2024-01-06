import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'

import { Observations as Observation } from '../../../generated/client'
import { observation as createNewObservation } from '../modules/createRows'
import { useElectric } from '../ElectricProvider'
import { TextField } from '../components/shared/TextField'
import { TextFieldInactive } from '../components/shared/TextFieldInactive'
import { Jsonb } from '../components/shared/Jsonb'
import { getValueFromChange } from '../modules/getValueFromChange'
import { FormMenu } from '../components/FormMenu'

import '../form.css'

export const Component = () => {
  const { project_id, observation_id, observation_source_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () => db.observations.liveUnique({ where: { observation_id } }),
    [observation_id],
  )

  const addRow = useCallback(async () => {
    const data = await createNewObservation({
      db,
      project_id,
      observation_source_id,
    })
    await db.observations.create({ data })
    navigate(
      `/projects/${project_id}/observation-sources/${observation_source_id}/observations/${data.observation_id}`,
    )
  }, [db, navigate, observation_source_id, project_id])

  const deleteRow = useCallback(async () => {
    await db.observations.delete({
      where: {
        observation_id,
      },
    })
    navigate(
      `/projects/${project_id}/observation-sources/${observation_source_id}/observations`,
    )
  }, [db.observations, navigate, observation_id, observation_source_id])

  const row: Observation = results

  const onChange = useCallback(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      db.observations.update({
        where: { observation_id },
        data: { [name]: value },
      })
    },
    [db.observations, observation_id],
  )

  if (!row) {
    return <div>Loading...</div>
  }

  return (
    <div className="form-container">
      <FormMenu addRow={addRow} deleteRow={deleteRow} tableName="observation" />
      <TextFieldInactive
        label="ID"
        name="observation_id"
        value={row.observation_id}
      />
      <TextField
        label="Place"
        name="place_id"
        value={row.place_id ?? ''}
        onChange={onChange}
        autoFocus
      />
      <TextFieldInactive
        label="ID in source"
        name="id_in_source"
        value={row.id_in_source ?? ''}
      />
      <TextFieldInactive
        label="Url"
        name="url"
        type="url"
        value={row.url ?? ''}
      />
      <TextFieldInactive
        label="Date"
        name="date"
        type="date"
        value={row.date ?? ''}
      />
      <TextFieldInactive
        label="Author"
        name="author"
        value={row.author ?? ''}
      />
      <Jsonb
        table="observations"
        idField="observation_id"
        id={row.observation_id}
        data={row.data ?? {}}
      />
    </div>
  )
}
