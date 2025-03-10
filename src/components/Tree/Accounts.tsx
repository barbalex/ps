import { useCallback, useMemo, memo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import isEqual from 'lodash/isEqual'
import { useAtom } from 'jotai'
import { useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { Node } from './Node.tsx'
import { AccountNode } from './Account.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import { treeOpenNodesAtom } from '../../store.ts'

export const AccountsNode = memo(() => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const result = useLiveIncrementalQuery(
    `SELECT * FROM accounts ORDER BY label ASC`,
    undefined,
    'account_id',
  )
  const accounts = result?.rows ?? []
  const accountsLoading = result === undefined

  const accountsNode = useMemo(
    () => ({
      label: `Accounts (${accountsLoading ? '...' : accounts.length})`,
    }),
    [accounts.length, accountsLoading],
  )

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const parentArray = useMemo(() => ['data'], [])
  const parentUrl = `/${parentArray.join('/')}`
  const ownArray = useMemo(() => [...parentArray, 'accounts'], [parentArray])
  const ownUrl = `/${ownArray.join('/')}`

  // needs to work not only works for urlPath, for all opened paths!
  const isOpen = openNodes.some((array) => isEqual(array, ownArray))
  const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
  const isActive = isEqual(urlPath, ownArray)

  const onClickButton = useCallback(() => {
    if (isOpen) {
      removeChildNodes({ node: ownArray, isRoot: true })
      // only navigate if urlPath includes ownArray
      if (isInActiveNodeArray && ownArray.length <= urlPath.length) {
        navigate({ pathname: parentUrl, search: searchParams.toString() })
      }
      return
    }
    // add to openNodes without navigating
    addOpenNodes({ nodes: [ownArray] })
  }, [
    isInActiveNodeArray,
    isOpen,
    navigate,
    ownArray,
    parentUrl,
    searchParams,
    urlPath.length,
  ])

  return (
    <>
      <Node
        node={accountsNode}
        level={1}
        isOpen={isOpen}
        isInActiveNodeArray={isInActiveNodeArray}
        isActive={isActive}
        childrenCount={accounts.length}
        to={ownUrl}
        onClickButton={onClickButton}
      />
      {isOpen &&
        accounts.map((account) => (
          <AccountNode
            key={account.account_id}
            account={account}
          />
        ))}
    </>
  )
})
