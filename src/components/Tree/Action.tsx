import { useLocation, useNavigate } from '@tanstack/react-router'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { isEqual } from 'es-toolkit'
import { useAtom } from 'jotai'

import { Node } from './Node.tsx'
import { ActionValuesNode } from './ActionsValues.tsx'
import { ActionReportsNode } from './ActionsReports.tsx'
import { FilesNode } from './Files.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import { treeOpenNodesAtom } from '../../store.ts'

export const ActionNode = ({
  projectId,
  subprojectId,
  placeId,
  placeId2,
  nav,
  level = 8,
}) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const location = useLocation()
  const navigate = useNavigate()

  const res = useLiveQuery(
    `SELECT p.files_active_actions, pl.action_values, pl.action_reports
     FROM projects p
     LEFT JOIN place_levels pl ON pl.project_id = p.project_id
     WHERE p.project_id = $1 AND (pl.level IS NULL OR pl.level = $2)`,
    [projectId, placeId2 ? 2 : 1],
  )
  const row = res?.rows?.[0]
  const showFiles = row?.files_active_actions ?? false

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const parentArray = [
    'data',
    'projects',
    projectId,
    'subprojects',
    subprojectId,
    'places',
    placeId,
    ...(placeId2 ? ['places', placeId2] : []),
    'actions',
  ]
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
        childrenCount={11}
        to={ownUrl}
        onClickButton={onClickButton}
      />
      {isOpen && (
        <>
          <Node
            label="Action"
            level={level + 1}
            isInActiveNodeArray={
              ownArray.every((part, i) => urlPath[i] === part) &&
              urlPath[ownArray.length] === 'action'
            }
            isActive={isEqual([...ownArray, 'action'], urlPath)}
            childrenCount={0}
            to={`${ownUrl}/action`}
          />
          {row?.action_values !== false && (
            <ActionValuesNode
              projectId={projectId}
              subprojectId={subprojectId}
              placeId={placeId}
              placeId2={placeId2}
              actionId={nav.id}
              level={level + 1}
            />
          )}
          {row?.action_reports !== false && (
            <ActionReportsNode
              projectId={projectId}
              subprojectId={subprojectId}
              placeId={placeId}
              placeId2={placeId2}
              actionId={nav.id}
              level={level + 1}
            />
          )}
          {showFiles && (
            <FilesNode
              projectId={projectId}
              subprojectId={subprojectId}
              placeId={placeId}
              placeId2={placeId2}
              actionId={nav.id}
              level={level + 1}
            />
          )}
        </>
      )}
    </>
  )
}
