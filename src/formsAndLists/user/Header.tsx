import { useParams, useNavigate } from '@tanstack/react-router'
import { useSetAtom } from 'jotai'
import { usePGlite } from '@electric-sql/pglite-react'

import { createUser } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { userIdAtom } from '../../store.ts'

const from = '/data/users/$userId'

export const Header = ({ autoFocusRef }) => {
  const setUserId = useSetAtom(userIdAtom)
  const { userId } = useParams({ from })
  const navigate = useNavigate()

  const db = usePGlite()

  const addRow = async () => {
    const res = await createUser({ db, setUserId })
    const data = res?.rows?.[0]

    navigate({ to: `../${data.user_id}` })
    autoFocusRef?.current?.focus()
  }

  const deleteRow = () => {
    const sql = `DELETE FROM users WHERE user_id = $1`
    db.query(sql, [userId])
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
