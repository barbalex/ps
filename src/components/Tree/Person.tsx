import { memo, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import isEqual from 'lodash/isEqual'

import { Node } from './Node.tsx'
import { Persons as Person } from '../../../generated/client/index.ts'

interface Props {
  project_id: string
  person: Person
  level?: number
}

export const PersonNode = memo(({ project_id, person, level = 4 }: Props) => {
  const location = useLocation()
  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const ownArray = useMemo(
    () => ['data', 'projects', project_id, 'persons', person.person_id],
    [person.person_id, project_id],
  )
  const ownUrl = `/${ownArray.join('/')}`

  const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
  const isActive = isEqual(urlPath, ownArray)

  return (
    <Node
      node={person}
      id={person.person_id}
      level={level}
      isInActiveNodeArray={isInActiveNodeArray}
      isActive={isActive}
      childrenCount={0}
      to={ownUrl}
    />
  )
})
