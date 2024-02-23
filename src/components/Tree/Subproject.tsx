import { useCallback, memo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { Node } from './Node'
import { Subprojects as Subproject } from '../../../generated/client'
import { PlacesNode } from './Places'
import { SubprojectReportsNode } from './SubprojectReports'
import { GoalsNode } from './Goals'
import { SubprojectTaxaNode } from './SubprojectTaxa'
import { SubprojectUsersNode } from './SubprojectUsers'
import { FilesNode } from './Files'

type Props = {
  project_id: string
  subproject: Subproject
  level?: number
}

export const SubprojectNode = memo(
  ({ project_id, subproject, level = 4 }: Props) => {
    const location = useLocation()
    const navigate = useNavigate()

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const isOpen =
      urlPath[0] === 'projects' &&
      urlPath[1] === project_id &&
      urlPath[2] === 'subprojects' &&
      urlPath[3] === subproject.subproject_id
    const isActive = isOpen && urlPath.length === 4

    const baseUrl = `/projects/${project_id}/subprojects`

    const onClickButton = useCallback(() => {
      if (isOpen) return navigate(baseUrl)
      navigate(`${baseUrl}/${subproject.subproject_id}`)
    }, [baseUrl, isOpen, navigate, subproject.subproject_id])

    return (
      <>
        <Node
          node={subproject}
          level={level}
          isOpen={isOpen}
          isInActiveNodeArray={isOpen}
          isActive={isActive}
          childrenCount={5}
          to={`${baseUrl}/${subproject.subproject_id}`}
          onClickButton={onClickButton}
        />
        {isOpen && (
          <>
            <PlacesNode
              project_id={project_id}
              subproject_id={subproject.subproject_id}
            />
            <SubprojectReportsNode
              project_id={project_id}
              subproject_id={subproject.subproject_id}
            />
            <GoalsNode
              project_id={project_id}
              subproject_id={subproject.subproject_id}
            />
            <SubprojectTaxaNode
              project_id={project_id}
              subproject_id={subproject.subproject_id}
            />
            <SubprojectUsersNode
              project_id={project_id}
              subproject_id={subproject.subproject_id}
            />
            <FilesNode
              project_id={project_id}
              subproject_id={subproject.subproject_id}
              level={5}
            />
          </>
        )}
      </>
    )
  },
)
