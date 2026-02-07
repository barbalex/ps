import { useLocation, useNavigate } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'
import { useAtom } from 'jotai'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useCorbado } from '@corbado/react'

import { Node } from '../Node.tsx'
import { ProjectDesignNode } from '../ProjectDesign.tsx'
import { SubprojectsNode } from '../Subprojects.tsx'
import { ProjectReportsNode } from '../ProjectReports.tsx'
import { PersonsNode } from '../Persons.tsx'
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
import { removeChildNodes } from '../../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../../modules/tree/addOpenNodes.ts'
import { designingAtom, treeOpenNodesAtom } from '../../../store.ts'

const parentArray = ['data', 'projects']

export const ProjectNode = ({ nav, level = 2 }) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const [designing] = useAtom(designingAtom)
  const { user } = useCorbado()

  const { pathname } = useLocation()
  const navigate = useNavigate()

  const showFiles = nav.files_active_projects ?? false

  const urlPath = pathname.split('/').filter((p) => p !== '')
  const parentUrl = `/${parentArray.join('/')}`
  const ownArray = [...parentArray, nav.id]
  const ownUrl = `/${ownArray.join('/')}`

  // Check if user is account owner for this project (auth not yet implemented, assume yes if project exists)
  const resultProject = useLiveQuery(
    `SELECT project_id FROM projects WHERE project_id = $1`,
    [nav.id],
  )
  const project = resultProject?.rows?.[0]
  const userIsAccountOwner = !!project

  // Only show designing nodes if user is account owner for this project
  const showDesigningNodes = designing && userIsAccountOwner

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
            label="Project"
            level={3}
            isInActiveNodeArray={
              ownArray.every((part, i) => urlPath[i] === part) &&
              urlPath[ownArray.length] === 'project'
            }
            isActive={isEqual([...ownArray, 'project'], urlPath)}
            childrenCount={0}
            to={`${ownUrl}/project`}
          />
          <SubprojectsNode projectId={nav.id} />
          <ProjectReportsNode projectId={nav.id} />
          <PersonsNode projectId={nav.id} />
          <WmsServicesNode projectId={nav.id} />
          <WmsLayersNode projectId={nav.id} />
          <WfsServicesNode projectId={nav.id} />
          <VectorLayersNode projectId={nav.id} />
          {showFiles && (
            <FilesNode
              projectId={nav.id}
              level={3}
            />
          )}
          {showDesigningNodes && (
            <>
              <ProjectDesignNode
                projectId={nav.id}
                level={level + 1}
              />
              <ProjectUsersNode projectId={nav.id} />
              <ListsNode projectId={nav.id} />
              <TaxonomiesNode projectId={nav.id} />
              <UnitsNode projectId={nav.id} />
              <ProjectCrssNode projectId={nav.id} />
              <PlaceLevelsNode projectId={nav.id} />
              <FieldsNode projectId={nav.id} />
              <ProjectReportDesignsNode
                projectId={nav.id}
                level={3}
              />
            </>
          )}
        </>
      )}
    </>
  )
}
