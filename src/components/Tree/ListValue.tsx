import { memo, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import isEqual from 'lodash/isEqual'

import { Node } from './Node.tsx'
import { ListValues as ListValue } from '../../../generated/client/index.ts'

interface Props {
  project_id: string
  list_id: string
  listValue: ListValue
  level?: number
}

export const ListValueNode = memo(
  ({ project_id, list_id, listValue, level = 6 }: Props) => {
    const location = useLocation()

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const ownArray = useMemo(
      () => [
        'data',
        'projects',
        project_id,
        'lists',
        list_id,
        'values',
        listValue.list_value_id,
      ],
      [project_id, list_id, listValue.list_value_id],
    )
    const ownUrl = `/${ownArray.join('/')}`

    const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
    const isActive = isEqual(urlPath, ownArray)

    return (
      <Node
        node={listValue}
        id={listValue.list_value_id}
        level={level}
        isInActiveNodeArray={isInActiveNodeArray}
        isActive={isActive}
        childrenCount={0}
        to={ownUrl}
      />
    )
  },
)
