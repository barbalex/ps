import { useNavigate } from '@tanstack/react-router'

import { Node } from './Node.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import { useProjectDesignNavData } from '../../modules/useProjectDesignNavData.ts'

interface Props {
  projectId: string
  level?: number
}

export const ProjectDesignNode = ({ projectId, level = 2 }: Props) => {
  const { navData } = useProjectDesignNavData({ projectId })
  const {
    label,
    parentUrl,
    ownArray,
    ownUrl,
    urlPath,
    isOpen,
    isInActiveNodeArray,
    isActive,
  } = navData

  const navigate = useNavigate()

  const onClickButton = () => {
    if (isOpen) {
      removeChildNodes({ node: ownArray })
      // TODO: only navigate if urlPath includes ownArray
      if (isInActiveNodeArray && ownArray.length <= urlPath.length) {
        navigate({ to: parentUrl })
      }
      return
    }
    // add to openNodes without navigating
    addOpenNodes({ nodes: [ownArray] })
  }

  return (
    <Node
      label={label}
      level={level}
      isOpen={isOpen}
      isInActiveNodeArray={isInActiveNodeArray}
      isActive={isActive}
      childrenCount={0}
      to={ownUrl}
      onClickButton={onClickButton}
    />
  )
}
