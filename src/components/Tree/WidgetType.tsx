import { useCallback, memo } from 'react'
import {
  useLocation,
  useParams,
  useNavigate,
  useSearchParams,
} from 'react-router-dom'

import { Node } from './Node'
import { WidgetTypes as WidgetType } from '../../../generated/client'

interface Props {
  widgetType: WidgetType
  level?: number
}

export const WidgetTypeNode = memo(({ widgetType, level = 2 }: Props) => {
  const params = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpen =
    urlPath[0] === 'widget-types' &&
    params.widget_type_id === widgetType.widget_type_id
  const isActive = isOpen && urlPath.length === 2

  const onClickButton = useCallback(() => {
    if (isOpen) {
      return navigate({
        pathname: '/widget-types',
        search: searchParams.toString(),
      })
    }
    navigate({
      pathname: `/widget-types/${widgetType.widget_type_id}`,
      search: searchParams.toString(),
    })
  }, [isOpen, navigate, searchParams, widgetType.widget_type_id])

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
})
