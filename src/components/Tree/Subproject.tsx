import { useCallback, memo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useLiveQuery } from 'electric-sql/react'

import { Node } from './Node.tsx'
import { Subprojects as Subproject } from '../../../generated/client/index.ts'
import { PlacesNode } from './Places.tsx'
import { SubprojectReportsNode } from './SubprojectReports.tsx'
import { GoalsNode } from './Goals.tsx'
import { OccurrencesToAssessNode } from './OccurrencesToAssess.tsx'
import { OccurrencesNotToAssignNode } from './OccurrencesNotToAssign.tsx'
import { SubprojectTaxaNode } from './SubprojectTaxa.tsx'
import { SubprojectUsersNode } from './SubprojectUsers.tsx'
import { OccurrenceImportsNode } from './OccurrenceImports.tsx'
import { FilesNode } from './Files.tsx'
import { ChartsNode } from './Charts.tsx'
import { useElectric } from '../../ElectricProvider.tsx'

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
