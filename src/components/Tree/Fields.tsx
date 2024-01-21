import { useCallback, useMemo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider'
import { Node } from './Node'
import { Fields as Field } from '../../../generated/client'
import { FieldNode } from './Field'

export const FieldsNode = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const { db } = useElectric()!
  const { results } = useLiveQuery(
    db.fields.liveMany({
      where: { deleted: false },
      orderBy: { label: 'asc' },
    }),
  )
  const fields: Field[] = results ?? []

  const fieldsNode = useMemo(
    () => ({
      label: `Fields (${fields.length})`,
    }),
    [fields.length],
  )

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpen = urlPath[0] === 'fields'
  const isActive = isOpen && urlPath.length === 1

  const onClickButton = useCallback(() => {
    if (isOpen) return navigate('/')
    navigate('/fields')
  }, [isOpen, navigate])

  return (
    <>
      <Node
        node={fieldsNode}
        level={1}
        isOpen={isOpen}
        isInActiveNodeArray={isOpen}
        isActive={isActive}
        childrenCount={fields.length}
        to={`/fields`}
        onClickButton={onClickButton}
      />
      {isOpen &&
        fields.map((field) => <FieldNode key={field.field_id} field={field} />)}
    </>
  )
}
