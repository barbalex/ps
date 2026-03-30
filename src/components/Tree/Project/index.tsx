import { useLocation, useNavigate } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'
import { useAtom } from 'jotai'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useIntl } from 'react-intl'

import { Node } from '../Node.tsx'
import { ProjectDesignNode } from '../ProjectDesign.tsx'
import { SubprojectsNode } from '../Subprojects.tsx'
import { ProjectReportsNode } from '../ProjectReports.tsx'
import { WmsServicesNode } from '../WmsServices.tsx'
import { WfsServicesNode } from '../WfsServices.tsx'
import { ListsNode } from '../Lists.tsx'
import { TaxonomiesNode } from '../Taxonomies.tsx'
import { UnitsNode } from '../Units.tsx'
import { ProjectCrssNode } from '../ProjectCrss.tsx'
import { WmsLayersNode } from '../WmsLayers.tsx'
import { VectorLayersNode } from '../VectorLayers.tsx'
import { ProjectUsersNode } from '../ProjectUsers.tsx'
import { PlaceLevelsNode } from '../PlaceLevels.tsx'
import { FieldsNode } from '../Fields.tsx'
import { FilesNode } from '../Files.tsx'
import { ProjectReportDesignsNode } from '../ProjectReportDesigns.tsx'
import { SubprojectReportDesignsNode } from '../SubprojectReportDesigns.tsx'
import { ProjectQcsNode } from '../ProjectQcs.tsx'
import { ProjectQcsRunNode } from '../ProjectQcsRun.tsx'
import { removeChildNodes } from '../../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../../modules/tree/addOpenNodes.ts'
import { designingAtom, treeOpenNodesAtom } from '../../../store.ts'

const parentArray = ['data', 'projects']

export const ProjectNode = ({ nav, level = 2 }) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const [designing] = useAtom(designingAtom)
  const { formatMessage } = useIntl()

  const { pathname } = useLocation()
  const navigate = useNavigate()


  const urlPath = pathname.split('/').filter((p) => p !== '')
  const parentUrl = `/${parentArray.join('/')}`
  const ownArray = [...parentArray, nav.id]
  const ownUrl = `/${ownArray.join('/')}`

  // TODO: Check if user is account owner for this project (auth not yet implemented, assume yes if project exists)
  const resultProject = useLiveQuery(
    `SELECT project_id, wms_layers, vector_layers, project_reports, files_active_projects, project_users_in_project, project_files_in_project, fields_in_project FROM projects WHERE project_id = $1`,
    [nav.id],
  )
  const project = resultProject?.rows?.[0]
  const userIsAccountOwner = !!project

  // Only show designing nodes if user is account owner for this project
  const showDesigningNodes = designing && userIsAccountOwner
  const showWmsNodes = designing || (project?.wms_layers ?? false)
  const showVectorNodes = designing || (project?.vector_layers ?? false)
  const showProjectReports = designing || (project?.project_reports ?? true)
  const showFiles = designing || (project?.files_active_projects ?? false)
  const usersInProject = project?.project_users_in_project !== false
  const filesInProject = project?.project_files_in_project !== false
  const fieldsInProject = project?.fields_in_project !== false
  const showUsersNav = !usersInProject
  const showFilesNav = showFiles && !filesInProject
  const showFieldsNav = !fieldsInProject

  // needs to work not only works for urlPath, for all opened paths!
  const isOpen = openNodes.some((array) => isEqual(array, ownArray))
  const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
  const isActive = isEqual(urlPath, ownArray)

  const onClickButton = () => {
    if (isOpen) {
      removeChildNodes({ node: ownArray })
      // TODO: only navigate if urlPath includes ownArray
      if (isInActiveNodeArray && ownArray.length <= urlPath.length) {
        navigate({ to: parentUrl })
      }
      return
    }
    // add to openNodes without navigating
    addOpenNodes({ nodes: [ownArray] })
  }

  return (
    <>
      <Node
        label={nav.label}
        id={nav.id}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isOpen}
        isActive={isActive}
        childrenCount={10}
        to={ownUrl}
        onClickButton={onClickButton}
      />
      {isOpen && (
        <>
          <Node
            label={formatMessage({ id: 'fz2AhZ', defaultMessage: 'Projekt' })}
            level={3}
            isInActiveNodeArray={
              ownArray.every((part, i) => urlPath[i] === part) &&
              urlPath[ownArray.length] === 'project'
            }
            isActive={isEqual([...ownArray, 'project'], urlPath)}
            childrenCount={0}
            to={`${ownUrl}/project`}
          />
          {showDesigningNodes && (
            <ProjectDesignNode projectId={nav.id} level={level + 1} />
          )}
          <SubprojectsNode projectId={nav.id} />
          {showDesigningNodes && (
            <SubprojectReportDesignsNode projectId={nav.id} level={3} />
          )}
          {showDesigningNodes && (
            <ProjectReportDesignsNode projectId={nav.id} level={3} />
          )}
          {showProjectReports && <ProjectReportsNode projectId={nav.id} />}
          {showWmsNodes && <WmsServicesNode projectId={nav.id} />}
          {showWmsNodes && <WmsLayersNode projectId={nav.id} />}
          {showVectorNodes && <WfsServicesNode projectId={nav.id} />}
          {showVectorNodes && <VectorLayersNode projectId={nav.id} />}
          {showFilesNav && <FilesNode projectId={nav.id} level={3} />}
          {showDesigningNodes && (
            <>
              {showUsersNav && <ProjectUsersNode projectId={nav.id} />}
              <ListsNode projectId={nav.id} />
              <TaxonomiesNode projectId={nav.id} />
              <UnitsNode projectId={nav.id} />
              <ProjectCrssNode projectId={nav.id} />
              <PlaceLevelsNode projectId={nav.id} />
              {showFieldsNav && <FieldsNode projectId={nav.id} />}
            </>
          )}
          <ProjectQcsNode projectId={nav.id} level={level + 1} />
          <ProjectQcsRunNode projectId={nav.id} level={level + 1} />
        </>
      )}
    </>
  )
}
