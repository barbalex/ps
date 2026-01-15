import { useLocation, useNavigate } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'
import { useAtom } from 'jotai'
import { useLiveQuery } from '@electric-sql/pglite-react'

import { Node } from './Node.tsx'
import { PlacesNode } from './Places.tsx'
import { SubprojectReportsNode } from './SubprojectReports.tsx'
import { SubprojectHistoriesNode } from './SubprojectHistories.tsx'
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
import type Projects from '../../models/public/Projects.ts'

export const SubprojectNode = ({ projectId, nav, level = 4 }) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const location = useLocation()
  const navigate = useNavigate()

  // need project to know whether to show files
  const res = useLiveQuery(`SELECT * FROM projects WHERE project_id = $1`, [
    projectId,
  ])
  const project: Projects | undefined = res?.rows?.[0]
  const showFiles = project?.files_active_subprojects ?? false

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const parentArray = ['data', 'projects', projectId, 'subprojects']
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
      // only navigate if urlPath includes ownArray
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
        isInActiveNodeArray={isInActiveNodeArray}
        isActive={isActive}
        childrenCount={5}
        to={ownUrl}
        onClickButton={onClickButton}
      />
      {isOpen && (
        <>
          <PlacesNode
            projectId={projectId}
            subprojectId={nav.id}
            level={5}
          />
          <SubprojectReportsNode
            projectId={projectId}
            subprojectId={nav.id}
          />
          <SubprojectHistoriesNode
            projectId={projectId}
            subprojectId={nav.id}
          />
          <GoalsNode
            projectId={projectId}
            subprojectId={nav.id}
          />
          <OccurrenceImportsNode
            projectId={projectId}
            subprojectId={nav.id}
          />
          <OccurrencesToAssessNode
            projectId={projectId}
            subprojectId={nav.id}
          />
          <OccurrencesNotToAssignNode
            projectId={projectId}
            subprojectId={nav.id}
          />
          <SubprojectTaxaNode
            projectId={projectId}
            subprojectId={nav.id}
          />
          <SubprojectUsersNode
            projectId={projectId}
            subprojectId={nav.id}
          />
          {showFiles && (
            <FilesNode
              projectId={projectId}
              subprojectId={nav.id}
              level={5}
            />
          )}
          <ChartsNode
            projectId={projectId}
            subprojectId={nav.id}
            level={5}
          />
        </>
      )}
    </>
  )
}
