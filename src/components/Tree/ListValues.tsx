import { useCallback, useMemo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider'
import { Node } from './Node'
import { ListValues as ListValue } from '../../../generated/client'
import { ListValueNode } from './ListValue'

export const ListValuesNode = ({ project_id, list_id, level = 5 }) => {
  const location = useLocation()
  const navigate = useNavigate()

  const { db } = useElectric()!
  const { results } = useLiveQuery(
    db.list_values.liveMany({
      where: { deleted: false, list_id },
      orderBy: { label: 'asc' },
    }),
  )
  const listValues: ListValue[] = results ?? []

  const valuesNode = useMemo(
    () => ({
      label: `List Values (${listValues.length})`,
    }),
    [listValues.length],
  )

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpen =
    urlPath[0] === 'projects' &&
    urlPath[1] === project_id &&
    urlPath[2] === 'lists' &&
    urlPath[3] === list_id &&
    urlPath[4] === 'values'
  const isActive = isOpen && urlPath.length === level

  const onClickButton = useCallback(() => {
    if (isOpen) return navigate(`/projects/${project_id}/lists/${list_id}`)
    navigate(`/projects/${project_id}/lists/${list_id}/values`)
  }, [isOpen, navigate, list_id, project_id])

  return (
    <>
      <Node
        node={valuesNode}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isOpen}
        isActive={isActive}
        childrenCount={listValues.length}
        to={`/projects/${project_id}/lists/${list_id}/values`}
        onClickButton={onClickButton}
      />
      {isOpen &&
        listValues.map((listValue) => (
          <ListValueNode
            key={listValue.list_value_id}
            project_id={project_id}
            list_id={list_id}
            listValue={listValue}
          />
        ))}
    </>
  )
}
