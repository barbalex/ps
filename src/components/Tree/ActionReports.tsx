import { useNavigate } from '@tanstack/react-router'

import { Node } from './Node.tsx'
import { ActionReportNode } from './ActionReport.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import { useActionReportsNavData } from '../../modules/useActionReportsNavData.ts'

type NavData = {
  id: string
  label: string
  count_unfiltered?: number
  count_filtered?: number
}[]

type Props = {
  projectId: string
  subprojectId: string
  placeId: string
  placeId2?: string
  level?: number
}

export const ActionReportsNode = ({
  projectId,
  subprojectId,
  placeId,
  placeId2,
  level = 7,
}: Props) => {
  const navigate = useNavigate()

  const { navData } = useActionReportsNavData({
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
  // ids only exist (and are only used) when the node is open
  const showNavs = isOpen && navs.length > 0 && (navs as NavData)[0].id

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
        (navs as NavData).map((nav, i) => (
          <ActionReportNode
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
