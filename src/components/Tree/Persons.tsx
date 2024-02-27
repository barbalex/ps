import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider'
import { Node } from './Node'
import { PersonNode } from './Person'

interface Props {
  project_id: string
  level?: number
}

export const PersonsNode = memo(({ project_id, level = 3 }: Props) => {
  const location = useLocation()
  const navigate = useNavigate()

  const { db } = useElectric()!
  const { results: persons = [] } = useLiveQuery(
    db.persons.liveMany({
      where: { deleted: false, project_id },
      orderBy: { label: 'asc' },
    }),
  )

  const personsNode = useMemo(
    () => ({ label: `Persons (${persons.length})` }),
    [persons.length],
  )

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpen =
    urlPath[0] === 'projects' &&
    urlPath[1] === project_id &&
    urlPath[2] === 'persons'
  const isActive = isOpen && urlPath.length === 3

  const baseUrl = `/projects/${project_id}`

  const onClickButton = useCallback(() => {
    if (isOpen) return navigate(baseUrl)
    navigate(`${baseUrl}/persons`)
  }, [baseUrl, isOpen, navigate])

  return (
    <>
      <Node
        node={personsNode}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isOpen}
        isActive={isActive}
        childrenCount={persons.length}
        to={`${baseUrl}/persons`}
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
})
