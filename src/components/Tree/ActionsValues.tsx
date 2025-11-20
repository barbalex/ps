import { useNavigate } from '@tanstack/react-router'
import { Node } from './Node.tsx'
import { ActionValueNode } from './ActionValue.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import { useActionValuesNavData } from '../../modules/useActionValuesNavData.ts'

export const ActionValuesNode = ({
  projectId,
  subprojectId,
  placeId,
  placeId2,
  actionId,
  level = 9,
}) => {
  const navigate = useNavigate()

  const { navData } = useActionValuesNavData({
    projectId,
    subprojectId,
    placeId,
    placeId2,
    actionId,
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
        navigate({
          to: parentUrl,
        })
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
          <ActionValueNode
            key={`${nav.id}-${i}`}
            projectId={projectId}
            subprojectId={subprojectId}
            placeId={placeId}
            placeId2={placeId2}
            actionId={actionId}
            nav={nav}
            level={level + 1}
          />
        ))}
    </>
  )
}
