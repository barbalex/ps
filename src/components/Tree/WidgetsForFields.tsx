import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider'
import { Node } from './Node'
import { WidgetForFieldNode } from './WidgetForField'

export const WidgetsForFieldsNode = memo(() => {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const { db } = useElectric()!
  const { results: widgetsForFields = [] } = useLiveQuery(
    db.widgets_for_fields.liveMany({
      where: { deleted: false },
      orderBy: { label: 'asc' },
    }),
  )

  const widgetsForFieldsNode = useMemo(
    () => ({ label: `Widgets For Fields (${widgetsForFields.length})` }),
    [widgetsForFields.length],
  )

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpen = urlPath[0] === 'widgets-for-fields'
  const isActive = isOpen && urlPath.length === 1

  const onClickButton = useCallback(() => {
    if (isOpen) {
      return navigate({ pathname: '/', search: searchParams.toString() })
    }
    navigate({
      pathname: '/widgets-for-fields',
      search: searchParams.toString(),
    })
  }, [isOpen, navigate, searchParams])

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
})
