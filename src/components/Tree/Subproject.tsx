import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { Node } from './Node'
import { Subprojects as Subproject } from '../../../generated/client'
import { PlacesNode } from './Places'
import { SubprojectReportsNode } from './SubprojectReports'

export const SubprojectNode = ({
  project_id,
  subproject,
  level = 4,
}: {
  project_id: string
  subproject: Subproject
  level: number
}) => {
  const location = useLocation()
  const navigate = useNavigate()

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpen =
    urlPath[0] === 'projects' &&
    urlPath[1] === project_id &&
    urlPath[2] === 'subprojects' &&
    urlPath[3] === subproject.subproject_id
  const isActive = isOpen && urlPath.length === 4

  const onClickButton = useCallback(() => {
    if (isOpen) return navigate(`/projects/${project_id}/subprojects`)
    navigate(`/projects/${project_id}/subprojects/${subproject.subproject_id}`)
  }, [isOpen, navigate, project_id, subproject.subproject_id])

  // TODO: childrenCount
  return (
    <>
      <Node
        node={subproject}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isOpen}
        isActive={isActive}
        childrenCount={10}
        to={`/projects/${project_id}/subprojects/${subproject.subproject_id}`}
        onClickButton={onClickButton}
      />
      {isOpen && (
        <>
          <PlacesNode
            project_id={project_id}
            subproject_id={subproject.subproject_id}
            level={level + 1}
          />
          <SubprojectReportsNode
            project_id={project_id}
            subproject_id={subproject.subproject_id}
          />
        </>
      )}
    </>
  )
}
