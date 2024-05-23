import { useCallback, memo } from 'react'
import {
  useLocation,
  useParams,
  useNavigate,
  useSearchParams,
} from 'react-router-dom'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'

import { Node } from './Node.tsx'
import { WidgetTypes as WidgetType } from '../../../generated/client/index.ts'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'

interface Props {
  widgetType: WidgetType
  level?: number
}

export const WidgetTypeNode = memo(({ widgetType, level = 2 }: Props) => {
  const params = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user: authUser } = useCorbado()

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
      id={widgetType.widget_type_id}
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
