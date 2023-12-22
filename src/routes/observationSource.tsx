import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'
import { FaPlus, FaMinus } from 'react-icons/fa'
import { Button } from '@fluentui/react-components'

import { ObservationSources as ObservationSource } from '../../../generated/client'
import { observationSource as createObservationSourcePreset } from '../modules/dataPresets'
import { useElectric } from '../ElectricProvider'
import { TextField } from '../components/shared/TextField'
import { TextFieldInactive } from '../components/shared/TextFieldInactive'
import { getValueFromChange } from '../modules/getValueFromChange'

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

  const addRow = async () => {
    const newObservationSource = createObservationSourcePreset()
    await db.observation_sources.create({
      data: { ...newObservationSource, project_id },
    })
    navigate(
      `/projects/${project_id}/observation-sources/${newObservationSource.observation_source_id}`,
    )
  }

  const deleteRow = async () => {
    await db.observation_sources.delete({
      where: {
        observation_source_id,
      },
    })
    navigate(`/projects/${project_id}/observation-sources`)
  }

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
      <div className="controls">
        <Button
          size="large"
          icon={<FaPlus />}
          onClick={addRow}
          title="Add new observation source"
        />
        <Button
          size="large"
          icon={<FaMinus />}
          onClick={deleteRow}
          title="Delete observation source"
        />
      </div>
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
      />
      <TextField
        label="Url"
        name="url"
        type="url"
        value={row.url ?? ''}
        onChange={onChange}
      />
    </div>
  )
}
