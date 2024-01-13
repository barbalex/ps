import { useCallback, useRef } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'

import { ObservationSources as ObservationSource } from '../../../generated/client'
import { createObservationSource } from '../modules/createRows'
import { useElectric } from '../ElectricProvider'
import { TextField } from '../components/shared/TextField'
import { TextFieldInactive } from '../components/shared/TextFieldInactive'
import { Jsonb } from '../components/shared/Jsonb'
import { getValueFromChange } from '../modules/getValueFromChange'
import { FormHeader } from '../components/FormHeader'

import '../form.css'

export const Component = () => {
  const { project_id, observation_source_id } = useParams()
  const navigate = useNavigate()

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () =>
      db.observation_sources.liveUnique({ where: { observation_source_id } }),
    [observation_source_id],
  )

  const baseUrl = `/projects/${project_id}/observation-sources`

  const addRow = useCallback(async () => {
    const data = await createObservationSource({
      db,
      project_id,
    })
    await db.observation_sources.create({ data })
    navigate(`${baseUrl}/${data.observation_source_id}`)
    autoFocusRef.current?.focus()
  }, [baseUrl, db, navigate, project_id])

  const deleteRow = useCallback(async () => {
    await db.observation_sources.delete({
      where: { observation_source_id },
    })
    navigate(baseUrl)
  }, [baseUrl, db.observation_sources, navigate, observation_source_id])

  const toNext = useCallback(async () => {
    const observationSources = await db.observation_sources.findMany({
      where: { deleted: false, project_id },
      orderBy: { label: 'asc' },
    })
    const len = observationSources.length
    const index = observationSources.findIndex(
      (p) => p.observation_source_id === observation_source_id,
    )
    const next = observationSources[(index + 1) % len]
    navigate(`${baseUrl}/${next.observation_source_id}`)
  }, [
    baseUrl,
    db.observation_sources,
    navigate,
    observation_source_id,
    project_id,
  ])

  const toPrevious = useCallback(async () => {
    const observationSources = await db.observation_sources.findMany({
      where: { deleted: false, project_id },
      orderBy: { label: 'asc' },
    })
    const len = observationSources.length
    const index = observationSources.findIndex(
      (p) => p.observation_source_id === observation_source_id,
    )
    const previous = observationSources[(index + len - 1) % len]
    navigate(`${baseUrl}/${previous.observation_source_id}`)
  }, [
    baseUrl,
    db.observation_sources,
    navigate,
    observation_source_id,
    project_id,
  ])

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
    <>
      <FormHeader
        title="Observation Source"
        addRow={addRow}
        deleteRow={deleteRow}
        toNext={toNext}
        toPrevious={toPrevious}
        tableName="observation source"
      />
      <div className="form-container">
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
          ref={autoFocusRef}
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
    </>
  )
}
