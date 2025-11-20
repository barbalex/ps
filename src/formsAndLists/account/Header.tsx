import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'

import { createAccount } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'

const from = '/data/accounts/$accountId'

export const Header = ({ autoFocusRef }) => {
  const { accountId } = useParams({ from })
  const navigate = useNavigate()

  const db = usePGlite()

  const addRow = async () => {
    const res = await createAccount({ db })
    const data = res?.rows?.[0]
    navigate({ to: `../${data.account_id}` })
    autoFocusRef?.current?.focus()
  }

  const deleteRow = async () => {
    const sql = `DELETE FROM accounts WHERE account_id = $1`
    await db.query(sql, [accountId])
    navigate({ to: `..` })
  }

  const toNext = async () => {
    const res = await db.query(`SELECT account_id FROM accounts order by label`)
    const rows = res?.rows
    const len = rows.length
    const index = rows.findIndex((p) => p.account_id === accountId)
    const next = rows[(index + 1) % len]
    navigate({ to: `../${next.account_id}` })
  }

  const toPrevious = async () => {
    const res = await db.query(`SELECT account_id FROM accounts order by label`)
    const rows = res?.rows
    const len = rows.length
    const index = rows.findIndex((p) => p.account_id === accountId)
    const previous = rows[(index + len - 1) % len]
    navigate({ to: `../${previous.account_id}` })
  }

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
}
