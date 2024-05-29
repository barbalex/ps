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
import { useElectric } from '../../ElectricProvider.tsx'

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

  const { db } = useElectric()!
  const { results: appState } = useLiveQuery(
    db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
  )

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpen =
    urlPath[1] === 'widget-types' &&
    params.widget_type_id === widgetType.widget_type_id
  const isActive = isOpen && urlPath.length === level + 1

  const onClickButton = useCallback(() => {
    if (isOpen) {
      removeChildNodes({
        node: ['widget-types', widgetType.widget_type_id],
        db,
        appStateId: appState?.app_state_id,
      })
      return navigate({
        pathname: '/data/widget-types',
        search: searchParams.toString(),
      })
    }
    navigate({
      pathname: `/data/widget-types/${widgetType.widget_type_id}`,
      search: searchParams.toString(),
    })
  }, [
    appState?.app_state_id,
    db,
    isOpen,
    navigate,
    searchParams,
    widgetType.widget_type_id,
  ])

  return (
    <Node
      node={widgetType}
      id={widgetType.widget_type_id}
      level={level}
      isOpen={isOpen}
      isInActiveNodeArray={isOpen}
      isActive={isActive}
      childrenCount={0}
      to={`/data/widget-types/${widgetType.widget_type_id}`}
      onClickButton={onClickButton}
    />
  )
})
