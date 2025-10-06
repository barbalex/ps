import { useCallback, memo } from 'react'
import { useNavigate } from '@tanstack/react-router'

import { Node } from './Node.tsx'
import { WmsLayerNode } from './WmsLayer.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import { useWmsLayersNavData } from '../../modules/useWmsLayersNavData.ts'

interface Props {
  projectId: string
  level?: number
}

export const WmsLayersNode = memo(({ projectId, level = 3 }: Props) => {
  const navigate = useNavigate()

  const { navData } = useWmsLayersNavData({ projectId })
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

  const onClickButton = useCallback(() => {
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
  }, [
    isInActiveNodeArray,
    isOpen,
    navigate,
    ownArray,
    parentUrl,
    urlPath.length,
  ])

  // only list navs if isOpen AND the first nav has an id
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
          <WmsLayerNode
            key={`${nav.id}-${i}`}
            projectId={projectId}
            nav={nav}
          />
        ))}
    </>
  )
})
