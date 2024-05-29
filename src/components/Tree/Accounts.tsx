import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useCorbado } from '@corbado/react'
import isEqual from 'lodash/isEqual'

import { useElectric } from '../../ElectricProvider.tsx'
import { Node } from './Node.tsx'
import { AccountNode } from './Account.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'

export const AccountsNode = memo(({ level = 1 }) => {
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
  const openNodes = useMemo(
    () => appState?.tree_open_nodes ?? [],
    [appState?.tree_open_nodes],
  )

  const accountsNode = useMemo(
    () => ({ label: `Accounts (${accounts.length})` }),
    [accounts.length],
  )

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const parentArray = useMemo(() => ['data'], [])
  const parentUrl = parentArray.join('/')
  const ownArray = useMemo(() => [...parentArray, 'accounts'], [parentArray])
  
  // TODO: this only works for urlPath, not for other opened paths!
  const isOpen = openNodes.some((array) => isEqual(array, ownArray))
  const isActive = isEqual(urlPath, ownArray)

  const onClickButton = useCallback(() => {
    if (isOpen) {
      removeChildNodes({
        node: ownArray,
        db,
        appStateId: appState?.app_state_id,
        isRoot: true,
      })
      // TODO: only navigate if urlPath includes ownArray
      if (!isOpen) return
      return navigate({
        pathname: `/${parentUrl}`,
        search: searchParams.toString(),
      })
    }
    // TODO: add to openNodes without navigating
    addOpenNodes({
      nodes: [ownArray],
      db,
      appStateId: appState?.app_state_id,
      isRoot: true,
    })
  }, [
    appState?.app_state_id,
    db,
    isOpen,
    navigate,
    ownArray,
    parentUrl,
    searchParams,
  ])

  return (
    <>
      <Node
        node={accountsNode}
        level={1}
        isOpen={isOpen}
        isInActiveNodeArray={isOpen}
        isActive={isActive}
        childrenCount={accounts.length}
        to={`/data/accounts`}
        onClickButton={onClickButton}
      />
      {isOpen &&
        accounts.map((account) => (
          <AccountNode key={account.account_id} account={account} />
        ))}
    </>
  )
})
