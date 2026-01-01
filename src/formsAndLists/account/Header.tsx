import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'

import { createAccount } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { addOperationAtom } from '../../store.ts'
import type Accounts from '../../models/public/Accounts.ts'

const from = '/data/accounts/$accountId'

export const Header = ({ autoFocusRef }) => {
  const { accountId } = useParams({ from })
  const navigate = useNavigate()
  const addOperation = useSetAtom(addOperationAtom)

  const db = usePGlite()

  const addRow = async () => {
    const res = await createAccount()
    const accountId: Accounts['account_id'] | undefined = res?.rows?.[0]
    if (!accountId) return
    navigate({ to: `../${accountId}` })
    autoFocusRef?.current?.focus()
  }

  const deleteRow = async () => {
    const prevRes = await db.query(
      `SELECT * FROM accounts WHERE account_id = $1`,
      [accountId],
    )
    const prev = prevRes?.rows?.[0] ?? {}
    db.query(`DELETE FROM accounts WHERE account_id = $1`, [accountId])
    addOperation({
      table: 'accounts',
      rowIdName: 'account_id',
      rowId: accountId,
      operation: 'delete',
      prev,
    })
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
