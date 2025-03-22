import { useCallback, memo } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'

import { createPlaceUser } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'

const from = 'TODO:'

export const Header = memo(({ autoFocusRef }) => {
  const { placeId, placeId2, placeUserId } = useParams({ from })
  const navigate = useNavigate()

  const db = usePGlite()

  const addRow = useCallback(async () => {
    const res = createPlaceUser({ placeId: placeId2 ?? placeId, db })
    const row = res?.rows?.[0]
    navigate({
      to: `../${row.place_user_id}`,
      params: (prev) => ({ ...prev, placeUserId: row.place_user_id }),
    })
    autoFocusRef.current?.focus()
  }, [autoFocusRef, db, navigate, placeId, placeId2])

  const deleteRow = useCallback(async () => {
    db.query(`DELETE FROM place_users WHERE place_user_id = $1`, [placeUserId])
    navigate({ to: '..' })
  }, [db, placeUserId, navigate])

  const toNext = useCallback(async () => {
    const res = await db.query(
      `SELECT place_user_id FROM place_users WHERE place_id = $1 ORDER BY label`,
      [placeId2 ?? placeId],
    )
    const rows = res?.rows
    const len = rows.length
    const index = rows.findIndex((p) => p.place_user_id === placeUserId)
    const next = rows[(index + 1) % len]
    navigate({
      to: `../${next.place_user_id}`,
      params: (prev) => ({ ...prev, placeUserId: next.place_user_id }),
    })
  }, [db, navigate, placeId, placeId2, placeUserId])

  const toPrevious = useCallback(async () => {
    const res = await db.query(
      `SELECT place_user_id FROM place_users WHERE place_id = $1 ORDER BY label`,
      [placeId2 ?? placeId],
    )
    const rows = res?.rows
    const len = rows.length
    const index = rows.findIndex((p) => p.place_user_id === placeUserId)
    const previous = rows[(index + len - 1) % len]
    navigate({
      to: `../${previous.place_user_id}`,
      params: (prev) => ({ ...prev, placeUserId: previous.place_user_id }),
    })
  }, [db, navigate, placeId, placeId2, placeUserId])

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
