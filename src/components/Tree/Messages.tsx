import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider.tsx'
import { Node } from './Node.tsx'
import { MessageNode } from './Message.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'

export const MessagesNode = memo(() => {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user: authUser } = useCorbado()

  const { db } = useElectric()!
  const { results: messages = [] } = useLiveQuery(
    db.messages.liveMany({
      orderBy: { label: 'asc' },
    }),
  )
  const { results: appState } = useLiveQuery(
    db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
  )

  const messagesNode = useMemo(
    () => ({ label: `Messages (${messages.length})` }),
    [messages.length],
  )

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpen = urlPath[1] === 'messages'
  const isActive = isOpen && urlPath.length === 1

  const onClickButton = useCallback(() => {
    if (isOpen) {
      removeChildNodes({
        node: ['messages'],
        db,
        appStateId: appState?.app_state_id,
        isRoot: true,
      })
      return navigate({
        pathname: '..',
        search: searchParams.toString(),
      })
    }
    navigate({ pathname: '/data/messages', search: searchParams.toString() })
  }, [appState?.app_state_id, db, isOpen, navigate, searchParams])

  return (
    <>
      <Node
        node={messagesNode}
        level={1}
        isOpen={isOpen}
        isInActiveNodeArray={isOpen}
        isActive={isActive}
        childrenCount={messages.length}
        to={`/data/messages`}
        onClickButton={onClickButton}
      />
      {isOpen &&
        messages.map((message) => (
          <MessageNode key={message.message_id} message={message} />
        ))}
    </>
  )
})
