import { memo, useMemo } from 'react'
import { useLocation } from 'react-router'
import isEqual from 'lodash/isEqual'

import { Node } from './Node.tsx'

export const PlaceReportValueNode = memo(
  ({
    project_id,
    subproject_id,
    place_id,
    place,
    place_report_id,
    placeReportValue,
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
        'places',
        place_id ?? place.place_id,
        ...(place_id ? ['places', place.place_id] : []),
        'reports',
        place_report_id,
        'values',
        placeReportValue.place_report_value_id,
      ],
      [
        project_id,
        subproject_id,
        place_id,
        place.place_id,
        place_report_id,
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
