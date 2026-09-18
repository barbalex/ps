import { useNavigate } from '@tanstack/react-router'

import { Node } from './Node.tsx'
import { VectorLayerNode } from './VectorLayer.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import { useVectorLayersNavData } from '../../modules/useVectorLayersNavData.ts'

interface Props {
  projectId: string
  level?: number
}

// mirrors the open rows returned by useVectorLayersNavData's sql
type NavData = {
  id: string
  label: string
  count_unfiltered: number
  count_filtered: number
}

export const VectorLayersNode = ({ projectId, level = 3 }: Props) => {
  const navigate = useNavigate()

  const { navData } = useVectorLayersNavData({ projectId })
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
  const openNavs = navs as NavData[]
  const showNavs = isOpen && navs.length > 0 && openNavs[0].id

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
        openNavs.map((nav, i) => (
          <VectorLayerNode
            key={`${nav.id}-${i}`}
            projectId={projectId}
            nav={nav}
          />
        ))}
    </>
  )
}
