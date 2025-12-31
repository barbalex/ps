import { useParams, useNavigate } from '@tanstack/react-router'
import { useSetAtom } from 'jotai'
import { usePGlite } from '@electric-sql/pglite-react'

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

  const addRow = async () => {
    const id = await createUser({ setUserId })
    if (!id) return

    navigate({ to: `../${id}` })
    autoFocusRef?.current?.focus()
  }

  const deleteRow = async () => {
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
  }

  const toNext = async () => {
    const res = await db.query(`SELECT user_id FROM users order by label`)
    const rows = res?.rows
    const len = rows.length
    const index = rows.findIndex((p) => p.user_id === userId)
    const next = rows[(index + 1) % len]
    navigate({ to: `../${next.user_id}` })
  }

  const toPrevious = async () => {
    const res = await db.query(`SELECT user_id FROM users order by label`)
    const rows = res?.rows
    const len = rows.length
    const index = rows.findIndex((p) => p.user_id === userId)
    const previous = rows[(index + len - 1) % len]
    navigate({ to: `../${previous.user_id}` })
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
