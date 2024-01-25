import { useCallback, useRef } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'

import { Observations as Observation } from '../../../generated/client'
import { createObservation } from '../modules/createRows'
import { useElectric } from '../ElectricProvider'
import { TextField } from '../components/shared/TextField'
import { TextFieldInactive } from '../components/shared/TextFieldInactive'
import { Jsonb } from '../components/shared/Jsonb'
import { getValueFromChange } from '../modules/getValueFromChange'
import { DateField } from '../components/shared/DateField'
import { FormHeader } from '../components/FormHeader'

import '../form.css'

export const Component = () => {
  const { project_id, observation_id, observation_source_id } = useParams()
  const navigate = useNavigate()

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const { db } = useElectric()
  const { results } = useLiveQuery(
    db.observations.liveUnique({ where: { observation_id } }),
  )

  const baseUrl = `/projects/${project_id}/observation-sources/${observation_source_id}/observations`

  const addRow = useCallback(async () => {
    const data = await createObservation({
      db,
      project_id,
      observation_source_id,
    })
    await db.observations.create({ data })
    navigate(`${baseUrl}/${data.observation_id}`)
    autoFocusRef.current?.focus()
  }, [baseUrl, db, navigate, observation_source_id, project_id])

  const deleteRow = useCallback(async () => {
    await db.observations.delete({
      where: {
        observation_id,
      },
    })
    navigate(baseUrl)
  }, [baseUrl, db.observations, navigate, observation_id])

  const toNext = useCallback(async () => {
    const observations = await db.observations.findMany({
      where: { deleted: false, observation_source_id },
      orderBy: { label: 'asc' },
    })
    const len = observations.length
    const index = observations.findIndex(
      (p) => p.observation_id === observation_id,
    )
    const next = observations[(index + 1) % len]
    navigate(`${baseUrl}/${next.observation_id}`)
  }, [
    baseUrl,
    db.observations,
    navigate,
    observation_id,
    observation_source_id,
  ])

  const toPrevious = useCallback(async () => {
    const observations = await db.observations.findMany({
      where: { deleted: false, observation_source_id },
      orderBy: { label: 'asc' },
    })
    const len = observations.length
    const index = observations.findIndex(
      (p) => p.observation_id === observation_id,
    )
    const previous = observations[(index + len - 1) % len]
    navigate(`${baseUrl}/${previous.observation_id}`)
  }, [
    baseUrl,
    db.observations,
    navigate,
    observation_id,
    observation_source_id,
  ])

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

  // TODO: inactivate these fields
  // observations are only imported, not created
  return (
    <div className="form-outer-container">
      <FormHeader
        title="Observation"
        addRow={addRow}
        deleteRow={deleteRow}
        toNext={toNext}
        toPrevious={toPrevious}
        tableName="observation"
      />
      <div className="form-container">
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
          ref={autoFocusRef}
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
        <DateField
          label="Date"
          name="date"
          value={row.date ?? ''}
          onChange={onChange}
        />
        <TextField
          label="Author"
          name="author"
          value={row.author ?? ''}
          onChange={onChange}
        />
        <Jsonb
          table="observations"
          idField="observation_id"
          id={row.observation_id}
          data={row.data ?? {}}
        />
      </div>
    </div>
  )
}
