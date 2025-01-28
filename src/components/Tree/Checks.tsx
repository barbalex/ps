import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import isEqual from 'lodash/isEqual'
import { useAtom } from 'jotai'
import { usePGlite } from '@electric-sql/pglite-react'

import { Node } from './Node.tsx'
import { CheckNode } from './Check.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import {
  treeOpenNodesAtom,
  checks1FilterAtom,
  checks2FilterAtom,
} from '../../store.ts'

export const ChecksNode = memo(
  ({ project_id, subproject_id, place_id, place, level = 7 }) => {
    const [openNodes] = useAtom(treeOpenNodesAtom)
    const [filterChecks1] = useAtom(checks1FilterAtom)
    const [filterChecks2] = useAtom(checks2FilterAtom)

    const location = useLocation()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const db = usePGlite()

    const filter = place_id ? filterChecks2 : filterChecks1
    const where = filter.length > 1 ? { OR: filter } : filter[0]
    const { results: checks = [] } = useLiveQuery(
      db.checks.liveMany({
        where: { place_id: place.place_id, ...where },
        orderBy: { label: 'asc' },
      }),
    )
    const { results: checksUnfiltered = [] } = useLiveQuery(
      db.checks.liveMany({
        where: { place_id: place.place_id },
        orderBy: { label: 'asc' },
      }),
    )
    const isFiltered = checks.length !== checksUnfiltered.length

    // TODO: get name by place_level
    const checksNode = useMemo(
      () => ({
        label: `Checks (${
          isFiltered
            ? `${checks.length}/${checksUnfiltered.length}`
            : checks.length
        })`,
      }),
      [checks.length, checksUnfiltered.length, isFiltered],
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
      [project_id, subproject_id, place_id, place.place_id],
    )
    const parentUrl = `/${parentArray.join('/')}`
    const ownArray = useMemo(() => [...parentArray, 'checks'], [parentArray])
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
      parentArray,
      parentUrl,
      searchParams,
      urlPath.length,
    ])

    return (
      <>
        <Node
          node={checksNode}
          level={level}
          isOpen={isOpen}
          isInActiveNodeArray={isInActiveNodeArray}
          isActive={isActive}
          childrenCount={checks.length}
          to={ownUrl}
          onClickButton={onClickButton}
        />
        {isOpen &&
          checks.map((check) => (
            <CheckNode
              key={check.check_id}
              project_id={project_id}
              subproject_id={subproject_id}
              place_id={place_id}
              place={place}
              check={check}
              level={level + 1}
            />
          ))}
      </>
    )
  },
)
