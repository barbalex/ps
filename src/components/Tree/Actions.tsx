import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import isEqual from 'lodash/isEqual'
import { useAtom } from 'jotai'

import { useElectric } from '../../ElectricProvider.tsx'
import { Node } from './Node.tsx'
import { ActionNode } from './Action.tsx'
import { Places as Place } from '../../generated/client/index.ts'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import {
  treeOpenNodesAtom,
  actions1FilterAtom,
  actions2FilterAtom,
} from '../../store.ts'

interface Props {
  project_id: string
  subproject_id: string
  place_id?: string
  place: Place
  level?: number
}

export const ActionsNode = memo(
  ({ project_id, subproject_id, place_id, place, level = 7 }: Props) => {
    const [openNodes] = useAtom(treeOpenNodesAtom)
    const [filterActions1] = useAtom(actions1FilterAtom)
    const [filterActions2] = useAtom(actions2FilterAtom)

    const location = useLocation()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { db } = useElectric()!

    const filter = place_id ? filterActions2 : filterActions1
    const where = filter.length > 1 ? { OR: filter } : filter[0]
    const { results: actions = [] } = useLiveQuery(
      db.actions.liveMany({
        where: { place_id: place.place_id, ...where },
        orderBy: { label: 'asc' },
      }),
    )
    const { results: actionsUnfiltered = [] } = useLiveQuery(
      db.actions.liveMany({
        where: { place_id: place.place_id },
        orderBy: { label: 'asc' },
      }),
    )
    const isFiltered = actions.length !== actionsUnfiltered.length

    const actionsNode = useMemo(
      () => ({
        label: `Actions (${
          isFiltered
            ? `${actions.length}/${actionsUnfiltered.length}`
            : actions.length
        })`,
      }),
      [actions.length, actionsUnfiltered.length, isFiltered],
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
        removeChildNodes({ node: parentArray })
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
      parentArray,
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
          childrenCount={actions.length}
          to={ownUrl}
          onClickButton={onClickButton}
        />
        {isOpen &&
          actions.map((action) => (
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
