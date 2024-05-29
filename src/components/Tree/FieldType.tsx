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
import { FieldTypes as FieldType } from '../../../generated/client/index.ts'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { useElectric } from '../../ElectricProvider.tsx'

interface Props {
  fieldType: FieldType
  level?: number
}

export const FieldTypeNode = memo(({ fieldType, level = 2 }: Props) => {
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
    urlPath[1] === 'field-types' &&
    params.field_type_id === fieldType.field_type_id
  const isActive = isOpen && urlPath.length === 2

  const onClickButton = useCallback(() => {
    if (isOpen) {
      removeChildNodes({
        node: ['field-types', fieldType.field_type_id],
        db,
        appStateId: appState?.app_state_id,
      })
      return navigate({
        pathname: '/data/field-types',
        search: searchParams.toString(),
      })
    }
    navigate({
      pathname: `/data/field-types/${fieldType.field_type_id}`,
      search: searchParams.toString(),
    })
  }, [
    isOpen,
    navigate,
    fieldType.field_type_id,
    searchParams,
    db,
    appState?.app_state_id,
  ])

  return (
    <Node
      node={fieldType}
      id={fieldType.field_type_id}
      level={level}
      isOpen={isOpen}
      isInActiveNodeArray={isOpen}
      isActive={isActive}
      childrenCount={0}
      to={`/data/field-types/${fieldType.field_type_id}`}
      onClickButton={onClickButton}
    />
  )
})
