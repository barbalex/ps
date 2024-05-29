import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useCorbado } from '@corbado/react'

import { useElectric } from '../../ElectricProvider.tsx'
import { Node } from './Node.tsx'
import { AccountNode } from './Account.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'

export const AccountsNode = memo(() => {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user: authUser } = useCorbado()

  const { db } = useElectric()!
  const { results: accounts = [] } = useLiveQuery(
    db.accounts.liveMany({
      orderBy: { label: 'asc' },
    }),
  )
  const { results: appState } = useLiveQuery(
    db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
  )

  const accountsNode = useMemo(
    () => ({ label: `Accounts (${accounts.length})` }),
    [accounts.length],
  )

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpen = urlPath[1] === 'accounts'
  const isActive = isOpen && urlPath.length === 1

  const onClickButton = useCallback(() => {
    if (isOpen) {
      removeChildNodes({
        node: ['accounts'],
        db,
        appStateId: appState?.app_state_id,
        isRoot: true,
      })
      return navigate({
        pathname: '..',
        search: searchParams.toString(),
      })
    }
    navigate({ pathname: '/accounts', search: searchParams.toString() })
  }, [appState?.app_state_id, db, isOpen, navigate, searchParams])

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
