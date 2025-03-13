import { useCallback, memo, useMemo } from 'react'
import { useLocation, useNavigate } from '@tanstack/react-router'
import isEqual from 'lodash/isEqual'
import { useAtom } from 'jotai'

import { Node } from '../Node.tsx'
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
import { Editing } from './Editing.tsx'
import { removeChildNodes } from '../../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../../modules/tree/addOpenNodes.ts'
import { designingAtom, treeOpenNodesAtom } from '../../../store.ts'

const parentArray = ['data', 'projects']

export const ProjectNode = memo(({ project, level = 2 }) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const [designing] = useAtom(designingAtom)

  const { pathname } = useLocation()
  const navigate = useNavigate()

  const showFiles = project.files_active_projects ?? false

  const urlPath = pathname.split('/').filter((p) => p !== '')
  const parentUrl = `/${parentArray.join('/')}`
  const ownArray = useMemo(
    () => [...parentArray, project.project_id],
    [project.project_id],
  )
  const ownUrl = `/${ownArray.join('/')}`

  // needs to work not only works for urlPath, for all opened paths!
  const isOpen = openNodes.some((array) => isEqual(array, ownArray))
  const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
  const isActive = isEqual(urlPath, ownArray)

  const onClickButton = useCallback(() => {
    if (isOpen) {
      removeChildNodes({ node: ownArray })
      // TODO: only navigate if urlPath includes ownArray
      if (isInActiveNodeArray && ownArray.length <= urlPath.length) {
        navigate({
          pathname: parentUrl,
        })
      }
      return
    }
    // add to openNodes without navigating
    addOpenNodes({ nodes: [ownArray] })
  }, [
    isInActiveNodeArray,
    isOpen,
    navigate,
    ownArray,
    parentUrl,
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
        sibling={<Editing projectId={project.project_id} />}
      />
      {/* {isOpen && (
        <>
          <SubprojectsNode project_id={project.project_id} />
          <ProjectReportsNode project_id={project.project_id} />
          <PersonsNode project_id={project.project_id} />
          <WmsLayersNode project_id={project.project_id} />
          <VectorLayersNode project_id={project.project_id} />
          {showFiles && (
            <FilesNode
              project_id={project.project_id}
              level={3}
            />
          )}
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
      )} */}
    </>
  )
})
