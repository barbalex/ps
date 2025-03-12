import { useCallback, useMemo, memo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import isEqual from 'lodash/isEqual'
import { useAtom } from 'jotai'
import {
  useLiveQuery,
  useLiveIncrementalQuery,
} from '@electric-sql/pglite-react'

import { Node } from './Node.tsx'
import { PlaceNode } from './Place/index.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import { filterStringFromFilter } from '../../modules/filterStringFromFilter.ts'
import { formatNumber } from '../../modules/formatNumber.ts'
import {
  treeOpenNodesAtom,
  places1FilterAtom,
  places2FilterAtom,
} from '../../store.ts'

interface Props {
  project_id: string
  subproject_id: string
  place_id?: string
}

export const PlacesNode = memo(
  ({ project_id, subproject_id, place_id }: Props) => {
    const [openNodes] = useAtom(treeOpenNodesAtom)
    const [places1Filter] = useAtom(places1FilterAtom)
    const [places2Filter] = useAtom(places2FilterAtom)
    const filter = place_id ? places2Filter : places1Filter

    const location = useLocation()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    const level = place_id ? 7 : 5

    // filtered places
    const filterString = filterStringFromFilter(filter)
    const isFiltered = !!filterString
    const sqlFiltered = `
      SELECT
        place_id,
        label 
      FROM places 
      WHERE 
        subproject_id = $1 
        and parent_id ${place_id ? `= $2` : `is null`}
        ${isFiltered ? ` AND ${filterString} ` : ''} 
      ORDER BY label`
    const paramsFiltered = [subproject_id, ...(place_id ? [place_id] : [])]
    const resFiltered = useLiveIncrementalQuery(
      sqlFiltered,
      paramsFiltered,
      'place_id',
    )
    const rows = resFiltered?.rows ?? []
    const rowsLoading = resFiltered === undefined

    // unfiltered count
    const resultCountUnfiltered = useLiveQuery(
      `SELECT count(*) FROM places WHERE subproject_id = $1 and parent_id ${
        place_id ? `= $2` : `is null`
      }`,
      [subproject_id, ...(place_id ? [place_id] : [])],
    )
    const countUnfiltered = resultCountUnfiltered?.rows?.[0]?.count ?? 0
    const countLoading = resultCountUnfiltered === undefined

    const resultPlaceLevels = useLiveIncrementalQuery(
      `SELECT * FROM place_levels WHERE project_id = $1 and level = $2 order by label`,
      [project_id, place_id ? 2 : 1],
      'place_level_id',
    )
    const placeLevels = resultPlaceLevels?.rows ?? []
    const placeNamePlural = placeLevels?.[0]?.name_plural ?? 'Places'

    // get name by place_level
    const node = useMemo(
      () => ({
        label: `${placeNamePlural} (${
          isFiltered
            ? `${rowsLoading ? '...' : formatNumber(rows.length)}/${
                countLoading ? '...' : formatNumber(countUnfiltered)
              }`
            : rowsLoading
            ? '...'
            : formatNumber(rows.length)
        })`,
      }),
      [
        placeNamePlural,
        isFiltered,
        rowsLoading,
        rows.length,
        countLoading,
        countUnfiltered,
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
        ...(place_id ? ['places', place_id] : []),
      ],
      [place_id, project_id, subproject_id],
    )
    const parentUrl = `/${parentArray.join('/')}`
    const ownArray = useMemo(() => [...parentArray, 'places'], [parentArray])
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
      isOpen,
      ownArray,
      isInActiveNodeArray,
      urlPath.length,
      navigate,
      parentUrl,
      searchParams,
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
          rows.map((place) => (
            <PlaceNode
              key={place.place_id}
              project_id={project_id}
              subproject_id={subproject_id}
              place_id={place_id}
              place={place}
              level={level + 1}
            />
          ))}
      </>
    )
  },
)
