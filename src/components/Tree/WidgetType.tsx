import { memo, useMemo } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import isEqual from 'lodash/isEqual'


import { Node } from './Node.tsx'
import { WidgetTypes as WidgetType } from '../../../generated/client/index.ts'

interface Props {
  widgetType: WidgetType
  level?: number
}

export const WidgetTypeNode = memo(({ widgetType, level = 2 }: Props) => {
  const params = useParams()
  const location = useLocation()

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const ownArray = useMemo(
    () => ['data', 'widget-types', widgetType.widget_type_id],
    [widgetType.widget_type_id],
  )
  const isOpen =
    urlPath[1] === 'widget-types' &&
    params.widget_type_id === widgetType.widget_type_id
  const isActive = isOpen && urlPath.length === level + 1

  return (
    <Node
      node={widgetType}
      id={widgetType.widget_type_id}
      level={level}
      isInActiveNodeArray={isOpen}
      isActive={isActive}
      childrenCount={0}
      to={`/data/widget-types/${widgetType.widget_type_id}`}
    />
  )
})
