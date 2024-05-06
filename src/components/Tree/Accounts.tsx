import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider.tsx'
import { Node } from './Node.tsx'
import { AccountNode } from './Account.tsx'

export const AccountsNode = memo(() => {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const { db } = useElectric()!
  const { results: accounts = [] } = useLiveQuery(
    db.accounts.liveMany({
      orderBy: { label: 'asc' },
    }),
  )

  const accountsNode = useMemo(
    () => ({ label: `Accounts (${accounts.length})` }),
    [accounts.length],
  )

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpen = urlPath[0] === 'accounts'
  const isActive = isOpen && urlPath.length === 1

  const onClickButton = useCallback(() => {
    if (isOpen) {
      return navigate({ pathname: '/', search: searchParams.toString() })
    }
    navigate({ pathname: '/accounts', search: searchParams.toString() })
  }, [isOpen, navigate, searchParams])

  return (
    <>
      <Node
        node={accountsNode}
        level={1}
        isOpen={isOpen}
        isInActiveNodeArray={isOpen}
        isActive={isActive}
        childrenCount={accounts.length}
        to={`/accounts`}
        onClickButton={onClickButton}
      />
      {isOpen &&
        accounts.map((account) => (
          <AccountNode key={account.account_id} account={account} />
        ))}
    </>
  )
})
