import { useNavigate } from '@tanstack/react-router'

import { Node } from './Node.tsx'
import { WfsServiceLayerNode } from './WfsServiceLayer.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import { useWfsServiceLayersNavData } from '../../modules/useWfsServiceLayersNavData.ts'

interface Props {
  projectId: string
  wfsServiceId: string
  level?: number
}

export const WfsServiceLayersNode = ({
  projectId,
  wfsServiceId,
  level = 5,
}: Props) => {
  const navigate = useNavigate()

  const { navData } = useWfsServiceLayersNavData({ projectId, wfsServiceId })
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
      removeChildNodes({ node: ownArray })
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
          <WfsServiceLayerNode
            key={`${nav.id}-${i}`}
            projectId={projectId}
            wfsServiceId={wfsServiceId}
            nav={nav}
            level={level + 1}
          />
        ))}
    </>
  )
}
