import { useCallback, memo } from 'react'
import {
  useLocation,
  useParams,
  useNavigate,
  useSearchParams,
} from 'react-router-dom'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'

import { Node } from './Node.tsx'
import { Accounts as Account } from '../../../generated/client/index.ts'

interface Props {
  account: Account
  level?: number
}

export const AccountNode = memo(({ account, level = 2 }: Props) => {
  const params = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user: authUser } = useCorbado()

  const { db } = useElectric()!
  const { results: appState } = useLiveQuery(
    db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
  )

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpen =
    urlPath[0] === 'accounts' && params.account_id === account.account_id
  const isActive = isOpen && urlPath.length === 2

  const onClickButton = useCallback(() => {
    if (isOpen) {
      removeChildNodes({
        node: ['accounts', account.account_id],
        db,
        appStateId: appState?.app_state_id,
      })
      return navigate({
        pathname: '/accounts',
        search: searchParams.toString(),
      })
    }
    navigate({
      pathname: `/accounts/${account.account_id}`,
      search: searchParams.toString(),
    })
  }, [
    isOpen,
    navigate,
    account.account_id,
    searchParams,
    db,
    appState?.app_state_id,
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
      to={`/accounts/${account.account_id}`}
      onClickButton={onClickButton}
    />
  )
})
