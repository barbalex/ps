import { useCallback, memo } from 'react'
import { useNavigate } from '@tanstack/react-router'

import { Node } from './Node.tsx'
import { GoalReportNode } from './GoalReport.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import { useGoalReportsNavData } from '../../modules/useGoalReportsNavData.ts'

interface Props {
  projectId: string
  subprojectId: string
  goalId: string
  level?: number
}

export const GoalReportsNode = memo(
  ({ projectId, subprojectId, goalId, level = 7 }: Props) => {
    const navigate = useNavigate()

    const { navData } = useGoalReportsNavData({
      projectId,
      subprojectId,
      goalId,
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
            <GoalReportNode
              key={nav.id}
              projectId={projectId}
              subprojectId={subprojectId}
              goalId={goalId}
              nav={nav}
            />
          ))}
      </>
    )
  },
)
