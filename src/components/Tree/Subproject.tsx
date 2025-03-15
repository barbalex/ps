import { useCallback, memo, useMemo } from 'react'
import { useLocation, useNavigate } from '@tanstack/react-router'
import isEqual from 'lodash/isEqual'
import { useAtom } from 'jotai'
import { useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { Node } from './Node.tsx'
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
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import { treeOpenNodesAtom } from '../../store.ts'

export const SubprojectNode = memo(({ project_id, subproject, level = 4 }) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const location = useLocation()
  const navigate = useNavigate()

  // need project to know whether to show files
  const res = useLiveIncrementalQuery(
    `SELECT * FROM projects WHERE project_id = $1`,
    [project_id],
    'project_id',
  )
  const project = res?.rows?.[0]
  const showFiles = project?.files_active_subprojects ?? false

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const parentArray = useMemo(
    () => ['data', 'projects', project_id, 'subprojects'],
    [project_id],
  )
  const parentUrl = `/${parentArray.join('/')}`
  const ownArray = useMemo(
    () => [...parentArray, subproject.subproject_id],
    [parentArray, subproject.subproject_id],
  )
  const ownUrl = `/${ownArray.join('/')}`

  // needs to work not only works for urlPath, for all opened paths!
  const isOpen = openNodes.some((array) => isEqual(array, ownArray))
  const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
  const isActive = isEqual(urlPath, ownArray)

  const onClickButton = useCallback(() => {
    if (isOpen) {
      removeChildNodes({ node: ownArray })
      // only navigate if urlPath includes ownArray
      if (isInActiveNodeArray && ownArray.length <= urlPath.length) {
        navigate({ to: parentUrl })
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
        node={subproject}
        id={subproject.subproject_id}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isInActiveNodeArray}
        isActive={isActive}
        childrenCount={5}
        to={ownUrl}
        onClickButton={onClickButton}
      />
      {/* {isOpen && (
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
      )} */}
    </>
  )
})
