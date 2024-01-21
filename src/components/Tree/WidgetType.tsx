import { useCallback } from 'react'
import { useLocation, useParams, useNavigate } from 'react-router-dom'

import { Node } from './Node'
import { WidgetTypes as WidgetType } from '../../../generated/client'

export const WidgetTypeNode = ({
  widgetType,
  level = 2,
}: {
  widgetTypes: WidgetType[]
  level: number
}) => {
  const params = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpen =
    urlPath[0] === 'widget-types' &&
    params.widget_type_id === widgetType.widget_type_id
  const isActive = isOpen && urlPath.length === 2

  const onClickButton = useCallback(() => {
    if (isOpen) return navigate('/widget-types')
    navigate(`/widget-types/${widgetType.widget_type_id}`)
  }, [isOpen, navigate, widgetType.widget_type_id])

  return (
    <Node
      node={widgetType}
      level={level}
      isOpen={isOpen}
      isInActiveNodeArray={isOpen}
      isActive={isActive}
      childrenCount={0}
      to={`/widget-types/${widgetType.widget_type_id}`}
      onClickButton={onClickButton}
    />
  )
}
