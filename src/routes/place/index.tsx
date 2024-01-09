import { useCallback, useMemo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'

import { Places as Place } from '../../../generated/client'
import { createPlace } from '../../modules/createRows'
import { useElectric } from '../../ElectricProvider'
import { TextField } from '../../components/shared/TextField'
import { TextFieldInactive } from '../../components/shared/TextFieldInactive'
import { Jsonb } from '../../components/shared/Jsonb'
import { DropdownField } from '../../components/shared/DropdownField'
import { getValueFromChange } from '../../modules/getValueFromChange'
import { FormMenu } from '../../components/FormMenu'

import '../../form.css'

export const Component = () => {
  const navigate = useNavigate()
  const { project_id, subproject_id, place_id } = useParams()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () => db.places.liveUnique({ where: { place_id } }),
    [place_id],
  )

  const addRow = useCallback(async () => {
    const data = await createPlace({ db, project_id, subproject_id })
    await db.places.create({ data })
    navigate(
      `/projects/${project_id}/subprojects/${subproject_id}/places/${data.place_id}`,
    )
  }, [db, navigate, project_id, subproject_id])

  const deleteRow = useCallback(async () => {
    await db.places.delete({
      where: {
        place_id,
      },
    })
    navigate(`/projects/${project_id}/subprojects/${subproject_id}/places`)
  }, [db.places, navigate, place_id, project_id, subproject_id])

  const row: Place = results

  // TODO: only show parent place if level 2 exists in place_levels
  const parentPlaceWhere = useMemo(
    () => ({ deleted: false, level: 1, subproject_id }),
    [subproject_id],
  )

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

  // console.log('place, row:', row)

  return (
    <div className="form-container">
      <FormMenu addRow={addRow} deleteRow={deleteRow} tableName="place" />
      <TextFieldInactive label="ID" name="place_id" value={row.place_id} />
      <TextField
        label="Level"
        name="level"
        type="number"
        value={row.level ?? ''}
        onChange={onChange}
      />
      {row.level === 2 && (
        <DropdownField
          label="Parent Place"
          name="parent_id"
          idField="place_id"
          table="places"
          where={parentPlaceWhere}
          value={row.parent_id ?? ''}
          onChange={onChange}
          autoFocus
        />
      )}
      <Jsonb
        table="places"
        idField="place_id"
        id={row.place_id}
        data={row.data ?? {}}
        autoFocus={row.level !== 2}
      />
    </div>
  )
}
