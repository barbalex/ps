import { memo, useMemo } from 'react'
import { useLocation } from '@tanstack/react-router'
import isEqual from 'lodash/isEqual'

import { Node } from './Node.tsx'

export const WidgetTypeNode = memo(({ nav, level = 2 }) => {
  const location = useLocation()

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const ownArray = useMemo(() => ['data', 'widget-types', nav.id], [nav.id])
  const ownUrl = `/${ownArray.join('/')}`

  const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
  const isActive = isEqual(urlPath, ownArray)

  return (
    <Node
      label={nav.label}
      id={nav.id}
      level={level}
      isInActiveNodeArray={isInActiveNodeArray}
      isActive={isActive}
      childrenCount={0}
      to={ownUrl}
    />
  )
})
