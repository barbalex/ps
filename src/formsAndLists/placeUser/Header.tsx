import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'

import { createPlaceUser } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { addOperationAtom } from '../../store.ts'

export const Header = ({ autoFocusRef, from }) => {
  const { placeId, placeId2, placeUserId } = useParams({ from })
  const navigate = useNavigate()
  const addOperation = useSetAtom(addOperationAtom)

  const db = usePGlite()

  const addRow = async () => {
    const res = createPlaceUser({ placeId: placeId2 ?? placeId, db })
    const row = res?.rows?.[0]
    navigate({
      to: `../${row.place_user_id}`,
      params: (prev) => ({ ...prev, placeUserId: row.place_user_id }),
    })
    autoFocusRef?.current?.focus()
  }

  const deleteRow = async () => {
    const prevRes = await db.query(
      `SELECT * FROM place_users WHERE place_user_id = $1`,
      [placeUserId],
    )
    const prev = prevRes?.rows?.[0] ?? {}
    db.query(`DELETE FROM place_users WHERE place_user_id = $1`, [placeUserId])
    addOperation({
      table: 'place_users',
      rowIdName: 'place_user_id',
      rowId: placeUserId,
      operation: 'delete',
      prev,
    })
    navigate({ to: '..' })
  }

  const toNext = async () => {
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
  }

  const toPrevious = async () => {
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
  }

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
}
