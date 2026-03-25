import { useLocation, useNavigate } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'
import { useAtom } from 'jotai'
import { useLiveQuery } from '@electric-sql/pglite-react'

import { Node } from './Node.tsx'
import { PlacesNode } from './Places.tsx'
import { SubprojectReportsNode } from './SubprojectReports.tsx'
import { SubprojectHistoriesNode } from './SubprojectHistories.tsx'
import { GoalsNode } from './Goals.tsx'
import { ObservationsToAssessNode } from './ObservationsToAssess.tsx'
import { ObservationsNotToAssignNode } from './ObservationsNotToAssign.tsx'
import { SubprojectTaxaNode } from './SubprojectTaxa.tsx'
import { SubprojectUsersNode } from './SubprojectUsers.tsx'
import { SubprojectQcsNode } from './SubprojectQcs.tsx'
import { SubprojectQcsRunNode } from './SubprojectQcsRun.tsx'
import { ObservationImportsNode } from './ObservationImports.tsx'
import { FilesNode } from './Files.tsx'
import { ChartsNode } from './Charts.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import { treeOpenNodesAtom, designingAtom, languageAtom } from '../../store.ts'
import { getSubprojectNameSingular } from '../../modules/subprojectNameCols.ts'
import type Projects from '../../models/public/Projects.ts'

export const SubprojectNode = ({ projectId, nav, level = 4 }) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const [isDesigning] = useAtom(designingAtom)
  const [language] = useAtom(languageAtom)
  const location = useLocation()
  const navigate = useNavigate()

  // need project to know whether to show files
  const res = useLiveQuery(`SELECT * FROM projects WHERE project_id = $1`, [
    projectId,
  ])
  const project: Projects | undefined = res?.rows?.[0]
  const showFiles = isDesigning || (project?.files_active_subprojects ?? false)
  const showSubprojectReports =
    isDesigning || (project?.subproject_reports ?? true)
  const showGoals = isDesigning || (project?.goals ?? true)
  const showOccurrences = isDesigning || (project?.occurrences ?? true)
  const showTaxa = isDesigning || (project?.taxa ?? true)
  const showCharts = isDesigning || (project?.charts ?? true)

  // TODO: Check if user is account owner for the parent project (auth not yet implemented, assume yes if project exists)
  const resultProject = useLiveQuery(
    `SELECT project_id FROM projects WHERE project_id = $1`,
    [projectId],
  )
  const projectData = resultProject?.rows?.[0]
  const userIsAccountOwner = !!projectData

  // Only show designing nodes if user is account owner for the parent project
  const showDesigningNodes = isDesigning && userIsAccountOwner

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
        childrenCount={6}
        to={ownUrl}
        onClickButton={onClickButton}
      />
      {isOpen && (
        <>
          <Node
            label={
              getSubprojectNameSingular(
                project as Record<string, unknown>,
                language,
              ) || 'Subproject'
            }
            level={5}
            isInActiveNodeArray={
              ownArray.every((part, i) => urlPath[i] === part) &&
              urlPath[ownArray.length] === 'subproject'
            }
            isActive={isEqual([...ownArray, 'subproject'], urlPath)}
            childrenCount={0}
            to={`${ownUrl}/subproject`}
          />
          <PlacesNode projectId={projectId} subprojectId={nav.id} level={5} />
          {showSubprojectReports && (
            <SubprojectReportsNode
              projectId={projectId}
              subprojectId={nav.id}
            />
          )}
          <SubprojectHistoriesNode
            projectId={projectId}
            subprojectId={nav.id}
          />
          {showGoals && (
            <GoalsNode projectId={projectId} subprojectId={nav.id} />
          )}
          {showOccurrences && (
            <ObservationImportsNode
              projectId={projectId}
              subprojectId={nav.id}
            />
          )}
          {showOccurrences && (
            <ObservationsToAssessNode
              projectId={projectId}
              subprojectId={nav.id}
            />
          )}
          {showOccurrences && (
            <ObservationsNotToAssignNode
              projectId={projectId}
              subprojectId={nav.id}
            />
          )}
          {showTaxa && (
            <SubprojectTaxaNode projectId={projectId} subprojectId={nav.id} />
          )}
          {showDesigningNodes && (
            <SubprojectUsersNode projectId={projectId} subprojectId={nav.id} />
          )}
          {showDesigningNodes && (
            <SubprojectQcsNode projectId={projectId} subprojectId={nav.id} />
          )}
          <SubprojectQcsRunNode projectId={projectId} subprojectId={nav.id} />
          {showFiles && (
            <FilesNode projectId={projectId} subprojectId={nav.id} level={5} />
          )}
          {showCharts && (
            <ChartsNode projectId={projectId} subprojectId={nav.id} level={5} />
          )}
        </>
      )}
    </>
  )
}
