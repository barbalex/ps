import { memo, useMemo } from 'react'
import { useLocation } from '@tanstack/react-router'
import isEqual from 'lodash/isEqual'

import { Node } from './Node.tsx'

export const GoalReportValueNode = memo(
  ({
    projectId,
    subprojectId,
    goalId,
    goalReportId,
    goalReportValue,
    level = 10,
  }) => {
    const location = useLocation()

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const ownArray = useMemo(
      () => [
        'data',
        'projects',
        projectId,
        'subprojects',
        subprojectId,
        'goals',
        goalId,
        'reports',
        goalReportId,
        'values',
        goalReportValue.goal_report_value_id,
      ],
      [
        projectId,
        subprojectId,
        goalId,
        goalReportId,
        goalReportValue.goal_report_value_id,
      ],
    )
    const ownUrl = `/${ownArray.join('/')}`

    const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
    const isActive = isEqual(urlPath, ownArray)

    return (
      <Node
        node={goalReportValue}
        id={goalReportValue.goal_report_value_id}
        level={level}
        isInActiveNodeArray={isInActiveNodeArray}
        isActive={isActive}
        childrenCount={0}
        to={ownUrl}
      />
    )
  },
)
