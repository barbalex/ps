import { useCallback, useMemo, memo } from 'react'
import { useLocation, useNavigate } from '@tanstack/react-router'
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
  projectId: string
  subprojectId: string
  placeId?: string
}

export const PlacesNode = memo(
  ({ projectId, subprojectId, placeId, level }: Props) => {
    const [openNodes] = useAtom(treeOpenNodesAtom)
    const [places1Filter] = useAtom(places1FilterAtom)
    const [places2Filter] = useAtom(places2FilterAtom)
    const filter = placeId ? places2Filter : places1Filter

    const location = useLocation()
    const navigate = useNavigate()

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
        and parent_id ${placeId ? `= '${placeId}'` : `is null`}
        ${isFiltered ? ` AND ${filterString} ` : ''} 
      ORDER BY label`
    const paramsFiltered = [subprojectId]
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
        placeId ? `= $2` : `is null`
      }`,
      [subprojectId, ...(placeId ? [placeId] : [])],
    )
    const countUnfiltered = resultCountUnfiltered?.rows?.[0]?.count ?? 0
    const countLoading = resultCountUnfiltered === undefined

    const resultPlaceLevels = useLiveIncrementalQuery(
      `SELECT * FROM place_levels WHERE project_id = $1 and level = $2 order by label`,
      [projectId, placeId ? 2 : 1],
      'place_level_id',
    )
    const placeLevels = resultPlaceLevels?.rows ?? []
    const placeNamePlural = placeLevels?.[0]?.name_plural ?? 'Places'

    // get name by place_level
    const node = useMemo(
      () => ({
        label: `${placeNamePlural} (${
          isFiltered ?
            `${rowsLoading ? '...' : formatNumber(rows.length)}/${
              countLoading ? '...' : formatNumber(countUnfiltered)
            }`
          : rowsLoading ? '...'
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
        projectId,
        'subprojects',
        subprojectId,
        ...(placeId ? ['places', placeId] : []),
      ],
      [placeId, projectId, subprojectId],
    )
    const parentUrl = `/${parentArray.join('/')}`
    const ownArray = useMemo(() => [...parentArray, 'places'], [parentArray])
    const ownUrl = `/${ownArray.join('/')}`

    // needs to work not only works for urlPath, for all opened paths!
    const isOpen = openNodes.some((array) => isEqual(array, ownArray))
    const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
    const isActive = isEqual(urlPath, ownArray)

    // console.log('PlacesNode', {
    //   openNodes,
    //   isOpen,
    //   ownUrl,
    //   ownArray,
    //   parentArray,
    //   parentUrl,
    // })

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
              projectId={projectId}
              subprojectId={subprojectId}
              placeId={placeId ?? place.place_id}
              placeId2={placeId ? place.place_id : undefined}
              place={place}
              level={level + 1}
            />
          ))}
      </>
    )
  },
)
