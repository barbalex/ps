import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider.tsx'
import { Node } from './Node.tsx'
import { SubprojectNode } from './Subproject'

interface Props {
  project_id: string
  level?: number
}

export const SubprojectsNode = memo(({ project_id, level = 3 }: Props) => {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const { db } = useElectric()!
  const { results: subprojects = [] } = useLiveQuery(
    db.subprojects.liveMany({
      where: { project_id },
      orderBy: { label: 'asc' },
    }),
  )

  // get projects.subproject_name_plural to name the table
  // can't include projects in subprojects query because there will be no result before subprojects are created
  const { results: project } = useLiveQuery(
    db.projects.liveUnique({ where: { project_id } }),
  )
  const namePlural = project?.subproject_name_plural ?? 'Subprojects'

  const subprojectsNode = useMemo(
    () => ({ label: `${namePlural} (${subprojects.length})` }),
    [namePlural, subprojects.length],
  )

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpen =
    urlPath[0] === 'projects' &&
    urlPath[1] === project_id &&
    urlPath[2] === 'subprojects'
  const isActive = isOpen && urlPath.length === 3

  const baseUrl = `/projects/${project_id}`

  const onClickButton = useCallback(() => {
    if (isOpen) {
      return navigate({ pathname: baseUrl, search: searchParams.toString() })
    }
    navigate({
      pathname: `${baseUrl}/subprojects`,
      search: searchParams.toString(),
    })
  }, [baseUrl, isOpen, navigate, searchParams])

  // prevent flash of different name that happens before namePlural is set
  if (!namePlural) return null

  return (
    <>
      <Node
        node={subprojectsNode}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isOpen}
        isActive={isActive}
        childrenCount={subprojects.length}
        to={`${baseUrl}/subprojects`}
        onClickButton={onClickButton}
      />
      {isOpen &&
        subprojects.map((subproject) => (
          <SubprojectNode
            key={subproject.subproject_id}
            project_id={project_id}
            subproject={subproject}
          />
        ))}
    </>
  )
})
