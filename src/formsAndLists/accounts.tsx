import { useCallback, memo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'

import { createAccount } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import { useAccountsNavData } from '../modules/useAccountsNavData.ts'
import '../form.css'

const from = '/data/accounts'

export const Accounts = memo(() => {
  const navigate = useNavigate({ from })
  const db = usePGlite()

  const { loading, navData } = useAccountsNavData()

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
        countFiltered={navData.length}
        isLoading={loading}
        addRow={add}
      />
      <div className="list-container">
        {loading ?
          <Loading />
        : <>
            {navData.map(({ account_id, label }) => (
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
