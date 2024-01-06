import { useCallback, useMemo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'

import { PlaceUsers as PlaceUser } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import { placeUser as createNewPlaceUser } from '../modules/createRows'
import { TextFieldInactive } from '../components/shared/TextFieldInactive'
import { DropdownField } from '../components/shared/DropdownField'
import { RadioGroupField } from '../components/shared/RadioGroupField'
import { getValueFromChange } from '../modules/getValueFromChange'
import { FormMenu } from '../components/FormMenu'

import '../form.css'

export const Component = () => {
  const { project_id, subproject_id, place_id, place_id2, place_user_id } =
    useParams()
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () => db.place_users.liveUnique({ where: { place_user_id } }),
    [place_user_id],
  )

  const addRow = useCallback(async () => {
    const newPlaceUser = createNewPlaceUser()
    await db.place_users.create({
      data: { ...newPlaceUser, place_id: place_id2 ?? place_id },
    })
    navigate(
      `/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}${
        place_id2 ? `/places/${place_id2}` : ''
      }/users/${newPlaceUser.place_user_id}`,
    )
  }, [db.place_users, navigate, place_id, place_id2, project_id, subproject_id])

  const deleteRow = useCallback(async () => {
    await db.place_users.delete({
      where: {
        place_user_id,
      },
    })
    navigate(
      `/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}${
        place_id2 ? `/places/${place_id2}` : ''
      }/users`,
    )
  }, [
    db.place_users,
    place_user_id,
    navigate,
    project_id,
    subproject_id,
    place_id,
    place_id2,
  ])

  const row: PlaceUser = results

  const userWhere = useMemo(() => ({ deleted: false }), [])

  const onChange = useCallback(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      db.place_users.update({
        where: { place_user_id },
        data: { [name]: value },
      })
    },
    [db.place_users, place_user_id],
  )

  if (!row) {
    return <div>Loading...</div>
  }

  return (
    <div className="form-container">
      <FormMenu
        addRow={addRow}
        deleteRow={deleteRow}
        tableName="project user"
      />
      <TextFieldInactive
        label="ID"
        name="place_user_id"
        value={row.place_user_id}
      />
      <DropdownField
        label="User"
        name="user_id"
        table="users"
        where={userWhere}
        value={row.user_id ?? ''}
        onChange={onChange}
        autoFocus
      />
      <RadioGroupField
        label="Role"
        name="role"
        list={['reader', 'editor', 'manager']}
        value={row.role ?? ''}
        onChange={onChange}
      />
    </div>
  )
}
