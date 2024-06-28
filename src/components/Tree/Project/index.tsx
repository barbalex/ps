import { useCallback, memo, useMemo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'
import isEqual from 'lodash/isEqual'

import { Node } from '../Node.tsx'
import { Projects as Project } from '../../../generated/client/index.ts'
import { SubprojectsNode } from '../Subprojects.tsx'
import { ProjectReportsNode } from '../ProjectReports.tsx'
import { PersonsNode } from '../Persons.tsx'
import { ListsNode } from '../Lists.tsx'
import { TaxonomiesNode } from '../Taxonomies.tsx'
import { UnitsNode } from '../Units.tsx'
import { ProjectCrssNode } from '../ProjectCrss.tsx'
import { TileLayersNode } from '../TileLayers.tsx'
import { VectorLayersNode } from '../VectorLayers.tsx'
import { ProjectUsersNode } from '../ProjectUsers.tsx'
import { PlaceLevelsNode } from '../PlaceLevels.tsx'
import { FieldsNode } from '../Fields.tsx'
import { FilesNode } from '../Files.tsx'
import { Editing } from './Editing.tsx'
import { useElectric } from '../../../ElectricProvider.tsx'
import { removeChildNodes } from '../../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../../modules/tree/addOpenNodes.ts'

interface Props {
  project: Project
  level?: number
}

export const ProjectNode = memo(({ project, level = 2 }: Props) => {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user: authUser } = useCorbado()

  const { db } = useElectric()!

  const { results: appState } = useLiveQuery(
    db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
  )
  const designing = appState?.designing ?? false
  const openNodes = useMemo(
    () => appState?.tree_open_nodes ?? [],
    [appState?.tree_open_nodes],
  )

  const showFiles = project.files_active_projects ?? false

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const parentArray = useMemo(() => ['data', 'projects'], [])
  const parentUrl = `/${parentArray.join('/')}`
  const ownArray = useMemo(
    () => [...parentArray, project.project_id],
    [parentArray, project.project_id],
  )
  const ownUrl = `/${ownArray.join('/')}`

  // needs to work not only works for urlPath, for all opened paths!
  const isOpen = openNodes.some((array) => isEqual(array, ownArray))
  const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
  const isActive = isEqual(urlPath, ownArray)

  const onClickButton = useCallback(() => {
    if (isOpen) {
      removeChildNodes({
        node: parentArray,
        db,
        appStateId: appState?.app_state_id,
      })
      // TODO: only navigate if urlPath includes ownArray
      if (isInActiveNodeArray && ownArray.length <= urlPath.length) {
        navigate({
          pathname: parentUrl,
          search: searchParams.toString(),
        })
      }
      return
    }
    // add to openNodes without navigating
    addOpenNodes({
      nodes: [ownArray],
      db,
      appStateId: appState?.app_state_id,
    })
  }, [
    appState?.app_state_id,
    db,
    isInActiveNodeArray,
    isOpen,
    navigate,
    ownArray,
    parentArray,
    parentUrl,
    searchParams,
    urlPath.length,
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
        to={ownUrl}
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
              <ProjectCrssNode project_id={project.project_id} />
              <PlaceLevelsNode project_id={project.project_id} />
              <FieldsNode project_id={project.project_id} />
            </>
          )}
        </>
      )}
    </>
  )
})
