import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider'
import { Node } from './Node'
import { ListNode } from './List'

type Props = {
  project_id: string
  level?: number
}

export const ListsNode = memo(({ project_id, level = 3 }: Props) => {
  const location = useLocation()
  const navigate = useNavigate()

  const { db } = useElectric()!
  const { results: lists = [] } = useLiveQuery(
    db.lists.liveMany({
      where: { deleted: false, project_id },
      orderBy: { label: 'asc' },
    }),
  )

  const listsNode = useMemo(
    () => ({ label: `Lists (${lists.length})` }),
    [lists.length],
  )

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpen =
    urlPath[0] === 'projects' &&
    urlPath[1] === project_id &&
    urlPath[2] === 'lists'
  const isActive = isOpen && urlPath.length === 3

  const baseUrl = `/projects/${project_id}`

  const onClickButton = useCallback(() => {
    if (isOpen) return navigate(baseUrl)
    navigate(`${baseUrl}/lists`)
  }, [baseUrl, isOpen, navigate])

  return (
    <>
      <Node
        node={listsNode}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isOpen}
        isActive={isActive}
        childrenCount={lists.length}
        to={`${baseUrl}/lists`}
        onClickButton={onClickButton}
      />
      {isOpen &&
        lists.map((list) => (
          <ListNode key={list.list_id} project_id={project_id} list={list} />
        ))}
    </>
  )
})
