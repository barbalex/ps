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
import { Users as User } from '../../../generated/client/index.ts'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { useElectric } from '../../ElectricProvider.tsx'

interface Props {
  user: User
  level?: number
}

export const UserNode = memo(({ user, level = 2 }: Props) => {
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
  const isOpen = urlPath[0] === 'users' && params.user_id === user.user_id
  const isActive = isOpen && urlPath.length === 2

  const onClickButton = useCallback(() => {
    if (isOpen) {
      removeChildNodes({
        node: ['users', user.user_id],
        db,
        appStateId: appState?.app_state_id,
      })
      return navigate({ pathname: '/users', search: searchParams.toString() })
    }
    navigate({
      pathname: `/users/${user.user_id}`,
      search: searchParams.toString(),
    })
  }, [appState?.app_state_id, db, isOpen, navigate, searchParams, user.user_id])

  return (
    <Node
      node={user}
      id={user.user_id}
      level={level}
      isOpen={isOpen}
      isInActiveNodeArray={isOpen}
      isActive={isActive}
      childrenCount={0}
      to={`/users/${user.user_id}`}
      onClickButton={onClickButton}
    />
  )
})
