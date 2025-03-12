import { memo, useMemo } from 'react'
import { useLocation } from 'react-router'
import isEqual from 'lodash/isEqual'

import { Node } from './Node.tsx'

export const ActionReportValueNode = memo(
  ({
    project_id,
    subproject_id,
    place_id,
    place,
    action_id,
    action_report_id,
    actionReportValue,
    level = 12,
  }) => {
    const location = useLocation()

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const parentArray = useMemo(
      () => [
        'data',
        'projects',
        project_id,
        'subprojects',
        subproject_id,
        'places',
        place_id ?? place.place_id,
        ...(place_id ? ['places', place.place_id] : []),
        'actions',
        action_id,
        'reports',
        action_report_id,
        'values',
      ],
      [
        project_id,
        subproject_id,
        place_id,
        place.place_id,
        action_id,
        action_report_id,
      ],
    )
    const ownArray = useMemo(
      () => [...parentArray, actionReportValue.action_report_value_id],
      [actionReportValue.action_report_value_id, parentArray],
    )
    const ownUrl = `/${ownArray.join('/')}`

    // needs to work not only works for urlPath, for all opened paths!
    const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
    const isActive = isEqual(urlPath, ownArray)

    return (
      <Node
        node={actionReportValue}
        id={actionReportValue.action_report_value_id}
        level={level}
        isInActiveNodeArray={isInActiveNodeArray}
        isActive={isActive}
        childrenCount={0}
        to={ownUrl}
      />
    )
  },
)
