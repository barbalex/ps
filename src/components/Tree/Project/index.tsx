import { useLocation, useNavigate } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'
import { useAtom } from 'jotai'

import { Node } from '../Node.tsx'
import { ProjectDesignNode } from '../ProjectDesign.tsx'
import { SubprojectsNode } from '../Subprojects.tsx'
import { ProjectReportsNode } from '../ProjectReports.tsx'
import { PersonsNode } from '../Persons.tsx'
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
import { Editing } from './Editing.tsx'
import { removeChildNodes } from '../../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../../modules/tree/addOpenNodes.ts'
import { designingAtom, treeOpenNodesAtom } from '../../../store.ts'

const parentArray = ['data', 'projects']

export const ProjectNode = ({ nav, level = 2 }) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const [designing] = useAtom(designingAtom)

  const { pathname } = useLocation()
  const navigate = useNavigate()

  const showFiles = nav.files_active_projects ?? false

  const urlPath = pathname.split('/').filter((p) => p !== '')
  const parentUrl = `/${parentArray.join('/')}`
  const ownArray = [...parentArray, nav.id]
  const ownUrl = `/${ownArray.join('/')}`

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
        sibling={<Editing projectId={nav.id} />}
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
          <WmsLayersNode projectId={nav.id} />
          <VectorLayersNode projectId={nav.id} />
          {showFiles && (
            <FilesNode
              projectId={nav.id}
              level={3}
            />
          )}
          {designing && (
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
