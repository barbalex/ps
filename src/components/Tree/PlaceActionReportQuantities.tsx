import { useNavigate } from '@tanstack/react-router'

import { Node } from './Node.tsx'
import { PlaceActionReportQuantityNode } from './PlaceActionReportQuantity.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import { usePlaceActionReportQuantitiesNavData } from '../../modules/usePlaceActionReportQuantitiesNavData.ts'

export const PlaceActionReportQuantitiesNode = ({
  projectId,
  subprojectId,
  placeId,
  placeId2,
  placeActionReportId,
  level = 9,
}) => {
  const navigate = useNavigate()

  const { navData } = usePlaceActionReportQuantitiesNavData({
    projectId,
    subprojectId,
    placeId,
    placeId2,
    placeActionReportId,
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
          <PlaceActionReportQuantityNode
            key={`${nav.id}-${i}`}
            projectId={projectId}
            subprojectId={subprojectId}
            placeId={placeId}
            placeId2={placeId2}
            placeActionReportId={placeActionReportId}
            nav={nav}
            level={level + 1}
          />
        ))}
    </>
  )
}
