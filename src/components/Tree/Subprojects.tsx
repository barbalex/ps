import { useCallback, useMemo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider'
import { Node } from './Node'
import { Subprojects as Subproject } from '../../../generated/client'
import { SubprojectNode } from './Subproject'

export const SubprojectsNode = ({ project_id, level = 3 }) => {
  const location = useLocation()
  const navigate = useNavigate()

  const { db } = useElectric()!
  const { results } = useLiveQuery(
    db.subprojects.liveMany({
      where: { deleted: false, project_id },
      orderBy: { label: 'asc' },
    }),
  )
  const subprojects: Subproject[] = results ?? []

  console.log('hello from SubprojectsNode, subprojects:', subprojects)

  // get projects.subproject_name_plural to name the table
  // can't include projects in subprojects query because there will be no result before subprojects are created
  const { results: project } = useLiveQuery(
    db.projects.liveUnique({ where: { project_id } }),
  )
  const namePlural = project?.subproject_name_plural ?? 'Subprojects'

  const subprojectsNode = useMemo(
    () => ({
      label: `${namePlural} (${subprojects.length})`,
    }),
    [namePlural, subprojects.length],
  )

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpen =
    urlPath[0] === 'projects' &&
    urlPath[1] === project_id &&
    urlPath[2] === 'subprojects'
  const isActive = isOpen && urlPath.length === 3

  const onClickButton = useCallback(() => {
    if (isOpen) return navigate(`/projects/${project_id}`)
    navigate(`/projects/${project_id}/subprojects`)
  }, [isOpen, navigate, project_id])

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
        to={`/projects/${project_id}/subprojects`}
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
}
