import { useCallback, memo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider'
import { createAccount } from '../../modules/createRows'
import { FormHeader } from '../../components/FormHeader'

export const Header = memo(({ autoFocusRef }) => {
  const { account_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()

  const addRow = useCallback(async () => {
    const data = createAccount()
    await db.accounts.create({ data })
    navigate(`/accounts/${data.account_id}`)
    autoFocusRef.current?.focus()
  }, [autoFocusRef, db.accounts, navigate])

  const deleteRow = useCallback(async () => {
    await db.accounts.delete({
      where: {
        account_id,
      },
    })
    navigate(`/accounts`)
  }, [account_id, db.accounts, navigate])

  const toNext = useCallback(async () => {
    const accounts = await db.accounts.findMany({
      orderBy: { label: 'asc' },
    })
    const len = accounts.length
    const index = accounts.findIndex((p) => p.account_id === account_id)
    const next = accounts[(index + 1) % len]
    navigate(`/accounts/${next.account_id}`)
  }, [account_id, db.accounts, navigate])

  const toPrevious = useCallback(async () => {
    const accounts = await db.accounts.findMany({
      orderBy: { label: 'asc' },
    })
    const len = accounts.length
    const index = accounts.findIndex((p) => p.account_id === account_id)
    const previous = accounts[(index + len - 1) % len]
    navigate(`/accounts/${previous.account_id}`)
  }, [account_id, db.accounts, navigate])

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
