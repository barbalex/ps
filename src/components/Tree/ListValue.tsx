import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { Node } from './Node'
import { ListValues as ListValue } from '../../../generated/client'

export const ListValueNode = ({
  project_id,
  list_id,
  listValue,
  level = 6,
}: {
  project_id: string
  listValue: ListValue
  level: number
}) => {
  const location = useLocation()
  const navigate = useNavigate()

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpen =
    urlPath[0] === 'projects' &&
    urlPath[1] === project_id &&
    urlPath[2] === 'lists' &&
    urlPath[3] === list_id &&
    urlPath[4] === 'values' &&
    urlPath[5] === listValue.list_value_id
  const isActive = isOpen && urlPath.length === level

  const onClickButton = useCallback(() => {
    if (isOpen)
      return navigate(`/projects/${project_id}/lists/${list_id}/values`)
    navigate(
      `/projects/${project_id}/lists/${list_id}/values/${listValue.list_value_id}`,
    )
  }, [isOpen, navigate, project_id, list_id, listValue.list_value_id])

  return (
    <Node
      node={listValue}
      level={level}
      isOpen={isOpen}
      isInActiveNodeArray={isOpen}
      isActive={isActive}
      childrenCount={0}
      to={`/projects/${project_id}/lists/${list_id}/values/${listValue.list_value_id}`}
      onClickButton={onClickButton}
    />
  )
}
