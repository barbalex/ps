import { useNavigate } from '@tanstack/react-router'

import { Node } from './Node.tsx'
import { QueuedOperationNode } from './QueuedOperation.tsx'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { useQueuedOperationsNavData } from '../../modules/useQueuedOperationsNavData.ts'

export const QueuedOperationsNode = () => {
  const navigate = useNavigate()

  const { navData } = useQueuedOperationsNavData()
  const {
    label,
    parentUrl,
    ownArray,
    ownUrl,
    urlPath,
    level,
    isOpen,
    isInActiveNodeArray,
    isActive,
    navs,
  } = navData

  const onClickButton = () => {
    if (isOpen) {
      removeChildNodes({ node: ownArray, isRoot: true })
      if (isInActiveNodeArray && ownArray.length <= urlPath.length) {
        navigate({ to: parentUrl })
      }
      return
    }
    addOpenNodes({ nodes: [ownArray] })
  }

  const showNavs = isOpen && navs.length > 0 && navs[0].id

  return (
    <>
      <Node
        label={label}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isInActiveNodeArray}
        isActive={isActive}
        childrenCount={navs.length}
        to={ownUrl}
        onClickButton={onClickButton}
      />
      {showNavs &&
        navs.map((nav, i) => (
          <QueuedOperationNode key={`${nav.id}-${i}`} nav={nav} />
        ))}
    </>
  )
}
