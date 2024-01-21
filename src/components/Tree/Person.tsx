import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { Node } from './Node'
import { Persons as Person } from '../../../generated/client'

export const PersonNode = ({
  project_id,
  person,
  level = 4,
}: {
  persons: Person[]
  level: number
}) => {
  const location = useLocation()
  const navigate = useNavigate()

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpen =
    urlPath[0] === 'projects' &&
    urlPath[1] === project_id &&
    urlPath[2] === 'persons' &&
    urlPath[3] === person.person_id
  const isActive = isOpen && urlPath.length === 4

  const onClickButton = useCallback(() => {
    if (isOpen) return navigate(`/projects/${project_id}/persons`)
    navigate(`/projects/${project_id}/persons/${person.person_id}`)
  }, [isOpen, navigate, project_id, person.person_id])

  return (
    <Node
      node={person}
      level={level}
      isOpen={isOpen}
      isInActiveNodeArray={isOpen}
      isActive={isActive}
      childrenCount={0}
      to={`/projects/${project_id}/persons/${person.person_id}`}
      onClickButton={onClickButton}
    />
  )
}
