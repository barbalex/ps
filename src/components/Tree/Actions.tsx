import { useCallback, useMemo, memo } from 'react'
import {
  useLiveIncrementalQuery,
  useLiveQuery,
} from '@electric-sql/pglite-react'
import { useLocation, useNavigate } from '@tanstack/react-router'
import isEqual from 'lodash/isEqual'
import { useAtom } from 'jotai'

import { Node } from './Node.tsx'
import { ActionNode } from './Action.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import {
  treeOpenNodesAtom,
  actions1FilterAtom,
  actions2FilterAtom,
} from '../../store.ts'
import { filterStringFromFilter } from '../../modules/filterStringFromFilter.ts'
import { formatNumber } from '../../modules/formatNumber.ts'

export const ActionsNode = memo(
  ({ projectId, subprojectId, placeId, place, level = 7 }) => {
    const [openNodes] = useAtom(treeOpenNodesAtom)
    const [filterActions1] = useAtom(actions1FilterAtom)
    const [filterActions2] = useAtom(actions2FilterAtom)

    const location = useLocation()
    const navigate = useNavigate()

    const filter = placeId ? filterActions2 : filterActions1
    const filterString = filterStringFromFilter(filter)
    const isFiltered = !!filterString
    const resFiltered = useLiveIncrementalQuery(
      `
      SELECT
        action_id,
        label
      FROM actions 
      WHERE 
        place_id = $1 
        ${isFiltered ? ` AND ${filterString}` : ''}
      ORDER BY label`,
      [place.place_id],
      'action_id',
    )
    const rows = resFiltered?.rows ?? []
    const rowsLoading = resFiltered === undefined

    const unfilteredCountRes = useLiveQuery(
      `
      SELECT count(*) 
      FROM actions 
      WHERE place_id = $1`,
      [place.place_id],
    )
    const countUnfiltered = unfilteredCountRes?.rows?.[0]?.count ?? 0
    const countLoading = unfilteredCountRes === undefined

    const node = useMemo(
      () => ({
        label: `Actions (${
          isFiltered ?
            `${rowsLoading ? '...' : formatNumber(rows.length)}/${
              countLoading ? '...' : formatNumber(countUnfiltered)
            }`
          : rowsLoading ? '...'
          : formatNumber(rows.length)
        })`,
      }),
      [rows.length, rowsLoading, countUnfiltered, countLoading, isFiltered],
    )

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
      ],
      [projectId, placeId, place.place_id, subprojectId],
    )
    const parentUrl = `/${parentArray.join('/')}`
    const ownArray = useMemo(() => [...parentArray, 'actions'], [parentArray])
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
          node={node}
          level={level}
          isOpen={isOpen}
          isInActiveNodeArray={isInActiveNodeArray}
          isActive={isActive}
          childrenCount={rows.length}
          to={ownUrl}
          onClickButton={onClickButton}
        />
        {isOpen &&
          rows.map((action) => (
            <ActionNode
              key={action.action_id}
              projectId={projectId}
              subprojectId={subprojectId}
              placeId={placeId}
              place={place}
              action={action}
              level={level + 1}
            />
          ))}
      </>
    )
  },
)
