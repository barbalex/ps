import { useCallback, memo, useMemo } from 'react'
import { useLocation, useNavigate } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'
import { useAtom } from 'jotai'

import { Node } from './Node.tsx'
import { ActionReportValuesNode } from './ActionsReportValues.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import { treeOpenNodesAtom } from '../../store.ts'

export const ActionReportNode = memo(
  ({
    projectId,
    subprojectId,
    placeId,
    placeId2,
    actionId,
    nav,
    level = 10,
  }) => {
    const [openNodes] = useAtom(treeOpenNodesAtom)
    const location = useLocation()
    const navigate = useNavigate()

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const parentArray = useMemo(
      () => [
        'data',
        'projects',
        projectId,
        'subprojects',
        subprojectId,
        'places',
        placeId,
        ...(placeId2 ? ['places', placeId2] : []),
        'actions',
        actionId,
        'reports',
      ],
      [projectId, subprojectId, placeId, placeId2, actionId],
    )
    const parentUrl = `/${parentArray.join('/')}`
    const ownArray = useMemo(
      () => [...parentArray, nav.id],
      [nav.id, parentArray],
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
          label={nav.label}
          id={nav.id}
          level={level}
          isOpen={isOpen}
          isInActiveNodeArray={isInActiveNodeArray}
          isActive={isActive}
          childrenCount={1}
          to={ownUrl}
          onClickButton={onClickButton}
        />
        {isOpen && (
          <ActionReportValuesNode
            projectId={projectId}
            subprojectId={subprojectId}
            placeId={placeId}
            placeId2={placeId2}
            actionId={actionId}
            actionReportId={nav.id}
            level={level + 1}
          />
        )}
      </>
    )
  },
)
