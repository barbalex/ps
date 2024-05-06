import { useCallback, memo } from 'react'
import {
  useLocation,
  useParams,
  useNavigate,
  useSearchParams,
} from 'react-router-dom'

import { Node } from './Node'
import { Messages as Message } from '../../../generated/client/index.ts'

interface Props {
  message: Message
  level?: number
}

export const MessageNode = memo(({ message, level = 2 }: Props) => {
  const params = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpen =
    urlPath[0] === 'messages' && params.message_id === message.message_id
  const isActive = isOpen && urlPath.length === 2

  const onClickButton = useCallback(() => {
    if (isOpen) {
      return navigate({
        pathname: '/messages',
        search: searchParams.toString(),
      })
    }
    navigate({
      pathname: `/messages/${message.message_id}`,
      search: searchParams.toString(),
    })
  }, [isOpen, navigate, message.message_id, searchParams])

  return (
    <Node
      node={message}
      id={message.message_id}
      level={level}
      isOpen={isOpen}
      isInActiveNodeArray={isOpen}
      isActive={isActive}
      childrenCount={0}
      to={`/messages/${message.message_id}`}
      onClickButton={onClickButton}
    />
  )
})
