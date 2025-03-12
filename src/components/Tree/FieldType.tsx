import { memo, useMemo } from 'react'
import { useLocation } from 'react-router'
import isEqual from 'lodash/isEqual'

import { Node } from './Node.tsx'

export const FieldTypeNode = memo(({ fieldType, level = 2 }) => {
  const location = useLocation()

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const ownArray = useMemo(
    () => ['data', 'field-types', fieldType.field_type_id],
    [fieldType.field_type_id],
  )
  const ownUrl = `/${ownArray.join('/')}`

  const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
  const isActive = isEqual(urlPath, ownArray)

  return (
    <Node
      node={fieldType}
      id={fieldType.field_type_id}
      level={level}
      isInActiveNodeArray={isInActiveNodeArray}
      isActive={isActive}
      childrenCount={0}
      to={ownUrl}
    />
  )
})
