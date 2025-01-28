import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider.tsx'
import { createPlaceUser } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'

export const Header = memo(({ autoFocusRef }) => {
  const { place_id, place_id2, place_user_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const db = usePGlite()

  const addRow = useCallback(async () => {
    const placeUser = createPlaceUser()
    await db.place_users.create({
      data: { ...placeUser, place_id: place_id2 ?? place_id },
    })
    navigate({
      pathname: `../${placeUser.place_user_id}`,
      search: searchParams.toString(),
    })
    autoFocusRef.current?.focus()
  }, [
    autoFocusRef,
    db.place_users,
    navigate,
    place_id,
    place_id2,
    searchParams,
  ])

  const deleteRow = useCallback(async () => {
    await db.place_users.delete({ where: { place_user_id } })
    navigate({ pathname: '..', search: searchParams.toString() })
  }, [db.place_users, place_user_id, navigate, searchParams])

  const toNext = useCallback(async () => {
    const placeUsers = await db.place_users.findMany({
      where: {  place_id: place_id2 ?? place_id },
      orderBy: { label: 'asc' },
    })
    const len = placeUsers.length
    const index = placeUsers.findIndex((p) => p.place_user_id === place_user_id)
    const next = placeUsers[(index + 1) % len]
    navigate({
      pathname: `../${next.place_user_id}`,
      search: searchParams.toString(),
    })
  }, [
    db.place_users,
    navigate,
    place_id,
    place_id2,
    place_user_id,
    searchParams,
  ])

  const toPrevious = useCallback(async () => {
    const placeUsers = await db.place_users.findMany({
      where: {  place_id: place_id2 ?? place_id },
      orderBy: { label: 'asc' },
    })
    const len = placeUsers.length
    const index = placeUsers.findIndex((p) => p.place_user_id === place_user_id)
    const previous = placeUsers[(index + len - 1) % len]
    navigate({
      pathname: `../${previous.place_user_id}`,
      search: searchParams.toString(),
    })
  }, [
    db.place_users,
    navigate,
    place_id,
    place_id2,
    place_user_id,
    searchParams,
  ])

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
