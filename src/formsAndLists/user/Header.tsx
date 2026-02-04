import { useParams, useNavigate } from '@tanstack/react-router'
import { useSetAtom } from 'jotai'
import { usePGlite } from '@electric-sql/pglite-react'
import { useRef, useEffect } from 'react'

import { createUser } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { userIdAtom, addOperationAtom } from '../../store.ts'

const from = '/data/users/$userId'

export const Header = ({ autoFocusRef }) => {
  const setUserId = useSetAtom(userIdAtom)
  const { userId } = useParams({ from })
  const navigate = useNavigate()
  const addOperation = useSetAtom(addOperationAtom)

  const db = usePGlite()

  // Keep a ref to the current userId so it's always fresh in callbacks
  // without this users can only click toNext or toPrevious once
  const userIdRef = useRef(userId)
  useEffect(() => {
    userIdRef.current = userId
  }, [userId])

  const addRow = async () => {
    const id = await createUser({ setUserId })
    if (!id) return

    navigate({ to: `../${id}` })
    autoFocusRef?.current?.focus()
  }

  const deleteRow = async () => {
    try {
      const prevRes = await db.query(`SELECT * FROM users WHERE user_id = $1`, [
        userId,
      ])
      const prev = prevRes?.rows?.[0] ?? {}
      const sql = `DELETE FROM users WHERE user_id = $1`
      await db.query(sql, [userId])
      addOperation({
        table: 'users',
        rowIdName: 'user_id',
        rowId: userId,
        operation: 'delete',
        prev,
      })
      navigate({ to: `..` })
    } catch (error) {
      console.error('Error deleting user:', error)
      // Could add a toast notification here
    }
  }

  const toNext = async () => {
    try {
      const res = await db.query(`SELECT user_id FROM users order by label`)
      const rows = res?.rows
      const len = rows.length
      const index = rows.findIndex((p) => p.user_id === userIdRef.current)
      const next = rows[(index + 1) % len]
      navigate({ to: `../${next.user_id}` })
    } catch (error) {
      console.error('Error navigating to next user:', error)
    }
  }

  const toPrevious = async () => {
    try {
      const res = await db.query(`SELECT user_id FROM users order by label`)
      const rows = res?.rows
      const len = rows.length
      const index = rows.findIndex((p) => p.user_id === userIdRef.current)
      const previous = rows[(index + len - 1) % len]
      navigate({ to: `../${previous.user_id}` })
    } catch (error) {
      console.error('Error navigating to previous user:', error)
    }
  }

  return (
    <FormHeader
      title="User"
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="user"
    />
  )
}
