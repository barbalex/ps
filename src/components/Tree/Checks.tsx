import { useCallback, useMemo, memo } from 'react'
import { useLiveIncrementalQuery } from '@electric-sql/pglite-react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import isEqual from 'lodash/isEqual'
import { useAtom } from 'jotai'

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

    const filter = place_id ? filterChecks2 : filterChecks1

    const resFiltered = useLiveIncrementalQuery(
      `
      SELECT * 
      FROM checks 
      WHERE 
        place_id = $1 
        ${filter.length > 0 ? ` AND ${filter.join(' AND ')}` : ''}
      ORDER BY label ASC`,
      [place.place_id],
      'check_id',
    )
    const checksFiltered = resFiltered?.rows ?? []

    const resUnfiltered = useLiveIncrementalQuery(
      `
      SELECT * 
      FROM checks 
      WHERE 
        place_id = $1 
      ORDER BY label ASC`,
      [place.place_id],
      'check_id',
    )
    const checksUnfiltered = resUnfiltered?.rows ?? []
    const isFiltered = filter.length > 0

    // TODO: get name by place_level
    const checksNode = useMemo(
      () => ({
        label: `Checks (${
          isFiltered
            ? `${checksFiltered.length}/${checksUnfiltered.length}`
            : checksFiltered.length
        })`,
      }),
      [checksFiltered.length, checksUnfiltered.length, isFiltered],
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
          childrenCount={checksFiltered.length}
          to={ownUrl}
          onClickButton={onClickButton}
        />
        {isOpen &&
          checksFiltered.map((check) => (
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
