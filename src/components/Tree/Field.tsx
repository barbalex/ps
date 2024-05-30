import { memo, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import isEqual from 'lodash/isEqual'

import { Node } from './Node.tsx'
import { Fields as Field } from '../../../generated/client/index.ts'

interface Props {
  project_id?: string
  field: Field
}

export const FieldNode = memo(({ project_id, field }: Props) => {
  const level: number = project_id ? 4 : 2
  const location = useLocation()

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const ownArray = useMemo(
    () => [
      'data',
      ...(project_id ? ['projects', project_id] : []),
      'fields',
      field.field_id,
    ],
    [field.field_id, project_id],
  )
  const ownUrl = `/${ownArray.join('/')}`

  const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
  const isActive = isEqual(urlPath, ownArray)

  return (
    <Node
      node={field}
      id={field.field_id}
      level={level}
      isInActiveNodeArray={isInActiveNodeArray}
      isActive={isActive}
      childrenCount={0}
      to={ownUrl}
    />
  )
})
