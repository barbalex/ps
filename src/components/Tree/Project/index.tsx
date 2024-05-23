import { useCallback, memo } from 'react'
import {
  useLocation,
  useParams,
  useNavigate,
  useSearchParams,
} from 'react-router-dom'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'

import { Node } from '../Node.tsx'
import { Projects as Project } from '../../../generated/client/index.ts'
import { SubprojectsNode } from '../Subprojects.tsx'
import { ProjectReportsNode } from '../ProjectReports.tsx'
import { PersonsNode } from '../Persons.tsx'
import { ListsNode } from '../Lists.tsx'
import { TaxonomiesNode } from '../Taxonomies.tsx'
import { UnitsNode } from '../Units.tsx'
import { TileLayersNode } from '../TileLayers.tsx'
import { VectorLayersNode } from '../VectorLayers.tsx'
import { ProjectUsersNode } from '../ProjectUsers.tsx'
import { PlaceLevelsNode } from '../PlaceLevels.tsx'
import { FieldsNode } from '../Fields.tsx'
import { FilesNode } from '../Files.tsx'
import { Editing } from './Editing.tsx'
import { useElectric } from '../../../ElectricProvider.tsx'
import { removeChildNodes } from '../../../modules/tree/removeChildNodes.ts'

interface Props {
  project: Project
  level?: number
}

export const ProjectNode = memo(({ project, level = 2 }: Props) => {
  const params = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user: authUser } = useCorbado()

  const { db } = useElectric()!
  const { results: appState } = useLiveQuery(
    db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
  )
  const designing = appState?.designing ?? false

  const showFiles = project.files_active_projects ?? false

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpen =
    urlPath[0] === 'projects' && params.project_id === project.project_id
  const isActive = isOpen && urlPath.length === 2

  const onClickButton = useCallback(() => {
    if (isOpen) {
      // remove closed child nodes from app_states.tree_open_nodes
      removeChildNodes({
        node: ['projects', project.project_id],
        db,
        appStateId: appState?.app_state_id,
      })
      return navigate({
        pathname: '/projects',
        search: searchParams.toString(),
      })
    }
    navigate({
      pathname: `/projects/${project.project_id}`,
      search: searchParams.toString(),
    })
  }, [
    appState?.app_state_id,
    db,
    isOpen,
    navigate,
    project.project_id,
    searchParams,
  ])

  return (
    <>
      <Node
        node={project}
        id={project.project_id}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isOpen}
        isActive={isActive}
        childrenCount={10}
        to={`/projects/${project.project_id}`}
        onClickButton={onClickButton}
        sibling={<Editing />}
      />
      {isOpen && (
        <>
          <SubprojectsNode project_id={project.project_id} />
          <ProjectReportsNode project_id={project.project_id} />
          <PersonsNode project_id={project.project_id} />
          <TileLayersNode project_id={project.project_id} />
          <VectorLayersNode project_id={project.project_id} />
          {showFiles && <FilesNode project_id={project.project_id} level={3} />}
          {designing && (
            <>
              <ProjectUsersNode project_id={project.project_id} />
              <ListsNode project_id={project.project_id} />
              <TaxonomiesNode project_id={project.project_id} />
              <UnitsNode project_id={project.project_id} />
              <PlaceLevelsNode project_id={project.project_id} />
              <FieldsNode project_id={project.project_id} />
            </>
          )}
        </>
      )}
    </>
  )
})
