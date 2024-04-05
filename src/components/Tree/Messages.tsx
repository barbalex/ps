import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider'
import { Node } from './Node'
import { MessageNode } from './Message'

export const MessagesNode = memo(() => {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const { db } = useElectric()!
  const { results: messages = [] } = useLiveQuery(
    db.messages.liveMany({
      orderBy: { label: 'asc' },
    }),
  )

  const messagesNode = useMemo(
    () => ({ label: `Messages (${messages.length})` }),
    [messages.length],
  )

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpen = urlPath[0] === 'messages'
  const isActive = isOpen && urlPath.length === 1

  const onClickButton = useCallback(() => {
    if (isOpen) {
      return navigate({ pathname: '/', search: searchParams.toString() })
    }
    navigate({ pathname: '/messages', search: searchParams.toString() })
  }, [isOpen, navigate, searchParams])

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
})
