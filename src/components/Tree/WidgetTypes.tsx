import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import isEqual from 'lodash/isEqual'

import { useElectric } from '../../ElectricProvider.tsx'
import { Node } from './Node.tsx'
import { WidgetTypeNode } from './WidgetType.tsx'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'

export const WidgetTypesNode = memo(({ level = 1 }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user: authUser } = useCorbado()

  const { db } = useElectric()!
  const { results: widgetTypes = [] } = useLiveQuery(
    db.widget_types.liveMany({
      orderBy: { label: 'asc' },
    }),
  )

  const { results: appState } = useLiveQuery(
    db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
  )
  const openNodes = useMemo(
    () => appState?.tree_open_nodes ?? [],
    [appState?.tree_open_nodes],
  )

  const widgetTypesNode = useMemo(
    () => ({ label: `Widget Types (${widgetTypes.length})` }),
    [widgetTypes.length],
  )

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpen = urlPath[1] === 'widget-types'
  const isActive = isOpen && urlPath.length === level + 1

  const onClickButton = useCallback(() => {
    if (isOpen) {
      removeChildNodes({
        node: ['widget-types'],
        db,
        appStateId: appState?.app_state_id,
      })
      return navigate({
        pathname: '/data/projects',
        search: searchParams.toString(),
      })
    }
    navigate({
      pathname: '/data/widget-types',
      search: searchParams.toString(),
    })
  }, [appState?.app_state_id, db, isOpen, navigate, searchParams])

  return (
    <>
      <Node
        node={widgetTypesNode}
        level={1}
        isOpen={isOpen}
        isInActiveNodeArray={isOpen}
        isActive={isActive}
        childrenCount={widgetTypes.length}
        to={`/data/widget-types`}
        onClickButton={onClickButton}
      />
      {isOpen &&
        widgetTypes.map((widgetType) => (
          <WidgetTypeNode
            key={widgetType.widget_type_id}
            widgetType={widgetType}
          />
        ))}
    </>
  )
})
