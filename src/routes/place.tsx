import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'
import { Switch } from '@fluentui/react-components'

import { Places as Place } from '../../../generated/client'
import { place as createPlacePreset } from '../modules/dataPresets'
import { useElectric } from '../ElectricProvider'
import { TextField } from '../components/shared/TextField'
import { TextFieldInactive } from '../components/shared/TextFieldInactive'
import { getValueFromChange } from '../modules/getValueFromChange'
import { FormMenu } from '../components/FormMenu'

import '../form.css'

export const Component = () => {
  const navigate = useNavigate()
  const { project_id, subproject_id, place_id } = useParams()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () => db.places.liveUnique({ where: { place_id } }),
    [place_id],
  )

  const addRow = useCallback(async () => {
    const newPlace = createPlacePreset()
    await db.places.create({
      data: { ...newPlace, subproject_id },
    })
    navigate(
      `/projects/${project_id}/subprojects/${subproject_id}/places/${newPlace.place_id}`,
    )
  }, [db.places, navigate, project_id, subproject_id])

  const deleteRow = useCallback(async () => {
    await db.places.delete({
      where: {
        place_id,
      },
    })
    navigate(`/projects/${project_id}/subprojects/${subproject_id}/places`)
  }, [db.places, navigate, place_id, project_id, subproject_id])

  const row: Place = results

  const onChange = useCallback(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
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

  console.log('place, row:', row)

  return (
    <div className="form-container">
      <FormMenu addRow={addRow} deleteRow={deleteRow} tableName="place" />
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
