import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { useRef, useEffect } from 'react'

import { createPlaceUser } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { addOperationAtom } from '../../store.ts'

export const Header = ({ autoFocusRef, from }) => {
  const { placeId, placeId2, placeUserId } = useParams({ from })
  const navigate = useNavigate()
  const addOperation = useSetAtom(addOperationAtom)

  const db = usePGlite()

  // Keep a ref to the current placeUserId so it's always fresh in callbacks
  // without this users can only click toNext or toPrevious once
  const placeUserIdRef = useRef(placeUserId)
  useEffect(() => {
    placeUserIdRef.current = placeUserId
  }, [placeUserId])

  const addRow = async () => {
    const id = await createPlaceUser({ placeId: placeId2 ?? placeId })
    if (!id) return
    navigate({
      to: `../${id}`,
      params: (prev) => ({ ...prev, placeUserId: id }),
    })
    autoFocusRef?.current?.focus()
  }

  const deleteRow = async () => {
    try {
      const prevRes = await db.query(
        `SELECT * FROM place_users WHERE place_user_id = $1`,
        [placeUserId],
      )
      const prev = prevRes?.rows?.[0] ?? {}
      await db.query(`DELETE FROM place_users WHERE place_user_id = $1`, [
        placeUserId,
      ])
      addOperation({
        table: 'place_users',
        rowIdName: 'place_user_id',
        rowId: placeUserId,
        operation: 'delete',
        prev,
      })
      navigate({ to: '..' })
    } catch (error) {
      console.error(error)
    }
  }

  const toNext = async () => {
    try {
      const res = await db.query(
        `SELECT place_user_id FROM place_users WHERE place_id = $1 ORDER BY label`,
        [placeId2 ?? placeId],
      )
      const rows = res?.rows
      const len = rows.length
      const index = rows.findIndex((p) => p.place_user_id === placeUserIdRef.current)
      const next = rows[(index + 1) % len]
      navigate({
        to: `../${next.place_user_id}`,
        params: (prev) => ({ ...prev, placeUserId: next.place_user_id }),
      })
    } catch (error) {
      console.error(error)
    }
  }

  const toPrevious = async () => {
    try {
      const res = await db.query(
        `SELECT place_user_id FROM place_users WHERE place_id = $1 ORDER BY label`,
        [placeId2 ?? placeId],
      )
      const rows = res?.rows
      const len = rows.length
      const index = rows.findIndex((p) => p.place_user_id === placeUserIdRef.current)
      const previous = rows[(index + len - 1) % len]
      navigate({
        to: `../${previous.place_user_id}`,
        params: (prev) => ({ ...prev, placeUserId: previous.place_user_id }),
      })
    } catch (error) {
      console.error(error)
    }
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
