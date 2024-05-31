import { memo, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import isEqual from 'lodash/isEqual'


import { Node } from './Node.tsx'
import { WidgetsForFields as WidgetForField } from '../../../generated/client/index.ts'

interface Props {
  widgetForField: WidgetForField
  level?: number
}

export const WidgetForFieldNode = memo(
  ({ widgetForField, level = 2 }: Props) => {
    const location = useLocation()

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const ownArray = useMemo(
      () => ['data', 'widgets-for-fields', widgetForField.widget_for_field_id],
      [widgetForField.widget_for_field_id],
    )
    const ownUrl = `/${ownArray.join('/')}`

    const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
    const isActive = isEqual(urlPath, ownArray)

    return (
      <Node
        node={widgetForField}
        id={widgetForField.widget_for_field_id}
        level={level}
        isInActiveNodeArray={isInActiveNodeArray}
        isActive={isActive}
        childrenCount={0}
        to={ownUrl}
      />
    )
  },
)
