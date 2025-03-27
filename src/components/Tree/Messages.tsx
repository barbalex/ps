import { useCallback, useMemo, memo } from 'react'
import { useLocation, useNavigate } from '@tanstack/react-router'
import isEqual from 'lodash/isEqual'
import { useAtom } from 'jotai'

import { Node } from './Node.tsx'
import { MessageNode } from './Message.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import { formatNumber } from '../../modules/formatNumber.ts'
import { useMessagesNavData } from '../../modules/useMessagesNavData.ts'
import { treeOpenNodesAtom } from '../../store.ts'

export const MessagesNode = memo(() => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const location = useLocation()
  const navigate = useNavigate()

  const { loading, navData } = useMessagesNavData()

  const node = useMemo(
    () => ({
      label: `Messages (${loading ? '...' : formatNumber(navData.length)})`,
    }),
    [loading, navData.length],
  )

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const parentArray = useMemo(() => ['data'], [])
  const parentUrl = `/${parentArray.join('/')}`
  const ownArray = useMemo(() => [...parentArray, 'messages'], [parentArray])
  const ownUrl = `/${ownArray.join('/')}`

  // needs to work not only works for urlPath, for all opened paths!
  const isOpen = openNodes.some((array) => isEqual(array, ownArray))
  const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
  const isActive = isEqual(urlPath, ownArray)

  const onClickButton = useCallback(() => {
    if (isOpen) {
      removeChildNodes({
        node: parentArray,
        isRoot: true,
      })
      // only navigate if urlPath includes ownArray
      if (isInActiveNodeArray && ownArray.length <= urlPath.length) {
        navigate({ to: parentUrl })
      }
      return
    }
    // add to openNodes without navigating
    addOpenNodes({ nodes: [ownArray] })
  }, [
    isInActiveNodeArray,
    isOpen,
    navigate,
    ownArray,
    parentArray,
    parentUrl,
    urlPath.length,
  ])

  return (
    <>
      <Node
        node={node}
        level={1}
        isOpen={isOpen}
        isInActiveNodeArray={isInActiveNodeArray}
        isActive={isActive}
        childrenCount={navData.length}
        to={ownUrl}
        onClickButton={onClickButton}
      />
      {isOpen &&
        navData.map((message) => (
          <MessageNode
            key={message.message_id}
            message={message}
          />
        ))}
    </>
  )
})
