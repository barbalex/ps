import { memo, useMemo } from 'react'
import { useLocation } from '@tanstack/react-router'
import isEqual from 'lodash/isEqual'

import { Node } from './Node.tsx'

export const ActionReportValueNode = memo(
  ({
    projectId,
    subprojectId,
    placeId,
    place,
    actionId,
    actionReportId,
    actionReportValue,
    level = 12,
  }) => {
    const location = useLocation()

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const parentArray = useMemo(
      () => [
        'data',
        'projects',
        projectId,
        'subprojects',
        subprojectId,
        'places',
        placeId ?? place.place_id,
        ...(placeId ? ['places', place.place_id] : []),
        'actions',
        actionId,
        'reports',
        actionReportId,
        'values',
      ],
      [
        projectId,
        subprojectId,
        placeId,
        place.place_id,
        actionId,
        actionReportId,
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
