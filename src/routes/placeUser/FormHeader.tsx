import { useCallback, memo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider'
import { createPlaceUser } from '../../modules/createRows'
import { FormHeader } from '../../components/FormHeader'

export const FormHeaderComponent = memo(({ autoFocusRef }) => {
  const { project_id, subproject_id, place_id, place_id2, place_user_id } =
    useParams()
  const navigate = useNavigate()

  const { db } = useElectric()

  const baseUrl = `/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}${
    place_id2 ? `/places/${place_id2}` : ''
  }/users`

  const addRow = useCallback(async () => {
    const placeUser = createPlaceUser()
    await db.place_users.create({
      data: { ...placeUser, place_id: place_id2 ?? place_id },
    })
    navigate(`${baseUrl}/${placeUser.place_user_id}`)
    autoFocusRef.current?.focus()
  }, [autoFocusRef, baseUrl, db.place_users, navigate, place_id, place_id2])

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

  return (
    <FormHeader
      title="Place User"
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="place user"
    />
  )
})
