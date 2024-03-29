import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider'
import { Node } from './Node'
import { UserNode } from './User'

export const UsersNode = memo(() => {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const { db } = useElectric()!
  const { results: users = [] } = useLiveQuery(
    db.users.liveMany({
      where: { deleted: false },
      orderBy: { label: 'asc' },
    }),
  )

  const usersNode = useMemo(
    () => ({ label: `Users (${users.length})` }),
    [users.length],
  )

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpen = urlPath[0] === 'users'
  const isActive = isOpen && urlPath.length === 1

  const onClickButton = useCallback(() => {
    if (isOpen) {
      return navigate({ pathname: '/', search: searchParams.toString() })
    }
    navigate({ pathname: '/users', search: searchParams.toString() })
  }, [isOpen, navigate, searchParams])

  return (
    <>
      <Node
        node={usersNode}
        level={1}
        isOpen={isOpen}
        isInActiveNodeArray={isOpen}
        isActive={isActive}
        childrenCount={users.length}
        to={`/users`}
        onClickButton={onClickButton}
      />
      {isOpen &&
        users.map((user) => <UserNode key={user.user_id} user={user} />)}
    </>
  )
})
