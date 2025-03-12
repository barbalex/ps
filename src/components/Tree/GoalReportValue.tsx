import { memo, useMemo } from 'react'
import { useLocation } from 'react-router'
import isEqual from 'lodash/isEqual'

import { Node } from './Node.tsx'

export const GoalReportValueNode = memo(
  ({
    project_id,
    subproject_id,
    goal_id,
    goal_report_id,
    goalReportValue,
    level = 10,
  }) => {
    const location = useLocation()

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const ownArray = useMemo(
      () => [
        'data',
        'projects',
        project_id,
        'subprojects',
        subproject_id,
        'goals',
        goal_id,
        'reports',
        goal_report_id,
        'values',
        goalReportValue.goal_report_value_id,
      ],
      [
        project_id,
        subproject_id,
        goal_id,
        goal_report_id,
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
