import { useCallback, memo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { Node } from './Node'
import { Lists as List } from '../../../generated/client'
import { ListValuesNode } from './ListValues'

interface Props {
  project_id: string
  list: List
  level?: number
}

export const ListNode = memo(({ project_id, list, level = 4 }: Props) => {
  const location = useLocation()
  const navigate = useNavigate()

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpen =
    urlPath[0] === 'projects' &&
    urlPath[1] === project_id &&
    urlPath[2] === 'lists' &&
    urlPath[3] === list.list_id
  const isActive = isOpen && urlPath.length === 4

  const baseUrl = `/projects/${project_id}/lists`

  const onClickButton = useCallback(() => {
    if (isOpen) return navigate(baseUrl)
    navigate(`${baseUrl}/${list.list_id}`)
  }, [isOpen, navigate, baseUrl, list.list_id])

  return (
    <>
      <Node
        node={list}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isOpen}
        isActive={isActive}
        childrenCount={0}
        to={`${baseUrl}/${list.list_id}`}
        onClickButton={onClickButton}
      />
      {isOpen && (
        <ListValuesNode project_id={project_id} list_id={list.list_id} />
      )}
    </>
  )
})
