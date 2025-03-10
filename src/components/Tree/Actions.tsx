import { useCallback, useMemo, memo } from 'react'
import {
  useLiveIncrementalQuery,
  useLiveQuery,
} from '@electric-sql/pglite-react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
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

export const ActionsNode = memo(
  ({ project_id, subproject_id, place_id, place, level = 7 }) => {
    const [openNodes] = useAtom(treeOpenNodesAtom)
    const [filterActions1] = useAtom(actions1FilterAtom)
    const [filterActions2] = useAtom(actions2FilterAtom)

    const location = useLocation()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    const filter = place_id ? filterActions2 : filterActions1
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
    const actionsFiltered = resFiltered?.rows ?? []
    const actionsLoading = resFiltered === undefined

    const unfilteredCountRes = useLiveQuery(
      `
      SELECT count(*) 
      FROM actions 
      WHERE place_id = $1`,
      [place.place_id],
    )
    const actionsUnfilteredCount = unfilteredCountRes?.rows?.[0]?.count ?? 0
    const countLoading = unfilteredCountRes === undefined

    const actionsNode = useMemo(
      () => ({
        label: `Actions (${
          isFiltered
            ? `${actionsLoading ? '...' : actionsFiltered.length}/${
                countLoading ? '...' : actionsUnfilteredCount
              }`
            : actionsLoading
            ? '...'
            : actionsFiltered.length
        })`,
      }),
      [
        actionsFiltered.length,
        actionsLoading,
        actionsUnfilteredCount,
        countLoading,
        isFiltered,
      ],
    )

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const parentArray = useMemo(
      () => [
        'data',
        'projects',
        project_id,
        'subprojects',
        subproject_id,
        'places',
        place_id ?? place.place_id,
        ...(place_id ? ['places', place.place_id] : []),
      ],
      [project_id, place_id, place.place_id, subproject_id],
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
          navigate({
            pathname: parentUrl,
            search: searchParams.toString(),
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
      searchParams,
      urlPath.length,
    ])

    return (
      <>
        <Node
          node={actionsNode}
          level={level}
          isOpen={isOpen}
          isInActiveNodeArray={isInActiveNodeArray}
          isActive={isActive}
          childrenCount={actionsFiltered.length}
          to={ownUrl}
          onClickButton={onClickButton}
        />
        {isOpen &&
          actionsFiltered.map((action) => (
            <ActionNode
              key={action.action_id}
              project_id={project_id}
              subproject_id={subproject_id}
              place_id={place_id}
              place={place}
              action={action}
              level={level + 1}
            />
          ))}
      </>
    )
  },
)
