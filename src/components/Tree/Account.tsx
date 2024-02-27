import { useCallback, memo } from 'react'
import { useLocation, useParams, useNavigate } from 'react-router-dom'

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

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpen =
    urlPath[0] === 'accounts' && params.account_id === account.account_id
  const isActive = isOpen && urlPath.length === 2

  const onClickButton = useCallback(() => {
    if (isOpen) return navigate('/accounts')
    navigate(`/accounts/${account.account_id}`)
  }, [isOpen, navigate, account.account_id])

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
