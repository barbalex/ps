import { useNavigate } from '@tanstack/react-router'

import { Node } from './Node.tsx'
import { FieldNode } from './Field.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import { useFieldsNavData } from '../../modules/useFieldsNavData.ts'

interface Props {
  projectId?: string
  accountId?: string
  userId?: string
  level?: number
}

export const FieldsNode = ({ projectId, accountId, userId, level }: Props) => {
  const navigate = useNavigate()

  const { navData } = useFieldsNavData({ projectId, accountId, userId })
  const {
    label,
    parentUrl,
    ownArray,
    ownUrl,
    urlPath,
    isOpen,
    isInActiveNodeArray,
    isActive,
    navs,
  } = navData

  const onClickButton = () => {
    if (isOpen) {
      removeChildNodes({
        node: ownArray,
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
  }

  // only list navs if isOpen AND the first nav has an id
  const showNavs = isOpen && navs.length > 0 && navs[0].id

  return (
    <>
      <Node
        label={label}
        level={level ?? (projectId || accountId ? 3 : 1)}
        isOpen={isOpen}
        isInActiveNodeArray={isInActiveNodeArray}
        isActive={isActive}
        childrenCount={navs.length}
        to={ownUrl}
        onClickButton={onClickButton}
      />
      {showNavs &&
        navs.map((nav, i) => (
          <FieldNode
            key={`${nav.id}-${i}`}
            nav={nav}
            projectId={projectId}
            accountId={accountId}
            userId={userId}
            level={level !== undefined ? level + 1 : undefined}
          />
        ))}
    </>
  )
}
