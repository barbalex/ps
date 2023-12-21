import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'
import { FaPlus, FaMinus } from 'react-icons/fa'
import { Button, Switch } from '@fluentui/react-components'

import { Places as Place } from '../../../generated/client'
import { place as createPlacePreset } from '../modules/dataPresets'
import { useElectric } from '../ElectricProvider'
import { TextField } from '../components/shared/TextField'
import { TextFieldInactive } from '../components/shared/TextFieldInactive'

import '../form.css'

export const Component = () => {
  const navigate = useNavigate()
  const { project_id, subproject_id, place_id } = useParams<{
    project_id: string
    subproject_id: string
    place_id: string
  }>()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () => db.places.liveUnique({ where: { place_id } }),
    [place_id],
  )

  const addRow = async () => {
    const newPlace = createPlacePreset()
    await db.places.create({
      data: newPlace,
    })
    navigate(
      `/projects/${project_id}/subprojects/${subproject_id}/places/${newPlace.place_id}`,
    )
  }

  const deleteRow = async () => {
    await db.places.delete({
      where: {
        place_id,
      },
    })
    navigate(`/projects/${project_id}/subprojects/${subproject_id}/places`)
  }

  const row: Place = results

  const onChange = useCallback(
    (e, data) => {
      const targetType = e.target.type
      const value =
        targetType === 'checkbox'
          ? data.checked
          : targetType === 'change'
          ? data.value
          : targetType === 'number'
          ? e.target.valueAsNumber ?? null
          : e.target.value ?? null
      const name = e.target.name
      // console.log('onChange', {
      //   name,
      //   targetType,
      //   value,
      // })
      db.places.update({
        where: { place_id },
        data: { [name]: value },
      })
    },
    [db.places, place_id],
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
          title="Add new project"
        />
        <Button
          size="large"
          icon={<FaMinus />}
          onClick={deleteRow}
          title="Delete project"
        />
      </div>
      <TextFieldInactive label="ID" name="place_id" value={row.place_id} />
      <TextField
        label="Subproject"
        name="subproject_id"
        value={row.subproject_id ?? ''}
        onChange={onChange}
      />
      <TextField
        label="Parent Place"
        name="parent_id"
        value={row.parent_id ?? ''}
        onChange={onChange}
      />
      <TextField
        label="Level"
        name="level"
        value={row.level ?? ''}
        onChange={onChange}
      />
      <Switch
        label="Enable uploading files"
        name="files_active"
        checked={row.files_active ?? false}
        onChange={onChange}
      />
    </div>
  )
}
