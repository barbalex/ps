import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'

import { ObservationSources as ObservationSource } from '../../../generated/client'
import { createObservationSource } from '../modules/createRows'
import { useElectric } from '../ElectricProvider'
import { TextField } from '../components/shared/TextField'
import { TextFieldInactive } from '../components/shared/TextFieldInactive'
import { Jsonb } from '../components/shared/Jsonb'
import { getValueFromChange } from '../modules/getValueFromChange'
import { FormMenu } from '../components/FormMenu'

import '../form.css'

export const Component = () => {
  const { project_id, observation_source_id } = useParams<{
    project_id: string
    observation_source_id: string
  }>()
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () =>
      db.observation_sources.liveUnique({ where: { observation_source_id } }),
    [observation_source_id],
  )

  const addRow = useCallback(async () => {
    const data = await createObservationSource({
      db,
      project_id,
    })
    await db.observation_sources.create({ data })
    navigate(
      `/projects/${project_id}/observation-sources/${data.observation_source_id}`,
    )
  }, [db, navigate, project_id])

  const deleteRow = useCallback(async () => {
    await db.observation_sources.delete({
      where: {
        observation_source_id,
      },
    })
    navigate(`/projects/${project_id}/observation-sources`)
  }, [db.observation_sources, navigate, observation_source_id, project_id])

  const row: ObservationSource = results

  const onChange = useCallback(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      db.observation_sources.update({
        where: { observation_source_id },
        data: { [name]: value },
      })
    },
    [db.observation_sources, observation_source_id],
  )

  if (!row) {
    return <div>Loading...</div>
  }

  return (
    <div className="form-container">
      <FormMenu
        addRow={addRow}
        deleteRow={deleteRow}
        tableName="observation source"
      />
      <TextFieldInactive
        label="ID"
        name="observation_source_id"
        value={row.observation_source_id}
      />
      <TextField
        label="Name"
        name="name"
        value={row.name ?? ''}
        onChange={onChange}
        autoFocus
      />
      <TextField
        label="Url"
        name="url"
        type="url"
        value={row.url ?? ''}
        onChange={onChange}
      />
      <Jsonb
        table="observation_sources"
        idField="observation_source_id"
        id={row.observation_source_id}
        data={row.data ?? {}}
      />
    </div>
  )
}
