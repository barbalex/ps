import { useCallback, useMemo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider'
import { Node } from './Node'
import { Messages as Message } from '../../../generated/client'
import { MessageNode } from './Message'

export const MessagesNode = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const { db } = useElectric()!
  const { results } = useLiveQuery(
    db.messages.liveMany({
      where: { deleted: false },
      orderBy: { label: 'asc' },
    }),
  )
  const messages: Message[] = results ?? []

  const messagesNode = useMemo(
    () => ({
      label: `Messages (${messages.length})`,
    }),
    [messages.length],
  )

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpen = urlPath[0] === 'messages'
  const isActive = isOpen && urlPath.length === 1

  const onClickButton = useCallback(() => {
    if (isOpen) return navigate('/')
    navigate('/messages')
  }, [isOpen, navigate])

  return (
    <>
      <Node
        node={messagesNode}
        level={1}
        isOpen={isOpen}
        isInActiveNodeArray={isOpen}
        isActive={isActive}
        childrenCount={messages.length}
        to={`/messages`}
        onClickButton={onClickButton}
      />
      {isOpen &&
        messages.map((message) => (
          <MessageNode key={message.message_id} message={message} />
        ))}
    </>
  )
}
