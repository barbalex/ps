import { useCallback, memo } from 'react'
import { useLocation, useParams, useNavigate } from 'react-router-dom'

import { Node } from './Node'
import { WidgetsForFields as WidgetForField } from '../../../generated/client'

interface Props {
  widgetForField: WidgetForField
  level?: number
}

export const WidgetForFieldNode = memo(
  ({ widgetForField, level = 2 }: Props) => {
    const params = useParams()
    const location = useLocation()
    const navigate = useNavigate()

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const isOpen =
      urlPath[0] === 'widgets-for-fields' &&
      params.widget_for_field_id === widgetForField.widget_for_field_id
    const isActive = isOpen && urlPath.length === 2

    const onClickButton = useCallback(() => {
      if (isOpen) return navigate('/widgets-for-fields')
      navigate(`/widgets-for-fields/${widgetForField.widget_for_field_id}`)
    }, [isOpen, navigate, widgetForField.widget_for_field_id])

    return (
      <Node
        node={widgetForField}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isOpen}
        isActive={isActive}
        childrenCount={0}
        to={`/widgets-for-fields/${widgetForField.widget_for_field_id}`}
        onClickButton={onClickButton}
      />
    )
  },
)
