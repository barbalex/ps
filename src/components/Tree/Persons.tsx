import { useCallback, useMemo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider'
import { Node } from './Node'
import { Persons as Person } from '../../../generated/client'
import { PersonNode } from './Person'

export const PersonsNode = ({ project_id, level = 3 }) => {
  const location = useLocation()
  const navigate = useNavigate()

  const { db } = useElectric()!
  const { results } = useLiveQuery(
    db.persons.liveMany({
      where: { deleted: false, project_id },
      orderBy: { label: 'asc' },
    }),
  )
  const persons: Person[] = results ?? []

  const personsNode = useMemo(
    () => ({
      label: `Persons (${persons.length})`,
    }),
    [persons.length],
  )

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpen =
    urlPath[0] === 'projects' &&
    urlPath[1] === project_id &&
    urlPath[2] === 'persons'
  const isActive = isOpen && urlPath.length === 3

  const onClickButton = useCallback(() => {
    if (isOpen) return navigate(`/projects/${project_id}`)
    navigate(`/projects/${project_id}/persons`)
  }, [isOpen, navigate, project_id])

  return (
    <>
      <Node
        node={personsNode}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isOpen}
        isActive={isActive}
        childrenCount={persons.length}
        to={`/projects/${project_id}/persons`}
        onClickButton={onClickButton}
      />
      {isOpen &&
        persons.map((person) => (
          <PersonNode
            key={person.person_id}
            project_id={project_id}
            person={person}
          />
        ))}
    </>
  )
}
