import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import isEqual from 'lodash/isEqual'

import { useElectric } from '../../ElectricProvider.tsx'
import { Node } from './Node.tsx'
import { WidgetForFieldNode } from './WidgetForField.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'

export const WidgetsForFieldsNode = memo(({ level = 1 }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user: authUser } = useCorbado()

  const { db } = useElectric()!
  const { results: widgetsForFields = [] } = useLiveQuery(
    db.widgets_for_fields.liveMany({
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

  const widgetsForFieldsNode = useMemo(
    () => ({ label: `Widgets For Fields (${widgetsForFields.length})` }),
    [widgetsForFields.length],
  )

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpen = urlPath[1] === 'widgets-for-fields'
  const isActive = isOpen && urlPath.length === level + 1

  const onClickButton = useCallback(() => {
    if (isOpen) {
      removeChildNodes({
        node: ['widgets-for-fields'],
        db,
        appStateId: appState?.app_state_id,
      })
      return navigate({
        pathname: '/data/projects',
        search: searchParams.toString(),
      })
    }
    navigate({
      pathname: '/data/widgets-for-fields',
      search: searchParams.toString(),
    })
  }, [appState?.app_state_id, db, isOpen, navigate, searchParams])

  return (
    <>
      <Node
        node={widgetsForFieldsNode}
        level={1}
        isOpen={isOpen}
        isInActiveNodeArray={isOpen}
        isActive={isActive}
        childrenCount={widgetsForFields.length}
        to={`/data/widgets-for-fields`}
        onClickButton={onClickButton}
      />
      {isOpen &&
        widgetsForFields.map((widgetForField) => (
          <WidgetForFieldNode
            key={widgetForField.widget_for_field_id}
            widgetForField={widgetForField}
          />
        ))}
    </>
  )
})
