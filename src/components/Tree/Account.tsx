import { useCallback, memo } from 'react'
import {
  useLocation,
  useParams,
  useNavigate,
  useSearchParams,
} from 'react-router-dom'

import { Node } from './Node'
import { Accounts as Account } from '../../../generated/client'

interface Props {
  account: Account
  level?: number
}

export const AccountNode = memo(({ account, level = 2 }: Props) => {
  const params = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpen =
    urlPath[0] === 'accounts' && params.account_id === account.account_id
  const isActive = isOpen && urlPath.length === 2

  const onClickButton = useCallback(() => {
    if (isOpen)
      return navigate({
        pathname: '/accounts',
        search: searchParams.toString(),
      })
    navigate({
      pathname: `/accounts/${account.account_id}`,
      search: searchParams.toString(),
    })
  }, [isOpen, navigate, account.account_id, searchParams])

  return (
    <Node
      node={account}
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
