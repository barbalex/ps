import { useCallback, useMemo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider'
import { Node } from './Node'
import { WidgetsForFields as WidgetForField } from '../../../generated/client'
import { WidgetForFieldNode } from './WidgetForField'

export const WidgetsForFieldsNode = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const { db } = useElectric()!
  const { results } = useLiveQuery(
    db.widgets_for_fields.liveMany({
      where: { deleted: false },
      orderBy: { label: 'asc' },
    }),
  )
  const widgetsForFields: WidgetForField[] = results ?? []

  const widgetsForFieldsNode = useMemo(
    () => ({
      label: `Widgets For Fields (${widgetsForFields.length})`,
    }),
    [widgetsForFields.length],
  )

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpen = urlPath[0] === 'widgets-for-fields'
  const isActive = isOpen && urlPath.length === 1

  const onClickButton = useCallback(() => {
    if (isOpen) return navigate('/')
    navigate('/widgets-for-fields')
  }, [isOpen, navigate])

  return (
    <>
      <Node
        node={widgetsForFieldsNode}
        level={1}
        isOpen={isOpen}
        isInActiveNodeArray={isOpen}
        isActive={isActive}
        childrenCount={widgetsForFields.length}
        to={`/widgets-for-fields`}
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
}
