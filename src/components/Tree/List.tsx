import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { Node } from './Node'
import { Lists as List } from '../../../generated/client'

export const ListNode = ({
  project_id,
  list,
  level = 4,
}: {
  lists: List[]
  level: number
}) => {
  const location = useLocation()
  const navigate = useNavigate()

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpen =
    urlPath[0] === 'projects' &&
    urlPath[1] === project_id &&
    urlPath[2] === 'lists' &&
    urlPath[3] === list.list_id
  const isActive = isOpen && urlPath.length === 4

  const onClickButton = useCallback(() => {
    if (isOpen) return navigate(`/projects/${project_id}/lists`)
    navigate(`/projects/${project_id}/lists/${list.list_id}`)
  }, [isOpen, navigate, project_id, list.list_id])

  return (
    <Node
      node={list}
      level={level}
      isOpen={isOpen}
      isInActiveNodeArray={isOpen}
      isActive={isActive}
      childrenCount={0}
      to={`/projects/${project_id}/lists/${list.list_id}`}
      onClickButton={onClickButton}
    />
  )
}
