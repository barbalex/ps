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
import { WidgetsForFields as WidgetForField } from '../../../generated/client/index.ts'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { useElectric } from '../../ElectricProvider.tsx'

interface Props {
  widgetForField: WidgetForField
  level?: number
}

export const WidgetForFieldNode = memo(
  ({ widgetForField, level = 2 }: Props) => {
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
      urlPath[0] === 'widgets-for-fields' &&
      params.widget_for_field_id === widgetForField.widget_for_field_id
    const isActive = isOpen && urlPath.length === 2

    const onClickButton = useCallback(() => {
      if (isOpen) {
        return navigate({
          pathname: '/widgets-for-fields',
          search: searchParams.toString(),
        })
      }
      navigate({
        pathname: `/widgets-for-fields/${widgetForField.widget_for_field_id}`,
        search: searchParams.toString(),
      })
    }, [isOpen, navigate, searchParams, widgetForField.widget_for_field_id])

    return (
      <Node
        node={widgetForField}
        id={widgetForField.widget_for_field_id}
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
