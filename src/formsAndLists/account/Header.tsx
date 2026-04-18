import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { useRef, useEffect } from 'react'
import { useIntl } from 'react-intl'

import { createAccount } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { addOperationAtom, confirmDeleteAccountAtom } from '../../store.ts'
import type Accounts from '../../models/public/Accounts.ts'

const from = '/data/users/$userId_/accounts/$accountId_'

export const Header = ({ autoFocusRef }) => {
  const { formatMessage } = useIntl()
  const { userId, accountId } = useParams({ from })
  const navigate = useNavigate()
  const addOperation = useSetAtom(addOperationAtom)
  const setConfirmDeleteAccount = useSetAtom(confirmDeleteAccountAtom)

  const db = usePGlite()

  // Keep a ref to the current accountId so it's always fresh in callbacks
  // without this users can only click toNext or toPrevious once
  const accountIdRef = useRef(accountId)
  useEffect(() => {
    accountIdRef.current = accountId
  }, [accountId])

  const countRes = useLiveQuery(
    'SELECT COUNT(*) as count FROM accounts WHERE user_id = $1',
    [userId],
  )
  const rowCount = countRes?.rows?.[0]?.count ?? 2

  const addRow = async () => {
    const res = await createAccount({ userId })
    const accountId: Accounts['account_id'] | undefined = res?.rows?.[0]
    if (!accountId) return
    navigate({ to: `../${accountId}` })
    autoFocusRef?.current?.focus()
  }

  const deleteRow = () => {
    setConfirmDeleteAccount({
      accountId,
      userId,
      onConfirm: async () => {
        try {
          const prevRes = await db.query(
            `SELECT * FROM accounts WHERE account_id = $1 AND user_id = $2`,
            [accountId, userId],
          )
          const prev = prevRes?.rows?.[0] ?? {}
          await db.query(`DELETE FROM accounts WHERE account_id = $1 AND user_id = $2`, [
            accountId,
            userId,
          ])
          addOperation({
            table: 'accounts',
            rowIdName: 'account_id',
            rowId: accountId,
            operation: 'delete',
            prev,
          })
          navigate({ to: `..` })
        } catch (error) {
          console.error('Error deleting account:', error)
        }
      },
    })
  }

  const toNext = async () => {
    try {
      const res = await db.query(
        `SELECT account_id FROM accounts WHERE user_id = $1 order by label`,
        [userId],
      )
      const rows = res?.rows
      const len = rows.length
      const index = rows.findIndex((p) => p.account_id === accountIdRef.current)
      const next = rows[(index + 1) % len]
      navigate({ to: `../${next.account_id}` })
    } catch (error) {
      console.error('Error navigating to next account:', error)
    }
  }

  const toPrevious = async () => {
    try {
      const res = await db.query(
        `SELECT account_id FROM accounts WHERE user_id = $1 order by label`,
        [userId],
      )
      const rows = res?.rows
      const len = rows.length
      const index = rows.findIndex((p) => p.account_id === accountIdRef.current)
      const previous = rows[(index + len - 1) % len]
      navigate({ to: `../${previous.account_id}` })
    } catch (error) {
      console.error('Error navigating to previous account:', error)
    }
  }

  return (
    <FormHeader
      title={formatMessage({ id: '9oKaIi', defaultMessage: 'Konto' })}
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      toNextDisabled={rowCount <= 1}
      toPreviousDisabled={rowCount <= 1}
      tableName="account"
    />
  )
}
