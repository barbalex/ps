import { useCallback, memo } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { useSetAtom } from 'jotai'
import { usePGlite } from '@electric-sql/pglite-react'

import { createUser } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { userIdAtom } from '../../store.ts'

const from = '/data/_authLayout/users/$userId'

export const Header = memo(({ autoFocusRef }) => {
  const setUserId = useSetAtom(userIdAtom)
  const { userId } = useParams({ from })
  const navigate = useNavigate()

  const db = usePGlite()

  const addRow = useCallback(async () => {
    const res = await createUser({ db, setUserId })
    const data = res?.rows?.[0]

    navigate({ to: `../${data.user_id}` })
    autoFocusRef?.current?.focus()
  }, [autoFocusRef, db, navigate, setUserId])

  const deleteRow = useCallback(async () => {
    const sql = `DELETE FROM users WHERE user_id = $1`
    await db.query(sql, [userId])
    navigate({ to: `..` })
  }, [db, userId, navigate])

  const toNext = useCallback(async () => {
    const res = await db.query(`SELECT user_id FROM users order by label`)
    const rows = res?.rows
    const len = rows.length
    const index = rows.findIndex((p) => p.user_id === userId)
    const next = rows[(index + 1) % len]
    navigate({ to: `../${next.user_id}` })
  }, [db, navigate, userId])

  const toPrevious = useCallback(async () => {
    const res = await db.query(`SELECT user_id FROM users order by label`)
    const rows = res?.rows
    const len = rows.length
    const index = rows.findIndex((p) => p.user_id === userId)
    const previous = rows[(index + len - 1) % len]
    navigate({ to: `../${previous.user_id}` })
  }, [db, navigate, userId])

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
})
