import { useCallback, useMemo, useRef } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'

import { PlaceUsers as PlaceUser } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import { createPlaceUser } from '../modules/createRows'
import { TextFieldInactive } from '../components/shared/TextFieldInactive'
import { DropdownField } from '../components/shared/DropdownField'
import { RadioGroupField } from '../components/shared/RadioGroupField'
import { getValueFromChange } from '../modules/getValueFromChange'
import { FormHeader } from '../components/FormHeader'

import '../form.css'

export const Component = () => {
  const { project_id, subproject_id, place_id, place_id2, place_user_id } =
    useParams()
  const navigate = useNavigate()

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () => db.place_users.liveUnique({ where: { place_user_id } }),
    [place_user_id],
  )

  const baseUrl = useMemo(
    () =>
      `/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}${
        place_id2 ? `/places/${place_id2}` : ''
      }/users`,
    [place_id, place_id2, project_id, subproject_id],
  )

  const addRow = useCallback(async () => {
    const placeUser = createPlaceUser()
    await db.place_users.create({
      data: { ...placeUser, place_id: place_id2 ?? place_id },
    })
    navigate(`${baseUrl}/${placeUser.place_user_id}`)
    autoFocusRef.current?.focus()
  }, [baseUrl, db.place_users, navigate, place_id, place_id2])

  const deleteRow = useCallback(async () => {
    await db.place_users.delete({
      where: {
        place_user_id,
      },
    })
    navigate(baseUrl)
  }, [db.place_users, place_user_id, navigate, baseUrl])

  const toNext = useCallback(async () => {
    const placeUsers = await db.place_users.findMany({
      where: { deleted: false, place_id: place_id2 ?? place_id },
      orderBy: { label: 'asc' },
    })
    const len = placeUsers.length
    const index = placeUsers.findIndex((p) => p.place_user_id === place_user_id)
    const next = placeUsers[(index + 1) % len]
    navigate(`${baseUrl}/${next.place_user_id}`)
  }, [baseUrl, db.place_users, navigate, place_id, place_id2, place_user_id])

  const toPrevious = useCallback(async () => {
    const placeUsers = await db.place_users.findMany({
      where: { deleted: false, place_id: place_id2 ?? place_id },
      orderBy: { label: 'asc' },
    })
    const len = placeUsers.length
    const index = placeUsers.findIndex((p) => p.place_user_id === place_user_id)
    const previous = placeUsers[(index + len - 1) % len]
    navigate(`${baseUrl}/${previous.place_user_id}`)
  }, [baseUrl, db.place_users, navigate, place_id, place_id2, place_user_id])

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
    <div className="form-outer-container">
      <FormHeader
        title="Place User"
        addRow={addRow}
        deleteRow={deleteRow}
        toNext={toNext}
        toPrevious={toPrevious}
        tableName="place user"
      />
      <div className="form-container">
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
          ref={autoFocusRef}
        />
        <RadioGroupField
          label="Role"
          name="role"
          list={['reader', 'editor', 'manager']}
          value={row.role ?? ''}
          onChange={onChange}
        />
      </div>
    </div>
  )
}
