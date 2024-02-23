import { useCallback, memo } from 'react'
import { useLocation, useParams, useNavigate } from 'react-router-dom'

import { Node } from './Node'
import { Messages as Message } from '../../../generated/client'

type Props = {
  message: Message
  level?: number
}

export const MessageNode = memo(({ message, level = 2 }: Props) => {
  const params = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpen =
    urlPath[0] === 'messages' && params.message_id === message.message_id
  const isActive = isOpen && urlPath.length === 2

  const onClickButton = useCallback(() => {
    if (isOpen) return navigate('/messages')
    navigate(`/messages/${message.message_id}`)
  }, [isOpen, navigate, message.message_id])

  return (
    <Node
      node={message}
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
