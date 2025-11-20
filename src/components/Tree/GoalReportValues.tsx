import { useNavigate } from '@tanstack/react-router'

import { Node } from './Node.tsx'
import { GoalReportValueNode } from './GoalReportValue.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import { useGoalReportValuesNavData } from '../../modules/useGoalReportValuesNavData.ts'

interface Props {
  projectId: string
  subprojectId: string
  goalId: string
  goalReportId: string
  level?: number
}

export const GoalReportValuesNode = ({
  projectId,
  subprojectId,
  goalId,
  goalReportId,
  level = 9,
}: Props) => {
  const navigate = useNavigate()

  const { navData } = useGoalReportValuesNavData({
    projectId,
    subprojectId,
    goalId,
    goalReportId,
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
          <GoalReportValueNode
            key={`${nav.id}-${i}`}
            projectId={projectId}
            subprojectId={subprojectId}
            goalId={goalId}
            goalReportId={goalReportId}
            nav={nav}
          />
        ))}
    </>
  )
}
