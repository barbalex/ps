import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useSetAtom } from 'jotai'
import { usePGlite } from '@electric-sql/pglite-react'

import { createUser } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { userIdAtom } from '../../store.ts'

export const Header = memo(({ autoFocusRef }) => {
  const setUserId = useSetAtom(userIdAtom)
  const { user_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const db = usePGlite()

  const addRow = useCallback(async () => {
    const res = await createUser({ db, setUserId })
    const data = res?.rows?.[0]

    navigate({
      pathname: `../${data.user_id}`,
      search: searchParams.toString(),
    })
    autoFocusRef.current?.focus()
  }, [autoFocusRef, db, navigate, searchParams, setUserId])

  const deleteRow = useCallback(async () => {
    const sql = `DELETE FROM users WHERE user_id = $1`
    await db.query(sql, [user_id])
    navigate({ pathname: `..`, search: searchParams.toString() })
  }, [db, user_id, navigate, searchParams])

  const toNext = useCallback(async () => {
    const res = await db.query(`SELECT * FROM users order by label`)
    const rows = res?.rows
    const len = rows.length
    const index = rows.findIndex((p) => p.user_id === user_id)
    const next = rows[(index + 1) % len]
    navigate({
      pathname: `../${next.user_id}`,
      search: searchParams.toString(),
    })
  }, [db, navigate, searchParams, user_id])

  const toPrevious = useCallback(async () => {
    const res = await db.query(`SELECT * FROM users order by label`)
    const rows = res?.rows
    const len = rows.length
    const index = rows.findIndex((p) => p.user_id === user_id)
    const previous = rows[(index + len - 1) % len]
    navigate({
      pathname: `../${previous.user_id}`,
      search: searchParams.toString(),
    })
  }, [db, navigate, searchParams, user_id])

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
