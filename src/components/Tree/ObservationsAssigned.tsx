import { useNavigate } from '@tanstack/react-router'

import { Node } from './Node.tsx'
import { ObservationAssignedNode } from './ObservationAssigned.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import { useObservationsNavData } from '../../modules/useObservationsNavData.ts'

export const ObservationsAssignedNode = ({
  projectId,
  subprojectId,
  placeId,
  placeId2,
  level = 7,
}) => {
  const navigate = useNavigate()

  const { navData } = useObservationsNavData({
    projectId,
    subprojectId,
    placeId,
    placeId2,
    isToAssess: false,
    isNotToAssign: false,
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
      {isOpen &&
        navs.map((nav) => (
          <ObservationAssignedNode
            key={nav.id}
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
