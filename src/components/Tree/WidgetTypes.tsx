import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider'
import { Node } from './Node'
import { WidgetTypeNode } from './WidgetType'

export const WidgetTypesNode = memo(() => {
  const location = useLocation()
  const navigate = useNavigate()

  const { db } = useElectric()!
  const { results: widgetTypes = [] } = useLiveQuery(
    db.widget_types.liveMany({
      where: { deleted: false },
      orderBy: { label: 'asc' },
    }),
  )

  const widgetTypesNode = useMemo(
    () => ({ label: `Widget Types (${widgetTypes.length})` }),
    [widgetTypes.length],
  )

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpen = urlPath[0] === 'widget-types'
  const isActive = isOpen && urlPath.length === 1

  const onClickButton = useCallback(() => {
    if (isOpen) return navigate('/')
    navigate('/widget-types')
  }, [isOpen, navigate])

  return (
    <>
      <Node
        node={widgetTypesNode}
        level={1}
        isOpen={isOpen}
        isInActiveNodeArray={isOpen}
        isActive={isActive}
        childrenCount={widgetTypes.length}
        to={`/widget-types`}
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
