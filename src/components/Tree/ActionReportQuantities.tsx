import { useNavigate } from '@tanstack/react-router'

import { Node } from './Node.tsx'
import { ActionReportQuantityNode } from './ActionReportQuantity.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import { useActionReportQuantitiesNavData } from '../../modules/useActionReportQuantitiesNavData.ts'

export const ActionReportQuantitiesNode = ({
  projectId,
  subprojectId,
  placeId,
  placeId2,
  actionId,
  actionReportId,
  level = 11,
}) => {
  const navigate = useNavigate()

  const { navData } = useActionReportQuantitiesNavData({
    projectId,
    subprojectId,
    placeId,
    placeId2,
    actionId,
    actionReportId,
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
          <ActionReportQuantityNode
            key={`${nav.id}-${i}`}
            projectId={projectId}
            subprojectId={subprojectId}
            placeId={placeId}
            placeId2={placeId2}
            actionId={actionId}
            actionReportId={actionReportId}
            nav={nav}
            level={level + 1}
          />
        ))}
    </>
  )
}
