import { useCallback } from 'react'
import { useLocation, useParams, useNavigate } from 'react-router-dom'

import { Node } from './Node'
import { Users as User } from '../../../generated/client'

export const UserNode = ({
  user,
  level = 2,
}: {
  user: User
  level: number
}) => {
  const params = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpen = urlPath[0] === 'users' && params.user_id === user.user_id
  const isActive = isOpen && urlPath.length === 2

  const onClickButton = useCallback(() => {
    if (isOpen) return navigate('/users')
    navigate(`/users/${user.user_id}`)
  }, [isOpen, navigate, user.user_id])

  return (
    <Node
      node={user}
      level={level}
      isOpen={isOpen}
      isInActiveNodeArray={isOpen}
      isActive={isActive}
      childrenCount={0}
      to={`/users/${user.user_id}`}
      onClickButton={onClickButton}
    />
  )
}
