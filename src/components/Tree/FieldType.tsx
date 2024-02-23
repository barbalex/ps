import { useCallback, memo } from 'react'
import { useLocation, useParams, useNavigate } from 'react-router-dom'

import { Node } from './Node'
import { FieldTypes as FieldType } from '../../../generated/client'

type Props = {
  fieldType: FieldType
  level?: number
}

export const FieldTypeNode = memo(({ fieldType, level = 2 }: Props) => {
  const params = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpen =
    urlPath[0] === 'field-types' &&
    params.field_type_id === fieldType.field_type_id
  const isActive = isOpen && urlPath.length === 2

  const onClickButton = useCallback(() => {
    if (isOpen) return navigate('/field-types')
    navigate(`/field-types/${fieldType.field_type_id}`)
  }, [isOpen, navigate, fieldType.field_type_id])

  return (
    <Node
      node={fieldType}
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
