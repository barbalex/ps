import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { usePGlite } from '@electric-sql/pglite-react'

import { createPlaceUser } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'

export const Header = memo(({ autoFocusRef }) => {
  const { place_id, place_id2, place_user_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const db = usePGlite()

  const addRow = useCallback(async () => {
    const res = createPlaceUser({ place_id: place_id2 ?? place_id, db })
    const placeUser = res?.rows?.[0]
    navigate({
      pathname: `../${placeUser.place_user_id}`,
      search: searchParams.toString(),
    })
    autoFocusRef.current?.focus()
  }, [autoFocusRef, db, navigate, place_id, place_id2, searchParams])

  const deleteRow = useCallback(async () => {
    db.query(`DELETE FROM place_users WHERE place_user_id = $1`, [
      place_user_id,
    ])
    navigate({ pathname: '..', search: searchParams.toString() })
  }, [db, place_user_id, navigate, searchParams])

  const toNext = useCallback(async () => {
    const res = await db.query(
      `SELECT place_user_id FROM place_users WHERE place_id = $1 order by label asc`,
      [place_id2 ?? place_id],
    )
    const placeUsers = res.rows
    const len = placeUsers.length
    const index = placeUsers.findIndex((p) => p.place_user_id === place_user_id)
    const next = placeUsers[(index + 1) % len]
    navigate({
      pathname: `../${next.place_user_id}`,
      search: searchParams.toString(),
    })
  }, [db, navigate, place_id, place_id2, place_user_id, searchParams])

  const toPrevious = useCallback(async () => {
    const res = await db.query(
      `SELECT place_user_id FROM place_users WHERE place_id = $1 order by label asc`,
      [place_id2 ?? place_id],
    )
    const placeUsers = res.rows
    const len = placeUsers.length
    const index = placeUsers.findIndex((p) => p.place_user_id === place_user_id)
    const previous = placeUsers[(index + len - 1) % len]
    navigate({
      pathname: `../${previous.place_user_id}`,
      search: searchParams.toString(),
    })
  }, [db, navigate, place_id, place_id2, place_user_id, searchParams])

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
