import { useCallback } from 'react'
import { useLocation, useParams, useNavigate } from 'react-router-dom'

import { Node } from './Node'
import { Fields as Field } from '../../../generated/client'

export const FieldNode = ({
  field,
  level = 2,
}: {
  fields: Field[]
  level: number
}) => {
  const params = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpen = urlPath[0] === 'fields' && params.field_id === field.field_id
  const isActive = isOpen && urlPath.length === 2

  const onClickButton = useCallback(() => {
    if (isOpen) return navigate('/fields')
    navigate(`/fields/${field.field_id}`)
  }, [isOpen, navigate, field.field_id])

  return (
    <Node
      node={field}
      level={level}
      isOpen={isOpen}
      isInActiveNodeArray={isOpen}
      isActive={isActive}
      childrenCount={0}
      to={`/fields/${field.field_id}`}
      onClickButton={onClickButton}
    />
  )
}
