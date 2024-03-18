import { useCallback, memo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import { Node } from './Node'
import { Persons as Person } from '../../../generated/client'

interface Props {
  project_id: string
  person: Person
  level?: number
}

export const PersonNode = memo(({ project_id, person, level = 4 }: Props) => {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpen =
    urlPath[0] === 'projects' &&
    urlPath[1] === project_id &&
    urlPath[2] === 'persons' &&
    urlPath[3] === person.person_id
  const isActive = isOpen && urlPath.length === 4

  const baseUrl = `/projects/${project_id}/persons`

  const onClickButton = useCallback(() => {
    if (isOpen) {
      return navigate({ pathname: baseUrl, search: searchParams.toString() })
    }
    navigate({
      pathname: `${baseUrl}/${person.person_id}`,
      search: searchParams.toString(),
    })
  }, [isOpen, navigate, baseUrl, person.person_id, searchParams])

  return (
    <Node
      node={person}
      level={level}
      isOpen={isOpen}
      isInActiveNodeArray={isOpen}
      isActive={isActive}
      childrenCount={0}
      to={`${baseUrl}/${person.person_id}`}
      onClickButton={onClickButton}
    />
  )
})
