import { memo, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import isEqual from 'lodash/isEqual'

import { Node } from './Node.tsx'
import {
  Places as Place,
  Actions_values as ActionValue,
} from '../../generated/client/index.ts'

interface Props {
  project_id: string
  subproject_id: string
  place_id: string
  place: Place
  action_id: string
  actionValue: ActionValue
  level?: number
}

export const ActionValueNode = memo(
  ({
    project_id,
    subproject_id,
    place_id,
    place,
    action_id,
    actionValue,
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
        'actions',
        action_id,
        'values',
        actionValue.action_value_id,
      ],
      [
        actionValue.action_value_id,
        action_id,
        place.place_id,
        place_id,
        project_id,
        subproject_id,
      ],
    )
    const ownUrl = `/${ownArray.join('/')}`

    const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
    const isActive = isEqual(urlPath, ownArray)

    return (
      <Node
        node={actionValue}
        id={actionValue.action_value_id}
        level={level}
        isInActiveNodeArray={isInActiveNodeArray}
        isActive={isActive}
        childrenCount={0}
        to={ownUrl}
      />
    )
  },
)
