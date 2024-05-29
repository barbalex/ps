import { useCallback, memo, useMemo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'

import { Node } from './Node.tsx'
import { Accounts as Account } from '../../../generated/client/index.ts'
import { useElectric } from '../../ElectricProvider.tsx'

interface Props {
  account: Account
  level?: number
}

export const AccountNode = memo(({ account, level = 2 }: Props) => {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user: authUser } = useCorbado()

  const { db } = useElectric()!
  const { results: appState } = useLiveQuery(
    db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
  )

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const parentArray = useMemo(() => ['data', 'accounts'], [])
  const ownArray = useMemo(
    () => [...parentArray, account.account_id],
    [account.account_id, parentArray],
  )
  const parentUrl = parentArray.join('/')
  const ownUrl = ownArray.join('/')

  // isOpen if urlPath includes ownArray
  const isOpen = ownArray.every((part, i) => urlPath[i] === part)

  const isActive = isOpen && urlPath.length === level + 1

  const onClickButton = useCallback(() => {
    if (isOpen) {
      removeChildNodes({
        node: ownArray,
        db,
        appStateId: appState?.app_state_id,
      })
      return navigate({
        pathname: parentUrl,
        search: searchParams.toString(),
      })
    }
    navigate({
      pathname: ownUrl,
      search: searchParams.toString(),
    })
  }, [
    isOpen,
    navigate,
    ownUrl,
    searchParams,
    ownArray,
    db,
    appState?.app_state_id,
    parentUrl,
  ])

  return (
    <Node
      node={account}
      id={account.account_id}
      level={level}
      isOpen={isOpen}
      isInActiveNodeArray={isOpen}
      isActive={isActive}
      childrenCount={0}
      to={`/data/accounts/${account.account_id}`}
      onClickButton={onClickButton}
    />
  )
})
