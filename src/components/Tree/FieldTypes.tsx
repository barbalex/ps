import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import isEqual from 'lodash/isEqual'

import { useElectric } from '../../ElectricProvider.tsx'
import { Node } from './Node.tsx'
import { FieldTypeNode } from './FieldType.tsx'

export const FieldTypesNode = memo(({ level = 1 }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const { db } = useElectric()!
  const { results: fieldTypes = [] } = useLiveQuery(
    db.field_types.liveMany({
      orderBy: { label: 'asc' },
    }),
  )

  const fieldTypesNode = useMemo(
    () => ({ label: `Field Types (${fieldTypes.length})` }),
    [fieldTypes.length],
  )

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpen = urlPath[1] === 'field-types'
  const isActive = isOpen && urlPath.length === level + 1

  const onClickButton = useCallback(() => {
    if (isOpen) {
      return navigate({
        pathname: '/data/projects',
        search: searchParams.toString(),
      })
    }
    navigate({ pathname: '/data/field-types', search: searchParams.toString() })
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
        to={`/data/field-types`}
        onClickButton={onClickButton}
      />
      {isOpen &&
        fieldTypes.map((fieldType) => (
          <FieldTypeNode key={fieldType.field_type_id} fieldType={fieldType} />
        ))}
    </>
  )
})
