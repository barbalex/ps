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

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpen =
    urlPath[0] === 'field-types' &&
    params.field_type_id === fieldType.field_type_id
  const isActive = isOpen && urlPath.length === 2

  const onClickButton = useCallback(() => {
    if (isOpen) {
      return navigate({
        pathname: '/field-types',
        search: searchParams.toString(),
      })
    }
    navigate({
      pathname: `/field-types/${fieldType.field_type_id}`,
      search: searchParams.toString(),
    })
  }, [isOpen, navigate, fieldType.field_type_id, searchParams])

  return (
    <Node
      node={fieldType}
      id={fieldType.field_type_id}
      level={level}
      isOpen={isOpen}
      isInActiveNodeArray={isOpen}
      isActive={isActive}
      childrenCount={0}
      to={`/field-types/${fieldType.field_type_id}`}
      onClickButton={onClickButton}
    />
  )
})
