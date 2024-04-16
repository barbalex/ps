import { useCallback, memo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useLiveQuery } from 'electric-sql/react'

import { Node } from './Node'
import { Subprojects as Subproject } from '../../../generated/client'
import { PlacesNode } from './Places'
import { SubprojectReportsNode } from './SubprojectReports'
import { GoalsNode } from './Goals'
import { OccurrencesToAssessNode } from './OccurrencesToAssess'
import { OccurrencesNotToAssignNode } from './OccurrencesNotToAssign'
import { SubprojectTaxaNode } from './SubprojectTaxa'
import { SubprojectUsersNode } from './SubprojectUsers'
import { OccurrenceImportsNode } from './OccurrenceImports'
import { FilesNode } from './Files'
import { ChartsNode } from './Charts'
import { useElectric } from '../../ElectricProvider'

interface Props {
  project_id: string
  subproject: Subproject
  level?: number
}

export const SubprojectNode = memo(
  ({ project_id, subproject, level = 4 }: Props) => {
    const location = useLocation()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    // need project to know whether to show files
    const { db } = useElectric()!
    const { results: project } = useLiveQuery(
      db.projects.liveUnique({ where: { project_id } }),
    )
    const showFiles = project?.files_active_subprojects ?? false

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const isOpen =
      urlPath[0] === 'projects' &&
      urlPath[1] === project_id &&
      urlPath[2] === 'subprojects' &&
      urlPath[3] === subproject.subproject_id
    const isActive = isOpen && urlPath.length === 4

    const baseUrl = `/projects/${project_id}/subprojects`

    const onClickButton = useCallback(() => {
      if (isOpen) {
        return navigate({ pathname: baseUrl, search: searchParams.toString() })
      }
      navigate({
        pathname: `${baseUrl}/${subproject.subproject_id}`,
        search: searchParams.toString(),
      })
    }, [baseUrl, isOpen, navigate, searchParams, subproject.subproject_id])

    return (
      <>
        <Node
          node={subproject}
          id={subproject.subproject_id}
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
            <OccurrencesToAssessNode
              project_id={project_id}
              subproject_id={subproject.subproject_id}
            />
            <OccurrencesNotToAssignNode
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
            <OccurrenceImportsNode
              project_id={project_id}
              subproject_id={subproject.subproject_id}
            />
            {showFiles && (
              <FilesNode
                project_id={project_id}
                subproject_id={subproject.subproject_id}
                level={5}
              />
            )}
            <ChartsNode
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
