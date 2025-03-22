import { useCallback, memo, useMemo } from 'react'
import { useLocation, useNavigate } from '@tanstack/react-router'
import { useLiveIncrementalQuery } from '@electric-sql/pglite-react'
import isEqual from 'lodash/isEqual'
import { useAtom } from 'jotai'

import { Node } from './Node.tsx'
import { ActionValuesNode } from './ActionsValues.tsx'
import { ActionReportsNode } from './ActionsReports.tsx'
import { FilesNode } from './Files.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import { treeOpenNodesAtom } from '../../store.ts'

export const ActionNode = memo(
  ({ projectId, subprojectId, placeId, action, place, level = 8 }) => {
    const [openNodes] = useAtom(treeOpenNodesAtom)
    const location = useLocation()
    const navigate = useNavigate()

    // need project to know whether to show files
    const resProject = useLiveIncrementalQuery(
      `SELECT * FROM projects WHERE project_id = $1`,
      [projectId],
      'project_id',
    )
    const project = resProject?.rows?.[0]
    const showFiles = project?.files_active_actions ?? false

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const parentArray = useMemo(
      () => [
        'data',
        'projects',
        projectId,
        'subprojects',
        subprojectId,
        'places',
        placeId ?? place.place_id,
        ...(placeId ? ['places', place.place_id] : []),
        'actions',
      ],
      [place.place_id, placeId, projectId, subprojectId],
    )
    const parentUrl = `/${parentArray.join('/')}`
    const ownArray = useMemo(
      () => [...parentArray, action.action_id],
      [action.action_id, parentArray],
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
      isOpen,
      ownArray,
      isInActiveNodeArray,
      urlPath.length,
      navigate,
      parentUrl,
    ])

    return (
      <>
        <Node
          node={action}
          id={action.action_id}
          level={level}
          isOpen={isOpen}
          isInActiveNodeArray={isInActiveNodeArray}
          isActive={isActive}
          childrenCount={10}
          to={ownUrl}
          onClickButton={onClickButton}
        />
        {isOpen && (
          <>
            <ActionValuesNode
              project_id={projectId}
              subproject_id={subprojectId}
              place_id={placeId}
              place={place}
              action_id={action.action_id}
              level={level + 1}
            />
            <ActionReportsNode
              project_id={projectId}
              subproject_id={subprojectId}
              place_id={placeId}
              place={place}
              action_id={action.action_id}
              level={level + 1}
            />
            {showFiles && (
              <FilesNode
                project_id={projectId}
                subproject_id={subprojectId}
                place_id={placeId ?? place.place_id}
                place_id2={placeId ? place.place_id : undefined}
                action_id={action.action_id}
                level={level + 1}
              />
            )}
          </>
        )}
      </>
    )
  },
)
