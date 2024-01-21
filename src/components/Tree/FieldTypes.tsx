import { useCallback, useMemo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider'
import { Node } from './Node'
import { FieldTypes as FieldType } from '../../../generated/client'
import { FieldTypeNode } from './FieldType'

export const FieldTypesNode = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const { db } = useElectric()!
  const { results } = useLiveQuery(
    db.field_types.liveMany({
      where: { deleted: false },
      orderBy: { label: 'asc' },
    }),
  )
  const fieldTypes: FieldType[] = results ?? []

  const fieldTypesNode = useMemo(
    () => ({
      label: `Field Types (${fieldTypes.length})`,
    }),
    [fieldTypes.length],
  )

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpen = urlPath[0] === 'field-types'
  const isActive = isOpen && urlPath.length === 1

  const onClickButton = useCallback(() => {
    if (isOpen) return navigate('/')
    navigate('/field-types')
  }, [isOpen, navigate])

  return (
    <>
      <Node
        node={fieldTypesNode}
        level={1}
        isOpen={isOpen}
        isInActiveNodeArray={isOpen}
        isActive={isActive}
        childrenCount={fieldTypes.length}
        to={`/field-types`}
        onClickButton={onClickButton}
      />
      {isOpen &&
        fieldTypes.map((fieldType) => (
          <FieldTypeNode key={fieldType.field_type_id} fieldType={fieldType} />
        ))}
    </>
  )
}
