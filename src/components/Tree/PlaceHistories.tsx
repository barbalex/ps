import { useNavigate } from '@tanstack/react-router'

import { Node } from './Node.tsx'
import { PlaceHistoryNode } from './PlaceHistory.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import { usePlaceHistoriesNavData } from '../../modules/usePlaceHistoriesNavData.ts'

interface Props {
  projectId: string
  subprojectId: string
  placeId: string
  placeId2?: string
  level?: number
}

export const PlaceHistoriesNode = ({
  projectId,
  subprojectId,
  placeId,
  placeId2,
  level = 7,
}: Props) => {
  const navigate = useNavigate()

  const { navData } = usePlaceHistoriesNavData({
    projectId,
    subprojectId,
    placeId,
    placeId2,
  })
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
          <PlaceHistoryNode
            key={`${nav.id}-${i}`}
            projectId={projectId}
            subprojectId={subprojectId}
            placeId={placeId}
            placeId2={placeId2}
            nav={nav}
            level={level + 1}
          />
        ))}
    </>
  )
}
