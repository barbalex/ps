import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider'
import { Node } from './Node'
import { FieldTypeNode } from './FieldType'

export const FieldTypesNode = memo(() => {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const { db } = useElectric()!
  const { results: fieldTypes = [] } = useLiveQuery(
    db.field_types.liveMany({
      where: { deleted: false },
      orderBy: { label: 'asc' },
    }),
  )

  const fieldTypesNode = useMemo(
    () => ({ label: `Field Types (${fieldTypes.length})` }),
    [fieldTypes.length],
  )

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpen = urlPath[0] === 'field-types'
  const isActive = isOpen && urlPath.length === 1

  const onClickButton = useCallback(() => {
    if (isOpen) {
      return navigate({ pathname: '/', search: searchParams.toString() })
    }
    navigate({ pathname: '/field-types', search: searchParams.toString() })
  }, [isOpen, navigate, searchParams])

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
})
