import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router'
import { usePGlite } from '@electric-sql/pglite-react'

import { createAccount } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'

export const Header = memo(({ autoFocusRef }) => {
  const { account_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const db = usePGlite()

  const addRow = useCallback(async () => {
    const res = await createAccount({ db })
    const data = res?.rows?.[0]
    navigate({
      pathname: `../${data.account_id}`,
      search: searchParams.toString(),
    })
    autoFocusRef.current?.focus()
  }, [autoFocusRef, db, navigate, searchParams])

  const deleteRow = useCallback(async () => {
    const sql = `DELETE FROM accounts WHERE account_id = $1`
    await db.query(sql, [account_id])
    navigate({ pathname: `..`, search: searchParams.toString() })
  }, [account_id, db, navigate, searchParams])

  const toNext = useCallback(async () => {
    const res = await db.query(`SELECT * FROM accounts order by label`)
    const rows = res?.rows
    const len = rows.length
    const index = rows.findIndex((p) => p.account_id === account_id)
    const next = rows[(index + 1) % len]
    navigate({
      pathname: `../${next.account_id}`,
      search: searchParams.toString(),
    })
  }, [account_id, db, navigate, searchParams])

  const toPrevious = useCallback(async () => {
    const res = await db.query(`SELECT * FROM accounts order by label`)
    const rows = res?.rows
    const len = rows.length
    const index = rows.findIndex((p) => p.account_id === account_id)
    const previous = rows[(index + len - 1) % len]
    navigate({
      pathname: `../${previous.account_id}`,
      search: searchParams.toString(),
    })
  }, [account_id, db, navigate, searchParams])

  return (
    <FormHeader
      title="Account"
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="account"
    />
  )
})
