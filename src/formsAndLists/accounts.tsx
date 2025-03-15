import { useCallback, memo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { createAccount } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import '../form.css'

const from = '/data/accounts'

export const Accounts = memo(() => {
  const navigate = useNavigate({ from })

  const db = usePGlite()
  const res = useLiveIncrementalQuery(
    `SELECT account_id, label FROM accounts`,
    undefined,
    'account_id',
  )
  const isLoading = res === undefined
  const accounts = res?.rows ?? []

  const add = useCallback(async () => {
    const res = await createAccount({ db })
    const data = res?.rows?.[0]
    if (!data) return
    navigate({ to: data.account_id })
  }, [db, navigate])

  return (
    <div className="list-view">
      <ListViewHeader
        namePlural="Accounts"
        nameSingular="account"
        tableName="accounts"
        isFiltered={false}
        countFiltered={accounts.length}
        isLoading={isLoading}
        addRow={add}
      />
      <div className="list-container">
        {isLoading ?
          <Loading />
        : <>
            {accounts.map(({ account_id, label }) => (
              <Row
                key={account_id}
                label={label ?? account_id}
                to={`/data/accounts/${account_id}`}
              />
            ))}
          </>
        }
      </div>
    </div>
  )
})
