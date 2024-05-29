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
import { Messages as Message } from '../../../generated/client/index.ts'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { useElectric } from '../../ElectricProvider.tsx'

interface Props {
  message: Message
  level?: number
}

export const MessageNode = memo(({ message, level = 2 }: Props) => {
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
    urlPath[1] === 'messages' && params.message_id === message.message_id
  const isActive = isOpen && urlPath.length === level + 1

  const onClickButton = useCallback(() => {
    if (isOpen) {
      removeChildNodes({
        node: ['messages', message.message_id],
        db,
        appStateId: appState?.app_state_id,
      })
      return navigate({
        pathname: '/data/messages',
        search: searchParams.toString(),
      })
    }
    navigate({
      pathname: `/data/messages/${message.message_id}`,
      search: searchParams.toString(),
    })
  }, [
    isOpen,
    navigate,
    message.message_id,
    searchParams,
    db,
    appState?.app_state_id,
  ])

  return (
    <Node
      node={message}
      id={message.message_id}
      level={level}
      isOpen={isOpen}
      isInActiveNodeArray={isOpen}
      isActive={isActive}
      childrenCount={0}
      to={`/data/messages/${message.message_id}`}
      onClickButton={onClickButton}
    />
  )
})
