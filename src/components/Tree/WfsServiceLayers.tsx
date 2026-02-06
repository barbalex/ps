import { Node } from './Node.tsx'
import { WfsServiceLayerNode } from './WfsServiceLayer.tsx'
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
  const { navData } = useWfsServiceLayersNavData({ projectId, wfsServiceId })
  const { label, ownUrl, isOpen, isInActiveNodeArray, isActive, navs } = navData

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
      />
      {showNavs &&
        navs.map((nav) => (
          <WfsServiceLayerNode
            key={nav.id}
            projectId={projectId}
            wfsServiceId={wfsServiceId}
            nav={nav}
            level={level + 1}
          />
        ))}
    </>
  )
}
