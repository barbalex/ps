import { memo, useMemo } from 'react'
import { useLocation } from '@tanstack/react-router'
import isEqual from 'lodash/isEqual'

import { Node } from './Node.tsx'

export const PlaceReportValueNode = memo(
  ({
    projectId,
    subprojectId,
    placeId,
    placeId2,
    placeReportId,
    placeReportValue,
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
        'places',
        placeId,
        ...(placeId2 ? ['places', placeId2] : []),
        'reports',
        placeReportId,
        'values',
        placeReportValue.place_report_value_id,
      ],
      [
        projectId,
        subprojectId,
        placeId,
        placeId2,
        placeReportId,
        placeReportValue.place_report_value_id,
      ],
    )
    const ownUrl = `/${ownArray.join('/')}`

    const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
    const isActive = isEqual(urlPath, ownArray)

    return (
      <Node
        node={placeReportValue}
        id={placeReportValue.place_report_value_id}
        level={level}
        isInActiveNodeArray={isInActiveNodeArray}
        isActive={isActive}
        childrenCount={0}
        to={ownUrl}
      />
    )
  },
)
